import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import ConfirmModal from '../../components/common/ConfirmModal';
import useAuth from '../../hooks/useAuth';
import { deleteRsvpAsync, fetchRsvpAsync, saveRsvpAsync } from './rsvpSlice';
import { useToast } from '../../hooks/useToast';

function RsvpManager({ eventId }) {
  const dispatch = useDispatch();
  const toast = useToast();
  const { isAuthenticated } = useAuth();
  const { rsvps, loading } = useSelector((state) => state.rsvp);
  const [showConfirm, setShowConfirm] = useState(false);
  const current = rsvps[eventId];

  useEffect(() => {
    if (isAuthenticated && eventId) {
      dispatch(fetchRsvpAsync(eventId));
    }
  }, [dispatch, eventId, isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const submitRsvp = async (status) => {
    const result = await dispatch(saveRsvpAsync({ eventId, payload: { status } }));
    if (saveRsvpAsync.fulfilled.match(result)) {
      toast.success('RSVP updated successfully');
    } else {
      toast.error(result.payload || 'Unable to update RSVP');
    }
  };

  const cancelRsvp = async () => {
    const result = await dispatch(deleteRsvpAsync(eventId));
    if (deleteRsvpAsync.fulfilled.match(result)) {
      toast.success('RSVP cancelled successfully');
    } else {
      toast.error(result.payload || 'Unable to cancel RSVP');
    }
    setShowConfirm(false);
  };

  return (
    <div className="eventhub-soft rounded-4 p-3">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <h2 className="h5 mb-1">RSVP</h2>
          <p className="mb-0 text-muted">Current status: {current?.status || 'No RSVP yet'}</p>
        </div>
        <div className="eventhub-rsvp-actions">
          {['GOING', 'MAYBE', 'NOT_GOING'].map((status) => (
            <button key={status} type="button" className="btn btn-outline-dark btn-sm" disabled={loading} onClick={() => submitRsvp(status)}>{status}</button>
          ))}
          {current && <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => setShowConfirm(true)}>Cancel RSVP</button>}
        </div>
      </div>
      <ConfirmModal show={showConfirm} title="Cancel RSVP" message="Remove your RSVP for this event?" onConfirm={cancelRsvp} onCancel={() => setShowConfirm(false)} />
    </div>
  );
}

export default RsvpManager;

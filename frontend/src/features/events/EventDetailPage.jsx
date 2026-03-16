import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ConfirmModal from '../../components/common/ConfirmModal';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { deleteEventAsync, fetchEventByIdAsync } from './eventsSlice';
import { formatDateTime } from '../../utils/dateUtils';
import useRBAC from '../../hooks/useRBAC';
import useAuth from '../../hooks/useAuth';
import RsvpManager from '../rsvp/RsvpManager';
import { useToast } from '../../hooks/useToast';

function EventDetailPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { id } = useParams();
  const { selectedItem, loading } = useSelector((state) => state.events);
  const { canEditEvent, canDeleteEvent } = useRBAC();
  const { isAuthenticated } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    dispatch(fetchEventByIdAsync(id));
  }, [dispatch, id]);

  const handleDelete = async () => {
    const result = await dispatch(deleteEventAsync(selectedItem.id));
    if (deleteEventAsync.fulfilled.match(result)) {
      toast.success('Event deleted successfully');
      navigate('/events');
    } else {
      toast.error(result.payload || 'Unable to delete event');
    }
    setShowDeleteConfirm(false);
  };

  if (loading || !selectedItem) {
    return <LoadingSkeleton rows={5} />;
  }

  return (
    <div className="eventhub-card eventhub-form-card p-4 page-enter eventhub-page-stack">
      <div className="eventhub-page-header">
        <div>
          <h1>{selectedItem.title}</h1>
          <p className="eventhub-page-lead">{selectedItem.description}</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          {canEditEvent(selectedItem) && <Link to={`/events/${selectedItem.id}/edit`} className="btn btn-outline-dark">Edit event</Link>}
          {canDeleteEvent(selectedItem) && <button type="button" className="btn btn-outline-danger" onClick={() => setShowDeleteConfirm(true)}>Delete event</button>}
        </div>
      </div>
      <div className="eventhub-detail-grid">
        <div className="eventhub-detail-item"><span className="eventhub-detail-label">Starts</span>{formatDateTime(selectedItem.startDateTime)}</div>
        <div className="eventhub-detail-item"><span className="eventhub-detail-label">Ends</span>{formatDateTime(selectedItem.endDateTime)}</div>
        <div className="eventhub-detail-item"><span className="eventhub-detail-label">Organizer</span>{selectedItem.organizerUsername}</div>
        <div className="eventhub-detail-item"><span className="eventhub-detail-label">Venue</span>{selectedItem.venueName || 'Online / TBA'}</div>
      </div>
      {isAuthenticated && (
        <div className="mt-4">
          <RsvpManager eventId={selectedItem.id} />
        </div>
      )}
      <ConfirmModal show={showDeleteConfirm} title="Delete event" message="Delete this event permanently?" onConfirm={handleDelete} onCancel={() => setShowDeleteConfirm(false)} />
    </div>
  );
}

export default EventDetailPage;

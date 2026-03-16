import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import ConfirmModal from '../../components/common/ConfirmModal';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import Pagination from '../../components/common/Pagination';
import { deleteVenueAsync, fetchVenuesAsync } from './venuesSlice';
import useRBAC from '../../hooks/useRBAC';
import { useToast } from '../../hooks/useToast';

function VenueListPage() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { items, total, loading } = useSelector((state) => state.venues);
  const [page, setPage] = useState(0);
  const [pendingDelete, setPendingDelete] = useState(null);
  const { canDeleteVenue } = useRBAC();

  useEffect(() => {
    dispatch(fetchVenuesAsync({ page, size: 5 }));
  }, [dispatch, page]);

  const handleDelete = async () => {
    const result = await dispatch(deleteVenueAsync(pendingDelete.id));
    if (deleteVenueAsync.fulfilled.match(result)) {
      toast.success('Venue deleted successfully');
    } else {
      toast.error(result.payload || 'Unable to delete venue');
    }
    setPendingDelete(null);
  };

  return (
    <div className="page-enter eventhub-page-stack">
      <div className="eventhub-page-header">
        <div>
          <h1 className="h3 mb-0">Venues</h1>
          <p className="eventhub-page-lead">Manage places, capacities, and location details for upcoming events.</p>
        </div>
        <Link to="/venues/new" className="btn btn-dark">Add Venue</Link>
      </div>
      {loading ? <LoadingSkeleton rows={4} /> : (
        <div className="eventhub-card eventhub-table-card p-4">
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr><th>Name</th><th>City</th><th>Country</th><th>Capacity</th><th className="text-end">Actions</th></tr>
              </thead>
              <tbody>
                {items.length ? items.map((venue) => (
                  <tr key={venue.id}>
                    <td>{venue.name}</td>
                    <td>{venue.city}</td>
                    <td>{venue.country}</td>
                    <td>{venue.capacity || 'N/A'}</td>
                    <td className="text-end">
                      {canDeleteVenue() && (
                        <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => setPendingDelete(venue)}>Delete</button>
                      )}
                    </td>
                  </tr>
                )) : <tr><td colSpan="5" className="text-center text-muted">No records available</td></tr>}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={page} totalItems={total} pageSize={5} onPageChange={setPage} />
        </div>
      )}
      <ConfirmModal show={Boolean(pendingDelete)} title="Delete venue" message="Delete this venue permanently?" onConfirm={handleDelete} onCancel={() => setPendingDelete(null)} />
    </div>
  );
}

export default VenueListPage;

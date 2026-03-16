import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import ConfirmModal from '../../components/common/ConfirmModal';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import { deleteEventAsync, fetchEventsAsync } from './eventsSlice';
import { fetchCategoriesAsync } from '../categories/categoriesSlice';
import { formatDateTime } from '../../utils/dateUtils';
import { useSearch } from '../../hooks/useSearch';
import useRBAC from '../../hooks/useRBAC';
import { useToast } from '../../hooks/useToast';

function EventListPage() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { items, total, page, loading } = useSelector((state) => state.events);
  const { items: categories } = useSelector((state) => state.categories);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activePage, setActivePage] = useState(0);
  const [pendingDelete, setPendingDelete] = useState(null);
  const { query, setQuery, filteredItems } = useSearch(items, ['title']);
  const { canDeleteEvent } = useRBAC();
  const visibleItems = selectedCategory
    ? filteredItems.filter((event) => String(event.categoryId) === String(selectedCategory))
    : filteredItems;

  useEffect(() => {
    dispatch(fetchCategoriesAsync());
  }, [dispatch]);

  useEffect(() => {
    const params = { page: activePage, size: 5 };
    if (selectedCategory) {
      params.categoryId = selectedCategory;
    }
    dispatch(fetchEventsAsync(params));
  }, [activePage, dispatch, selectedCategory]);

  const handleDelete = async () => {
    const result = await dispatch(deleteEventAsync(pendingDelete.id));
    if (deleteEventAsync.fulfilled.match(result)) {
      toast.success('Event deleted successfully');
    } else {
      toast.error(result.payload || 'Unable to delete event');
    }
    setPendingDelete(null);
  };

  return (
    <div className="page-enter eventhub-page-stack">
      <div className="eventhub-page-header">
        <div>
          <h1 className="display-6 fw-bold">Published Events</h1>
          <p className="eventhub-page-lead">Schedule gatherings, discover events, and RSVP with confidence.</p>
        </div>
        <Link to="/events/new" className="btn btn-dark">Create Event</Link>
      </div>
      <div className="eventhub-soft eventhub-filter-bar row g-3">
        <div className="col-lg-8">
          <SearchBar value={query} onChange={setQuery} placeholder="Search events by title" />
        </div>
        <div className="col-lg-4">
          <select className="form-select" value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
            <option value="">All categories</option>
            {categories.map((category) => (
              <option value={category.id} key={category.id}>{category.name}</option>
            ))}
          </select>
        </div>
      </div>
      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : (
        <div className="row g-4">
          {visibleItems.length ? visibleItems.map((event) => (
            <div className="col-md-6" key={event.id}>
              <article className="eventhub-card eventhub-event-card p-4 h-100 d-flex flex-column gap-3">
                <span className="eventhub-badge align-self-start">{event.categoryName || 'General'}</span>
                <h3 className="h4">{event.title}</h3>
                <p className="text-muted mb-0">{event.description}</p>
                <div className="eventhub-event-meta">
                  <span>{formatDateTime(event.startDateTime)}</span>
                  <span>{event.organizerUsername || 'EventHub Organizer'}</span>
                </div>
                <div className="mt-auto d-flex gap-2 flex-wrap">
                  <Link to={`/events/${event.id}`} className="btn btn-outline-dark">View details</Link>
                  {canDeleteEvent(event) && (
                    <button type="button" className="btn btn-outline-danger" onClick={() => setPendingDelete(event)}>Delete</button>
                  )}
                </div>
              </article>
            </div>
          )) : <div className="col-12"><div className="eventhub-empty-state">No records available</div></div>}
        </div>
      )}
      <Pagination currentPage={page} totalItems={total} pageSize={5} onPageChange={setActivePage} />
      <ConfirmModal show={Boolean(pendingDelete)} title="Delete event" message="Delete this event permanently?" onConfirm={handleDelete} onCancel={() => setPendingDelete(null)} />
    </div>
  );
}

export default EventListPage;

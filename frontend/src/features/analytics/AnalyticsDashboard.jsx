import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { fetchAnalyticsSummaryAsync } from './analyticsSlice';

function AnalyticsDashboard() {
  const dispatch = useDispatch();
  const { summary, monthly, byCategory, loading } = useSelector((state) => state.analytics);

  useEffect(() => {
    dispatch(fetchAnalyticsSummaryAsync());
  }, [dispatch]);

  if (loading || !summary) {
    return <LoadingSkeleton rows={5} />;
  }

  return (
    <div className="page-enter eventhub-page-stack">
      <div className="eventhub-page-header">
        <div>
          <h1 className="h3 mb-0">Analytics Dashboard</h1>
          <p className="eventhub-page-lead">Track event publishing momentum, RSVP volume, and category performance at a glance.</p>
        </div>
      </div>
      <div className="row g-3">
        {[['Total Events', summary.totalEvents], ['Published', summary.publishedEvents], ['Drafts', summary.draftEvents], ['RSVPs', summary.totalRsvps]].map(([label, value]) => (
          <div className="col-md-3" key={label}>
            <div className="eventhub-card eventhub-stat-card p-4">
              <div className="eventhub-stat-label">{label}</div>
              <div className="eventhub-stat-value">{value}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="row g-4">
        <div className="col-lg-6">
          <div className="eventhub-card eventhub-table-card p-4">
            <h2 className="h5">Monthly Events</h2>
            <ul className="list-group list-group-flush eventhub-list">
              {monthly.length ? monthly.map((item) => <li className="list-group-item eventhub-list-item d-flex justify-content-between" key={item.label}><span>{item.label}</span><strong>{item.value}</strong></li>) : <li className="list-group-item eventhub-list-item text-muted">No records available</li>}
            </ul>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="eventhub-card eventhub-table-card p-4">
            <h2 className="h5">By Category</h2>
            <ul className="list-group list-group-flush eventhub-list">
              {byCategory.length ? byCategory.map((item) => <li className="list-group-item eventhub-list-item d-flex justify-content-between" key={item.label}><span>{item.label}</span><strong>{item.value}</strong></li>) : <li className="list-group-item eventhub-list-item text-muted">No records available</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;

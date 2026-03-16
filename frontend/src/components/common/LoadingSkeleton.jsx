import React from 'react';

function LoadingSkeleton({ rows = 3 }) {
  return (
    <div data-testid="loading-skeleton" className="eventhub-card eventhub-skeleton p-4">
      {Array.from({ length: rows }).map((_, index) => (
        <div className="placeholder-glow mb-3" key={index}>
          <span className="placeholder col-12 rounded-3" style={{ height: '1.25rem' }} />
        </div>
      ))}
    </div>
  );
}

export default LoadingSkeleton;

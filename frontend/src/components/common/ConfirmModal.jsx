import React from 'react';

function ConfirmModal({ show, title = 'Confirm action', message = 'Are you sure?', onConfirm, onCancel }) {
  if (!show) {
    return null;
  }

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center eventhub-modal-backdrop" style={{ zIndex: 2000 }}>
      <div className="eventhub-card eventhub-modal p-4" role="dialog" aria-modal="true">
        <h5>{title}</h5>
        <p className="text-muted">{message}</p>
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>Cancel</button>
          <button type="button" className="btn btn-danger" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;

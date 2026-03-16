import React, { useEffect, useState } from 'react';

function Toast() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const handler = (event) => {
      setToast(event.detail);
      setTimeout(() => setToast(null), 3000);
    };
    window.addEventListener('eventhub-toast', handler);
    return () => window.removeEventListener('eventhub-toast', handler);
  }, []);

  if (!toast) {
    return null;
  }

  return (
    <div className="position-fixed top-0 end-0 p-3 eventhub-toast" style={{ zIndex: 2100 }}>
      <div className={`alert alert-${toast.type} shadow`} role="alert">
        {toast.message}
      </div>
    </div>
  );
}

export default Toast;

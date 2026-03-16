import React from 'react';
import AppRoutes from './routes/AppRoutes';
import Toast from './components/common/Toast';
import { useTheme } from './hooks/useTheme';

function App() {
  useTheme();

  return (
    <div className="eventhub-shell">
      <AppRoutes />
      <Toast />
    </div>
  );
}

export default App;

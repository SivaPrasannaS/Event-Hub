import React from 'react';
import RoleGuard from './RoleGuard';

const withRole = (Component, permission, fallback = null) => {
  function RoleWrapped(props) {
    return (
      <RoleGuard permission={permission} fallback={fallback}>
        <Component {...props} />
      </RoleGuard>
    );
  }

  return RoleWrapped;
};

export default withRole;

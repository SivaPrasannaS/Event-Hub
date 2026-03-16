import React from 'react';
import { NavLink } from 'react-router-dom';
import RoleGuard from '../rbac/RoleGuard';

function Sidebar() {
  return (
    <aside className="eventhub-card eventhub-sidebar p-3 d-flex flex-column gap-2 h-100">
      <NavLink to="/events" className="btn text-start eventhub-sidebar-link">Browse Events</NavLink>
      <NavLink to="/events/new" className="btn text-start eventhub-sidebar-link">Create Event</NavLink>
      <NavLink to="/venues" className="btn text-start eventhub-sidebar-link">Venues</NavLink>
      <NavLink to="/media" className="btn text-start eventhub-sidebar-link">Media</NavLink>
      <RoleGuard permission="category:manage">
        <NavLink to="/categories" className="btn text-start eventhub-sidebar-link">Categories</NavLink>
      </RoleGuard>
      <RoleGuard permission="analytics:view">
        <NavLink to="/analytics" className="btn text-start eventhub-sidebar-link">Analytics</NavLink>
      </RoleGuard>
      <RoleGuard permission="user:manage">
        <NavLink to="/admin/users" className="btn text-start eventhub-sidebar-link">Users</NavLink>
      </RoleGuard>
    </aside>
  );
}

export default Sidebar;

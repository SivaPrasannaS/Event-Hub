import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import useAuth from '../../hooks/useAuth';
import ThemeToggle from './ThemeToggle';
import { logout } from '../../features/auth/authSlice';

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg sticky-top eventhub-navbar">
      <div className="container-fluid px-4 py-2">
        <Link to="/events" className="navbar-brand fw-bold eventhub-brand">EventHub</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#eventhub-nav">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="eventhub-nav">
          <div className="navbar-nav me-auto gap-2">
            <NavLink to="/events" className="nav-link">Events</NavLink>
            {isAuthenticated && <NavLink to="/venues" className="nav-link">Venues</NavLink>}
            {isAuthenticated && <NavLink to="/media" className="nav-link">Media</NavLink>}
          </div>
          <div className="d-flex align-items-center gap-2">
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                <span className="small eventhub-user-chip">{user?.username}</span>
                <button type="button" className="btn btn-sm btn-danger" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="btn btn-outline-dark btn-sm">Login</NavLink>
                <NavLink to="/register" className="btn btn-dark btn-sm">Register</NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

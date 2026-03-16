import React, { useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import FormInput from '../../components/forms/FormInput';
import { loginSchema } from '../../utils/validators';
import { clearAuthError, loginAsync } from './authSlice';
import useAuth from '../../hooks/useAuth';

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/events');
    }
    return () => dispatch(clearAuthError());
  }, [dispatch, isAuthenticated, navigate]);

  const onSubmit = async (values) => {
    const result = await dispatch(loginAsync(values));
    if (loginAsync.fulfilled.match(result)) {
      navigate('/events');
    }
  };

  return (
    <div className="container py-5 eventhub-auth-wrap">
      <div className="row justify-content-center w-100 eventhub-auth-grid">
        <div className="col-12 col-xl-10">
          <div className="eventhub-card eventhub-auth-card eventhub-auth-layout page-enter">
            <div className="row g-0 align-items-stretch">
              <div className="col-lg-6">
                <div className="eventhub-auth-panel h-100 d-flex flex-column justify-content-center">
                  <span className="eventhub-auth-kicker">EventHub Access</span>
                  <h1 className="eventhub-auth-title">Login</h1>
                  <p className="eventhub-auth-copy">Move from planning to attendance with a workspace designed for organizers, managers, and guests.</p>
                  <ul className="eventhub-auth-points">
                    <li>Review upcoming events and RSVP status in one place</li>
                    <li>Manage venues, media, and publishing flows securely</li>
                    <li>Stay productive in both light and dark mode</li>
                  </ul>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="eventhub-auth-form-panel h-100">
                  <h2>Welcome back</h2>
                  <p className="eventhub-auth-subtitle">Sign in to continue managing schedules, RSVPs, and event operations.</p>
                  {error && <div className="alert alert-danger">{error}</div>}
                  <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <FormInput label="Username" name="username" register={register} error={errors.username} />
                    <FormInput label="Password" name="password" type="password" register={register} error={errors.password} />
                    <button className="btn btn-dark w-100" type="submit" disabled={loading}>
                      {loading && <span className="spinner-border spinner-border-sm me-2" />}
                      Sign in
                    </button>
                  </form>
                  <p className="small eventhub-auth-footer mb-0">
                    Need an account? <Link to="/register" className="eventhub-link">Register</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

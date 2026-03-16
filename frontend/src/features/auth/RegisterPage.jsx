import React from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import FormInput from '../../components/forms/FormInput';
import { registerSchema } from '../../utils/validators';
import { registerAsync } from './authSlice';
import useAuth from '../../hooks/useAuth';

function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = async (values) => {
    const result = await dispatch(registerAsync(values));
    if (registerAsync.fulfilled.match(result)) {
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
                  <span className="eventhub-auth-kicker">New Workspace</span>
                  <h1 className="eventhub-auth-title">Register</h1>
                  <p className="eventhub-auth-copy">Create your account to start organizing, publishing, and managing event experiences with a consistent workflow.</p>
                  <ul className="eventhub-auth-points">
                    <li>Plan events with categories, venues, and media assets</li>
                    <li>Collaborate using role-based access controls</li>
                    <li>Track engagement through RSVP and analytics views</li>
                  </ul>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="eventhub-auth-form-panel h-100">
                  <h2>Create your account</h2>
                  <p className="eventhub-auth-subtitle">Set up your EventHub profile and get access to the complete scheduling workspace.</p>
                  {error && <div className="alert alert-danger">{error}</div>}
                  <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <FormInput label="Username" name="username" register={register} error={errors.username} />
                    <FormInput label="Password" name="password" type="password" register={register} error={errors.password} />
                    <button className="btn btn-dark w-100" type="submit" disabled={loading}>
                      {loading && <span className="spinner-border spinner-border-sm me-2" />}
                      Create account
                    </button>
                  </form>
                  <p className="small eventhub-auth-footer mb-0">
                    Already have an account? <Link to="/login" className="eventhub-link">Login</Link>
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

export default RegisterPage;

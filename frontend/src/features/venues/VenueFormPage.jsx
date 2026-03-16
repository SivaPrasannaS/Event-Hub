import React from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import FormInput from '../../components/forms/FormInput';
import { venueSchema } from '../../utils/validators';
import { createVenueAsync } from './venuesSlice';
import { useToast } from '../../hooks/useToast';

function VenueFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { loading } = useSelector((state) => state.venues);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(venueSchema),
    defaultValues: { name: '', address: '', city: '', country: '', capacity: '' },
  });

  const onSubmit = async (values) => {
    const result = await dispatch(createVenueAsync(values));
    if (createVenueAsync.fulfilled.match(result)) {
      toast.success('Venue created successfully');
      navigate('/venues');
    } else {
      toast.error(result.payload || 'Unable to create venue');
    }
  };

  return (
    <div className="eventhub-card eventhub-form-card p-4 page-enter eventhub-page-stack">
      <div>
        <h1 className="h3 mb-2">Create Venue</h1>
        <p className="eventhub-page-lead">Capture venue name, location, and capacity so organizers can plan accurately.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormInput label="Name" name="name" register={register} error={errors.name} />
        <FormInput label="Address" name="address" register={register} error={errors.address} />
        <div className="row">
          <div className="col-md-6"><FormInput label="City" name="city" register={register} error={errors.city} /></div>
          <div className="col-md-6"><FormInput label="Country" name="country" register={register} error={errors.country} /></div>
        </div>
        <FormInput label="Capacity" name="capacity" type="number" register={register} error={errors.capacity} />
        <div className="eventhub-form-actions">
          <button className="btn btn-dark" type="submit" disabled={loading}>
            {loading && <span className="spinner-border spinner-border-sm me-2" />}
            Save Venue
          </button>
        </div>
      </form>
    </div>
  );
}

export default VenueFormPage;

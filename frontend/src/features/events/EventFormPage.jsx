import React, { useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import FormInput from '../../components/forms/FormInput';
import FormSelect from '../../components/forms/FormSelect';
import FormTextarea from '../../components/forms/FormTextarea';
import { fetchCategoriesAsync } from '../categories/categoriesSlice';
import { fetchVenuesAsync } from '../venues/venuesSlice';
import { createEventAsync, fetchEventByIdAsync, updateEventAsync } from './eventsSlice';
import { eventSchema } from '../../utils/validators';
import { toInputDateTime } from '../../utils/dateUtils';
import useRBAC from '../../hooks/useRBAC';
import { useToast } from '../../hooks/useToast';

function EventFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { can } = useRBAC();
  const toast = useToast();
  const isEditMode = Boolean(id);
  const { items: categories } = useSelector((state) => state.categories);
  const { items: venues } = useSelector((state) => state.venues);
  const { selectedItem, loading } = useSelector((state) => state.events);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      startDateTime: '',
      endDateTime: '',
      categoryId: '',
      venueId: '',
      capacity: '',
      status: 'DRAFT',
      tags: '',
    },
  });

  useEffect(() => {
    dispatch(fetchCategoriesAsync());
    dispatch(fetchVenuesAsync({ page: 0, size: 50 }));
    if (isEditMode) {
      dispatch(fetchEventByIdAsync(id));
    }
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    if (isEditMode && selectedItem) {
      reset({
        title: selectedItem.title,
        description: selectedItem.description,
        startDateTime: toInputDateTime(selectedItem.startDateTime),
        endDateTime: toInputDateTime(selectedItem.endDateTime),
        categoryId: String(selectedItem.categoryId || ''),
        venueId: String(selectedItem.venueId || ''),
        capacity: selectedItem.capacity || '',
        status: selectedItem.status,
        tags: selectedItem.tags || '',
      });
    }
  }, [isEditMode, reset, selectedItem]);

  const onSubmit = async (values) => {
    const payload = { ...values, categoryId: Number(values.categoryId), venueId: values.venueId ? Number(values.venueId) : null };
    const action = isEditMode ? updateEventAsync({ id, payload }) : createEventAsync(payload);
    const result = await dispatch(action);
    if (updateEventAsync.fulfilled.match(result) || createEventAsync.fulfilled.match(result)) {
      toast.success(`Event ${isEditMode ? 'updated' : 'created'} successfully`);
      navigate(`/events/${result.payload.id}`);
    } else {
      toast.error(result.payload || 'Unable to save event');
    }
  };

  return (
    <div className="eventhub-card eventhub-form-card p-4 page-enter eventhub-page-stack">
      <div>
        <h1 className="h3 mb-2">{isEditMode ? 'Edit Event' : 'Create Event'}</h1>
        <p className="eventhub-page-lead">Set the schedule, venue, visibility, and audience details for your event.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="row eventhub-form-grid">
          <div className="col-md-6"><FormInput label="Title" name="title" register={register} error={errors.title} /></div>
          <div className="col-md-6"><FormInput label="Tags" name="tags" register={register} error={errors.tags} placeholder="music, community" /></div>
          <div className="col-md-6"><FormInput label="Start" name="startDateTime" type="datetime-local" register={register} error={errors.startDateTime} /></div>
          <div className="col-md-6"><FormInput label="End" name="endDateTime" type="datetime-local" register={register} error={errors.endDateTime} /></div>
          <div className="col-md-6"><FormSelect label="Category" name="categoryId" register={register} error={errors.categoryId} options={categories.map((category) => ({ value: category.id, label: category.name }))} /></div>
          <div className="col-md-6"><FormSelect label="Venue" name="venueId" register={register} error={errors.venueId} options={venues.map((venue) => ({ value: venue.id, label: venue.name }))} /></div>
          <div className="col-md-6"><FormInput label="Capacity" name="capacity" type="number" register={register} error={errors.capacity} /></div>
          {can('event:publish') && (
            <div className="col-md-6"><FormSelect label="Status" name="status" register={register} error={errors.status} options={[{ value: 'DRAFT', label: 'Draft' }, { value: 'PUBLISHED', label: 'Published' }]} /></div>
          )}
        </div>
        <FormTextarea label="Description" name="description" register={register} error={errors.description} rows={5} />
        <div className="eventhub-form-actions">
          <button className="btn btn-dark" type="submit" disabled={loading}>
            {loading && <span className="spinner-border spinner-border-sm me-2" />}
            Save Event
          </button>
        </div>
      </form>
    </div>
  );
}

export default EventFormPage;

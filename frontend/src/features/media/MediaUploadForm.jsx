import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import FormFileUpload from '../../components/forms/FormFileUpload';
import FormSelect from '../../components/forms/FormSelect';
import { uploadMediaAsync } from './mediaSlice';
import { useToast } from '../../hooks/useToast';

function MediaUploadForm({ onSuccess }) {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.media);
  const toast = useToast();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (values) => {
    const formData = new FormData();
    formData.append('file', values.file[0]);
    formData.append('mediaType', values.mediaType);
    const result = await dispatch(uploadMediaAsync(formData));
    if (uploadMediaAsync.fulfilled.match(result)) {
      toast.success('Media uploaded successfully');
      reset();
      if (onSuccess) {
        onSuccess(result.payload);
      }
    } else {
      toast.error(result.payload || 'Unable to upload media');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="eventhub-soft eventhub-upload-card" noValidate>
      <div className="mb-3">
        <h2 className="h4">Upload Asset</h2>
        <p className="text-muted mb-0">Add a new image, video, or document to your shared media library.</p>
      </div>
      <FormFileUpload label="Upload file" name="file" register={register} error={errors.file} />
      <FormSelect label="Media type" name="mediaType" register={register} error={errors.mediaType} options={[
        { value: 'IMAGE', label: 'Image' },
        { value: 'VIDEO', label: 'Video' },
        { value: 'DOCUMENT', label: 'Document' },
      ]} />
      <div className="eventhub-form-actions">
        <button className="btn btn-dark" type="submit" disabled={loading}>
          {loading && <span className="spinner-border spinner-border-sm me-2" />}
          Upload
        </button>
      </div>
    </form>
  );
}

export default MediaUploadForm;

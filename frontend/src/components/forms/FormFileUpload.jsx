import React from 'react';

function FormFileUpload({ label, name, register, error, accept }) {
  return (
    <div className="eventhub-field">
      <label className="form-label" htmlFor={name}>{label}</label>
      <input id={name} className={`form-control ${error ? 'is-invalid' : ''}`} type="file" accept={accept} {...register(name)} />
      {error && <div className="invalid-feedback d-block">{error.message}</div>}
    </div>
  );
}

export default FormFileUpload;

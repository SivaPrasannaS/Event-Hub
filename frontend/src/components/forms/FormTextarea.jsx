import React from 'react';

function FormTextarea({ label, name, register, error, rows = 4, ...rest }) {
  return (
    <div className="eventhub-field">
      <label className="form-label" htmlFor={name}>{label}</label>
      <textarea id={name} className={`form-control ${error ? 'is-invalid' : ''}`} rows={rows} {...register(name)} {...rest} />
      {error && <div className="invalid-feedback d-block">{error.message}</div>}
    </div>
  );
}

export default FormTextarea;

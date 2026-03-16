import React from 'react';

function FormSelect({ label, name, register, error, options, ...rest }) {
  return (
    <div className="eventhub-field">
      <label className="form-label" htmlFor={name}>{label}</label>
      <select id={name} className={`form-select ${error ? 'is-invalid' : ''}`} {...register(name)} {...rest}>
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      {error && <div className="invalid-feedback d-block">{error.message}</div>}
    </div>
  );
}

export default FormSelect;

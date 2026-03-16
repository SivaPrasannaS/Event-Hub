import React, { useState } from 'react';

function FormInput({ label, name, register, error, type = 'text', ...rest }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const resolvedType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="eventhub-field">
      <label className="form-label" htmlFor={name}>{label}</label>
      <div className="input-group">
        <input id={name} className={`form-control ${error ? 'is-invalid' : ''}`} type={resolvedType} {...register(name)} {...rest} />
        {isPassword && (
          <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
            {showPassword ? '🙈' : '👁'}
          </button>
        )}
        {error && <div className="invalid-feedback d-block">{error.message}</div>}
      </div>
    </div>
  );
}

export default FormInput;

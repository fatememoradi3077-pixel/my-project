import { useId } from 'react';

function Wrapper({ id, label, error, hint, required, children }) {
  return (
    <div>
      <label htmlFor={id} className="th-label">
        {label}
        {required ? <span className="ml-1 text-brand">*</span> : null}
      </label>
      {children}
      {hint && !error ? <p className="mt-1.5 text-xs text-ink-faint">{hint}</p> : null}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-sale" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextField({ label, error, hint, required, className = '', ...rest }) {
  const id = useId();
  return (
    <Wrapper id={id} label={label} error={error} hint={hint} required={required}>
      <input
        id={id}
        aria-invalid={error ? 'true' : undefined}
        className={`th-input ${error ? 'border-sale' : ''} ${className}`}
        {...rest}
      />
    </Wrapper>
  );
}

export function TextAreaField({ label, error, hint, required, rows = 5, className = '', ...rest }) {
  const id = useId();
  return (
    <Wrapper id={id} label={label} error={error} hint={hint} required={required}>
      <textarea
        id={id}
        rows={rows}
        aria-invalid={error ? 'true' : undefined}
        className={`th-input resize-y ${error ? 'border-sale' : ''} ${className}`}
        {...rest}
      />
    </Wrapper>
  );
}

export function SelectField({ label, error, hint, required, options = [], className = '', ...rest }) {
  const id = useId();
  return (
    <Wrapper id={id} label={label} error={error} hint={hint} required={required}>
      <select
        id={id}
        aria-invalid={error ? 'true' : undefined}
        className={`th-input th-select ${error ? 'border-sale' : ''} ${className}`}
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value ?? option.label} value={option.value ?? ''}>
            {option.label}
          </option>
        ))}
      </select>
    </Wrapper>
  );
}

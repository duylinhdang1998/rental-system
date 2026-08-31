import type { InputHTMLAttributes } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label: string;
}

export function TextField({ error, id, label, ...props }: TextFieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className="grid gap-2">
      <label className="text-sm font-bold text-ink" htmlFor={id}>
        {label}
      </label>
      <input
        aria-describedby={error ? errorId : undefined}
        aria-invalid={Boolean(error)}
        className="field-control"
        id={id}
        {...props}
      />
      {error ? (
        <p className="text-sm font-semibold text-negative" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

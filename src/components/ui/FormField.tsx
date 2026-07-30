import React from 'react';

interface FormFieldProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  id?: string;
  children: React.ReactElement<{ className?: string; id?: string }>;
}

export function FormField({ label, error, helperText, required, id, children }: FormFieldProps) {
  const hasError = !!error;
  const child = React.cloneElement(children, {
    id,
    className: `${children.props.className || ''} ${
      hasError
        ? 'border-red-500 focus:ring-red-500/20'
        : 'border-slate-200 focus:border-[#1A5C5E] focus:ring-1 focus:ring-[#1A5C5E]'
    }`,
  });

  return (
    <div className="w-full text-xs">
      {label && (
        <label htmlFor={id} className="block text-slate-600 mb-1.5 font-bold uppercase tracking-wider text-[9px]">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {child}
      {error ? (
        <p className="text-red-500 text-[10px] mt-1 font-semibold">{error}</p>
      ) : helperText ? (
        <p className="text-slate-400 text-[10px] mt-1 font-light">{helperText}</p>
      ) : null}
    </div>
  );
}

export default FormField;

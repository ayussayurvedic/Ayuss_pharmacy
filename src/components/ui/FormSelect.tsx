import React, { forwardRef, SelectHTMLAttributes } from 'react';

export interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
  options: { label: string; value: string }[];
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ className = '', error, label, options, id, ...props }, ref) => {
    return (
      <div className="w-full text-xs font-sans">
        {label && (
          <label htmlFor={id} className="block text-slate-600 mb-1.5 font-bold uppercase tracking-wider text-[9px]">
            {label} {props.required && <span className="text-red-500">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={`w-full px-4 py-3 rounded-lg border transition-all text-sm focus:outline-none focus:border-[#1A5C5E] focus:ring-1 focus:ring-[#1A5C5E] bg-slate-50/50 ${
            error
              ? 'border-red-500'
              : 'border-slate-200'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-red-500 text-[10px] mt-1 font-semibold">{error}</p>}
      </div>
    );
  }
);

FormSelect.displayName = 'FormSelect';
export default FormSelect;

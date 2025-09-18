import React from 'react';

interface MobileFormProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
  style?: React.CSSProperties;
}

const MobileForm: React.FC<MobileFormProps> = ({
  children,
  onSubmit,
  className = '',
  style = {}
}) => {
  return (
    <form 
      onSubmit={onSubmit}
      className={`mobile-form ${className}`}
      style={{
        ...style,
        padding: '16px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '16px'
      }}
    >
      {children}
    </form>
  );
};

interface MobileFormGroupProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const MobileFormGroup: React.FC<MobileFormGroupProps> = ({
  children,
  className = '',
  style = {}
}) => {
  return (
    <div 
      className={`mobile-form-group mb-3 ${className}`}
      style={{
        ...style,
        marginBottom: '16px'
      }}
    >
      {children}
    </div>
  );
};

interface MobileFormLabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const MobileFormLabel: React.FC<MobileFormLabelProps> = ({
  children,
  htmlFor,
  required = false,
  className = '',
  style = {}
}) => {
  return (
    <label 
      htmlFor={htmlFor}
      className={`mobile-form-label form-label fw-bold ${className}`}
      style={{
        ...style,
        fontSize: '14px',
        marginBottom: '6px',
        display: 'block',
        color: '#333'
      }}
    >
      {children}
      {required && <span className="text-danger ms-1">*</span>}
    </label>
  );
};

interface MobileFormControlProps {
  type?: string;
  id?: string;
  name?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  options?: { value: string | number; label: string }[];
  rows?: number;
}

export const MobileFormControl: React.FC<MobileFormControlProps> = ({
  type = 'text',
  id,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  style = {},
  options,
  rows = 3
}) => {
  const baseStyle = {
    ...style,
    fontSize: '14px',
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    width: '100%',
    minHeight: '44px', // Touch-friendly minimum height
    boxSizing: 'border-box' as const
  };

  if (type === 'select' && options) {
    return (
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`mobile-form-control form-select ${className}`}
        style={baseStyle}
      >
        <option value="">{placeholder || 'Select an option'}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (type === 'textarea') {
    return (
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        className={`mobile-form-control form-control ${className}`}
        style={{
          ...baseStyle,
          minHeight: `${rows * 20 + 20}px`,
          resize: 'vertical'
        }}
      />
    );
  }

  return (
    <input
      type={type}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className={`mobile-form-control form-control ${className}`}
      style={baseStyle}
    />
  );
};

interface MobileButtonProps {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'outline-primary' | 'outline-secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  style?: React.CSSProperties;
  fullWidth?: boolean;
}

export const MobileButton: React.FC<MobileButtonProps> = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  className = '',
  style = {},
  fullWidth = false
}) => {
  const sizeClasses = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg'
  };

  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    success: 'btn-success',
    danger: 'btn-danger',
    warning: 'btn-warning',
    info: 'btn-info',
    light: 'btn-light',
    dark: 'btn-dark',
    'outline-primary': 'btn-outline-primary',
    'outline-secondary': 'btn-outline-secondary'
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`mobile-button btn ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-100' : ''} ${className}`}
      style={{
        ...style,
        minHeight: '44px', // Touch-friendly minimum height
        fontSize: size === 'sm' ? '12px' : size === 'lg' ? '16px' : '14px',
        padding: size === 'sm' ? '6px 12px' : size === 'lg' ? '12px 24px' : '8px 16px',
        borderRadius: '6px',
        fontWeight: '600',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease'
      }}
    >
      {children}
    </button>
  );
};

export default MobileForm;

import { cn } from '../utils';

export const Input = ({
  type,
  placeholder,
  value,
  onChange,
  required,
  disabled,
  ...props
}: {
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
}) => {
  return (
    <div className="space-y-1">
      <input
        type={type || 'text'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required || undefined}
        disabled={disabled || undefined}
        className={cn(
          "w-full px-3 py-2 border border-line rounded-md bg-cream text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-terracotta transition-colors",
          disabled ? "disabled:opacity-50 disabled:cursor-not-allowed" : undefined
        )}
        {...props}
      />
    </div>
  );
};
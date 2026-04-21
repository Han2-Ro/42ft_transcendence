type Props = {
  id: string;
  name: string;
  label: string;
  disabled?: boolean;
  required?: boolean;
  type?: React.HTMLInputTypeAttribute;
  className?: string;
  autocomplete?: string;
};

export const TextInput = ({
  id,
  name,
  label,
  disabled,
  required,
  type = "text",
  className = "",
  autocomplete,
}: Props) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={id} className="font-bold">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        className={`px-2 py-1 border-2 rounded-sm ${disabled ? "text-neutral-400" : "border-gray-500 "}`}
        required={required}
        disabled={disabled}
        autoComplete={autocomplete}
      />
    </div>
  );
};

type Props = {
  id: string;
  name: string;
  label: string;
  disabled?: boolean;
  required?: boolean;
  type?: React.HTMLInputTypeAttribute;
};

export const TextInput = ({
  id,
  name,
  label,
  disabled,
  required,
  type = "text",
}: Props) => {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-bold">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        className="px-2 py-1 border-2 rounded-sm border-gray-500"
        required={required}
        disabled={disabled}
      />
    </div>
  );
};

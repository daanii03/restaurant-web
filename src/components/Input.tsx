
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  labelText: string;
  placeholder?:string;
  type: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

export default function Input({ id, labelText, type, error, ...rest }: InputProps) {
  return (
    <div className="flex flex-col gap-2 py-4 w-full">
      <label htmlFor={id} className="text-primary font-bold">
        {labelText}
      </label>
      <input
        id={id}
        type={type}
        {...rest}
        className={`bg-elevated border rounded-sm p-2 outline-none transition-colors scheme-dark ${
          error
            ? "border-brand-red text-brand-red focus:border-brand-red"
            : "border-muted/40 text-primary focus:border-primary/80"
        }`}
      />
      {error && <p className="text-brand-red text-xs">{error}</p>}
    </div>
  );
}

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  labelText: string;
  placeholder?:string;
  type: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Input({ id, labelText, type, ...rest }: InputProps) {
  return (
    <div className="flex flex-col gap-2 py-4 w-full">
      <label htmlFor={id} className="text-primary font-bold">
        {labelText}
      </label>
      <input
        id={id}
        type={type}
        {...rest}
        className="text-primary bg-elevated border border-muted/40 rounded-sm p-2 outline-none focus:border-primary/80 transition-colors scheme-dark"
      />
    </div>
  );
}

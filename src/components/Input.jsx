import React from 'react';
import { twMerge } from 'tailwind-merge';

export const Input = React.forwardRef(({ 
  label, 
  error, 
  className, 
  id,
  type = 'text',
  ...props 
}, ref) => {
  return (
    <div className="w-full space-y-1.5 font-sans">
      {label && (
        <label 
          htmlFor={id} 
          className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        type={type}
        className={twMerge(
          "flex w-full rounded-lg border px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-medium",
          // Theme specific
          "bg-white text-zinc-900 border-zinc-200 placeholder:text-zinc-400",
          "dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800 dark:placeholder:text-zinc-500 dark:ring-offset-zinc-950",
          error && "border-red-500 focus-visible:ring-red-500 dark:border-red-500",
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-1 ml-1 font-medium">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

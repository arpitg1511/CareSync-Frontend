import React from 'react';
import { twMerge } from 'tailwind-merge';

export const Card = ({ children, className, title, subtitle, footer }) => {
  return (
    <div className={twMerge(
      "border rounded-xl shadow-sm transition-all duration-300 overflow-hidden backdrop-blur-sm",
      "bg-white border-zinc-200 text-zinc-900",
      "dark:bg-zinc-900/50 dark:border-zinc-800 dark:text-zinc-100",
      className
    )}>
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          {title && <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{title}</h3>}
          {subtitle && <p className="text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 bg-zinc-50/50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800">
          {footer}
        </div>
      )}
    </div>
  );
};

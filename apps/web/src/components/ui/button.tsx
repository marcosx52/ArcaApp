import { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

export function Button({
  className,
  variant = 'default',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'outline' }) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 dark:focus-visible:ring-slate-100/20 disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'default'
          ? 'bg-slate-900 text-white shadow-sm hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white'
          : 'bg-white/80 border border-slate-200 text-slate-800 hover:bg-slate-50 dark:bg-slate-950/70 dark:border-slate-800 dark:text-slate-100 dark:hover:bg-slate-900',
        className,
      )}
      {...props}
    />
  );
}

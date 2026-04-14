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
        'inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition',
        variant === 'default'
          ? 'bg-slate-900 text-white hover:bg-slate-800'
          : 'bg-white border border-slate-200 text-slate-800 hover:bg-slate-50',
        className,
      )}
      {...props}
    />
  );
}

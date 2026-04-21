import clsx from 'clsx';

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={clsx(
        'w-full rounded-2xl border border-slate-200 bg-white/85 px-4 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10 aria-[invalid=true]:border-red-300 aria-[invalid=true]:bg-red-50/60 aria-[invalid=true]:focus:border-red-400 aria-[invalid=true]:focus:ring-red-500/20 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-700 dark:focus:ring-slate-100/10 dark:aria-[invalid=true]:border-red-500/60 dark:aria-[invalid=true]:bg-red-950/20 dark:aria-[invalid=true]:focus:border-red-400 dark:aria-[invalid=true]:focus:ring-red-500/20',
        props.className,
      )}
    />
  );
}

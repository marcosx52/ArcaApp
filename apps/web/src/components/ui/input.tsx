import clsx from 'clsx';

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={clsx('w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm', props.className)} />;
}

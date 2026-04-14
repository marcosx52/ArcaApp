import clsx from 'clsx';

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span {...props} className={clsx('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', className)} />;
}

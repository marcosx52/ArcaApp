import Link from 'next/link';
import { Button } from '../ui/button';

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white/88 p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-950/72">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      {actionLabel ? (
        actionHref ? (
          <Link
            href={actionHref}
            className="mt-4 inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
          >
            {actionLabel}
          </Link>
        ) : (
          <Button className="mt-4">{actionLabel}</Button>
        )
      ) : null}
    </div>
  );
}

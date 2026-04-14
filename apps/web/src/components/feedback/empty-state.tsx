import { Button } from '../ui/button';

export function EmptyState({
  title,
  description,
  actionLabel,
}: {
  title: string;
  description: string;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
      {actionLabel ? <Button className="mt-4">{actionLabel}</Button> : null}
    </div>
  );
}

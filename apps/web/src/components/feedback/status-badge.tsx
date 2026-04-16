import { Badge } from '../ui/badge';

export function StatusBadge({
  children,
  tone = 'default',
}: {
  children: React.ReactNode;
  tone?: 'default' | 'success' | 'warning' | 'danger';
}) {
  const tones = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    success: 'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
    danger: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300',
  };

  return <Badge className={tones[tone]}>{children}</Badge>;
}

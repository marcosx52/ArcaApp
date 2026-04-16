export function LoadingState({ label = 'Cargando...' }: { label?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/88 p-6 text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-950/72 dark:text-slate-400">
      {label}
    </div>
  );
}

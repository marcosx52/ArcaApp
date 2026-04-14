export const formatCurrency = (value: number | string) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 2 }).format(
    typeof value === 'string' ? Number(value) : value
  );

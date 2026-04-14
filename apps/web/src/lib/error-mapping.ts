export function mapError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Ocurrió un error inesperado';
}

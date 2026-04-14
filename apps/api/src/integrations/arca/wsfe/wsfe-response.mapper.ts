export function mapWsfeResponse(response: any) {
  return {
    success: response?.Resultado === 'A',
    cae: response?.CAE,
    caeDueDate: response?.CAEFchVto,
    message: response?.Resultado === 'A' ? 'Aceptado por ARCA' : 'Rechazado por ARCA',
  };
}

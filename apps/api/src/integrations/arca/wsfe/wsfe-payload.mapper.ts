export function mapInvoiceToWsfePayload(invoice: Record<string, unknown>) {
  return {
    CabReq: { CantReg: 1, PtoVta: 3, CbteTipo: 11 },
    FeDetReq: { FECAEDetRequest: [invoice] },
  };
}

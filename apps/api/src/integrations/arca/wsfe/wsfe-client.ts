export class WsfeClient {
  async emit(_payload: unknown, _auth: unknown) {
    return {
      Resultado: 'A',
      CAE: '00000000000000',
      CAEFchVto: '20260501',
      Observaciones: [],
    };
  }
}

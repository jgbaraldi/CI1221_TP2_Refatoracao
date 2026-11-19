export default class CidadesTXTReporter {
  constructor(titulo){
    this.titulo = titulo;
  }

  /** @param {{nome: string}[]} cidades */
  reportar(cidades) {
    const itens = cidades.map((cidade) => `* ${cidade.nome}`);

    return [
      this.titulo,
      '='.repeat(this.titulo.length),
      ...itens
    ].join('\n');
  }
}


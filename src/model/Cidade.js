/**
 * Modelo comum de uma cidade
 */
export default class Cidade {
  constructor({ nome, codigo = null, uf = null }) {
    this.nome = nome;
    this.codigo = codigo;
    this.uf = uf;
  }
}

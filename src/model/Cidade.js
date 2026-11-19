/**
 * Modelo comum de uma cidade
 * - nome: obrigatório, não vazio
 */
export default class Cidade {
  constructor({ nome } = {}) {
    if (typeof nome !== 'string' || nome.trim() === '') {
      throw new Error('Cidade inválida: "nome" é obrigatório e deve ser um texto não vazio.');
    }

    this.nome = nome.trim();
  }
}

import CidadesReader from './CidadesReader.js';
import Cidade from '../model/Cidade.js';

/**
 * Lê cidades de um arquivo CSV com cabeçalho:
 *   COD UF,COD,NOME
 */
export default class CsvCidadesReader extends CidadesReader {
  constructor(separador = ',') {
    super();
    this.separador = separador;
  }

  /**
   * Transforma o texto CSV em uma lista de objetos, usando o cabeçalho
   * como nomes dos campos: { 'COD UF': '11', COD: '1100015', NOME: '...' }.
   */
  parse(conteudo) {
    const linhas = conteudo
      .split(/\r?\n/)
      .filter((linha) => linha.trim() !== '');

    if (linhas.length === 0) {
      throw new Error('CSV de cidades inválido: arquivo vazio.');
    }

    const [cabecalho, ...dados] = linhas;
    const colunas = cabecalho.split(this.separador).map((coluna) => coluna.trim());

    return dados.map((linha, i) => {
      const valores = linha.split(this.separador);
      if (valores.length !== colunas.length) {
        // +2: uma linha do cabeçalho e numeração começando em 1
        throw new Error(
          `CSV de cidades inválido na linha ${i + 2}: esperado ${colunas.length} campos, encontrado ${valores.length}.`,
        );
      }
      return Object.fromEntries(colunas.map((coluna, j) => [coluna, valores[j].trim()]));
    });
  }

  converter(registro) {
    return new Cidade({
      nome: registro.NOME,
      codigo: registro.COD,
      uf: registro['COD UF'],
    });
  }
}

import * as path from 'node:path';
import JsonCidadesReader from './JsonCidadesReader.js';
import CsvCidadesReader from './CsvCidadesReader.js';

/**
 * escolhe o leitor a partir da extensão do arquivo de dados.

 */
const LEITORES = {
  '.json': JsonCidadesReader,
  '.csv': CsvCidadesReader,
};

export default class ReaderFactory {
  /**
   * @param {string} caminho caminho do arquivo de dados (ex: data/cidades.csv)
   * @returns {import('./CidadesReader.js').default}
   */
  static criar(caminho) {
    const extensao = path.extname(caminho).toLowerCase();
    const Leitor = LEITORES[extensao];

    if (!Leitor) {
      throw new Error(
        `Formato de arquivo não suportado: "${extensao || caminho}". ` +
        `Use um destes: ${ReaderFactory.extensoesSuportadas().join(', ')}.`,
      );
    }

    return new Leitor();
  }

  /** Lista de extensões aceitas, útil para mensagens de ajuda. */
  static extensoesSuportadas() {
    return Object.keys(LEITORES);
  }
}

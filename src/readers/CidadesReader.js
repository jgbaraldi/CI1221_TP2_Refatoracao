import * as fs from 'node:fs';


export default class CidadesReader {
  constructor() {
    if (new.target === CidadesReader) {
      throw new TypeError('CidadesReader é abstrata; use uma subclasse (ex: JsonCidadesReader).');
    }
  }

  /**
   * @param {string} caminho caminho do arquivo de dados
   * @returns {import('../model/Cidade.js').default[]}
   */
  ler(caminho) {
    const conteudo = this.lerArquivo(caminho);
    const registros = this.parse(conteudo);
    return registros.map((registro, i) => {
      try {
        return this.converter(registro);
      } catch (erro) {
        throw new Error(`Registro ${i + 1} de "${caminho}": ${erro.message}`);
      }
    });
  }

  /** Passo comum a todos os formatos: lê o arquivo como texto UTF-8. */
  lerArquivo(caminho) {
    return fs.readFileSync(caminho, 'utf-8');
  }

  /**
   * Interpreta o texto do arquivo e devolve uma lista de registros brutos.
   * @abstract
   */
  parse(conteudo) {
    throw new Error(`${this.constructor.name} deve implementar parse()`);
  }

  /**
   * Converte um registro bruto do formato para o modelo comum Cidade.
   * @abstract
   */
  converter(registro) {
    throw new Error(`${this.constructor.name} deve implementar converter()`);
  }
}

import CidadesReader from './CidadesReader.js';
import Cidade from '../model/Cidade.js';

/**
 * Lê cidades de um arquivo JSON 
 */
export default class JsonCidadesReader extends CidadesReader {
  parse(conteudo) {
    const dados = JSON.parse(conteudo);
    if (!Array.isArray(dados)) {
      throw new Error('JSON de cidades inválido: esperado um array de objetos.');
    }
    return dados;
  }

  converter(registro) {
    return new Cidade({
      nome: registro.Nome,
      codigo: registro.ID,
      uf: registro.Estado,
    });
  }
}

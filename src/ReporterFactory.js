import CidadesHTMLReporter from './CidadesHTMLReporter.js';
import CidadesTXTReporter from './CidadesTXTReporter.js';

const REPORTERS = new Map([
  ['html', CidadesHTMLReporter],
  ['txt', CidadesTXTReporter],
]);

export default class ReporterFactory {
    /**
    * @param {string} formato
    * @returns {ReporterClass}
    */
    static criar(formato) {
      const ReporterClass = REPORTERS.get(formato);
      if (!ReporterClass) {
        throw new Error(
            `Formato de relatório desconhecido: ${formato}. 
            Formatos suportados: ${ReporterFactory.formatosSuportados().join(', ')}.
            `);
      }
      return new ReporterClass();
    }

    static formatosSuportados() {
      return [...REPORTERS.keys()];
    }
}
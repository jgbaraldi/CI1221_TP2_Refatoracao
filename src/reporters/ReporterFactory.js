import CidadesHTMLReporter from './CidadesHTMLReporter.js';
import CidadesTXTReporter from './CidadesTXTReporter.js';
import CidadesMarkdownReporter from './CidadesMarkdownReporter.js';

import { TITULO_RELATORIO } from './reporterConstants.js';

const REPORTERS = new Map([
  ['html', CidadesHTMLReporter],
  ['txt', CidadesTXTReporter],
  ['md', CidadesMarkdownReporter]
]);

export default class ReporterFactory {
    /**
    * @param {string} formato
    * @returns {ReporterClassGenerator}
    */
    static criar(formato) {
        if (typeof formato !== 'string' || !formato.trim()) {
            throw new Error('Informe um formato de relatório.');
        }
    
        const ReporterClassGenerator = REPORTERS.get(formato.trim().toLowerCase());

        if (!ReporterClassGenerator) {
          throw new Error(
              `Formato de relatório desconhecido: ${formato}. 
              Use um dos formatos suportados: ${ReporterFactory.formatosSuportados().join(', ')}.
            `);
        }

        return new ReporterClassGenerator(TITULO_RELATORIO);
    }

    static formatosSuportados() {
        return [...REPORTERS.keys()];
    }
}
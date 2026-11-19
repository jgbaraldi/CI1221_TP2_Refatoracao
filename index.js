import { parseArgs } from 'node:util';
import ReaderFactory from './src/readers/ReaderFactory.js';
import ReporterFactory from './src/reporters/ReporterFactory.js';

try {
    const { values } = parseArgs({
        options: {
            format: { type: 'string' },
            source: { type: 'string' },
        },
    });

    const arquivo = values.source;
    const formato = values.format;

    if (!arquivo || !formato) {
        throw new Error(
            'Uso: node index.js --format=<formato> --source=<arquivo>'
        );
    }

    const leitor = ReaderFactory.criar(arquivo);
    const reporter = ReporterFactory.criar(formato);

    const cidades = leitor.ler(arquivo);
    const relatorio = reporter.reportar(cidades);

    console.log(relatorio);

} catch (erro) {
    console.error(`Erro: ${erro.message}`);
    process.exit(1);
}

import ReaderFactory from './src/readers/ReaderFactory.js';
import ReporterFactory from './src/reporters/ReporterFactory.js';

const [,, arquivo, formato] = process.argv;

if (!arquivo || !formato) {
  console.error('Uso: node index.js <arquivo> <formato>');
  console.error(
    `Fontes suportadas: ${ReaderFactory.extensoesSuportadas().join(', ')}`
  );
  console.error(
    `Formatos suportados: ${ReporterFactory.formatosSuportados().join(', ')}`
  );

  process.exit(1);
}

try {
  const leitor = ReaderFactory.criar(arquivo);
  const reporter = ReporterFactory.criar(formato);

  const cidades = leitor.ler(arquivo);
  const relatorio = reporter.reportar(cidades);

  console.log(relatorio);
} catch (erro) {
  console.error(`Erro: ${erro.message}`);
  process.exit(1);
}
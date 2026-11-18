
function escaparMarkdown(texto) {
  return texto.replace(/[\\`*_{}\[\]()<>#+.!|~&-]/g, '\\$&');
}

export default class CidadesMarkdownReporter {
  constructor(titulo) {
    this.titulo = titulo;
  }

  /** @param {{nome: string}[]} cidades */
  reportar(cidades) {
    const itens = cidades.map(
      (cidade) => `- ${escaparMarkdown(cidade.nome)}`
    );

    return [
      `# ${escaparMarkdown(this.titulo)}`,
      '',
      ...itens
    ].join('\n');
  }
}
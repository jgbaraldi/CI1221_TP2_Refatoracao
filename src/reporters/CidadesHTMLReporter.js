function escaparHTML(texto) {
  return texto.replace(/[&<>"']/g, (caractere) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[caractere]);
}

export default class CidadesHTMLReport {
  constructor(titulo){
    this.titulo = titulo;
  }

  /** @param {{nome: string}[]} cidades */
  reportar(cidades) {
    const itens = cidades
      .map((cidade) => `      <li>${escaparHTML(cidade.nome)}</li>`)
      .join('\n');

    return `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${escaparHTML(this.titulo)}</title>
        </head>
        <body>
          <h1>${escaparHTML(this.titulo)}</h1>
          <ul>
      ${itens}
          </ul>
        </body>
      </html>`;
  }
}

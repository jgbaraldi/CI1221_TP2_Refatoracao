
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

// Execute a partir da raiz do repositório.
const RAIZ = process.cwd();
const TITULO = 'Relatório de Nomes de Cidades';
const FORMATOS = ['html', 'txt', 'md'];
const JSON_PATH = 'data/cidades-2.json';
const CSV_PATH = 'data/cidades.csv';

// Oráculo independente: não importa readers, reporters ou factories do projeto.
function lerEsperadoJSON(caminho) {
  return JSON.parse(readFileSync(resolve(RAIZ, caminho), 'utf8'))
    .map(registro => registro.Nome.trim());
}

function lerEsperadoCSV(caminho) {
  const [cabecalho, ...linhas] = readFileSync(resolve(RAIZ, caminho), 'utf8')
    .replace(/^\uFEFF/, '').split(/\r?\n/).filter(linha => linha.trim());
  assert.equal(cabecalho, 'COD UF,COD,NOME', 'Cabeçalho da base de referência');
  return linhas.map((linha, i) => {
    // Layout específico do CSV fornecido: dois códigos numéricos e um nome.
    const registro = /^\d+,\d+,([^,]+)$/.exec(linha);
    assert.ok(registro, `CSV de referência: linha ${i + 2} inesperada`);
    return registro[1].trim();
  });
}

function executar(arquivo, formato) {
  const args = [];

  if (formato !== undefined) args.push(`--format=${formato}`);
  if (arquivo !== undefined) args.push(`--source=${arquivo}`);

  const resultado = spawnSync(
    process.execPath,
    [join(RAIZ, 'index.js'), ...args],
    {
      cwd: RAIZ,
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
      timeout: 15000,
    }
  );

  if (resultado.error) throw resultado.error;

  assert.equal(resultado.signal, null, 'Processo encerrado por sinal');

  return resultado;
}

function sucesso(...args) {
  const r = executar(...args);
  assert.equal(r.status, 0, `CLI falhou: ${r.stderr}`);
  assert.equal(r.stderr.trim(), '', 'Saída inesperada em stderr');
  assert.ok(r.stdout.trim(), 'Relatório vazio');
  return r.stdout;
}

function erro(args, mensagem) {
  const r = executar(...args);
  assert.ok(Number.isInteger(r.status) && r.status !== 0, 'Esperado código de saída não zero');
  assert.equal(r.stdout.trim(), '', 'Não deve gerar relatório em caso de erro');
  assert.ok(r.stderr.trim(), 'Esperada mensagem de erro em stderr');
  assert.match(r.stderr, mensagem);
}

function decodificarHTML(texto) {
  const entidades = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
  const entidade = /&(?:amp|lt|gt|quot|apos|#\d+|#x[\da-fA-F]+);/g;
  assert.ok(!/[<>&]/.test(texto.replace(entidade, '')), 'Caractere HTML não escapado');
  return texto.replace(entidade, valor => {
    const nome = valor.slice(1, -1);
    if (nome.startsWith('#x')) return String.fromCodePoint(parseInt(nome.slice(2), 16));
    if (nome.startsWith('#')) return String.fromCodePoint(Number(nome.slice(1)));
    return entidades[nome];
  });
}

function linhasDeLista(linhas, prefixo) {
  return linhas.map((linha, i) => {
    assert.ok(linha.startsWith(prefixo), `Marcador incorreto no item ${i + 1}`);
    return linha.slice(prefixo.length);
  });
}

function extrairNomes(formato, saida) {
  // Remove só as quebras finais da CLI, não espaços dos nomes.
  const texto = saida.replace(/(?:\r?\n)+$/, '').replace(/\r\n/g, '\n');
  assert.ok(!texto.includes('\uFFFD'), 'Caractere de substituição: possível erro de encoding');
  if (formato === 'html') {
    // Valida a estrutura simples esperada do reporter, tolerando indentação.
    const estrutura = /^\s*<!DOCTYPE html>\s*<html>\s*<head>\s*<meta charset="utf-8"\s*\/?\s*>\s*<title>([^<]*)<\/title>\s*<\/head>\s*<body>\s*<h1>([^<]*)<\/h1>\s*<ul>([\s\S]*?)<\/ul>\s*<\/body>\s*<\/html>\s*$/i;
    const match = estrutura.exec(texto);
    assert.ok(match, 'Estrutura HTML inválida ou diferente do contrato esperado');
    assert.equal(decodificarHTML(match[1]), TITULO);
    assert.equal(decodificarHTML(match[2]), TITULO);
    const lista = match[3];
    const itens = [...lista.matchAll(/<li>([^<]*)<\/li>/g)];
    assert.equal(lista.replace(/<li>[^<]*<\/li>/g, '').trim(), '', 'Conteúdo inesperado em ul');
    return itens.map(item => decodificarHTML(item[1]));
  }
  const [titulo, separador, ...itens] = texto.split('\n');
  if (formato === 'txt') {
    assert.equal(titulo, TITULO);
    assert.equal(separador, '='.repeat(TITULO.length));
    return linhasDeLista(itens, '* ');
  }
  assert.equal(titulo, `# ${TITULO}`);
  assert.equal(separador, '', 'Falta linha em branco após título Markdown');
  // CommonMark: barra invertida seguida por pontuação ASCII é um escape.
  return linhasDeLista(itens, '- ').map(nome =>
    nome.replace(/\\([!-/:-@\[-`{-~])/g, '$1'));
}

function verificarNomes(atuais, esperados) {
  assert.equal(atuais.length, esperados.length, 'Quantidade de registros divergente');
  // Comparação posicional: detecta perda, duplicação indevida e mudança de ordem.
  for (let i = 0; i < esperados.length; i++) {
    assert.equal(atuais[i], esperados[i], `Nome divergente no registro ${i + 1}`);
  }
}

for (const [fonte, caminho, ler, quantidade] of [
  ['JSON', JSON_PATH, lerEsperadoJSON, 5340],
  ['CSV', CSV_PATH, lerEsperadoCSV, 5570],
]) {
  for (const formato of FORMATOS) {
    test(`${fonte} → ${formato.toUpperCase()} (${quantidade} registros)`, () => {
      const esperado = ler(caminho);
      assert.equal(esperado.length, quantidade, 'Quantidade na base original do TP2');
      verificarNomes(extrairNomes(formato, sucesso(caminho, formato)), esperado);
    });
  }
}

// Entradas controladas, independentes das bases fornecidas.
const temporario = mkdtempSync(join(tmpdir(), 'tp2-testes-'));
after(() => rmSync(temporario, { recursive: true, force: true }));
function fixture(nome, conteudo) {
  const caminho = join(temporario, nome);
  writeFileSync(caminho, conteudo, 'utf8');
  return caminho;
}
const nomes = ['São João', 'São João', 'A & B <Centro>', 'Cidade *Nova*', 'Olho d`Água', 'Vila "Azul"', "D'Oeste", '[Centro](bairro)', 'Lagoa-Nova'];
const especiaisJSON = fixture('especiais.json', JSON.stringify(nomes.map(Nome => ({ Nome }))));
const especiaisCSV = fixture('especiais.csv', 'COD UF,COD,NOME\n' + nomes.map((nome, i) => `41,${i + 1},${nome}`).join('\n'));
for (const [fonte, caminho] of [['JSON', especiaisJSON], ['CSV', especiaisCSV]]) {
  for (const formato of FORMATOS) {
    test(`${fonte} → ${formato}: acentos, homônimos e caracteres especiais`, () => {
      const saida = sucesso(caminho, formato);
      verificarNomes(extrairNomes(formato, saida), nomes);
      if (formato === 'html') {
        assert.match(saida, /A &amp; B &lt;Centro&gt;/);
      }
      if (formato === 'md') {
        assert.ok(saida.includes('Cidade \\*Nova\\*'), 'Asteriscos devem ser escapados');
        assert.ok(saida.includes('Olho d\\`Água'), 'Crase deve ser escapada');
        assert.ok(saida.includes('\\[Centro\\]\\(bairro\\)'), 'Não deve criar link Markdown');
      }
    });
  }
}

const jsonInvalido = fixture('invalido.json', '[{');
const jsonObjeto = fixture('objeto.json', '{"Nome":"Curitiba"}');
const jsonSemNome = fixture('sem-nome.json', '[{"ID":"1"}]');
const jsonNomeVazio = fixture('nome-vazio.json', '[{"Nome":"   "}]');
const csvInvalido = fixture('invalido.csv', 'COD UF,COD,NOME\n41,123');
const csvSemNome = fixture('sem-nome.csv', 'COD UF,COD,CIDADE\n41,123,Curitiba');
const csvVazio = fixture('vazio.csv', '');
const xml = fixture('cidades.xml', '<cidades/>');

for (const [nome, args, mensagem] of [
  ['Argumentos ausentes', [], /uso|argument|formato/i],
  ['Formato de relatório inválido', [JSON_PATH, 'pdf'], /formato/i],
  ['Extensão de entrada não suportada', [xml, 'html'], /formato|extens[aã]o/i],
  ['Arquivo inexistente', [join(temporario, 'inexistente.json'), 'html'], /ENOENT|inexistente|encontrad/i],
  ['JSON malformado', [jsonInvalido, 'html'], /JSON|syntax|unexpected|expected/i],
  ['JSON não é array', [jsonObjeto, 'txt'], /array|JSON/i],
  ['JSON sem nome obrigatório', [jsonSemNome, 'md'], /nome/i],
  ['JSON com nome vazio', [jsonNomeVazio, 'html'], /nome/i],
  ['CSV com número incorreto de campos', [csvInvalido, 'txt'], /campo|CSV|linha/i],
  ['CSV sem coluna NOME (com registro)', [csvSemNome, 'md'], /nome|coluna|CSV/i],
  ['CSV vazio', [csvVazio, 'html'], /vazio|CSV/i],
]) {
  test(`Erro: ${nome}`, () => erro(args, mensagem));
}
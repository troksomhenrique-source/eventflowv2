// Monta o modo demonstração dentro do v6.html.
// Uso (na raiz do repositório): node exemplos/demo/montar.js
// Junta o catálogo e as ilustrações de exemplos/gerador com os arquivos
// desta pasta e grava três blocos no v6.html (substitui se já existirem):
//   <style id="v6-demo-css">   antes do </head>
//   <script id="v6-demo">      logo depois do supabase-js: troca o cliente pelo banco falso
//   <script id="v6-demo-ui">   no fim do arquivo: botões do login e faixa de aviso
const fs = require("fs"), path = require("path");
const RAIZ = path.join(__dirname, "..", "..");
const ARQ = path.join(RAIZ, "v6.html");
const { itens, kits, frota } = require("../gerador/catalogo");
const { svg, tipos } = require("../gerador/desenhos");

const usados = new Set(itens.map(i => i[12]));
const desenhos = Object.fromEntries(tipos.filter(t => usados.has(t) || t === "rack").map(t => [t, svg(t)]));
const json = v => JSON.stringify(v).replace(/<\//g, "<\\/");
const runtime = fs.readFileSync(path.join(__dirname, "demo-runtime.js"), "utf8")
  .replace("__CATALOGO__", () => json({ itens, kits, frota }))
  .replace("__DESENHOS__", () => json(desenhos));
const ui = fs.readFileSync(path.join(__dirname, "demo-ui.js"), "utf8");
const css = fs.readFileSync(path.join(__dirname, "demo.css"), "utf8");

let h = fs.readFileSync(ARQ, "utf8");
const tira = id => { h = h.replace(new RegExp(`\\n?<(script|style) id="${id}">[\\s\\S]*?</\\1>`), ""); };
["v6-demo-css", "v6-demo", "v6-demo-ui"].forEach(tira);

const cdn = h.match(/<script src="[^"]*supabase-js[^"]*"><\/script>/);
if (!cdn) throw new Error("Não achei o <script> do supabase-js no v6.html.");
h = h.replace(cdn[0], () => cdn[0] + `\n<script id="v6-demo">\n${runtime}</script>`);
const head = h.indexOf("</head>");
h = h.slice(0, head) + `<style id="v6-demo-css">\n${css}</style>\n` + h.slice(head);
const fim = h.lastIndexOf("</body>");
h = h.slice(0, fim) + `<script id="v6-demo-ui">\n${ui}</script>\n` + h.slice(fim);

fs.writeFileSync(ARQ, h);
console.log(`v6.html atualizado · ${itens.length} itens, ${Object.keys(desenhos).length} ilustrações, ${(h.length / 1024).toFixed(0)} KB`);

// Gera os arquivos para publicar a partir do v6.html.
// Uso (na raiz do repositório): node exemplos/demo/montar.js
//
//   publicar/app/index.html    o sistema, para a sua equipe e clientes
//   publicar/demo/index.html   a demonstração: entra com um clique nos logins
//                              da empresa de demonstração (supabase/demo/empresa_demo.sql)
const fs = require("fs"), path = require("path");
const RAIZ = path.join(__dirname, "..", "..");
const ORIGEM = path.join(RAIZ, "v6.html");
const CFG = require("./config");

let h = fs.readFileSync(ORIGEM, "utf8");
/* o modo demonstração antigo (banco falso dentro do v6.html) saiu: a demonstração agora usa o banco real */
const tira = (txt, id) => txt.replace(new RegExp(`\\n?<(script|style) id="${id}">[\\s\\S]*?</\\1>`), "");
const limpo = ["v6-demo-css", "v6-demo", "v6-demo-ui"].reduce(tira, h);
if (limpo !== h) { fs.writeFileSync(ORIGEM, limpo); console.log("v6.html: modo demonstração antigo removido"); }
h = limpo;

const grava = (rel, txt) => {
  const p = path.join(RAIZ, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, txt);
  console.log(`${rel} · ${(txt.length / 1024).toFixed(0)} KB`);
};
const naHead = (txt, extra) => { const i = txt.indexOf("</head>"); return txt.slice(0, i) + extra + txt.slice(i); };
const noFim = (txt, extra) => { const i = txt.lastIndexOf("</body>"); return txt.slice(0, i) + extra + txt.slice(i); };

/* sistema: igual ao v6.html, fora dos buscadores */
grava("publicar/app/index.html", naHead(h, `<meta name="robots" content="noindex, nofollow">\n`));

/* demonstração */
const css = fs.readFileSync(path.join(__dirname, "demo.css"), "utf8");
const js = fs.readFileSync(path.join(__dirname, "demo-login.js"), "utf8").replace("__CFG__", () => JSON.stringify(CFG));
let demo = h.replace(/<title>[^<]*<\/title>/, "<title>EventFlow · Demonstração</title>");
demo = naHead(demo, `<style id="v6-demo-css">\n${css}</style>\n`);
demo = noFim(demo, `<script id="v6-demo">\n${js}</script>\n`);
grava("publicar/demo/index.html", demo);

// Gera exemplos/inventario-locadora-medio-grande.xlsx (Inventario, Kits, Frota, Fotos, Leia-me)
const XLSX = require("xlsx");
const { chromium } = require("playwright");
const path = require("path"), fs = require("fs");
const { itens, kits, frota } = require("./catalogo");
const { svg, tipos } = require("./desenhos");
const SAIDA = process.argv[2] || path.join(__dirname, "..", "inventario-locadora-medio-grande.xlsx");
const PREVIA = process.argv[3];
(async () => {
  // checagens de consistência antes de gerar
  const cods = new Set();
  for (const i of itens) { if (cods.has(i[0])) throw Error("código repetido " + i[0]); cods.add(i[0]); if (!tipos.includes(i[12])) throw Error("sem desenho: " + i[12]); if (i[11] > i[10]) throw Error("manutenção > total " + i[0]); }
  for (const k of kits) for (const [c] of k[4]) if (!cods.has(c)) throw Error(`kit ${k[0]} usa item inexistente ${c}`);
  // renderiza um desenho por tipo e reaproveita para todos os itens daquele tipo
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 320, height: 240 }, deviceScaleFactor: 1 });
  const fotoTipo = {};
  for (const t of new Set(itens.map(i => i[12]))) {
    await p.setContent(`<html><body style="margin:0">${svg(t)}</body></html>`);
    const buf = await p.screenshot({ type: "jpeg", quality: 82, clip: { x: 0, y: 0, width: 320, height: 240 } });
    fotoTipo[t] = "data:image/jpeg;base64," + buf.toString("base64");
    if (fotoTipo[t].length > 32000) throw Error("imagem grande demais para a célula: " + t);
  }
  if (PREVIA) { // folha de contato para conferir os desenhos
    const html = `<body style="margin:0;display:grid;grid-template-columns:repeat(8,160px);gap:4px;background:#ccc;font:10px sans-serif">${Object.entries(fotoTipo).map(([t, s]) => `<div><img src="${s}" width="160"><br>${t}</div>`).join("")}</body>`;
    await p.setViewportSize({ width: 8 * 164, height: 1400 }); await p.setContent(html); await p.screenshot({ path: PREVIA, fullPage: true });
  }
  await b.close();
  const wb = XLSX.utils.book_new();
  const add = (nome, m, larg) => { const ws = XLSX.utils.aoa_to_sheet(m); ws["!cols"] = larg.map(w => ({ wch: w })); if (m.length > 1) ws["!autofilter"] = { ref: ws["!ref"] }; XLSX.utils.book_append_sheet(wb, ws, nome); };
  add("Inventario", [["codigo", "descricao", "categoria", "unidade", "marca", "modelo", "peso_kg", "unidades_por_case", "consumo_w", "diaria_brl", "quantidade_total", "em_manutencao", "observacao_tecnica"],
    ...itens.map(i => [i[0], i[1], i[2], i[3], i[4], i[5], i[6], i[7], i[8], i[9], i[10], i[11], i[13]])], [18, 46, 12, 9, 18, 24, 9, 10, 10, 10, 10, 10, 90]);
  add("Kits", [["kit_codigo", "kit_nome", "categoria", "para_que_serve", "item_codigo", "quantidade"], ...kits.flatMap(k => k[4].map(([c, q]) => [k[0], k[1], k[2], k[3], c, q]))], [16, 34, 12, 44, 18, 11]);
  add("Frota", [["codigo", "nome", "tipo", "placa", "capacidade_kg", "capacidade_cases", "lugares", "em_manutencao", "observacao"], ...frota], [10, 34, 20, 10, 14, 16, 9, 14, 46]);
  add("Fotos", [["item_codigo", "foto"], ...itens.map(i => [i[0], fotoTipo[i[12]]])], [18, 60]);
  add("Leia-me", [["EventFlow · inventário de exemplo (locadora de médio/grande porte)"], [""],
    ["Aba", "Conteúdo"],
    ["Inventario", `${itens.length} itens: som (Electro-Voice, DAS Audio, RCF), luz (Briwax, Showtech e linha chinesa), vídeo/painel LED, cenografia, estrutura, internet e energia. Peso e consumo por unidade, de referência: confira na etiqueta.`],
    ["Kits", `${kits.length} kits prontos, uma linha por componente.`],
    ["Frota", `${frota.length} veículos. As placas TST… são de teste: troque pelas reais.`],
    ["Fotos", "Ilustrações por tipo de aparelho, para o modo “Com foto”. Troque por fotos reais pela ficha do item ou colocando um link https:// da imagem nesta aba."],
    [""], ["Como importar: Inventário → Importar arquivo → escolha este Excel → confira a prévia → Confirmar."]], [14, 140]);
  fs.mkdirSync(path.dirname(SAIDA), { recursive: true });
  XLSX.writeFile(wb, SAIDA);
  console.log(`${itens.length} itens · ${kits.length} kits · ${frota.length} veículos · ${Object.keys(fotoTipo).length} desenhos → ${SAIDA} (${(fs.statSync(SAIDA).size / 1024).toFixed(0)} KB)`);
})().catch(e => { console.error(e); process.exit(1); });

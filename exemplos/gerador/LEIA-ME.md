# Gerador do inventário de exemplo

Gera `../inventario-locadora-medio-grande.xlsx` com as abas Inventario, Kits, Frota, Fotos e Leia-me,
no formato que o EventFlow importa em **Inventário → Importar arquivo**.

- `catalogo.js` — itens, kits e frota (edite aqui para mudar quantidades, diárias, marcas).
- `desenhos.js` — ilustrações por tipo de aparelho usadas na aba Fotos.
- `gerar.js` — monta a planilha.

```bash
npm install xlsx@0.18.5 playwright
node gerar.js
```

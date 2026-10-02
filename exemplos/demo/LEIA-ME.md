# Modo demonstração

Uma locadora de grande porte já preenchida (Atlas Eventos & Locação), para apresentar o EventFlow sem tocar no banco.

**Como abrir**
- Na tela de login, em "Conhecer com dados de demonstração", escolha Gerência, Produção ou Estoque.
- Ou pelo endereço: `v6.html?demo=gerencia`, `?demo=producao` ou `?demo=estoque`.
- Dentro do sistema, a faixa no topo troca o nível de acesso ou sai da demonstração.

**O que tem**: 18 pessoas nos 3 níveis, 16 clientes, 14 freelancers, 117 equipamentos com ilustração, 11 kits, 9 veículos, 39 negócios em todas as etapas do funil, 21 ordens de serviço (um ano de histórico + eventos em andamento), cargas e movimentações, reembolsos, contas a pagar e receber, parceiros e sublocações (enviadas e recebidas), mural, chat, notas, agenda, avisos e histórico de alterações. As datas são relativas ao dia de hoje.

**Como funciona**: o app recebe um banco falso em memória no lugar do Supabase. Nada sai do navegador; ao sair ou trocar de perfil, tudo volta ao início. Chamadas de voz/vídeo e envio de arquivos não funcionam na demonstração.

**Para editar os dados**: altere `demo-runtime.js` (dados e banco falso), `demo-ui.js` (login e faixa) ou `demo.css`, e rode na raiz do repositório:

```
node exemplos/demo/montar.js
```

O script grava os blocos `v6-demo-css`, `v6-demo` e `v6-demo-ui` dentro do `v6.html` (substitui os anteriores). O catálogo e as ilustrações vêm de `exemplos/gerador`.

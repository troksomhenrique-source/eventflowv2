# Empresa de demonstração e arquivos para publicar

## O que tem aqui

| Arquivo | Para quê |
|---|---|
| `dados.js` | os dados da empresa fictícia **Atlas Eventos & Locação** (pessoas, inventário, negócios, OS, cargas, financeiro, parceiros, mural, chat…) |
| `config.js` | e-mails e senha dos logins de demonstração |
| `gerar-sql.js` | gera `supabase/demo/empresa_demo.sql` |
| `demo-login.js`, `demo.css` | a tela de entrada da demonstração (três botões) e a faixa "Demonstração" |
| `montar.js` | gera `publicar/app/index.html` e `publicar/demo/index.html` a partir do `v6.html` |

## Como colocar a demonstração no ar

1. **Supabase → SQL Editor**: cole o arquivo `supabase/demo/empresa_demo.sql` inteiro e clique em **Run**.
   No fim aparece uma tabela com quantos registros entraram em cada parte. Se alguma parte mostrar "não gravados", o motivo está na última coluna.
   Pode rodar de novo quando quiser: ele apaga só os dados da empresa de demonstração e recria tudo com as datas de hoje. Nenhuma outra empresa é tocada.
2. **Cloudflare Pages**: publique a pasta `publicar/demo` num projeto (aberto ao público) e a pasta `publicar/app` em outro (protegido com Cloudflare Access).

Logins criados (senha em `config.js`, hoje `Demo@2026`):
`gerencia@atlas.example.com`, `producao@atlas.example.com`, `estoque@atlas.example.com` e mais 15 pessoas da equipe.

## Depois de mudar algo

Na raiz do repositório:

```
node exemplos/demo/gerar-sql.js   # mudou dados.js ou config.js
node exemplos/demo/montar.js      # mudou o v6.html, demo-login.js, demo.css ou config.js
```

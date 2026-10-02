/* EventFlow · modo demonstração: entrada pela tela de login e faixa de aviso.
   Gerado por exemplos/demo/montar.js. */
(function(){
const D=window.EF_DEMO||{};
const NIVEIS=[["gerencia","Gerência","Tudo: comercial, valores, financeiro e equipe"],
  ["producao","Produção","Negócios, OS, memoriais e escalas, sem financeiro"],
  ["estoque","Estoque","Inventário, cargas, frota e sublocação"]];

/* tela de login: atalho para conhecer o sistema com dados de exemplo */
const _login=telaLogin;
telaLogin=function(){
  const r=_login.apply(this,arguments);
  const card=document.querySelector("#authHost .authcard");
  if(card&&!card.querySelector(".demo-login")){
    const f=card.querySelector("footer");
    const el=document.createElement("div");el.className="demo-login";
    el.innerHTML=`<div class="demo-t">Conhecer com dados de demonstração</div>
      <p>Uma locadora de grande porte já preenchida: 18 pessoas, 117 equipamentos com foto, 39 negócios, 21 ordens de serviço e um ano de histórico, com cargas, financeiro e parceiros. Nada é gravado.</p>
      <div class="demo-niveis">${NIVEIS.map(n=>`<button type="button" class="demo-nivel" data-demo="${n[0]}"><b>${n[1]}</b><span>${n[2]}</span></button>`).join("")}</div>`;
    card.insertBefore(el,f||null);
  }
  return r;
};
document.addEventListener("click",ev=>{
  const b=ev.target.closest("[data-demo]");if(!b) return;
  ev.preventDefault();
  if(b.dataset.demo==="sair") return D.sair&&D.sair();
  if(D.entrar) D.entrar(b.dataset.demo);
});
if(!D.ativo) return;

/* as operações de estoque da demonstração mexem direto no estado do app */
window.__efS=()=>S;

/* carrega a empresa de exemplo uma vez; “Atualizar” não apaga o que foi mexido */
let carregou=false;
const _carregar=carregarTudo;
carregarTudo=async function(){
  if(carregou) return true;
  const r=await _carregar.apply(this,arguments);
  if(r!==false) carregou=true;
  return r;
};

/* faixa no topo de cada tela: lembra que é demonstração e troca o nível de acesso */
function faixa(){
  const v=document.getElementById("view");if(!v||v.querySelector(".demo-faixa")) return;
  const eu=D.eu||{};
  const el=document.createElement("div");el.className="demo-faixa";el.setAttribute("role","note");
  el.innerHTML=`<div class="demo-txt"><b>Demonstração</b><span class="demo-longo"> · ${esc((D.empresa||{}).nome||"")}</span> · você está como <b>${esc(eu.nome||"")}</b><span class="demo-longo"> (${esc(eu.cargo||"")})</span>. Nada aqui é gravado.</div>
    <div class="demo-acoes"><div class="demo-seg" role="group" aria-label="Ver como">${NIVEIS.map(n=>`<button type="button" data-demo="${n[0]}" class="${n[0]===D.papel?"on":""}" aria-pressed="${n[0]===D.papel}">${n[1]}</button>`).join("")}</div>
    <button type="button" class="btn sm ghost" data-demo="sair"><span class="demo-longo">Sair da demonstração</span><span class="demo-curto">Sair</span></button></div>`;
  v.prepend(el);
}
const _render=render;
render=function(){const r=_render.apply(this,arguments);faixa();return r;};
})();

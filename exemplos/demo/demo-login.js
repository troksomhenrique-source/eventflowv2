/* EventFlow · página de demonstração
   Entra com um clique nos logins da empresa de demonstração (banco real,
   empresa separada). Gerado por exemplos/demo/montar.js — edite lá. */
(function(){
const CFG=__CFG__;
const NIVEIS=[["gerencia","Gerência","Tudo: comercial, valores, financeiro e equipe"],
  ["producao","Produção","Negócios, OS, memoriais e escalas, sem financeiro"],
  ["estoque","Estoque","Inventário, cargas, frota e sublocação"]];
const TROCA="ef-demo-trocar";
const lerTroca=()=>{try{const p=sessionStorage.getItem(TROCA);sessionStorage.removeItem(TROCA);return p;}catch(e){return null;}};

async function entrar(papel){
  telaCarregando("Abrindo a demonstração…");
  try{
    const {error}=await sb.auth.signInWithPassword({email:CFG.logins[papel],password:CFG.senha});
    if(error) return telaLogin(error.message==="Invalid login credentials"
      ?"A demonstração ainda não foi preparada neste banco (rode o empresa_demo.sql no Supabase)."
      :"Não foi possível abrir a demonstração: "+error.message);
    await iniciar();
  }catch(e){telaLogin("Não foi possível abrir a demonstração: "+mensagemErro(e));}
}

/* tela de entrada: em vez de e-mail e senha, três botões */
const _login=telaLogin;
telaLogin=function(msg){
  const r=_login.apply(this,arguments);
  const pend=lerTroca();
  if(pend&&CFG.logins[pend]){entrar(pend);return r;}
  const card=document.querySelector("#authHost .authcard"),form=card&&card.querySelector("#formLogin");
  if(form){
    form.outerHTML=`<div class="demo-entrada"><div><h2>Conheça o EventFlow</h2>
      <p class="sub">Uma locadora de grande porte já preenchida: equipe, inventário com fotos, negócios, ordens de serviço, cargas, financeiro e parceiros. Escolha com qual nível de acesso quer entrar.</p></div>
      ${msg?`<div class="erro">${esc(msg)}</div>`:""}
      <div class="demo-niveis">${NIVEIS.map(n=>`<button type="button" class="demo-nivel" data-demo="${n[0]}"><b>${n[1]}</b><span>${n[2]}</span></button>`).join("")}</div></div>`;
    const f=card.querySelector("footer");
    if(f) f.innerHTML="Ambiente de demonstração com dados fictícios. Outros visitantes também usam esta empresa, e os dados voltam ao original periodicamente.";
  }
  return r;
};
document.addEventListener("click",ev=>{
  const b=ev.target.closest("[data-demo]");if(!b) return;
  ev.preventDefault();
  const p=b.dataset.demo;
  if(p==="sair"){sair();return;}
  if(!CFG.logins[p]) return;
  if(document.getElementById("app").hidden) return entrar(p);
  if(p===S.role) return;
  /* troca de nível: sai desta conta e entra na outra assim que a página recarregar */
  try{sessionStorage.setItem(TROCA,p);}catch(e){}
  sair();
});

/* faixa no topo de cada tela */
function faixa(){
  const v=document.getElementById("view");if(!v||v.querySelector(".demo-faixa")||!S.perfilId) return;
  const eu=(typeof me==="function"&&me())||{};
  const el=document.createElement("div");el.className="demo-faixa";el.setAttribute("role","note");
  el.innerHTML=`<div class="demo-txt"><b>Demonstração</b> · você está como <b>${esc(eu.nome||"")}</b><span class="demo-longo"> (${esc(eu.cargo||"")})</span>. Dados fictícios.</div>
    <div class="demo-acoes"><div class="demo-seg" role="group" aria-label="Ver como">${NIVEIS.map(n=>`<button type="button" data-demo="${n[0]}" class="${n[0]===S.role?"on":""}" aria-pressed="${n[0]===S.role}">${n[1]}</button>`).join("")}</div>
    <button type="button" class="btn sm ghost" data-demo="sair"><span class="demo-longo">Sair da demonstração</span><span class="demo-curto">Sair</span></button></div>`;
  v.prepend(el);
}
const _render=render;
render=function(){const r=_render.apply(this,arguments);faixa();return r;};
})();

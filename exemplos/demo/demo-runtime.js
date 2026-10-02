/* =====================================================================
   EventFlow · modo demonstração
   Uma empresa de grande porte, completa, para conhecer o sistema sem
   tocar no banco. Entra pela tela de login ("Conhecer com dados de
   demonstração") ou pelo endereço ?demo=gerencia | producao | estoque.

   Como funciona: em vez do cliente do Supabase, o app recebe um banco
   falso em memória com as mesmas tabelas e funções que ele usa. As telas
   carregam pelo caminho normal; nada sai do navegador e tudo volta ao
   início ao sair ou trocar de perfil.

   Este bloco é gerado por exemplos/demo/montar.js — edite lá, não aqui.
   ===================================================================== */
(function(){
const PAPEIS=["gerencia","producao","estoque"];
let papel=null;
try{
  const q=new URLSearchParams(location.search).get("demo");
  if(q&&PAPEIS.includes(q)) sessionStorage.setItem("ef-demo",q);
  papel=sessionStorage.getItem("ef-demo");
}catch(e){}
var limparUrl=()=>{try{const u=new URL(location.href);u.searchParams.delete("demo");history.replaceState(null,"",u.pathname+u.search+u.hash);}catch(e){}};
window.EF_DEMO={
  ativo:PAPEIS.includes(papel), papel:PAPEIS.includes(papel)?papel:null,
  entrar(p){try{sessionStorage.setItem("ef-demo",p);}catch(e){} limparUrl(); location.reload();},
  sair(){try{sessionStorage.removeItem("ef-demo");}catch(e){} limparUrl(); location.reload();}
};
if(!EF_DEMO.ativo) return;
limparUrl();   /* o endereço fica limpo; a demonstração segue nesta aba até sair */

/* ---------------- catálogo e ilustrações ---------------- */
const CATALOGO=__CATALOGO__;
const DESENHOS=__DESENHOS__;

/* ---------------- utilidades ---------------- */
const HOJE=new Date().toISOString().slice(0,10);
const d=n=>{const x=new Date(HOJE+"T12:00:00");x.setDate(x.getDate()+n);return x.toISOString().slice(0,10);};
const ts=(n,h)=>{const [a,b]=String(h||"10:00").split(":");return d(Math.trunc(n))+"T"+String(+a||0).padStart(2,"0")+":"+String(+b||0).padStart(2,"0")+":00";};
let semente=20261002;
const rnd=()=>{semente=(semente*1103515245+12345)%2147483648;return semente/2147483648;};
const id=(p,n)=>p+"0000000-0000-4000-8000-"+String(n).padStart(12,"0");
let seqId=0;const nid=p=>id(p||"f",++seqId);
const EMP=id("e",1), PARC_EMP=id("e",2);

/* ---------------- empresa ---------------- */
const EMPRESA={id:EMP,nome:"Atlas Eventos & Locação",documento:"00.000.000/0001-00",
  telefone:"(11) 4000-0000",email:"contato@atlas-demo.com.br",site:"atlas-demo.com.br",
  endereco:"Av. das Nações, 2.000 · galpões 3 e 4",cidade:"São Paulo · SP"};

/* ---------------- pessoas (3 níveis de permissão) ---------------- */
const P=[
 ["gerencia","Marina Duarte","Diretora geral","#4B5BD0"],
 ["gerencia","Ricardo Mota","Diretor comercial","#7A5BC4"],
 ["gerencia","Helena Prado","Gerente financeira","#B5568A"],
 ["gerencia","Fábio Nunes","Gerente de operações","#3E7CB1"],
 ["producao","Lucas Ferraz","Produtor executivo","#2FA38A"],
 ["producao","Camila Rocha","Produtora de eventos","#3C9D5D"],
 ["producao","Diego Alves","Produtor técnico","#4F8F3A"],
 ["producao","Patrícia Lemos","Projetista 3D","#8A6FB3"],
 ["producao","Bruno Teixeira","Engenheiro de estruturas","#5A7D9A"],
 ["producao","Juliana Castro","Produtora de eventos","#C27C3A"],
 ["producao","Rafael Souza","Coordenador de som","#2E8B8B"],
 ["producao","Tiago Mendes","Coordenador de luz e vídeo","#A0603A"],
 ["estoque","André Pires","Coordenador de almoxarifado","#E3A23B"],
 ["estoque","Sérgio Lima","Conferente","#B98A2E"],
 ["estoque","Wesley Santos","Conferente","#9C7A3C"],
 ["estoque","Gabriel Costa","Técnico de manutenção","#6E8B3D"],
 ["estoque","Renata Dias","Assistente de logística","#C0605A"],
 ["estoque","Márcio Reis","Motorista","#7D6E5A"]
].map((x,i)=>({id:id("a",i+1),papel:x[0],nome:x[1],cargo:x[2],cor:x[3],ativo:true,empresa_id:EMP,
  email:x[1].toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(" ",".")+"@atlas-demo.com.br"}));
const pessoa=nome=>P.find(p=>p.nome.startsWith(nome)).id;
const EU=P.find(p=>p.papel===papel);   /* primeira pessoa de cada nível */
const G1=pessoa("Marina"),G2=pessoa("Ricardo"),G3=pessoa("Helena"),G4=pessoa("Fábio");
const PR=["Lucas","Camila","Diego","Juliana"].map(pessoa),P3D=pessoa("Patrícia"),ENG=pessoa("Bruno"),SOM=pessoa("Rafael"),LUZ=pessoa("Tiago");
const E1=pessoa("André"),E2=pessoa("Sérgio"),E3=pessoa("Wesley"),EMAN=pessoa("Gabriel"),ELOG=pessoa("Renata"),MOT=pessoa("Márcio");

/* ---------------- inventário, kits e frota ---------------- */
const itens=CATALOGO.itens.map(a=>({cod:a[0],nome:a[1],categoria:a[2],unidade:a[3],marca:a[4],modelo:a[5],peso_kg:a[6],por_case:a[7],
  watts:a[8],diaria:a[9],quantidade_total:a[10],em_manutencao:a[11],observacao_tecnica:a[13]||"",desenho:a[12]}));
const it=c=>itens.find(i=>i.cod===c)||{cod:c,nome:c,categoria:"Extras",diaria:0};
const kits=CATALOGO.kits.map(k=>({cod:k[0],nome:k[1],categoria:k[2],observacao:k[3],kit_itens:k[4].map(x=>({item_cod:x[0],quantidade:x[1]}))}));
const frota=CATALOGO.frota.map(f=>({cod:f[0],nome:f[1],tipo:f[2],placa:f[3],capacidade_kg:f[4],capacidade_cases:f[5],lugares:f[6],
  em_manutencao:f[7]==="sim",observacao:f[8]||""}));
const svgUrl=t=>"data:image/svg+xml;charset=utf-8,"+encodeURIComponent(DESENHOS[t]||DESENHOS.rack||"");
const fotos=itens.filter(i=>DESENHOS[i.desenho]).map(i=>({empresa_id:EMP,item_cod:i.cod,imagem:svgUrl(i.desenho)}));
itens.forEach(i=>delete i.desenho);

/* ---------------- clientes ---------------- */
const CL=[
 ["Vértice Live Marketing","Agência","Bianca Torres","(11) 98000-1001","São Paulo · SP","2019"],
 ["Grupo Meridiano Financeiro","Corporativo","Leonardo Assis","(11) 98000-1002","São Paulo · SP","2021"],
 ["Solaris Pharma","Corporativo","Dra. Cíntia Moura","(11) 98000-1003","Barueri · SP","2022"],
 ["Sociedade Paulista de Cardiologia Clínica","Associação","Fernanda Lopes","(11) 98000-1004","São Paulo · SP","2018"],
 ["Prisma Produções Musicais","Produtora","Henrique Valle","(11) 98000-1005","São Paulo · SP","2020"],
 ["AgroTech Feiras e Negócios","Feiras","Otávio Ramos","(19) 98000-1006","Campinas · SP","2023"],
 ["Comissão de Formatura Medicina 2026","Pessoa física","Beatriz Nogueira","(11) 98000-1007","Santos · SP","2025"],
 ["Hotel Grand Paulista","Hotelaria","Marcelo Prado","(11) 98000-1008","São Paulo · SP","2017"],
 ["Nexo Tecnologia","Corporativo","Aline Ferraz","(11) 98000-1009","São Paulo · SP","2024"],
 ["Fazenda Boa Vista Eventos","Espaço de eventos","Rogério Almeida","(15) 98000-1010","Itu · SP","2021"],
 ["Prefeitura de Exemplo · Cultura","Governo","Sandra Melo","(13) 98000-1011","Litoral · SP","2024"],
 ["Instituto Horizonte de Educação","Educação","Paulo Siqueira","(11) 98000-1012","São Paulo · SP","2022"],
 ["Brava Bebidas","Corporativo","Natália Reis","(11) 98000-1013","Jundiaí · SP","2023"],
 ["Kairos Agência Digital","Agência","Thiago Bastos","(11) 98000-1014","São Paulo · SP","2025"],
 ["Arena Norte Multiuso","Espaço de eventos","Cláudio Viana","(11) 98000-1015","Guarulhos · SP","2020"],
 ["Conecta Saúde Seguros","Corporativo","Mariana Pacheco","(11) 98000-1016","São Paulo · SP","2026"]
].map((c,i)=>({id:id("c",i+1),nome:c[0],tipo:c[1],documento:"",contato:c[2],telefone:c[3],cidade:c[4],desde:c[5]}));
const cli=n=>CL.find(c=>c.nome.startsWith(n)).id;

/* ---------------- freelancers ---------------- */
const FR=[
 ["Carlos Henrique Silva","Carlão",["Rigger","Montagem"],480,true,"Strada cabine dupla"],
 ["Jéssica Moraes","Jé",["Operação de som"],520,false,""],
 ["Rodrigo Pacheco","Digão",["Operação de luz","Eletricista"],500,true,"Saveiro"],
 ["Marcos Vinícius Rocha","Marquinhos",["Técnico de LED","Operação de vídeo"],550,false,""],
 ["Ana Paula Lima","",["Coordenação"],600,true,"Onix"],
 ["Felipe Andrade","Lipe",["Montagem","Apoio"],260,false,""],
 ["Rogério Batista","Batista",["Motorista"],350,false,""],
 ["Eduardo Matos","Dudu",["Rigger"],480,false,""],
 ["Larissa Campos","",["Cenografia"],420,true,"Fiorino"],
 ["Gustavo Prates","Guga",["Projecionista","Operação de vídeo"],500,false,""],
 ["Vanessa Duarte","Van",["Apoio","Montagem"],240,false,""],
 ["Paulo Sérgio Nunes","PS",["Eletricista"],450,true,"Montana"],
 ["Igor Fernandes","",["Operação de som","Montagem"],380,false,""],
 ["Daniela Couto","Dani",["Coordenação","Apoio"],450,false,""]
].map((f,i)=>({id:id("b",i+1),nome:f[0],apelido:f[1],telefone:"(11) 97000-"+String(2001+i),email:"",cidade:i%4===3?"Guarulhos":"São Paulo",
  especialidades:f[2],veiculo_proprio:f[4],veiculo_desc:f[5],observacao:i===0?"Certificação NR-35 válida até 2027. Preferência em eventos com grid.":"",
  ativo:i!==10,cache_diaria:f[3],cpf:"",rg:"",nascimento:"",banco:"",agencia:"",conta:"",tipo_conta:"Corrente",titular:f[0],pix:"chave-demo-"+(i+1)}));
const fr=n=>FR.find(f=>f.nome.startsWith(n)).id;

/* ---------------- negócios e ordens de serviço ---------------- */
let seqNeg=180, seqOS=115, seqOSC=88, seqMov=402;
const negocios=[], ordens=[];
const ETP=["qualificacao","briefing","vt","tresd","orcamento","fechamento","finalizacao"];
function linhasOrc(lista,dias,ambPlen){
  return lista.map((x,k)=>{const i=it(x[0]);
    return {id:nid("1"),ordem:k,tipo:"estoque",item_cod:i.cod,descricao:i.nome,categoria:i.categoria,quantidade:x[1],diarias:dias,
      valor_unitario:i.diaria,cobranca:"diaria",fornecedor:"",observacao:"",ambiente_id:ambPlen};});
}
function negocio(o){
  const etapa=o.etapa, ix=ETP.indexOf(etapa), nId=id("d",negocios.length+1);
  const plen=nid("2");
  const dias=Math.max(1,(new Date(o.desm)-new Date(o.mont))/86400000+1);
  const lin=linhasOrc(o.itens||[],dias,plen);
  if(o.externos) o.externos.forEach((x,k)=>lin.push({id:nid("1"),ordem:lin.length+k,tipo:"externo",item_cod:null,descricao:x[0],categoria:x[1],
    quantidade:1,diarias:1,valor_unitario:x[2],cobranca:"fechado",fornecedor:x[3]||"",observacao:"",ambiente_id:plen}));
  const subtotal=lin.reduce((s,l)=>s+l.quantidade*l.valor_unitario*(l.cobranca==="diaria"?l.diarias:1),0);
  const desconto=o.desc==null?(ix>=4?5:0):o.desc;
  const valor=Math.round(subtotal*(1-desconto/100)/100)*100;
  const n={id:nId,codigo:"NEG-"+String(++seqNeg).padStart(4,"0"),titulo:o.titulo,cliente_id:o.cli,etapa,temperatura:o.temp||"morno",
    recorrente:!!o.rec,eventos_anteriores:o.rec?3:0,tipo_evento:o.tipo,origem:o.origem||"Indicação",responsavel_id:o.resp||G2,
    local_nome:o.local,sala:o.sala||"Plenária",endereco:o.end||"",cidade:o.cidade,publico:o.publico,prazo_decisao:o.prazo||d(10),
    montagem:o.mont,montagem_hora:"07:00",evento_inicio:o.ini,evento_inicio_hora:o.hIni||"19:00",evento_fim:o.fim||o.ini,evento_fim_hora:"23:00",
    desmontagem:o.desm,desmontagem_hora:"23:30",valor:ix>=4||o.os?valor:(o.estimado||0),os_id:null,
    negocio_sala:{area_m2:o.area||900,comprimento_m:o.comp||40,largura_m:o.larg||22.5,pe_direito:o.pd||9,ancoragem:o.anc||"liberada",
      carga_piso:500,energia_kva:o.kva||180,pontos:o.pontos||12,wll_ponto_kgf:o.wll||750,acesso:o.acesso||"Doca para carreta, portão 5",elevador:false,observacao:""},
    negocio_ambientes:[{id:plen,nome:o.sala||"Plenária",principal:true,ordem:0}].concat((o.bus||[]).map((b,k)=>({id:nid("2"),nome:b,principal:false,ordem:k+1,
      comprimento_m:14,largura_m:10,area_m2:140,pe_direito:4,carga_piso:400,energia_kva:15,pontos:0,wll_ponto_kgf:0,observacao:""}))),
    briefing_blocos:(o.blocos||[]).map(b=>({bloco:b[0],incluso:true,porte:b[1],observacao:b[2]||"",largura_m:b[3]||null,altura_m:b[4]||null})),
    briefing_notas:(o.notasBrief||[]).map((t,k)=>({id:nid("3"),criado_em:ts(-12+k,"15:"+(10+k)),autor_id:o.resp||G2,texto:t})),
    visitas_tecnicas:ix>=2?{realizada:ix>=3,data:ix>=3?d(-15):d(3),hora:"10:00",resumo:ix>=3?(o.vt||"Pé-direito e pontos conferidos com o engenheiro do local. Doca liberada das 6h às 22h."):""}:null,
    vt_participantes:ix>=2?[{perfil_id:o.prod||PR[0]},{perfil_id:ENG}]:[],
    vt_checklist:ix>=2?["Medida do pé-direito conferida","Pontos de ancoragem localizados","Quadro de energia e carga disponível","Acesso, doca e elevador de carga","Restrições de ruído e horário de montagem"]
      .map((t,k)=>({id:nid("4"),ordem:k,texto:t,concluido:ix>=3||k<2})):[],
    vt_fotos:[],
    projetos_3d:ix>=3?{necessario:true,status:ix>=4?"Aprovado":"Enviado ao cliente",responsavel_id:P3D,prazo:ix>=4?d(-8):d(2),revisoes:ix>=4?2:1,
      arquivo:"",retorno:ix>=4?"Cliente aprovou a versão 2 com a testeira em azul.":"Aguardando retorno do cliente sobre a posição do LED."}:null,
    orcamentos:{desconto,condicoes:"50% na assinatura · 50% até 5 dias antes da montagem",validade:d(15),observacao:o.obsOrc||"",
      probabilidade:o.prob||[10,25,35,50,60,80,100][ix],previsao:o.prev||d(12),concorrentes:o.conc||""},
    orcamento_linhas:ix>=4||o.os?lin:[],
    fechamentos:ix>=5?{reuniao:ix>=6?d(-6):d(2),hora:"16:00",decisoes:ix>=6?"Escopo aprovado. Equipe de rigging própria, 2 freelancers de apoio. Carga na véspera às 7h.":"",
      aprovado:ix>=6,aprovado_por:ix>=6?G1:null,aprovado_em:ix>=6?ts(-6,"17:20"):null}:null,
    fechamento_participantes:ix>=5?[G1,G2,G4,o.prod||PR[0]].map(p=>({perfil_id:p})):[],
    fechamento_pauta:ix>=5?["Escopo fecha com o que foi vendido ao cliente","Cronograma de montagem cabe na janela liberada pelo local","Equipe e frota disponíveis nas datas"]
      .map((t,k)=>({id:nid("5"),ordem:k,texto:t,revisado:ix>=6})):[]};
  negocios.push(n);
  if(o.os){
    const osId=id("9",ordens.length+1), oPlen=nid("6");
    const ambs=[{id:oPlen,nome:o.sala||"Plenária",principal:true,ordem:0,comprimento_m:o.comp||40,largura_m:o.larg||22.5}]
      .concat((o.bus||[]).map((b,k)=>({id:nid("6"),nome:b,principal:false,ordem:k+1,comprimento_m:14,largura_m:10})));
    const aereos=new Set(o.aereo||[]);
    const osItens=(o.itens||[]).map(x=>{const i=it(x[0]);const amb=x[2]!=null?ambs[x[2]].id:oPlen;
      return {id:nid("7"),item_cod:i.cod,quantidade:x[1],quantidade_aerea:aereos.has(i.cod)?x[1]:0,ambiente_id:amb,descricao:null,categoria:null,observacao:x[3]||null};});
    const escala=(o.escala||[]).map(e=>({id:nid("8"),data:e[0],freelancer_id:e[1].startsWith("b")?e[1]:null,perfil_id:e[1].startsWith("a")?e[1]:null,
      nome:(P.find(p=>p.id===e[1])||FR.find(f=>f.id===e[1])||{}).nome||"",funcao:e[2],veiculo_cod:e[3]||null,hora:e[4]||"07:00",observacao:""}));
    const veic=(o.veic||[]).map(v=>({id:nid("8"),veiculo_cod:v[0],data:v[1],hora:v[2]||"06:30",motorista:v[3]||"",observacao:v[4]||""}));
    const os={id:osId,codigo:"OS-"+String(++seqOS).padStart(4,"0"),negocio_id:nId,cliente_id:o.cli,evento:o.titulo,local_nome:o.local,cidade:o.cidade,
      publico:o.publico,area_m2:o.area||900,montagem:o.mont,evento_inicio:o.ini,evento_fim:o.fim||o.ini,desmontagem:o.desm,valor,status:o.os,
      descritivo:o.descritivo||"",criado_em:ts(o.criada||-20),
      os_produtores:[{perfil_id:o.prod||PR[0],responsavel:true}].concat((o.coprod||[]).map(p=>({perfil_id:p,responsavel:false}))),
      os_ambientes:ambs,os_estruturas:[],os_zonas:[],os_itens:osItens,
      os_ancoragens:aereos.size?Array.from({length:Math.min(o.pontos||8,12)},(_,k)=>({id:nid("6"),ambiente_id:oPlen,estrutura_id:null,nome:"P"+(k+1),quantidade:1,wll_kgf:o.wll||750})):[],
      os_memorial:ambs.map(a=>({ambiente_id:a.id,area_apoio:a.principal?96:24,carga_admissivel:500,carga_pontual_admissivel:1500,sobrecarga_publico:a.principal?400:250,
        apoios_por_equipamento:4,torre_solo:false,solo_concluido:o.os!=="Aguardando produção",fator_dinamico:1.2,fator_desbalanceamento:1.25,wll_acessorio:2000,
        fs_minimo:5,vao_livre:10,aereo_concluido:o.os==="Liberada"||o.os==="Encerrada"})),
      os_logistica:{observacao:o.logObs||"Carga na véspera às 7h. Descarga pela doca do portão 5; credenciais da equipe enviadas ao local."},
      os_veiculo_dias:veic,os_escala:escala};
    ordens.push(os); n.os_id=osId; n.valor=valor;
  }
  return n;
}

/* conjuntos de itens prontos (código, quantidade, ambiente, observação) */
const PA_GRANDE=[["SOM-EV-X1",12],["SOM-EV-X12",8],["SOM-DYN-TGX20",6],["SOM-EV-PXM12",8],["SOM-X32",1],["SOM-DL32",2],["SOM-MULTI24",2],["SOM-PCON10",10]];
const LUZ_SHOW=[["LUZ-BX-BEAM7R",12],["LUZ-BX-WASH3610",8],["LUZ-BX-SPOT300",6],["LUZ-ST-1915X",8],["LUZ-CN-PAR1812",24],["LUZ-CN-BLIND4",8],["LUZ-ST-HAZE",2],["LUZ-AVO-TQ",1]];
const LED=[["VID-P391",40],["VID-NOVA",2],["VID-V160",1],["VID-SDI50",6]];
const ESTR=[["EST-Q50-2",20],["EST-Q50-3",12],["EST-Q50-CUBO",8],["EST-TALHA-E1T",8],["EST-CTRL8",2],["EST-PRATIC",24]];
const CENO=[["CEN-BACKDROP",2],["CEN-PAINEL",16],["CEN-TOTEM",4],["CEN-CARPETE",4]];
const NET=[["NET-UDM",1],["NET-AP",12],["NET-SW24",3],["NET-4G",2]];
const SOM_CORP=[["SOM-RCF-HDL6",8],["SOM-RCF-SUB705",4],["SOM-RCF-NX45",6],["SOM-SQ6",1],["SOM-ULXD4Q",2],["SOM-ULXD-B58",8],["SOM-ULXD-LAP",4]];
const SOM_DAS=[["SOM-DAS-AERO20",12],["SOM-DAS-LX218",8],["SOM-DAS-ROAD15",6],["SOM-SM58",8],["SOM-SM57",8],["SOM-S16",1]];
const aereoDe=lista=>lista.map(x=>x[0]);

const BL_CONG=[["led","Painel panorâmico","Painel atrás do palco + 2 laterais de apoio",12,4],["palco","Médio · palco de palestra"],["estrutura","Grid suspenso","Grid Q50 em 8 pontos"],
  ["som","Fala","PA distribuído + delay no fundo da plenária"],["luz","Cênica · palestra e painel"],["transmissao","Híbrido · presencial e online"],["internet","Link dedicado para transmissão"]];
const BL_SHOW=[["led","Telão de grande porte","",8,4.5],["palco","Grande · show"],["estrutura","Cobertura de palco"],["som","Show","PA Electro-Voice X1 + subs cardioides"],
  ["luz","Grande porte · festival"],["cenografia","Cenário de grande porte"]];
const BL_CORP=[["led","Backdrop padrão","",8,3],["palco","Médio · palco de palestra"],["som","Música ambiente"],["luz","Cênica · palestra e painel"],["cenografia","Identidade simples"]];

/* --- histórico: eventos realizados nos últimos 12 meses --- */
const HIST=[
 ["Convenção anual Brava Bebidas","Brava","Convenção","Resort Santa Clara","Atibaia",320,-335,[...SOM_CORP,["VID-P391",24],["LUZ-CN-PAR1812",16]]],
 ["Réveillon na Orla 2026","Prefeitura","Show / festival","Praia Central","Litoral",35000,-276,[...PA_GRANDE,...LUZ_SHOW,...LED,...ESTR]],
 ["Fórum Conecta Saúde 2026","Conecta","Congresso","WTC Events Center","São Paulo",1100,-248,[...LED,...SOM_CORP,...ESTR.slice(0,3)]],
 ["Carnaval corporativo Meridiano","Grupo Meridiano","Festa corporativa","Espaço das Américas","São Paulo",2800,-222,[...SOM_DAS,...LUZ_SHOW,...LED.slice(0,2)]],
 ["Feira do Livro Horizonte 2026","Instituto","Feira","Centro Cultural","São Paulo",2600,-196,[...SOM_CORP,...NET]],
 ["Lançamento Solaris Dermato","Solaris","Lançamento de produto","Espaço Villa Blue Tree","São Paulo",280,-171,[...CENO,["VID-P391",24],...SOM_CORP.slice(0,3)]],
 ["Arraiá Corporativo Nexo","Nexo","Festa corporativa","Galpão Nexo Labs","São Paulo",900,-140,[...SOM_DAS,...LUZ_SHOW.slice(0,5)]],
 ["Congresso de Educação Horizonte 2026","Instituto","Congresso","Centro de Convenções Frei Caneca","São Paulo",850,-112,[...LED,...SOM_CORP,...NET]],
 ["Show acústico Prisma · turnê verão","Prisma","Show / festival","Teatro Municipal de Exemplo","Sorocaba",1300,-86,[...SOM_DAS,...LUZ_SHOW]],
 ["AgroTech Ribeirão · Feira","AgroTech","Feira","Centro de Eventos","Ribeirão Preto",6000,-58,[...NET,...SOM_CORP,...CENO]],
 ["Premiação Kairos 2025","Kairos","Premiação","Casa Natura Musical","São Paulo",650,-41,[...LED.slice(0,3),...SOM_CORP,...LUZ_SHOW.slice(0,6)]]
];
HIST.forEach((h,k)=>negocio({titulo:h[0],cli:cli(h[1]),etapa:"finalizacao",temp:"quente",tipo:h[2],origem:k%3?"Cliente recorrente":"Indicação",rec:k%3>0,
  local:h[3],cidade:h[4],publico:h[5],mont:d(h[6]-1),ini:d(h[6]),fim:d(h[6]),desm:d(h[6]+1),os:"Encerrada",criada:h[6]-30,prod:PR[k%4],itens:h[7],
  descritivo:"Evento realizado. Escopo e memoriais arquivados para consulta."}));

/* --- já realizados (OS encerradas) --- */
negocio({titulo:"Summit Nexo de Tecnologia 2026",cli:cli("Nexo"),etapa:"finalizacao",temp:"quente",tipo:"Congresso",origem:"Cliente recorrente",rec:true,
  local:"Centro de Convenções Imigrantes",cidade:"São Paulo",publico:1600,mont:d(-23),ini:d(-21),fim:d(-20),desm:d(-19),os:"Encerrada",criada:-50,
  itens:[...LED,...SOM_CORP,...LUZ_SHOW.slice(0,4),...ESTR.slice(0,4),...NET],aereo:aereoDe(ESTR.slice(0,2)),blocos:BL_CONG,prod:PR[1],bus:["Sala B.U. 1","Sala B.U. 2"],
  escala:[[d(-23),fr("Carlos"),"Rigger"],[d(-23),fr("Marcos"),"Técnico de LED"],[d(-21),SOM,"Coordenação de som"]],veic:[["TRK-01",d(-23),"05:30","Márcio Reis"]],
  descritivo:"Plenária para 1.600 pessoas com painel de LED panorâmico, transmissão híbrida e duas salas de B.U. Grid Q50 suspenso em 8 pontos."});
negocio({titulo:"Casamento Fazenda Boa Vista · Clara & Bento",cli:cli("Fazenda"),etapa:"finalizacao",temp:"quente",tipo:"Casamento",origem:"Instagram",
  local:"Fazenda Boa Vista",cidade:"Itu",publico:420,mont:d(-11),ini:d(-10),fim:d(-10),desm:d(-9),os:"Encerrada",criada:-40,prod:PR[3],
  itens:[...LUZ_SHOW.slice(2,6),...SOM_DAS.slice(0,3),...CENO.slice(0,3)],blocos:[["luz","Show · movimento e efeito"],["som","Show"],["cenografia","Ambientação e lounge"]],
  escala:[[d(-11),fr("Larissa"),"Cenografia"],[d(-10),fr("Jéssica"),"Operação de som"]],veic:[["VUC-01",d(-11),"07:00","Rogério Batista"]],
  descritivo:"Cerimônia ao ar livre e festa na tenda principal. Luz cênica quente, pista com movings e som DAS para banda e DJ."});

/* --- em andamento e próximos (OS ativas) --- */
negocio({titulo:"Congresso Paulista de Cardiologia Clínica",cli:cli("Sociedade Paulista"),etapa:"finalizacao",temp:"quente",tipo:"Congresso",origem:"Cliente recorrente",rec:true,
  local:"Expo Center Norte · Pavilhão Branco",cidade:"São Paulo",publico:2400,mont:d(-1),ini:d(0),fim:d(2),desm:d(3),os:"Liberada",criada:-30,prod:PR[0],coprod:[PR[2]],
  bus:["Auditório 2","Sala de pôsteres","Credenciamento"],area:2400,comp:60,larg:40,pd:12,pontos:16,
  itens:[...LED,...PA_GRANDE,...LUZ_SHOW.slice(0,5),...ESTR,...NET,["SOM-EV-ZLX12",8,1],["CEN-PAINEL",12,3]],aereo:aereoDe([...ESTR.slice(0,2),...PA_GRANDE.slice(0,1)]),blocos:BL_CONG,
  notasBrief:["Cliente quer o painel central com 12 m de base.","Transmissão para 3 salas satélites via link dedicado."],
  escala:[[d(-1),fr("Carlos"),"Rigger","TRK-01","06:00"],[d(-1),fr("Eduardo"),"Rigger"],[d(-1),fr("Marcos"),"Técnico de LED"],[d(-1),E2,"Conferência de carga"],
    [d(0),SOM,"Coordenação de som"],[d(0),LUZ,"Coordenação de luz"],[d(0),fr("Jéssica"),"Operação de som"],[d(0),fr("Gustavo"),"Projecionista"],
    [d(3),fr("Felipe"),"Desmontagem"],[d(3),fr("Vanessa"),"Desmontagem"]],
  veic:[["CAR-01",d(-1),"05:00","Rogério Batista","Carreta com estrutura e LED"],["TRK-01",d(-1),"06:00","Márcio Reis"],["VAN-01",d(-1),"06:00","Carlos Henrique Silva","Equipe de montagem"],["CAR-01",d(3),"22:00","Rogério Batista","Retorno"]],
  descritivo:"Plenária para 2.400 pessoas com painel de LED P3.9 de 12 x 4 m e duas telas laterais, PA Electro-Voice X1 voado em dois clusters e grid Q50 suspenso em 16 pontos de 750 kgf. Auditório 2 com som RCF e projeção. Transmissão híbrida para salas satélites por link dedicado de 500 Mbps. Responsável técnico pela estrutura: Eng. Bruno Teixeira."});
negocio({titulo:"Convenção Nacional de Vendas Meridiano",cli:cli("Grupo Meridiano"),etapa:"finalizacao",temp:"quente",tipo:"Convenção",origem:"Cliente recorrente",rec:true,
  local:"Hotel Grand Paulista · Salão Imperial",cidade:"São Paulo",publico:900,mont:d(3),ini:d(4),fim:d(5),desm:d(5),os:"Liberada",criada:-22,prod:PR[1],
  bus:["Foyer"],itens:[["VID-P391",24],["VID-NOVA",1],...SOM_CORP,["LUZ-CN-PAR1812",12],["LUZ-ST-1915X",8],["EST-Q30-2",12],["EST-PRATIC",12],["CEN-PAINEL",8]],aereo:["EST-Q30-2"],blocos:BL_CORP,
  escala:[[d(3),fr("Rodrigo"),"Operação de luz"],[d(3),fr("Igor"),"Montagem"],[d(4),fr("Ana Paula"),"Coordenação"]],veic:[["TRK-02",d(3),"06:00","Márcio Reis"]],
  descritivo:"Salão Imperial em formato auditório para 900 lugares. Backdrop de LED 8 x 3 m, som RCF distribuído, luz cênica e cenografia com a identidade da campanha."});
negocio({titulo:"Festival Sons do Parque · 3ª edição",cli:cli("Prisma"),etapa:"finalizacao",temp:"quente",tipo:"Show / festival",origem:"Indicação",
  local:"Parque Villa-Lobos · Palco Lago",cidade:"São Paulo",publico:12000,mont:d(8),ini:d(10),fim:d(11),desm:d(12),os:"Liberada",criada:-35,prod:PR[2],coprod:[PR[0]],
  itens:[...PA_GRANDE,...SOM_DAS,...LUZ_SHOW,...LED,...ESTR,...CENO],aereo:aereoDe([...PA_GRANDE.slice(0,1),...LUZ_SHOW.slice(0,3)]),blocos:BL_SHOW,kva:500,pontos:12,wll:1000,
  escala:[[d(8),fr("Carlos"),"Rigger"],[d(8),fr("Eduardo"),"Rigger"],[d(8),fr("Paulo"),"Eletricista"],[d(10),SOM,"Coordenação de som"],[d(10),LUZ,"Coordenação de luz"]],
  veic:[["CAR-01",d(7),"05:00","Rogério Batista"],["MUN-01",d(8),"06:00","Márcio Reis","Içamento do PA"]],
  descritivo:"Palco 16 x 12 m com cobertura em Q50, PA Electro-Voice X1 voado (12 por lado) e subs em arranjo cardioide. Luz de festival com 60 aparelhos e dois telões laterais de LED."});
negocio({titulo:"Lançamento Solaris · Nova linha cardiológica",cli:cli("Solaris"),etapa:"finalizacao",temp:"quente",tipo:"Lançamento de produto",origem:"Agência",
  local:"Espaço Villa Blue Tree",cidade:"São Paulo",publico:350,mont:d(13),ini:d(14),fim:d(14),desm:d(14),os:"Em produção",criada:-12,prod:PR[3],
  itens:[...LED.slice(0,2),...SOM_CORP.slice(0,4),...LUZ_SHOW.slice(1,4),...CENO],blocos:BL_CORP,
  escala:[[d(13),fr("Larissa"),"Cenografia"],[d(13),fr("Vanessa"),"Apoio"]],veic:[["VUC-02",d(13),"07:00","Márcio Reis"]],
  descritivo:"Coquetel e apresentação para 350 convidados. Cenografia completa com painéis iluminados e backdrop de LED para o vídeo de lançamento."});
negocio({titulo:"Formatura Medicina 2026 · Baile",cli:cli("Comissão"),etapa:"finalizacao",temp:"quente",tipo:"Formatura",origem:"Site",
  local:"Arena Norte Multiuso",cidade:"Guarulhos",publico:2200,mont:d(17),ini:d(18),fim:d(18),desm:d(19),os:"Em produção",criada:-18,prod:PR[0],
  itens:[...SOM_DAS,...LUZ_SHOW,...LED,...ESTR.slice(0,4)],aereo:aereoDe(LUZ_SHOW.slice(0,2)),blocos:BL_SHOW,
  escala:[[d(17),fr("Carlos"),"Rigger"],[d(18),fr("Igor"),"Operação de som"]],veic:[["CAR-01",d(17),"05:00","Rogério Batista"]],
  descritivo:"Baile para 2.200 pessoas com palco para banda, pista central com grid de luz e dois telões. Som DAS com subs no chão."});
negocio({titulo:"AgroTech Campinas · Feira 2026",cli:cli("AgroTech"),etapa:"finalizacao",temp:"morno",tipo:"Feira",origem:"Prospecção",
  local:"Expo D. Pedro · Pavilhão 2",cidade:"Campinas",publico:8000,mont:d(22),ini:d(24),fim:d(26),desm:d(27),os:"Em produção",criada:-10,prod:PR[2],
  itens:[...NET,...SOM_CORP,...LED.slice(0,2),...CENO,...ESTR.slice(2,5)],blocos:[["internet","Cobertura total · público e transmissão"],["som","Fala"],["led","Backdrop compacto","",6,3],["cenografia","Cenário completo"]],
  veic:[["TRK-02",d(22),"05:30","Márcio Reis"]],
  descritivo:"Arena de palestras da feira, sinalização em LED e rede Wi-Fi para expositores e público em todo o pavilhão."});
negocio({titulo:"Corporate Day Vértice · Cliente automotivo",cli:cli("Vértice"),etapa:"finalizacao",temp:"quente",tipo:"Evento corporativo",origem:"Agência",
  local:"Autódromo · Paddock Club",cidade:"São Paulo",publico:600,mont:d(29),ini:d(30),fim:d(30),desm:d(31),os:"Aguardando produção",criada:-3,prod:PR[1],
  itens:[...LED.slice(0,2),...SOM_CORP,...LUZ_SHOW.slice(0,3)],blocos:BL_CORP,descritivo:""});
negocio({titulo:"Réveillon na Orla · Show da virada",cli:cli("Prefeitura"),etapa:"finalizacao",temp:"quente",tipo:"Show / festival",origem:"Licitação",
  local:"Praia Central · Palco principal",cidade:"Litoral",publico:40000,mont:d(85),ini:d(90),fim:d(90),desm:d(92),os:"Aguardando produção",criada:-2,prod:PR[0],kva:800,
  itens:[...PA_GRANDE.map(x=>[x[0],x[1]*2]),...LUZ_SHOW.map(x=>[x[0],x[1]*2]),...LED.map(x=>[x[0],x[1]*2]),...ESTR.map(x=>[x[0],x[1]*2])],blocos:BL_SHOW,descritivo:""});

/* --- funil comercial (sem OS ainda) --- */
negocio({titulo:"Fórum Conecta Saúde 2027",cli:cli("Conecta"),etapa:"fechamento",temp:"quente",tipo:"Congresso",origem:"Indicação",local:"WTC Events Center",cidade:"São Paulo",publico:1200,
  mont:d(44),ini:d(45),fim:d(46),desm:d(46),itens:[...LED,...SOM_CORP,...LUZ_SHOW.slice(0,4),...ESTR.slice(0,3)],blocos:BL_CONG,prod:PR[1],conc:"Duas locadoras regionais"});
negocio({titulo:"Encontro de Diretores Brava Bebidas",cli:cli("Brava"),etapa:"fechamento",temp:"morno",tipo:"Convenção",origem:"Cliente recorrente",rec:true,local:"Resort Santa Clara",cidade:"Atibaia",publico:280,
  mont:d(36),ini:d(37),fim:d(38),desm:d(38),itens:[...SOM_CORP,...LED.slice(0,2),...LUZ_SHOW.slice(1,3)],blocos:BL_CORP,prod:PR[3]});
negocio({titulo:"Feira do Livro Horizonte",cli:cli("Instituto"),etapa:"orcamento",temp:"morno",tipo:"Feira",origem:"Site",local:"Centro Cultural",cidade:"São Paulo",publico:3000,
  mont:d(50),ini:d(52),fim:d(55),desm:d(55),itens:[...SOM_CORP.slice(0,4),...NET,...CENO.slice(0,2)],blocos:[["som","Fala"],["internet","Wi-Fi para o público"]],conc:"Locadora do próprio espaço"});
negocio({titulo:"Show acústico Prisma · turnê inverno",cli:cli("Prisma"),etapa:"orcamento",temp:"quente",tipo:"Show / festival",origem:"Cliente recorrente",rec:true,local:"Teatro Municipal de Exemplo",cidade:"Sorocaba",publico:1400,
  mont:d(40),ini:d(41),fim:d(41),desm:d(41),itens:[...SOM_DAS,...LUZ_SHOW.slice(0,5)],blocos:[["som","Show"],["luz","Show · movimento e efeito"]]});
negocio({titulo:"Premiação Kairos Digital Awards",cli:cli("Kairos"),etapa:"orcamento",temp:"quente",tipo:"Premiação",origem:"Instagram",local:"Casa Natura Musical",cidade:"São Paulo",publico:700,
  mont:d(33),ini:d(34),fim:d(34),desm:d(34),itens:[...LED.slice(0,3),...SOM_CORP,...LUZ_SHOW.slice(0,6),...CENO],blocos:BL_CORP,
  externos:[["Gerador 260 kVA silenciado","Extras",6800,"Parceiro de energia"]]});
negocio({titulo:"Evento de fim de ano Meridiano",cli:cli("Grupo Meridiano"),etapa:"orcamento",temp:"morno",tipo:"Festa corporativa",origem:"Cliente recorrente",rec:true,local:"Espaço das Américas",cidade:"São Paulo",publico:3500,
  mont:d(70),ini:d(71),fim:d(71),desm:d(72),itens:[...PA_GRANDE,...LUZ_SHOW,...LED,...ESTR.slice(0,4)],blocos:BL_SHOW});
negocio({titulo:"Lançamento imobiliário Jardins",cli:cli("Vértice"),etapa:"tresd",temp:"morno",tipo:"Lançamento de produto",origem:"Agência",local:"Stand de vendas",cidade:"São Paulo",publico:250,
  mont:d(26),ini:d(27),fim:d(27),desm:d(27),blocos:BL_CORP,estimado:45000});
negocio({titulo:"Congresso de Educação Horizonte",cli:cli("Instituto"),etapa:"tresd",temp:"quente",tipo:"Congresso",origem:"Cliente recorrente",rec:true,local:"Centro de Convenções Frei Caneca",cidade:"São Paulo",publico:900,
  mont:d(58),ini:d(59),fim:d(60),desm:d(60),blocos:BL_CONG,estimado:160000});
negocio({titulo:"Arraiá Corporativo Conecta",cli:cli("Conecta"),etapa:"vt",temp:"morno",tipo:"Festa corporativa",origem:"Indicação",local:"Clube Atlético",cidade:"São Paulo",publico:800,
  mont:d(64),ini:d(65),fim:d(65),desm:d(65),blocos:[["som","Show"],["luz","Show · movimento e efeito"],["cenografia","Ambientação e lounge"]],estimado:70000});
negocio({titulo:"Hackathon Nexo 48h",cli:cli("Nexo"),etapa:"vt",temp:"quente",tipo:"Evento corporativo",origem:"Cliente recorrente",rec:true,local:"Galpão Nexo Labs",cidade:"São Paulo",publico:400,
  mont:d(20),ini:d(21),fim:d(22),desm:d(22),blocos:[["internet","Cobertura total · público e transmissão"],["som","Fala"],["transmissao","Multicâmera"]],estimado:90000});
negocio({titulo:"Feirão Brava Verão",cli:cli("Brava"),etapa:"vt",temp:"frio",tipo:"Ativação de marca",origem:"Prospecção",local:"Shopping Jundiaí · praça central",cidade:"Jundiaí",publico:1500,
  mont:d(75),ini:d(76),fim:d(80),desm:d(80),blocos:[["som","Música ambiente"],["cenografia","Ambientação e lounge"]],estimado:38000});
negocio({titulo:"Simpósio de Oncologia Solaris",cli:cli("Solaris"),etapa:"briefing",temp:"quente",tipo:"Congresso",origem:"Cliente recorrente",rec:true,local:"Hotel Grand Paulista",cidade:"São Paulo",publico:500,
  mont:d(95),ini:d(96),fim:d(97),desm:d(97),blocos:BL_CONG,estimado:120000,notasBrief:["Duas salas simultâneas com tradução."]});
negocio({titulo:"Festa de 15 anos · Valentina",cli:cli("Fazenda"),etapa:"briefing",temp:"morno",tipo:"Festa social",origem:"Instagram",local:"Fazenda Boa Vista",cidade:"Itu",publico:300,
  mont:d(110),ini:d(111),fim:d(111),desm:d(112),blocos:[["luz","Show · movimento e efeito"],["som","Show"]],estimado:32000});
negocio({titulo:"Convenção anual Arena Norte",cli:cli("Arena"),etapa:"briefing",temp:"frio",tipo:"Convenção",origem:"Site",local:"Arena Norte Multiuso",cidade:"Guarulhos",publico:1800,
  mont:d(120),ini:d(121),fim:d(121),desm:d(122),estimado:85000});
negocio({titulo:"Expo Saúde Litoral",cli:cli("Prefeitura"),etapa:"qualificacao",temp:"morno",tipo:"Feira",origem:"Licitação",local:"Centro de Eventos",cidade:"Litoral",publico:5000,
  mont:d(130),ini:d(132),fim:d(134),desm:d(134),estimado:150000});
negocio({titulo:"Workshop de liderança Kairos",cli:cli("Kairos"),etapa:"qualificacao",temp:"frio",tipo:"Treinamento",origem:"Site",local:"A definir",cidade:"São Paulo",publico:120,
  mont:d(48),ini:d(48),fim:d(48),desm:d(48),estimado:12000});
negocio({titulo:"Casamento Helena & Rafael",cli:cli("Hotel"),etapa:"qualificacao",temp:"quente",tipo:"Casamento",origem:"Indicação",local:"Hotel Grand Paulista · Terraço",cidade:"São Paulo",publico:220,
  mont:d(150),ini:d(151),fim:d(151),desm:d(151),estimado:28000});
negocio({titulo:"Lançamento app Conecta+",cli:cli("Conecta"),etapa:"qualificacao",temp:"morno",tipo:"Lançamento de produto",origem:"Indicação",local:"A definir",cidade:"São Paulo",publico:300,
  mont:d(60),ini:d(61),fim:d(61),desm:d(61),estimado:40000});

/* ---------------- ordens de carga e movimentos ---------------- */
const cargas=[], movs=[];
function romaneio(os){const m={};os.os_itens.forEach(i=>{m[i.item_cod]=(m[i.item_cod]||0)+i.quantidade;});return Object.entries(m).map(([c,q])=>({item_cod:c,descricao:it(c).nome,quantidade:q,observacao:null}));}
function carga(os,status,veic,equipe,obs){
  const c={id:id("k",cargas.length+1),codigo:"OSC-"+String(++seqOSC).padStart(4,"0"),os_id:os.id,evento_avulso:null,status,data_carga:d(-1+((new Date(os.montagem)-new Date(HOJE))/86400000)),
    hora_carga:"07:00",data_descarga:d(1+((new Date(os.desmontagem)-new Date(HOJE))/86400000)),veiculo:veic,equipe:equipe||"",observacao:obs||"",osc_itens:romaneio(os)};
  cargas.push(c);
  if(status==="Carregada"||status==="Retornada"){
    movs.push({id:nid("m"),codigo:"MOV-"+(++seqMov),data:c.data_carga,tipo:"SAIDA",ordem_carga_id:c.id,referencia:os.evento,usuario_id:E2,
      movimento_linhas:c.osc_itens.map(l=>({item_cod:l.item_cod,quantidade:l.quantidade,avaria:0}))});
  }
  if(status==="Retornada"){
    movs.push({id:nid("m"),codigo:"MOV-"+(++seqMov),data:c.data_descarga,tipo:"ENTRADA",ordem_carga_id:c.id,referencia:os.evento,usuario_id:E3,
      movimento_linhas:c.osc_itens.map((l,k)=>({item_cod:l.item_cod,quantidade:l.quantidade,avaria:k===1?1:0}))});
  }
  return c;
}
const OSN=n=>ordens.find(o=>o.evento.startsWith(n));
carga(OSN("Summit"),"Retornada","Truck baú TRK-01","Sérgio, Wesley + 2 freelas");
carga(OSN("Casamento Fazenda"),"Retornada","VUC 3/4 VUC-01","Wesley");
carga(OSN("Congresso Paulista"),"Carregada","Carreta CAR-01 + Truck TRK-01","Sérgio, Wesley, Carlão, Eduardo","Grid e LED na carreta; som e luz no truck.");
carga(OSN("Convenção Nacional"),"Em separação","Truck baú TRK-02","Sérgio","Separar cases de microfone por sala.");
carga(OSN("Festival"),"Liberada","Carreta CAR-01 + Munck MUN-01","Equipe de estoque completa");
/* carga avulsa: empréstimo para manutenção externa */
cargas.push({id:id("k",cargas.length+1),codigo:"OSC-"+String(++seqOSC).padStart(4,"0"),os_id:null,evento_avulso:"Revisão de moving heads · assistência técnica",status:"Liberada",
  data_carga:d(2),hora_carga:"09:00",data_descarga:d(16),veiculo:"Utilitário UTI-01",equipe:"Gabriel Costa",observacao:"Levar notas fiscais de remessa para conserto.",
  osc_itens:[{item_cod:LUZ_SHOW[0][0],descricao:it(LUZ_SHOW[0][0]).nome,quantidade:2,observacao:"Cooler com ruído"}]});
/* ajuste de inventário */
movs.push({id:nid("m"),codigo:"MOV-"+(++seqMov),data:d(-30),tipo:"ENTRADA",ordem_carga_id:null,referencia:"Compra · NF 4.512 · 24 extensões de energia",usuario_id:E1,
  movimento_linhas:[{item_cod:"EXT-EXT10",quantidade:24,avaria:0}]});
ordens.forEach(o=>{if(o.status==="Liberada"&&!cargas.some(c=>c.os_id===o.id)) o.status="Em produção";});

/* ---------------- reembolsos ---------------- */
const RB=[
 [OSN("Summit"),-22,"Almoço da equipe de montagem","Alimentação",386.4,"Cartão de crédito","Pago",fr("Carlos"),null],
 [OSN("Summit"),-21,"Estacionamento Centro de Convenções","Estacionamento",120,"Pix","Pago",null,SOM],
 [OSN("Casamento"),-11,"Combustível VUC ida e volta","Combustível",612.9,"Cartão de débito","Pago",fr("Rogério"),null],
 [OSN("Congresso Paulista"),-1,"Pedágios Rodoanel · carreta","Pedágio",248.6,"Pix","Aprovado",fr("Rogério"),null],
 [OSN("Congresso Paulista"),-1,"Lanche da madrugada · montagem","Alimentação",412,"Pix","Enviado",null,PR[0]],
 [OSN("Congresso Paulista"),0,"Fita gaffer e abraçadeiras","Material de montagem",189.9,"Cartão de crédito","Enviado",fr("Eduardo"),null],
 [OSN("Convenção Nacional"),-2,"Uber da equipe para a visita técnica","Transporte / app",96.3,"Cartão de crédito","Aprovado",null,PR[1]],
 [OSN("Festival"),-4,"Hospedagem do rigger em visita","Hospedagem",540,"Cartão de crédito","Enviado",fr("Carlos"),null],
 [OSN("Lançamento Solaris ·"),-3,"Frete de painéis da cenografia","Frete",780,"Boleto","Recusado",null,PR[3]]
].concat(HIST.map((h,k)=>[OSN(h[0]),h[6],["Alimentação da equipe","Combustível da frota","Hospedagem da equipe","Pedágios"][k%4],["Alimentação","Combustível","Hospedagem","Pedágio"][k%4],1800+((k*1370)%4200),"Cartão de crédito","Pago",null,PR[k%4]]))
.map((r,i)=>({id:id("r",i+1),os_id:r[0].id,data:d(r[1]),descricao:r[2],categoria:r[3],valor:r[4],forma:r[5],status:r[6],
  pago_por_freela:r[7],pago_por_perfil:r[8],pago_por_nome:(FR.find(f=>f.id===r[7])||P.find(p=>p.id===r[8])||{}).nome||"",
  para_freela:r[7],para_perfil:r[8],para_nome:(FR.find(f=>f.id===r[7])||P.find(p=>p.id===r[8])||{}).nome||"",
  comprovante_path:null,observacao:r[6]==="Recusado"?"Frete já incluso no contrato do fornecedor.":"",criado_por:r[8]||PR[0]}));

/* ---------------- comunicação: mural, notas, agenda, avisos ---------------- */
const posts=[
 [G1,-0.1,"Bom dia, time! Hoje é o primeiro dia do Congresso de Cardiologia no Expo Center Norte: 2.400 pessoas e transmissão para 3 salas. Obrigada a todo mundo que virou a noite na montagem 👏",[PR[0],PR[2],E2,SOM,LUZ],[[PR[0],"Plenária testada às 6h, tudo no ar. Painel central ficou lindo."],[SOM,"PA alinhado e delay ok. Rodamos o teste de microfones com a organização."]]],
 [null,-0.3,"Ordem de carga OSC-0090 carregada · Congresso Paulista de Cardiologia Clínica saiu do galpão com 312 peças.",[],[]],
 [G4,-1,"Lembrete de segurança: todo rigger precisa do NR-35 em dia no sistema antes de subir no grid. O Gabriel conferiu os cintos e talabartes ontem.",[G1,EMAN,fr("Carlos")].filter(x=>x.startsWith("a")),[[EMAN,"Cintos 12 e 14 foram para descarte. Pedido de reposição já com a Helena."]]],
 [G2,-2,"Fechamos o Festival Sons do Parque pelo 3º ano seguido! 12 mil pessoas, PA X1 voado e dois telões. Bora pra cima 🚀",[G1,G3,PR[2],PR[0]],[[PR[2],"Visita técnica do palco Lago marcada para quinta 9h."]]],
 [E1,-3,"Inventário de cabos concluído: 24 cabos novos de energia entraram no estoque (MOV-0403). Etiquetas já coladas.",[G4],[]],
 [null,-5,"Sublocação SUB-2610-002 aceita pela Sonora Locações · 8 moving beam para o Festival.",[],[]],
 [G3,-6,"Financeiro: notas de reembolso do Summit Nexo foram todas pagas. Quem tiver nota pendente, lança até sexta 🙏",[PR[1],PR[0]],[]]
].map((p,i)=>({id:id("p",i+1),autor_id:p[0]||null,criado_em:ts(Math.trunc(p[1]),String(9+((i*2)%10)).padStart(2,"0")+":"+String(10+i*7%50).padStart(2,"0")),
  texto:p[2],sistema:!p[0],post_curtidas:p[3].map(x=>({perfil_id:x})),post_comentarios:p[4].map((c,k)=>({id:nid("c"),autor_id:c[0],texto:c[1],criado_em:ts(Math.trunc(p[1]),"1"+(k+1)+":30")}))}));
const notas=[
 ["Checklist de carga · Congresso Cardiologia",["carga","OS"],"warn",true,"equipe",E1,OSN("Congresso Paulista").id,["Cases de LED numerados","Cabos de sinal testados","Talhas e cintas conferidas","Romaneio assinado pelo motorista"],[1,1,1,0],"Conferir também os rádios comunicadores (12 unidades)."],
 ["Procedimento de devolução de sublocação",["sublocação","processo"],"acc",true,"equipe",G4,null,["Conferir quantidade e estado com o parceiro","Registrar avarias com foto","Lançar conta a pagar"],[1,1,0],"Sempre devolver com o romaneio do parceiro assinado."],
 ["Ideias para o stand da AgroTech",["comercial"],"",false,"equipe",PR[2],OSN("AgroTech Campinas").id,[],[],"Testeira em LED curvo e totem com QR code para captação de leads."],
 ["Contatos do Expo Center Norte",["contatos"],"",true,"equipe",PR[0],null,[],[],"Engenharia: (11) 4000-1111 · Segurança: (11) 4000-2222 · Doca 5 abre às 5h."],
 ["Manutenção preventiva · outubro",["manutenção"],"crit",false,"equipe",EMAN,null,["Limpeza das lentes dos movings","Troca de lâmpadas dos beams","Revisão das talhas elétricas"],[1,0,0],""],
 ["Minhas metas do trimestre",["pessoal"],"ok",false,"privada",EU.id,null,["Fechar 3 eventos acima de R$ 150 mil","Revisar tabela de diárias"],[1,0],""]
].map((n,i)=>({id:id("n",i+1),titulo:n[0],etiquetas:n[1],cor:n[2],fixada:n[3],escopo:n[4],autor_id:n[5],os_id:n[6],conteudo:n[9],criado_em:ts(-i-1,"11:00"),
  nota_checklist:n[7].map((t,k)=>({id:nid("h"),ordem:k,texto:t,concluido:!!n[8][k]}))}));
const compromissos=[
 ["Reunião de fechamento · Fórum Conecta Saúde","reuniao",2,"16:00",60,[G1,G2,G4,PR[1]],"Sala de reunião"],
 ["Visita técnica · Hackathon Nexo","visita",3,"10:00",120,[PR[2],ENG],"Galpão Nexo Labs"],
 ["Prazo da proposta · Premiação Kairos","prazo",4,"18:00",0,[G2],""],
 ["Apresentação do 3D · Lançamento Jardins","reuniao",1,"14:30",45,[P3D,G2],"Online"],
 ["Montagem · Convenção Meridiano","montagem",3,"07:00",600,[PR[1],E2],"Hotel Grand Paulista"],
 ["Conferência de estoque mensal","carga",6,"08:00",240,[E1,E2,E3],"Galpão 3"],
 ["Reunião semanal de operações","reuniao",0,"09:00",60,[G1,G4,PR[0],E1],"Sala de reunião"],
 ["Visita técnica · Arraiá Conecta","visita",5,"15:00",90,[PR[1]],"Clube Atlético"],
 ["Prazo de envio · tabela de diárias 2027","prazo",9,"12:00",0,[G1,G3],""]
].map((c,i)=>({id:id("g",i+1),titulo:c[0],tipo:c[1],data:d(c[2]),hora:c[3],duracao_min:c[4],os_id:null,negocio_id:null,local:c[6],observacao:"",
  compromisso_responsaveis:c[5].map(p=>({perfil_id:p}))}));
const notificacoes=[
 ["Nova nota de reembolso no Congresso Paulista de Cardiologia (R$ 412,00).",["gerencia"],"reembolsos",null,-0.2],
 ["Ordem de carga OSC-0091 em separação para a Convenção Meridiano.",["gerencia","producao","estoque"],"cargas",null,-0.5],
 ["Pedido de sublocação recebido da Sonora Locações: 6 caixas RCF para o dia "+d(6).slice(8,10)+"/"+d(6).slice(5,7)+".",["gerencia","estoque"],"parceiros",null,-0.6],
 ["Negócio Fórum Conecta Saúde 2027 avançou para Fechamento.",["gerencia","producao"],"crm",null,-1],
 ["Projeto 3D do Lançamento Jardins enviado ao cliente.",["gerencia","producao"],"crm",null,-2],
 ["2 contas a pagar vencem nesta semana.",["gerencia"],"contas",null,-0.1]
].map((n,i)=>({id:id("i",i+1),texto:n[0],destino:n[1],tela:n[2],referencia:n[3],tipo:"info",criado_em:ts(Math.trunc(n[4]),"0"+(8+i)+":15"),notificacao_leituras:[]}));
notificacoes[3].notificacao_leituras=[{perfil_id:EU.id}];

/* ---------------- parceiros, sublocação e contas (módulos v6) ---------------- */
const parceiros=[
 {id:id("q",1),empresa_id:EMP,nome:"Sonora Locações",documento:"",contato:"Vitor Sampaio",telefone:"(11) 96000-3001",email:"vitor@sonora-demo.com.br",cidade:"São Paulo · SP",
  observacao:"Usa o EventFlow · pedidos chegam direto no sistema.",empresa_parceira_id:PARC_EMP,ativo:true},
 {id:id("q",2),empresa_id:EMP,nome:"LuzMax Iluminação",documento:"",contato:"Renato Alves",telefone:"(11) 96000-3002",email:"",cidade:"Osasco · SP",observacao:"Parceiro para moving heads em grandes festivais.",empresa_parceira_id:null,ativo:true},
 {id:id("q",3),empresa_id:EMP,nome:"Estrutural Sul Treliças",documento:"",contato:"Mônica Freitas",telefone:"(41) 96000-3003",email:"",cidade:"Curitiba · PR",observacao:"Q50 e cobertura de palco.",empresa_parceira_id:null,ativo:true},
 {id:id("q",4),empresa_id:EMP,nome:"Energia Já Geradores",documento:"",contato:"Wagner Lopes",telefone:"(11) 96000-3004",email:"",cidade:"Guarulhos · SP",observacao:"Geradores silenciados 180 a 500 kVA.",empresa_parceira_id:null,ativo:true}
];
const bm=it("LUZ-BX-BEAM380"), rcf=it("SOM-RCF-HDL6");
const hist=(dia,emp,quem,acao,msg)=>({ts:ts(dia,"10:00"),emp,quem,acao,msg:msg||""});
const sublocs=[
 {id:id("s",1),codigo:"SUB-2610-002",solicitante_empresa_id:EMP,solicitante_nome:EMPRESA.nome,fornecedor_empresa_id:PARC_EMP,fornecedor_nome:"Sonora Locações",parceiro_id:parceiros[0].id,
  negocio_id:null,os_id:OSN("Festival").id,evento:"",retirada:d(7),devolucao:d(13),contra_retirada:null,contra_devolucao:null,contra_mensagem:null,status:"Aceita",valor:6400,
  mensagem:"Precisamos de reforço de beams para o palco Lago.",itens:[{id:nid("t"),codSolic:bm.cod,desc:bm.nome,qtd:8,codForn:"",obs:""}],
  historico:[hist(-6,EMPRESA.nome,"Lucas Ferraz","Pedido enviado"),hist(-5,"Sonora Locações","Vitor Sampaio","Aceito")],criado_em:ts(-6)},
 {id:id("s",2),codigo:"SUB-2610-003",solicitante_empresa_id:EMP,solicitante_nome:EMPRESA.nome,fornecedor_empresa_id:null,fornecedor_nome:"Energia Já Geradores",parceiro_id:parceiros[3].id,
  negocio_id:null,os_id:OSN("Réveillon na Orla ·").id,evento:"",retirada:d(84),devolucao:d(93),contra_retirada:null,contra_devolucao:null,contra_mensagem:null,status:"Enviada",valor:0,
  mensagem:"Orçamento de 2 geradores de 500 kVA com operador.",itens:[{id:nid("t"),codSolic:"",desc:"Gerador 500 kVA silenciado com operador",qtd:2,codForn:"",obs:""}],
  historico:[hist(-1,EMPRESA.nome,"Lucas Ferraz","Pedido enviado")],criado_em:ts(-1)},
 {id:id("s",3),codigo:"SUB-2610-001",solicitante_empresa_id:EMP,solicitante_nome:EMPRESA.nome,fornecedor_empresa_id:null,fornecedor_nome:"Estrutural Sul Treliças",parceiro_id:parceiros[2].id,
  negocio_id:null,os_id:OSN("Congresso Paulista").id,evento:"",retirada:d(-2),devolucao:d(4),contra_retirada:null,contra_devolucao:null,contra_mensagem:null,status:"Retirada",valor:3800,
  mensagem:"",itens:[{id:nid("t"),codSolic:ESTR[0][0],desc:it(ESTR[0][0]).nome,qtd:16,codForn:"",obs:""}],
  historico:[hist(-12,EMPRESA.nome,"Lucas Ferraz","Pedido enviado"),hist(-11,"Estrutural Sul Treliças","Mônica Freitas","Aceito"),hist(-2,EMPRESA.nome,"Sérgio Lima","Retirada registrada")],criado_em:ts(-12)},
 /* pedidos que outra empresa fez para nós (somos o fornecedor) */
 {id:id("s",4),codigo:"SUB-2610-014",solicitante_empresa_id:PARC_EMP,solicitante_nome:"Sonora Locações",fornecedor_empresa_id:EMP,fornecedor_nome:EMPRESA.nome,parceiro_id:null,
  negocio_id:null,os_id:null,evento:"Feira de Franquias · Pavilhão Azul",retirada:d(6),devolucao:d(9),contra_retirada:null,contra_devolucao:null,contra_mensagem:null,status:"Enviada",valor:2100,
  mensagem:"Conseguem 6 caixas RCF? Retiramos no galpão às 8h.",itens:[{id:nid("t"),codSolic:"",desc:rcf.nome,qtd:6,codForn:rcf.cod,obs:""}],
  historico:[hist(-0.5,"Sonora Locações","Vitor Sampaio","Pedido enviado")],criado_em:ts(-1)},
 {id:id("s",5),codigo:"SUB-2609-021",solicitante_empresa_id:PARC_EMP,solicitante_nome:"Sonora Locações",fornecedor_empresa_id:EMP,fornecedor_nome:EMPRESA.nome,parceiro_id:null,
  negocio_id:null,os_id:null,evento:"Show corporativo · cliente da Sonora",retirada:d(-3),devolucao:d(1),contra_retirada:null,contra_devolucao:null,contra_mensagem:null,status:"Retirada",valor:1500,
  mensagem:"",itens:[{id:nid("t"),codSolic:"",desc:it(LUZ_SHOW[3][0]).nome,qtd:4,codForn:LUZ_SHOW[3][0],obs:""}],
  historico:[hist(-8,"Sonora Locações","Vitor Sampaio","Pedido enviado"),hist(-7,EMPRESA.nome,"André Pires","Aceito"),hist(-3,EMPRESA.nome,"André Pires","Retirada registrada")],criado_em:ts(-8)}
];
const contas=[];
const conta=(tipo,desc,cat,contra,venc,valor,pago,extra)=>contas.push(Object.assign({id:id("x",contas.length+1),empresa_id:EMP,tipo,descricao:desc,categoria:cat,contraparte:contra,
  emissao:d(Math.min(venc,0)-20),vencimento:d(venc),valor,pago_em:pago!=null?d(pago):null,valor_pago:pago!=null?valor:null,forma:pago!=null?"Pix":"Boleto",
  os_id:null,sublocacao_id:null,reembolso_id:null,parcela:null,observacao:""},extra||{}));
ordens.forEach(o=>{const c=CL.find(x=>x.id===o.cliente_id).nome, v=o.valor;
  const ini=(new Date(o.montagem)-new Date(HOJE))/86400000;
  conta("receber","Sinal 50% · "+o.evento,"Sinal / entrada",c,Math.round(ini)-20,Math.round(v/2),ini-20<0?Math.round(ini)-21:null,{os_id:o.id,parcela:"1/2"});
  conta("receber","Saldo 50% · "+o.evento,"Saldo do evento",c,Math.round(ini)-5,v-Math.round(v/2),ini-5<-3?Math.round(ini)-6:null,{os_id:o.id,parcela:"2/2"});});
conta("pagar","Sublocação SUB-2610-002 · 8 moving beam","Sublocação","Sonora Locações",14,6400,null,{sublocacao_id:sublocs[0].id});
conta("pagar","Sublocação SUB-2610-001 · Q50","Sublocação","Estrutural Sul Treliças",5,3800,null,{sublocacao_id:sublocs[2].id});
conta("receber","Sublocação SUB-2609-021 para Sonora","Sublocação a parceiro","Sonora Locações",3,1500,null,{sublocacao_id:sublocs[4].id});
conta("pagar","Aluguel dos galpões 3 e 4","Aluguel e estrutura","Imobiliária Exemplo",4,38000,null);
conta("pagar","Aluguel dos galpões 3 e 4","Aluguel e estrutura","Imobiliária Exemplo",-26,38000,-27);
conta("pagar","Folha de pagamento","Salários","Equipe interna",3,142000,null);
conta("pagar","Folha de pagamento","Salários","Equipe interna",-27,142000,-27);
conta("pagar","Diesel da frota","Combustível","Posto Rodovia",-2,9850,null);
conta("pagar","Cachês de freelancers · Summit Nexo","Freelancers","Equipe freelancer",-12,14600,-10);
conta("pagar","Cachês de freelancers · Congresso Cardiologia","Freelancers","Equipe freelancer",8,21400,null);
conta("pagar","Compra de 8 moving wash","Compras de equipamento","Importadora Exemplo",20,64000,null,{parcela:"2/4"});
conta("pagar","Compra de 8 moving wash","Compras de equipamento","Importadora Exemplo",-10,64000,-10,{parcela:"1/4"});
conta("pagar","Manutenção das talhas elétricas","Manutenção","Assistência Técnica Exemplo",0,4200,null);
conta("pagar","Seguro da frota","Outros","Seguradora Exemplo",12,7300,null);
conta("pagar","Impostos sobre serviços","Impostos","Prefeitura",15,46800,null);

/* ---------------- chat ---------------- */
const chat={canais:[],msgs:[]};
const canal=(tipo,nome,membros,msgs,dia)=>{const c={id:id("w",chat.canais.length+1),tipo,nome,criado_em:ts(dia||-20),
  membros:membros.map((p,k)=>({perfil_id:p,admin:k===0,lido_em:ts(-1)}))};chat.canais.push(c);
  msgs.forEach((m,k)=>chat.msgs.push({id:nid("z"),canal_id:c.id,autor_id:m[0],texto:m[1],criado_em:ts(m[2],m[3]||("1"+(k%10)+":"+String(10+k*3).padStart(2,"0"))),editado_em:null,apagado:false,anexo:null,resposta_id:null}));
  return c;};
canal("grupo","Operação · Congresso Cardiologia",[PR[0],G4,PR[2],E1,E2,SOM,LUZ,EU.id],[
 [E2,"Carreta saiu do galpão 5h10, previsão de chegada 6h.",-1,"05:12"],[PR[0],"Perfeito. Doca 5 já está liberada.",-1,"05:20"],
 [LUZ,"Grid no alto, começando o foco da luz.",-1,"14:40"],[SOM,"PA voado e alinhado. Delay da plenária ok.",-1,"19:05"],
 [G4,"Ótimo trabalho, pessoal. Amanhã às 7h reunião rápida no palco.",-1,"21:30"],[PR[0],"Abertura começou no horário, transmissão estável nas 3 salas 🙌",0,"09:20"]]);
canal("grupo","Comercial",[G2,G1,G3,PR[1],EU.id],[
 [G2,"Proposta do Fórum Conecta enviada. Concorrência com duas locadoras regionais.",-2,"11:00"],[G1,"Podemos dar 5% se fecharem até sexta.",-2,"11:30"],
 [G3,"Lembrando: sinal de 50% na assinatura para clientes novos.",-1,"09:45"]]);
canal("grupo","Estoque e manutenção",[E1,E2,E3,EMAN,ELOG,MOT,G4,EU.id],[
 [EMAN,"Dois movings voltaram do Summit com cooler fazendo barulho, separei na bancada.",-5,"16:10"],[E1,"Vou gerar a carga avulsa para a assistência técnica.",-5,"16:40"],
 [ELOG,"Truck TRK-02 com revisão marcada para a semana que vem.",-2,"10:00"],[MOT,"Ok, uso a van para as entregas pequenas.",-2,"10:20"]]);
const dm=EU.id===G1?G2:G1;
canal("dm","",[EU.id,dm],[[dm,"Consegue revisar a proposta da Premiação Kairos até amanhã?",-1,"18:00"],[EU.id,"Consigo sim, te mando de manhã.",-1,"18:10"]]);

/* ---------------- histórico de alterações (auditoria) ---------------- */
const auditoria=[
 [0,"09:42",P.find(p=>p.id===PR[0]),"UPDATE","ordens_venda",OSN("Congresso Paulista").codigo+" · status",{status:"Em produção"},{status:"Liberada"}],
 [0,"08:15",P.find(p=>p.id===E2),"UPDATE","ordens_carga","OSC-0090 · carregada",{status:"Em separação"},{status:"Carregada"}],
 [-1,"17:30",P.find(p=>p.id===G3),"INSERT","contas","Diesel da frota",null,{valor:9850,vencimento:d(-2)}],
 [-1,"11:05",P.find(p=>p.id===G2),"UPDATE","negocios","Fórum Conecta Saúde 2027 · etapa",{etapa:"orcamento"},{etapa:"fechamento"}],
 [-2,"16:20",P.find(p=>p.id===E1),"UPDATE","itens","Quantidade em manutenção",{em_manutencao:0},{em_manutencao:2}],
 [-3,"10:00",P.find(p=>p.id===G1),"INSERT","clientes","Conecta Saúde Seguros",null,{nome:"Conecta Saúde Seguros",tipo:"Corporativo"}],
 [-4,"14:12",P.find(p=>p.id===PR[3]),"UPDATE","reembolsos","Frete de painéis",{status:"Enviado"},{status:"Recusado"}],
 [-6,"09:30",P.find(p=>p.id===G4),"DELETE","compromissos","Reunião cancelada",{titulo:"Alinhamento fornecedores"},null]
].map((a,i)=>({id:i+1,ocorrido_em:ts(a[0],a[1]),autor_nome:a[2].nome,autor_papel:a[2].papel,operacao:a[3],tabela:a[4],registro:a[5],resumo:a[5],antes:a[6],depois:a[7]}));

/* ---------------- tabelas ---------------- */
const DB={
  perfis:P, clientes:CL, v_itens:itens, itens, kits, frota,
  v_negocios:negocios, negocios, v_ordens_venda:ordens, ordens_venda:ordens,
  ordens_carga:cargas, movimentos:movs, canais:[], mensagens:[], posts, notas, compromissos, notificacoes,
  v_freelancers:FR, freelancers:FR, reembolsos:RB,
  parceiros, sublocacoes:sublocs, contas, item_fotos:fotos, organograma_miro:[]
};

/* ---------------- banco falso ---------------- */
const ok=data=>({data,error:null});
const falha=m=>({data:null,error:{code:"DEMO",message:m}});
const agora=()=>new Date().toISOString();
const uuid=()=>(crypto.randomUUID?crypto.randomUUID():nid("f"));
function consulta(tab){
  const st={op:"select",filtros:[],payload:null,single:null,range:null,limit:null};
  const linhas=()=>DB[tab]||(DB[tab]=[]);
  const casa=r=>st.filtros.every(f=>f(r));
  const exec=()=>{
    const t=linhas();
    if(st.op==="select"){
      let r=t.filter(casa);
      if(st.range) r=r.slice(st.range[0],st.range[1]+1);
      if(st.limit!=null) r=r.slice(0,st.limit);
      r=JSON.parse(JSON.stringify(r));
      if(st.single) return ok(r[0]||null);
      return ok(r);
    }
    let out=[];
    const lista=[].concat(st.payload||[]);
    if(st.op==="insert"||st.op==="upsert"){
      lista.forEach(p=>{const x=Object.assign({id:p.id||uuid(),criado_em:agora()},p);
        const k=x.id?t.findIndex(r=>r.id===x.id):-1;
        if(k>=0) t[k]=Object.assign(t[k],x); else t.push(x); out.push(x);});
    }else if(st.op==="update"){
      t.filter(casa).forEach(r=>{Object.assign(r,st.payload);out.push(r);});
    }else if(st.op==="delete"){
      for(let k=t.length-1;k>=0;k--) if(casa(t[k])){out.push(t[k]);t.splice(k,1);}
    }
    out=JSON.parse(JSON.stringify(out));
    return ok(st.single?out[0]||null:out);
  };
  const o={
    select(){return o;}, insert(p){st.op="insert";st.payload=p;return o;}, upsert(p){st.op="upsert";st.payload=p;return o;},
    update(p){st.op="update";st.payload=p;return o;}, delete(){st.op="delete";return o;},
    eq(c,v){st.filtros.push(r=>r[c]===v);return o;}, neq(c,v){st.filtros.push(r=>r[c]!==v);return o;},
    in(c,a){st.filtros.push(r=>(a||[]).includes(r[c]));return o;}, is(c,v){st.filtros.push(r=>(r[c]==null)===(v==null));return o;},
    gt(){return o;},gte(){return o;},lt(){return o;},lte(){return o;},like(){return o;},ilike(){return o;},not(){return o;},or(){return o;},
    match(){return o;},filter(){return o;},contains(){return o;},textSearch(){return o;},order(){return o;},
    limit(n){st.limit=n;return o;}, range(a,b){st.range=[a,b];return o;},
    single(){st.single=true;return o;}, maybeSingle(){st.single=true;return o;},
    then(res,rej){return Promise.resolve().then(exec).then(res,rej);}
  };
  return o;
}

/* conversas do chat no formato das funções do banco */
function chatLista(){
  return chat.canais.filter(c=>c.membros.some(m=>m.perfil_id===EU.id)).map(c=>{
    const ms=chat.msgs.filter(m=>m.canal_id===c.id).sort((a,b)=>a.criado_em<b.criado_em?-1:1);
    const eu=c.membros.find(m=>m.perfil_id===EU.id);
    return Object.assign(JSON.parse(JSON.stringify(c)),{ultima:ms.length?JSON.parse(JSON.stringify(ms[ms.length-1])):null,
      novas:ms.filter(m=>m.autor_id!==EU.id&&m.criado_em>(eu.lido_em||"")).length});});
}
const RPC={
  plataforma_owner:()=>ok(false),
  contexto_empresa:()=>ok(EMPRESA),
  meu_perfil_completo:()=>ok(Object.assign({telefone:"(11) 99000-0000",whatsapp:"(11) 99000-0000",cidade:"São Paulo",estado:"SP",avatar_path:null},EU)),
  salvar_meu_perfil:a=>{Object.assign(EU,a&&a.p_dados||{});return ok(true);},
  pessoas_online:()=>ok(P.filter((p,i)=>i%3!==2).map((p,i)=>({nome:p.nome,cargo:p.cargo,papel:p.papel,email:p.email,visto_em:new Date(Date.now()-i*9000).toISOString()}))),
  registrar_presenca:()=>ok(true),
  listar_auditoria:a=>ok(auditoria.filter(r=>(!a.p_tabela||r.tabela===a.p_tabela)&&(!a.p_acao||r.operacao===a.p_acao)&&
    (!a.p_busca||JSON.stringify(r).toLowerCase().includes(String(a.p_busca).toLowerCase())))),
  empresa_por_codigo:a=>ok(a&&a.p_id===PARC_EMP?"Sonora Locações":null),
  importar_inventario:a=>{const l=(a&&a.p_itens)||[];return ok({criados:l.length,atualizados:0});},
  chat_listar:()=>ok(chatLista()),
  chat_mensagens:a=>{let ms=chat.msgs.filter(m=>m.canal_id===a.p_canal);
    if(a.p_busca) ms=ms.filter(m=>(m.texto||"").toLowerCase().includes(a.p_busca.toLowerCase()));
    if(a.p_antes) ms=ms.filter(m=>m.criado_em<a.p_antes);
    const c=chat.canais.find(x=>x.id===a.p_canal);if(c){const m=c.membros.find(x=>x.perfil_id===EU.id);if(m)m.lido_em=agora();}
    return ok(JSON.parse(JSON.stringify(ms.sort((x,y)=>x.criado_em<y.criado_em?1:-1).slice(0,100))));},
  chat_enviar:a=>{chat.msgs.push({id:a.p_id||uuid(),canal_id:a.p_canal,autor_id:EU.id,texto:a.p_texto||"",criado_em:agora(),editado_em:null,apagado:false,anexo:a.p_anexo||null,resposta_id:a.p_resposta||null});return ok(true);},
  chat_editar:a=>{const m=chat.msgs.find(x=>x.id===a.p_id);if(m){if(a.p_apagar)m.apagado=true;else{m.texto=a.p_texto;m.editado_em=agora();}}return ok(true);},
  chat_criar:a=>{const c=canal(a.p_direta?"dm":"grupo",a.p_nome||"",[EU.id,...(a.p_membros||[])],[],0);c.criado_em=agora();return ok(c.id);},
  chat_gerenciar:a=>{const c=chat.canais.find(x=>x.id===a.p_canal);if(!c)return ok(true);
    if(a.p_acao==="nome")c.nome=a.p_nome;else if(a.p_acao==="adicionar"&&a.p_pessoa)c.membros.push({perfil_id:a.p_pessoa,admin:false,lido_em:null});
    else if(a.p_acao==="remover")c.membros=c.membros.filter(m=>m.perfil_id!==a.p_pessoa);
    else if(a.p_acao==="sair")c.membros=c.membros.filter(m=>m.perfil_id!==EU.id);
    else{const m=c.membros.find(x=>x.perfil_id===a.p_pessoa);if(m)m.admin=a.p_acao==="promover";}
    return ok(true);},
  chat_ligar:()=>falha("Chamadas de voz e vídeo não funcionam na demonstração."),
  chat_chamada_acao:()=>ok(true), chat_sinal:()=>ok(true), chat_telefonia:()=>falha("Indisponível na demonstração."),
  /* operações de estoque: no banco real são transações; aqui mexem direto no estado do app */
  gerar_ordem_carga:a=>{const S=window.__efS&&window.__efS();const o=S&&S.os.find(x=>x.id===a.p_os);if(!o)return falha("OS não encontrada.");
    const it2=typeof romaneioDaOS==="function"?romaneioDaOS(o):o.itens;
    const c={id:uuid(),codigo:"OSC-"+String(++seqOSC).padStart(4,"0"),osId:o.id,evento:"",status:"Liberada",carga:d(Math.round((new Date(o.montagem)-new Date(HOJE))/86400000)-1),
      horaCarga:"07:00",descarga:d(Math.round((new Date(o.desmontagem)-new Date(HOJE))/86400000)+1),veiculo:"",equipe:"",conferente:"",obs:"",
      itens:it2.map(i=>({cod:i.cod,nome:i.nome||"",qtd:i.qtd,obs:i.obs||""}))};
    S.cargas.push(c);o.status="Liberada";return ok({id:c.id,codigo:c.codigo});},
  confirmar_carga:a=>{const S=window.__efS&&window.__efS();const c=S&&S.cargas.find(x=>x.id===a.p_ordem);if(!c)return falha("Carga não encontrada.");
    c.status="Carregada";S.movs.push({id:uuid(),codigo:"MOV-"+(++seqMov),data:HOJE,tipo:"SAÍDA",oscId:c.id,ref:c.codigo,quem:EU.id,user:EU.nome,
      linhas:c.itens.filter(i=>i.cod).map(i=>[i.cod,i.qtd]),avarias:[]});return ok({data:HOJE});},
  registrar_descarga:a=>{const S=window.__efS&&window.__efS();const c=S&&S.cargas.find(x=>x.id===a.p_ordem);if(!c)return falha("Carga não encontrada.");
    const av=a.p_avarias||{};c.status="Retornada";
    S.movs.push({id:uuid(),codigo:"MOV-"+(++seqMov),data:HOJE,tipo:"ENTRADA",oscId:c.id,ref:c.codigo,quem:EU.id,user:EU.nome,
      linhas:c.itens.filter(i=>i.cod).map(i=>[i.cod,i.qtd]),avarias:Object.entries(av)});
    Object.entries(av).forEach(([cod,q])=>{const i=S.cat.find(x=>x.cod===cod);if(i)i.manut=(i.manut||0)+q;});
    return ok({data:HOJE});}
};
const canalFalso=()=>{const ch={on(){return ch;},subscribe(cb){if(typeof cb==="function")setTimeout(()=>cb("SUBSCRIBED"),0);return ch;},
  track:async()=>"ok",untrack:async()=>"ok",send:async()=>"ok",presenceState:()=>({}),unsubscribe:async()=>"ok"};return ch;};
const cliente={
  auth:{
    getUser:async()=>({data:{user:{id:EU.id,email:EU.email}},error:null}),
    getSession:async()=>({data:{session:{user:{id:EU.id,email:EU.email}}},error:null}),
    onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}}),
    signInWithPassword:async()=>({data:null,error:{message:"Você está na demonstração. Saia dela para entrar com a sua conta."}}),
    signOut:async()=>{try{sessionStorage.removeItem("ef-demo");}catch(e){} limparUrl();return {error:null};},
    resetPasswordForEmail:async()=>({error:null}), updateUser:async()=>({data:{},error:null})
  },
  from:t=>consulta(t),
  rpc:async(n,a)=>{const f=RPC[n];try{return f?f(a||{}):ok(null);}catch(e){return falha(e.message);}},
  channel:()=>canalFalso(), removeChannel:async()=>"ok", removeAllChannels:async()=>[],
  storage:{from:()=>({upload:async p=>ok({path:p}),remove:async()=>ok([]),createSignedUrl:async()=>ok({signedUrl:""}),
    createSignedUrls:async l=>ok((l||[]).map(p=>({path:p,signedUrl:""}))),getPublicUrl:()=>({data:{publicUrl:""}})})},
  functions:{invoke:async()=>({data:null,error:{message:"Indisponível na demonstração."}})}
};
window.supabase={createClient:()=>cliente};
EF_DEMO.empresa=EMPRESA; EF_DEMO.eu=EU;
})();

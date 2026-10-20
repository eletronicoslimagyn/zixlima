(()=>{
'use strict';
const core=window.zixMonstroBridge;
const bundled=window.ZIX_MONSTRO_CODIGOS;
if(!core||!bundled||!Array.isArray(bundled.entries))return;
const $=id=>document.getElementById(id);
const menu=document.querySelector('.tabs'), main=document.querySelector('main');
if(!menu||!main)return;
const tab=document.createElement('button');tab.textContent='🧬 Códigos PRO';tab.dataset.tab='library';menu.append(tab);
const section=document.createElement('section');section.dataset.pane='library';section.className='hidden';
section.innerHTML=`<div class="card"><h2>🧬 Banco de programação MONSTRO 7.0</h2>
 <p class="hint">Biblioteca offline de exemplos e padrões de engenharia. Não são códigos mágicos nem executados automaticamente. Selecione, estude, adapte e teste antes de usar.</p>
 <div class="row"><label style="flex:2 1 250px">Pesquisar título, tema, linguagem ou palavra-chave<input id="libQuery" placeholder="Ex.: Termux, Supabase, segurança, Python, APK..."></label><label>Área<select id="libArea"><option value="">Todas as áreas</option></select></label><label>Linguagem<select id="libLanguage"><option value="">Todas</option></select></label></div>
 <div class="row"><label>Nível<select id="libLevel"><option value="">Todos</option><option>Iniciante</option><option>Intermediário</option><option>Avançado</option></select></label><label>Importar pacote próprio (JSON)<input id="libImport" type="file" accept=".json,application/json"></label></div>
 <div class="row"><button id="libSyncTermux" class="primary">🔄 Sincronizar Termux</button><span id="libTermuxStatus" class="tiny" role="status">Inicie o servidor pelo Termux para carregar códigos adicionais.</span></div>
 <div class="row"><button id="libExport">⬇ Baixar todo o banco JSON</button><button id="libMyExport">⬇ Exportar meus códigos</button><button id="libNew">＋ Guardar meu código</button><button id="libClearFilter">Limpar filtros</button></div>
 <p id="libCount" class="stat" role="status"></p>
 <div class="grid" style="grid-template-columns:minmax(230px,1fr) minmax(0,1.5fr);align-items:start">
  <div id="libResults" style="max-height:60vh;overflow:auto;display:grid;gap:7px"></div>
  <div><div class="card" style="background:#0b1628"><h3 id="libTitle">Selecione um exemplo</h3><p id="libInfo" class="tiny"></p><p id="libSummary"></p><p id="libWarning" class="warn tiny"></p><pre id="libCode" style="font-size:12px;max-height:45vh;overflow:auto;white-space:pre;word-break:normal;padding:12px;border:1px solid #34415a;border-radius:8px;background:#050d1b"></pre><div class="row"><button class="primary" id="libCopy">📋 Copiar</button><button id="libSave">⬇ Baixar código</button><button id="libEditor">💻 Abrir no editor</button><button id="libAsk">👾 Analisar com IA</button></div><p id="libStatus" role="status" class="stat"></p></div></div>
 </div></div>`;
main.append(section);tab.addEventListener('click',()=>core.activate('library'));
const stateKey='zix_monstro_biblioteca_pessoal_v6';
let termux=[];
let extra=[];
try{const saved=JSON.parse(localStorage.getItem(stateKey)||'[]');if(Array.isArray(saved))extra=saved.filter(x=>valid(x,true)).slice(0,250)}catch{}
const base=bundled.entries;
const languages=[...new Set(base.map(x=>x.language))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
const cats=[...new Set(base.map(x=>x.category))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
for(const [id,values] of [['libArea',cats],['libLanguage',languages]])for(const v of values){const o=document.createElement('option');o.value=v;o.textContent=v;$(id).append(o)}
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
let selected=null;
const status=s=>{$('libStatus').textContent=s};
function valid(x,custom=false){return x && typeof x==='object' && !Array.isArray(x) && typeof x.title==='string' && x.title.length<=150 && x.title.length>0 && typeof x.code==='string' && x.code.length>0 && x.code.length<=40000 && typeof x.language==='string' && x.language.length<=65 && typeof x.category==='string' && x.category.length<=100 && (!custom || (typeof x.id==='string'&&x.id.startsWith('pessoal-')))}
function download(name,value,type='text/plain;charset=utf-8'){
 if(window.MonstroAndroid&&window.MonstroAndroid.saveTextFile){window.MonstroAndroid.saveTextFile(name,String(value),type);return;}const blob=new Blob([value],{type});const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name.replace(/[^\w.\-]/g,'_').slice(0,100);a.click();setTimeout(()=>URL.revokeObjectURL(u),3000);
}
function list(){return [...base,...termux,...extra]}
function saveExtra(){try{localStorage.setItem(stateKey,JSON.stringify(extra));return true}catch{return false}}
function show(x){selected=x;$('libTitle').textContent=x.title;$('libInfo').textContent=`${x.language} · ${x.category} · ${x.level||'Personalizado'} · ${x.id}`;
 $('libSummary').textContent=x.summary||'';$('libWarning').textContent=x.caution||'Adapte e teste antes de executar.';$('libCode').textContent=x.code;status('Pronto para copiar, salvar ou enviar à IA.');}
function render(){
 const q=norm($('libQuery').value.trim()),cat=$('libArea').value,language=$('libLanguage').value,level=$('libLevel').value;
 const matching=list().filter(x=>(!cat||x.category===cat)&&(!language||x.language===language)&&(!level||x.level===level)&&(!q||norm([x.title,x.language,x.category,x.summary,...(x.tags||[]),x.code.slice(0,1500)].join(' ')).includes(q)));
 $('libCount').textContent=`${matching.length} encontrados · ${base.length} exemplos oficiais offline · ${extra.length} exemplos pessoais · ${termux.length} recebidos do Termux`;
 const area=$('libResults');area.replaceChildren();
 for(const x of matching.slice(0,300)){const b=document.createElement('button');b.type='button';b.style.cssText='text-align:left;min-width:0;overflow-wrap:anywhere';
 b.textContent=`${x.language} · ${x.title}`;
 if(selected?.id===x.id){b.style.background='#155d4e';b.style.borderColor='#49caab'}
 b.onclick=()=>{show(x);render()};area.append(b)}
 if(!matching.length){const p=document.createElement('p');p.className='hint';p.textContent='Nenhum código encontrado. Experimente outro termo.';area.append(p)}
 if(matching.length>300){const p=document.createElement('p');p.className='hint';p.textContent='Exibindo os primeiros 300 resultados; refine os filtros.';area.append(p)}
}
for(const id of ['libQuery','libArea','libLanguage','libLevel'])$(id).addEventListener(id==='libQuery'?'input':'change',render);
$('libClearFilter').onclick=()=>{for(const id of ['libQuery','libArea','libLanguage','libLevel'])$(id).value='';render()};
$('libCopy').onclick=async()=>{if(!selected)return;try{await navigator.clipboard.writeText(selected.code);status('Código copiado. Revise antes de executar.')}catch{status('Permissão de cópia indisponível; selecione o código manualmente.')}};
$('libSave').onclick=()=>{if(!selected)return;download(selected.filename||'codigo.txt',selected.code);status('Arquivo preparado para download.')};
$('libEditor').onclick=()=>{if(!selected)return;const editor=$('source');if(editor?.value.trim()&&!confirm('Substituir o texto do editor atual? Salve antes suas mudanças.'))return;
 $('filename').value=selected.filename||'exemplo.txt';editor.value=selected.code;core.activate('code');core.notify('Exemplo copiado para o editor. Salve no projeto quando desejar.')};
$('libAsk').onclick=()=>{if(!selected)return;core.activate('chat');core.send('Quero estudar e adaptar com segurança este exemplo da biblioteca offline. Explique o funcionamento em português do Brasil, requisitos, limitações e testes; faça perguntas se faltar contexto. Não execute operações no meu aparelho. TÍTULO: '+selected.title+'\nDESCRIÇÃO: '+(selected.summary||'')+'\nCÓDIGO:\n```'+selected.language+'\n'+selected.code.slice(0,12500)+'\n```')};
$('libExport').onclick=()=>download('monstro-biblioteca-codigos-v7.json',JSON.stringify({schema:bundled.schema,version:7,entries:[...base,...termux]},null,2),'application/json;charset=utf-8');
$('libMyExport').onclick=()=>download('monstro-meus-codigos.json',JSON.stringify({schema:bundled.schema,entries:extra},null,2),'application/json;charset=utf-8');
$('libNew').onclick=()=>{const title=prompt('Título do novo código');if(!title?.trim())return;
 const file=$('filename').value||'meu-codigo.txt',code=$('source').value;
 if(!code.trim()){status('Cole o código primeiro na aba Código e depois clique novamente em Guardar meu código.');return;}
 if(title.length>150||code.length>40000){status('Limite: 150 caracteres no título e 40.000 no código.');return;}
 if(extra.length>=250){status('Limite de 250 exemplos pessoais. Exporte seu banco antes de remover outros exemplos.');return;}
 const item={id:'pessoal-'+Date.now()+'-'+Math.floor(Math.random()*1000),title:title.trim(),language:'Pessoal',category:'Meus códigos',level:'Personalizado',summary:'Código salvo do editor do projeto',filename:file,code,caution:'Código pessoal: revise e teste antes de usar.',tags:[]};
 extra.push(item);if(!saveExtra()){extra.pop();status('Espaço local insuficiente. Exporte seus códigos para JSON.');return;}
 show(item);render();status('Código armazenado localmente. Faça backup JSON para outro aparelho.')};
$('libImport').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;if(file.size>4_000_000){status('Arquivo acima de 4 MB não será importado.');e.target.value='';return;}
 try{
  const parsed=JSON.parse(await file.text());if(parsed.schema!==bundled.schema||!Array.isArray(parsed.entries))throw Error('Formato inválido. Use um JSON exportado pela biblioteca.');
  let inserted=0;for(const rec of parsed.entries){if(extra.length>=250)break;if(!valid(rec))continue;
    if(base.some(x=>x.id===rec.id))continue; // os oficiais já existem
    const id='pessoal-'+Date.now()+'-'+inserted;
    if(extra.some(x=>x.title===rec.title&&x.code===rec.code))continue;
    extra.push({...rec,id,level:rec.level||'Personalizado',tags:Array.isArray(rec.tags)?rec.tags.slice(0,10).map(String):[],filename:rec.filename||'exemplo.txt'});inserted++;
  }
  if(!saveExtra())throw Error('Armazenamento local cheio. Exporte uma cópia JSON antes de importar.');
  render();status(`${inserted} códigos pessoais importados. Nenhum código foi executado.`);
 }catch(err){status('Falha ao importar: '+err.message)}finally{e.target.value=''}
};
async function syncTermux(){
  const statusNode=$('libTermuxStatus');
  if(!['localhost','127.0.0.1'].includes(location.hostname)){
    statusNode.textContent='Abra http://127.0.0.1:8765 no mesmo aparelho para sincronizar com Termux.';
    return;
  }
  const btn=$('libSyncTermux');btn.disabled=true;statusNode.textContent='Lendo banco do Termux...';
  try{
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),8000);
    let response;try{response=await fetch('/api/library/entries',{cache:'no-store',signal:controller.signal});}finally{clearTimeout(timer)}
    if(!response.ok)throw Error('Servidor retornou HTTP '+response.status);
    const payload=await response.json();
    if(!payload.ok||!Array.isArray(payload.entries))throw Error('Resposta inesperada do servidor');
    const ids=new Set(base.map(x=>x.id));
    termux=payload.entries.filter(x=>valid(x)&&!ids.has(x.id)).slice(0,400);
    for(const [selector,field] of [['libArea','category'],['libLanguage','language']]){
      const existing=new Set([...$(selector).options].map(o=>o.value));
      for(const value of new Set(termux.map(x=>x[field]))){if(!existing.has(value)){$(selector).add(new Option(value,value));existing.add(value)}}
    }
    statusNode.textContent=termux.length+' códigos exclusivos carregados do banco SQLite.'+(payload.total>termux.length?' Mostrando os 400 mais recentes.':'');
    render();
  }catch(err){statusNode.textContent='Não foi possível sincronizar: '+err.message+'. Inicie a opção 2 pelo Termux.'}
  finally{btn.disabled=false}
}
$('libSyncTermux').onclick=syncTermux;
show(base[0]);render();if(['127.0.0.1','localhost'].includes(location.hostname))void syncTermux();
})();

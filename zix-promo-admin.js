/* ZixLima: gestão unificada por ID original, três canais separados. */
import {SUPABASE_URL,SUPABASE_ANON_KEY} from './config.js';
import {createClient} from 'https://esm.sh/@supabase/supabase-js@2';
const db=createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
const $=id=>document.getElementById(id);
const el=(tag,txt='',cls='')=>{const n=document.createElement(tag);n.textContent=txt;n.className=cls;return n;};
let all=[],listings=[];
let authorized=false;
const types=[{channel:'interno',title:'🔴 Impulsionamento interno',cls:'imp',plans:[['destaque_7','Destaque 7 dias · R$ 9,90'],['premium_15','Premium 15 dias · R$ 24,90'],['supremo_30','Supremo 30 dias · R$ 49,90']]},{channel:'google_ads',title:'🔵 Google Ads',cls:'ads',plans:[['google_personalizado','Campanha personalizada · orçamento a combinar']]},{channel:'externo',title:'🟣 Impulsionamento externo',cls:'ext',plans:[['externo_personalizado','Divulgação externa · orçamento a combinar']]}];
function msg(s){$('zixPromoMsg').textContent=s;}
function money(n){return Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}
function esc(s){return String(s||'').toLowerCase();}
function badge(x){return el('strong',x.public_code||x.id,'zixpromo-code '+({interno:'imp',google_ads:'ads',externo:'ext'}[x.channel]||''));}
function label(x){return listings.find(y=>y.id===x.listing_id)?.zix_code||x.listing_id;}
async function findListing(code){
 const s=code.trim();if(!s)throw Error('Digite o ID do anúncio.');
 const isUuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
 const {data,error}=await db.from('listings').select('id,zix_code,title,user_id,status').eq(isUuid?'id':'zix_code',isUuid?s:s.toUpperCase()).maybeSingle();
 if(error)throw error;if(!data)throw Error('Anúncio não encontrado no Supabase.');
 return data;
}
async function rpc(action,x,days=0){
 const note=window.prompt('Motivo da ação (para o histórico administrativo):',action==='bonus'?'Bônus de cortesia':action==='reativar'?'Reativação autorizada':'Ação administrativa');
 if(note===null)return;
 if(!window.confirm(`${action.toUpperCase()} ${x.public_code}?\nConfirma a alteração?`))return;
 const {error}=await db.rpc('zix_promo_admin',{p_action:action,p_boost:x.id,p_days:days,p_notes:note});
 if(error){alert('Erro: '+error.message);return;}
 await reload();
}
function serviceCard(x){
 const node=el('div','','zixpromo-item');
 const top=el('div','','zixpromo-top');top.append(badge(x),el('span',`${x.status}${x.archived_at?' · arquivado':''}`));node.append(top);
 node.append(el('div',`Anúncio: ${label(x)} | ${x.package} | ${money(x.price_brl)}`));
 const date=x.ends_at?new Date(x.ends_at).toLocaleString('pt-BR'):'Não iniciado';node.append(el('small',`Vencimento: ${date} · Bônus: ${x.bonus_days||0} dia(s)`));
 const actions=el('div','','zixpromo-actions');
 function btn(name,cb){const b=el('button',name);b.type='button';b.onclick=cb;actions.append(b);}
 btn('🎁 Bônus',()=>{const v=Number(prompt('Adicionar quantos dias de bônus? (1 a 365)','7'));if(Number.isInteger(v)&&v>0&&v<=365)void rpc('bonus',x,v);else if(!Number.isNaN(v))alert('Prazo inválido.');});
 btn('🔄 Reativar',()=>{const v=Number(prompt('Reativar por quantos dias? (1 a 365)','7'));if(Number.isInteger(v)&&v>0&&v<=365)void rpc('reativar',x,v);else if(!Number.isNaN(v))alert('Prazo inválido.');});
 if(x.status!=='cancelado')btn('⛔ Cancelar',()=>void rpc('cancelar',x));
 btn(x.archived_at?'📂 Restaurar':'🗃️ Arquivar',()=>void rpc(x.archived_at?'restaurar':'arquivar',x));
 node.append(actions);return node;
}
function render(){
 const q=esc($('zixPromoSearch').value.trim());
 for(const t of types){
 const panel=$('zixPromoList_'+t.channel);panel.replaceChildren();
 let result=all.filter(x=>x.channel===t.channel&&(!q||[x.public_code,x.id,x.package,x.listing_id,label(x),listings.find(y=>y.id===x.listing_id)?.title].some(z=>esc(z).includes(q))));
 for(const x of result)panel.append(serviceCard(x));
 if(!result.length)panel.append(el('p','Nenhuma contratação encontrada.'));
 }
 updateHistory();
}
function updateHistory(){
 const hist=$('zixHistoryList');if(!hist)return;
 for(const card of hist.querySelectorAll('.zix-history-item')){
  card.querySelector('.zixpromo-linked')?.remove();
  const h=card.querySelector('.zix-history-row strong')?.textContent||'';
  const code=h.replace(/^Nº\s*/,'').trim();
  const parent=listings.find(x=>x.zix_code===code||x.id===code);
  if(!parent)continue;
  const related=all.filter(x=>x.listing_id===parent.id);
  const extra=el('div','','zixpromo-linked');extra.append(el('div','Serviços e campanhas vinculados:'));
  if(!related.length)extra.append(el('small','Nenhuma contratação de publicidade.'));
  for(const x of related){const line=el('div','','zixpromo-link-line');line.append(badge(x),el('small',` ${x.status}${x.archived_at?' · arquivado':''} · ${x.package}`));extra.append(line);}
  card.append(extra);
 }
}
async function reload(){
 if(!authorized)return;
 const [a,b]=await Promise.all([
  db.from('zix_boost_requests').select('id,listing_id,channel,package,price_brl,status,starts_at,ends_at,bonus_days,archived_at,public_code,created_at').order('created_at',{ascending:false}).limit(2000),
  db.from('listings').select('id,zix_code,title,user_id,status').order('created_at',{ascending:false}).limit(2000)
 ]);
 if(a.error||b.error){msg('Erro ao carregar: '+(a.error?.message||b.error?.message));return;}
 all=a.data||[];listings=b.data||[];
 msg(`Campanhas e destaques: ${all.length} | Anúncios: ${listings.length}.`);render();
}
function makeType(t,root){
 const section=el('section','','zixpromo-panel');section.append(el('h3',t.title));
 const form=document.createElement('form');form.className='zixpromo-form';
 const field=document.createElement('input');field.required=true;field.placeholder='ID original: ZIX-000004';field.setAttribute('aria-label','ID original do anúncio');
 const pack=document.createElement('select');pack.setAttribute('aria-label','Plano');for(const [value,name] of t.plans){const op=new Option(name,value);pack.append(op);}
 const save=el('button','📣 Registrar solicitação');save.type='submit';form.append(field,pack,save);section.append(form);
 form.addEventListener('submit',async ev=>{
  ev.preventDefault();save.disabled=true;
  try{const listing=await findListing(field.value);if(listing.status!=='approved')throw Error('Anúncio ainda não aprovado.');
   const reason=prompt(`Criar solicitação de ${t.title} para ${listing.zix_code}?\nMotivo/observação administrativa:`,'Solicitação recebida');if(reason===null)return;
   const {data,error}=await db.rpc('zix_promo_admin',{p_action:'criar',p_listing:listing.id,p_channel:t.channel,p_package:pack.value,p_notes:reason});
   if(error)throw error;alert('Solicitação registrada com código '+data.code);await reload();
  }catch(e){alert(e.message);}finally{save.disabled=false;}
 });
 const list=el('div','','zixpromo-list');list.id='zixPromoList_'+t.channel;section.append(list);root.append(section);
}
function init(){
 const target=$('zixFinanceiro');if(!target)return;
 const root=el('section','','zixpromo-root');root.id='zixPromoRoot';
 root.append(el('h2','📚 Gestão de publicidade por ID do anúncio'));
 root.append(el('p','Verde: ZixLima original · Vermelho: impulsionamento interno · Azul: Google Ads · Roxo: divulgação externa.'));
 const search=document.createElement('input');search.type='search';search.placeholder='Pesquisar ZIX, ZIMP, ZADS ou ZEXT';search.id='zixPromoSearch';search.addEventListener('input',render);root.append(search);
 const refresh=el('button','🔄 Atualizar contratos');refresh.type='button';refresh.onclick=()=>void reload();root.append(refresh);
 const note=el('p','Aguardando autenticação administrativa...');note.id='zixPromoMsg';root.append(note);
 for(const t of types)makeType(t,root);
 target.append(root);
 const hist=$('zixHistoryList');if(hist){const obs=new MutationObserver(()=>updateHistory());obs.observe(hist,{childList:true});}
 async function auth(){const {data:{user}}=await db.auth.getUser();if(!user){authorized=false;msg('Faça login como administrador.');return;}
 const {data,error}=await db.from('admins').select('user_id').eq('user_id',user.id).maybeSingle();authorized=!error&&!!data;
 if(authorized)await reload();else msg('Acesso permitido somente ao administrador.');
 }
 void auth();db.auth.onAuthStateChange(()=>{setTimeout(()=>void auth(),0);});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();

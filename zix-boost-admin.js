/* ZixLima — solicitações de publicidade: fila, rejeição, arquivamento e histórico.
   O Supabase aplica a autorização (RLS) e um trigger salva cada alteração no histórico. */
import {SUPABASE_URL,SUPABASE_ANON_KEY} from './config.js';
const $=id=>document.getElementById(id);
const element=(tag,text='',cls='')=>{const n=document.createElement(tag);n.textContent=text;n.className=cls;return n;};
const money=x=>Number(x||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const date=x=>x?new Date(x).toLocaleString('pt-BR'):'—';
const statusLabels={solicitado:'Novo pedido',aguardando_pagamento:'Aguardando pagamento',aprovado:'Aprovado',ativo:'Ativo',concluido:'Concluído',rejeitado:'Rejeitado',cancelado:'Cancelado'};
const platformLabels={interno:'Destaque ZixLima',google_ads:'Google Ads',facebook:'Facebook Ads',instagram:'Instagram Ads',youtube:'YouTube Ads',tiktok:'TikTok Ads',externo:'Divulgação externa'};
let db,authorized=false,requests=[],listings=new Map(),history=[],tab='pendentes';
function message(value){const node=$('zixBoostAdmMsg');if(node)node.textContent=value}
function statusName(item){return item.archived_at?'Excluído da fila':(statusLabels[item.status]||item.status)}
function platformName(item){const set=item.channels_requested?.length?item.channels_requested:[item.channel];return set.map(x=>platformLabels[x]||x).join(' • ')}
function showTab(key){tab=key;for(const b of document.querySelectorAll('.zix-boost-subtab')){b.classList.toggle('current',b.dataset.mode===key);b.setAttribute('aria-pressed',String(b.dataset.mode===key));}render()}
function askReason(title,defaultText=''){const value=prompt(title+'\nInforme um motivo para o histórico:',defaultText);if(value===null)return null;return value.trim().slice(0,600)}
async function setStatus(item,next,days){
 if(!authorized)return;
 const reason=askReason(`Alterar ${item.public_code||item.id} para ${statusLabels[next]||next}?`,next==='rejeitado'?'Solicitação rejeitada após análise':'');if(reason===null)return;
 if(next==='rejeitado'&&!reason){alert('Informe o motivo da rejeição.');return;}
 if(!confirm(`Confirmar ${statusLabels[next]||next} para este pedido?\nA publicação e pagamento não serão processados automaticamente.`))return;
 const now=new Date();const changes={status:next,admin_reason:reason};
 if(next==='ativo'){
  if(item.channel!=='interno'){alert('Campanhas externas não são ativadas pelo site. Registre como Aprovado e gerencie a publicidade diretamente na plataforma contratada.');return;}
  if(!Number.isInteger(days)||days<1||days>365){alert('Duração inválida (1 a 365 dias).');return;}
  changes.starts_at=now.toISOString();changes.ends_at=new Date(now.getTime()+days*86400000).toISOString();
 }else if(next==='rejeitado'||next==='cancelado'){
  changes.starts_at=null;changes.ends_at=null;
 }
 const {error}=await db.from('zix_boost_requests').update(changes).eq('id',item.id).select('id').single();
 if(error)alert('Falha ao salvar: '+error.message);else await reload();
}
async function archive(item,restore=false){
 if(!authorized)return;
 const reason=askReason(restore?'Restaurar pedido para a fila?':'Excluir pedido da fila? O histórico continuará salvo.',restore?'Restaurado pelo administrador':'Excluído da fila pelo administrador');if(reason===null)return;
 if(!restore&&!confirm('Excluir este pedido da fila? A exclusão é segura: ele ficará no Histórico e poderá ser restaurado.'))return;
 const changes={archived_at:restore?null:new Date().toISOString(),admin_reason:reason};
 if(!restore&&item.status==='ativo')changes.status='cancelado';
 const {error}=await db.from('zix_boost_requests').update(changes).eq('id',item.id).select('id').single();
 if(error)alert('Falha ao atualizar: '+error.message);else await reload();
}
function card(item){
 const node=element('article','','zix-boost-admin-row');
 const listing=listings.get(item.listing_id);
 const top=element('div','','zix-boost-rowtop');const code=element('strong',item.public_code||listing?.zix_code||item.id,'zix-boost-id');const badge=element('span',statusName(item),'zix-boost-status '+(item.status||''));top.append(code,badge);node.append(top);
 node.append(element('h3',listing?.title||'Anúncio '+(listing?.zix_code||item.listing_id)));
 node.append(element('p',platformName(item),'zix-boost-platforms'));
 const info=element('div','','zix-boost-metadata');info.append(element('span','📅 '+date(item.created_at)),element('span','💰 Serviço '+money(item.price_brl)),element('span','📣 Mídia '+(item.media_budget_brl?money(item.media_budget_brl):'a combinar')));node.append(info);
 const objective={visitas:'Visitas',whatsapp:'Conversas WhatsApp',leads:'Contatos de clientes',alcance:'Alcance'};
 if(item.campaign_objective)node.append(element('p','Objetivo: '+(objective[item.campaign_objective]||item.campaign_objective),'zix-boost-detail'));
 if(item.request_notes)node.append(element('p','Cliente: '+item.request_notes,'zix-boost-detail'));
 if(item.admin_reason)node.append(element('p','Última observação ADM: '+item.admin_reason,'zix-boost-detail'));
 const actions=element('div','','zix-boost-admin-actions');
 const button=(label,cls,handler)=>{const b=element('button',label,cls);b.type='button';b.onclick=async()=>{b.disabled=true;try{await handler()}catch(e){alert(e.message)}finally{b.disabled=false}};actions.append(b)};
 if(item.archived_at){node.append(element('p','Arquivado em '+date(item.archived_at),'zix-boost-detail'));button('↩ Restaurar','zix-boost-action',()=>archive(item,true));}
 else if(['solicitado','aguardando_pagamento','aprovado'].includes(item.status)){
  button('✓ Aprovar','zix-boost-action good',()=>setStatus(item,'aprovado',0));
  if(item.channel==='interno')button('▶ Ativar destaque','zix-boost-action good',async()=>{const raw=prompt('Duração do destaque em dias (1 a 365)',String(item.duration_days|| (item.package==='destaque_7'?7:item.package==='premium_15'?15:30)));if(raw===null)return;await setStatus(item,'ativo',Number(raw))});
  button('✕ Rejeitar','zix-boost-action bad',()=>setStatus(item,'rejeitado',0));
 }
 if(item.status==='ativo'&&!item.archived_at){button('✓ Concluir','zix-boost-action',()=>setStatus(item,'concluido',0));button('⛔ Cancelar','zix-boost-action bad',()=>setStatus(item,'cancelado',0));}
 if(!item.archived_at)button('🗑 Excluir da fila','zix-boost-action subtle',()=>archive(item));
 node.append(actions);return node;
}
function render(){const content=$('zixBoostAdmList'),search=$('zixBoostAdmSearch');if(!content)return;content.replaceChildren();
 const query=(search?.value||'').trim().toLowerCase();
 let data=requests.filter(x=>tab==='pendentes'?!x.archived_at&&['solicitado','aguardando_pagamento','aprovado'].includes(x.status):tab==='ativos'?!x.archived_at&&x.status==='ativo':!!x.archived_at||['concluido','rejeitado','cancelado'].includes(x.status));
 if(query)data=data.filter(x=>{const l=listings.get(x.listing_id);return [x.public_code,x.id,x.listing_id,l?.zix_code,l?.title,platformName(x),x.status].some(t=>String(t||'').toLowerCase().includes(query))});
 const counts={pendentes:requests.filter(x=>!x.archived_at&&['solicitado','aguardando_pagamento','aprovado'].includes(x.status)).length,ativos:requests.filter(x=>!x.archived_at&&x.status==='ativo').length,historico:requests.filter(x=>x.archived_at||['concluido','rejeitado','cancelado'].includes(x.status)).length};
 for(const b of document.querySelectorAll('.zix-boost-subtab'))b.textContent=(b.dataset.mode==='pendentes'?'📥 Pendentes':b.dataset.mode==='ativos'?'📢 Ativos':'🗂 Histórico')+' ('+counts[b.dataset.mode]+')';
 if(!data.length)content.append(element('p','Nenhuma solicitação nesta seção.','zix-boost-empty'));
 for(const x of data)content.append(card(x));
 const log=$('zixBoostAdmHistory');if(log){log.replaceChildren();if(tab==='historico'){
  for(const event of history.slice(0,100)){
   const box=element('div','','zix-boost-logline');const request=requests.find(r=>r.id===event.boost_id);
   box.append(element('strong',date(event.created_at)+' · '+(request?.public_code||event.boost_id?.slice(0,8)||'Pedido')));
   box.append(element('span',event.action+' · '+(statusLabels[event.new_status]||event.new_status||'—')));
   if(event.reason)box.append(element('small',event.reason));log.append(box);
  }
 }log.hidden=tab!=='historico';}
}
async function reload(){if(!authorized)return;message('Atualizando solicitações...');
 const {data,error}=await db.from('zix_boost_requests').select('id,listing_id,channel,channels_requested,package,price_brl,duration_days,media_budget_brl,campaign_objective,request_notes,admin_reason,status,starts_at,ends_at,archived_at,created_at,public_code').order('created_at',{ascending:false}).limit(350);
 if(error){message('Erro ao consultar pedidos: '+error.message+'. Confira se o SQL da atualização foi aplicado.');return;}
 requests=data||[];listings=new Map();const ids=[...new Set(requests.map(x=>x.listing_id).filter(Boolean))];
 for(let i=0;i<ids.length;i+=120){const r=await db.from('listings').select('id,zix_code,title').in('id',ids.slice(i,i+120));if(!r.error)for(const l of r.data||[])listings.set(l.id,l);}
 const ev=await db.from('zix_boost_events').select('boost_id,action,new_status,reason,created_at').order('created_at',{ascending:false}).limit(100);
 history=ev.error?[]:(ev.data||[]);
 message(`Pedidos encontrados: ${requests.length} (mostrando até 350). Nenhuma publicidade é aprovada automaticamente.`);render();
}
function init(){const target=$('zixBoostAdminPanel');if(!target)return;
 target.classList.add('zix-boost-admin-section');
 target.innerHTML=`<div class="zix-boost-admin-title"><div><p class="zix-boost-eyebrow">CENTRAL ADMINISTRATIVA</p><h2>📣 Pedidos de impulsionamento</h2><p>Analise solicitações de destaque e tráfego pago. Rejeite, arquive e consulte o histórico de decisões.</p></div><button type="button" id="zixBoostAdmRefresh" class="zix-boost-refresh">↻ Atualizar</button></div>
 <div class="zix-boost-admin-toolbar"><input type="search" id="zixBoostAdmSearch" placeholder="Buscar por anúncio, ID ou plataforma" aria-label="Buscar solicitação">
 <div class="zix-boost-admin-subtabs"><button type="button" class="zix-boost-subtab" data-mode="pendentes">📥 Pendentes</button><button type="button" class="zix-boost-subtab" data-mode="ativos">📢 Ativos</button><button type="button" class="zix-boost-subtab" data-mode="historico">🗂 Histórico</button></div></div>
 <p id="zixBoostAdmMsg" role="status" aria-live="polite">Aguardando autenticação…</p><div id="zixBoostAdmList" class="zix-boost-admin-list"></div>
 <section id="zixBoostAdmHistory" class="zix-boost-history" hidden><h3>Registro das ações administrativas</h3><p>O histórico de alterações fica salvo no Supabase, inclusive após retirar um pedido da fila.</p></section>`;
 document.querySelectorAll('.zix-boost-subtab').forEach(btn=>btn.addEventListener('click',()=>showTab(btn.dataset.mode)));
 $('zixBoostAdmRefresh').onclick=()=>void reload();$('zixBoostAdmSearch').addEventListener('input',render);
 async function authenticate(){try{
  if(!db){const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');db=createClient(SUPABASE_URL,SUPABASE_ANON_KEY);}
  const {data:{user}}=await db.auth.getUser();if(!user){authorized=false;message('Faça login como administrador.');return;}
  const {data,error}=await db.from('admins').select('user_id').eq('user_id',user.id).maybeSingle();authorized=!error&&!!data;
  if(!authorized){message('Acesso exclusivo ao administrador.');return;}await reload();
 }catch(e){message('Falha de autenticação: '+e.message)}}
 void authenticate();
 let subscribed=false;
 async function setUpAuth(){if(subscribed||!db)return;subscribed=true;db.auth.onAuthStateChange(()=>setTimeout(()=>void authenticate(),0));}
 setTimeout(setUpAuth,1500);showTab(tab);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();

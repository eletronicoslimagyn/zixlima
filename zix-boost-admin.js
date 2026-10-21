/* ZixLima: painel de solicitações de impulsionamento. */
import {SUPABASE_URL,SUPABASE_ANON_KEY} from './config.js';
async function start(){
 const parent=document.getElementById('zixFinanceiro');if(!parent)return;
 const container=document.createElement('section');container.id='zixBoostAdminPanel';container.className='zix-boost-admin-section';container.innerHTML='<h2>📣 Gestão de impulsionamentos</h2><p>Confira comprovantes e aprove solicitações internas. Google Ads: acompanhe os pedidos, sem publicação automática.</p>';parent.append(container);
 const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
 const db=createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
 const status=document.createElement('p');container.append(status);
 const form=document.createElement('form');form.innerHTML=`<label>ID do anúncio <input name="code" required placeholder="Código ou UUID do anúncio"></label><label>Canal <select name="channel"><option value="interno">Destaque dentro da ZixLima</option><option value="google_ads">Google Ads — solicitação de gestão</option></select></label><label>Plano <select name="plan"><option value="destaque_7">Destaque 7 dias — R$ 9,90</option><option value="premium_15">Premium 15 dias — R$ 24,90</option><option value="supremo_30">Supremo 30 dias — R$ 49,90</option><option value="google_personalizado">Google Ads — orçamento a combinar</option></select></label><button type="submit">Registrar solicitação</button>`;
 container.append(form);
 const list=document.createElement('div');container.append(list);
 const {data:auth}=await db.auth.getUser();const user=auth?.user;
 if(!user){status.textContent='Faça login como administrador para consultar solicitações.';return}
 const {data:isAdmin}=await db.from('admins').select('user_id').eq('user_id',user.id).maybeSingle();
 if(!isAdmin){status.textContent='Acesso restrito à administração.';form.hidden=true;return}
 async function reload(){list.replaceChildren();const {data,error}=await db.from('zix_boost_requests').select('id,listing_id,channel,package,price_brl,media_budget_brl,status,created_at').order('created_at',{ascending:false}).limit(100);if(error){status.textContent=error.message;return}status.textContent=`${data.length} solicitações registradas.`;
 for(const item of data){const d=document.createElement('div');d.className='zix-boost-admin-row';const h=document.createElement('p');h.textContent=`${item.channel==='interno'?'🏷️ Interno':'🌐 Google Ads'} | ${item.package} | ${item.status} | ${item.listing_id} | R$ ${item.price_brl}`;d.append(h);
  const select=document.createElement('select');for(const op of ['solicitado','aguardando_pagamento','aprovado','ativo','concluido','rejeitado','cancelado']){const o=document.createElement('option');o.value=op;o.textContent=op;select.append(o)}select.value=item.status;d.append(select);
  const days=document.createElement('input');days.type='number';days.min='1';days.max='365';days.value=item.package==='destaque_7'?'7':item.package==='premium_15'?'15':'30';days.title='Duração em dias para destaque interno';d.append(days);
  const save=document.createElement('button');save.textContent='Salvar status';save.type='button';save.onclick=async()=>{if(!confirm('Confirmar alteração de status? Verifique o pagamento antes de ativar.'))return;const now=new Date();const end=new Date(now.getTime()+Number(days.value)*86400000);const args={p_id:item.id,p_status:select.value,p_start:select.value==='ativo'?now.toISOString():null,p_end:select.value==='ativo'?end.toISOString():null};const {error:e}=await db.rpc('zix_boost_admin_update',args);if(e)alert(e.message);else reload()};d.append(save);list.append(d)}
 }
 form.addEventListener('submit',async e=>{e.preventDefault();const f=new FormData(form);const code=String(f.get('code')).trim(),plan=String(f.get('plan')),channel=String(f.get('channel'));if((channel==='google_ads') !== (plan==='google_personalizado')){status.textContent='Selecione um plano correspondente ao canal.';return}const {data:listing,error:le}=await db.from('listings').select('id,user_id,status').or(`id.eq.${code.replace(/[^0-9a-f-]/gi,'')},zix_code.eq.${code.replace(/[^a-z0-9_-]/gi,'')}`).maybeSingle();if(le||!listing){status.textContent='Anúncio não encontrado. Confira ID ou código.';return}
 // Solicitações em nome do cliente devem ser feitas por ele; o ADM não pode falsificar sua identidade.
 if(listing.user_id!==user.id){status.textContent='Este formulário registra apenas anúncios da sua conta. Para anúncios de clientes, solicite que eles enviem o pedido autenticado; o administrador poderá aprová-lo abaixo.';return}
 const prices={destaque_7:9.90,premium_15:24.90,supremo_30:49.90,google_personalizado:0};const {error}=await db.from('zix_boost_requests').insert({listing_id:listing.id,user_id:user.id,channel,package:plan,price_brl:prices[plan]});status.textContent=error?error.message:'Solicitação criada. Aguarde a conferência do pagamento.';if(!error)reload();});
 reload();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();

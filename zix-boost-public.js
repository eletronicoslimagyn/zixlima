/* ZixLima | Solicitação de publicidade, revisão visual 2026.
   Só permite pedidos por usuários autenticados e anúncios próprios aprovados.
   Não inicia cobrança nem publica campanhas automaticamente. */
import {SUPABASE_URL,SUPABASE_ANON_KEY} from './config.js';

const money=n=>Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
let boostClientPromise;
async function boostClient(){
 if(!SUPABASE_URL||!SUPABASE_ANON_KEY)throw Error('Supabase não configurado.');
 if(!boostClientPromise)boostClientPromise=import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm').then(({createClient})=>createClient(SUPABASE_URL,SUPABASE_ANON_KEY));
 return boostClientPromise;
}
const channels=[
 ['google_ads','Google Ads','Pesquisa, Display e parceiros Google'],
 ['facebook','Facebook Ads','Feed e anúncios do Facebook'],
 ['instagram','Instagram Ads','Feed, Stories e Reels'],
 ['youtube','YouTube Ads','Anúncios em vídeos'],
 ['tiktok','TikTok Ads','Vídeos e descoberta']
];

async function loadAvailablePlans(db){
 const {data,error}=await db.from('zix_boost_plans')
   .select('code,title,duration_days,price_brl')
   .eq('enabled',true).order('sort_order',{ascending:true}).order('duration_days',{ascending:true});
 if(error)throw new Error('Não foi possível carregar planos de impulsionamento: '+error.message);
 return data||[];
}

async function loadShowcase(){
 const holder=document.getElementById('zixBoostShowcase');if(!holder)return;
 try{
  const db=await boostClient();const now=new Date().toISOString();
  const {data:requests,error}=await db.from('zix_boost_requests').select('listing_id').eq('channel','interno').eq('status','ativo').is('archived_at',null).lte('starts_at',now).gt('ends_at',now).limit(18);
  if(error)throw error;
  const ids=[...new Set((requests||[]).map(x=>x.listing_id))];if(!ids.length)return;
  const {data,error:e}=await db.from('listings').select('id,title,price,city,state,photos,zix_expires_at,status,zix_blocked,zix_paused_at').in('id',ids).eq('status','approved').eq('zix_blocked',false).is('zix_paused_at',null);
  if(e)throw e;
  const valid=(data||[]).filter(x=>!x.zix_expires_at||new Date(x.zix_expires_at)>new Date());if(!valid.length)return;
  const title=document.createElement('h2');title.textContent='✨ Destaques patrocinados';holder.append(title);
  const grid=document.createElement('div');grid.className='zix-boost-grid';
  for(const item of valid){
   const a=document.createElement('a');a.className='zix-boost-card';a.href='./?anuncio='+encodeURIComponent(item.id);
   const pic=item.photos?.[0];if(pic&&/^https:\/\//i.test(pic)){const im=document.createElement('img');im.src=pic;im.alt='Foto do anúncio';im.loading='lazy';a.append(im)}
   const tag=document.createElement('small');tag.textContent='Patrocinado';a.append(tag);
   const name=document.createElement('strong');name.textContent=item.title;a.append(name);
   const price=document.createElement('p');price.textContent=money(item.price);a.append(price);
   const loc=document.createElement('span');loc.textContent=[item.city,item.state].filter(Boolean).join(' - ');a.append(loc);grid.append(a);
  }
  holder.append(grid);holder.hidden=false;
 }catch(err){console.warn('Destaques indisponíveis:',err.message)}
}

function openBoostDialog(db,user,own,plans){
 const dialog=document.createElement('dialog');dialog.className='zix-boost-dialog';dialog.setAttribute('aria-label','Solicitar impulsionamento ou tráfego pago');
 dialog.innerHTML=`
 <div class="zix-boost-modal">
  <header class="zix-boost-modal-head"><span class="zix-boost-eyebrow">ZIXLIMA • PUBLICIDADE</span>
  <button type="button" class="zix-boost-close" aria-label="Fechar janela">✕</button>
  <h2>Impulsione seu anúncio</h2><p>Escolha onde divulgar. Sua solicitação será avaliada pelo administrador antes de qualquer campanha ou cobrança.</p></header>
  <form class="zix-boost-form">
   <div class="zix-boost-steps"><span>01 Anúncio</span><span>02 Divulgação</span><span>03 Solicitar</span></div>
   <label class="zix-boost-label" for="boostOwnListing">Anúncio para impulsionar</label>
   <select id="boostOwnListing" name="listing" required></select>
   <div class="zix-boost-choice" role="radiogroup" aria-label="Tipo de impulsionamento">
    <label class="zix-boost-type"><input name="mode" type="radio" value="interno" checked><span><strong>✨ Destaque ZixLima</strong><small>Mais visibilidade dentro do site</small></span></label>
    <label class="zix-boost-type"><input name="mode" type="radio" value="trafego"><span><strong>📣 Tráfego pago</strong><small>Campanhas em redes de anúncios</small></span></label>
   </div>
   <section class="zix-boost-internal">
    <label class="zix-boost-label" for="boostPack">Selecione um plano</label>
    <select name="pack" id="boostPack" aria-label="Escolha um plano"></select><p class="zix-boost-help zix-plan-nooptions" hidden>Sem planos internos disponíveis. Selecione tráfego pago ou peça ao administrador que ative um plano.</p>
   </section>
   <section class="zix-boost-traffic" hidden>
    <p class="zix-boost-label">Selecione uma ou várias plataformas</p>
    <div class="zix-boost-channels" role="group" aria-label="Plataformas de publicidade"></div>
    <div class="zix-boost-two">
     <label>Objetivo da campanha<select name="objective"><option value="visitas">Mais visitas ao anúncio</option><option value="whatsapp">Conversas pelo WhatsApp</option><option value="leads">Receber contatos de clientes</option><option value="alcance">Alcance e reconhecimento</option></select></label>
     <label>Orçamento sugerido para mídia (R$)<input type="number" name="budget" min="1" max="1000000" step="0.01" placeholder="Ex.: 100,00" inputmode="decimal"></label>
    </div>
    <p class="zix-boost-help">O orçamento é uma sugestão para análise. Não será debitado automaticamente. A taxa de gestão, se houver, será informada antes da contratação.</p>
   </section>
   <label class="zix-boost-label" for="boostNotes">Informações adicionais (opcional)</label>
   <textarea id="boostNotes" name="notes" maxlength="600" rows="2" placeholder="Ex.: Quero divulgar somente em Goiânia"></textarea>
   <div class="zix-boost-summary"><div><small>Resumo do pedido</small><strong class="zix-boost-summary-name">Destaque interno · 7 dias</strong></div><strong class="zix-boost-summary-price">R$ 9,90</strong></div>
   <p class="zix-boost-alert" role="status" aria-live="polite"></p>
   <div class="zix-boost-actions"><button type="button" class="zix-boost-cancel">Cancelar</button><button type="submit" class="zix-boost-submit">Enviar solicitação</button></div>
  </form>
 </div>`;
 const $=selector=>dialog.querySelector(selector);
 const listing=$('#boostOwnListing');for(const x of own){const opt=document.createElement('option');opt.value=x.id;opt.textContent=(x.zix_code||x.id)+' — '+x.title;listing.append(opt)}
 const planSelect=$('#boostPack');
 for(const plan of plans){
  const opt=document.createElement('option');opt.value=plan.code;
  opt.dataset.price=String(plan.price_brl);opt.dataset.days=String(plan.duration_days);
  opt.dataset.title=plan.title;
  opt.textContent=`${plan.title} • ${plan.duration_days} ${plan.duration_days===1?'dia':'dias'} • ${money(plan.price_brl)}`;
  planSelect.append(opt);
 }
 if(!plans.length){planSelect.disabled=true;$('.zix-plan-nooptions').hidden=false;}
 const channelsEl=$('.zix-boost-channels');for(const [value,label,hint] of channels){
  const wrap=document.createElement('label');wrap.className='zix-boost-channel';
  const input=document.createElement('input');input.type='checkbox';input.value=value;input.name='platform';
  const txt=document.createElement('span');const strong=document.createElement('strong');strong.textContent=label;const small=document.createElement('small');small.textContent=hint;txt.append(strong,small);wrap.append(input,txt);channelsEl.append(wrap);
 }
 function updateMode(){const paid=$('input[name="mode"]:checked')?.value==='trafego';$('.zix-boost-internal').hidden=paid;$('.zix-boost-traffic').hidden=!paid;
  const name=$('.zix-boost-summary-name'),price=$('.zix-boost-summary-price');
  if(paid){const items=[...dialog.querySelectorAll('input[name="platform"]:checked')].map(x=>channels.find(c=>c[0]===x.value)?.[1]).filter(Boolean);name.textContent=items.length?items.join(' + '):'Selecione suas plataformas';price.textContent='Orçamento a combinar';}
  else{const op=planSelect.selectedOptions[0];name.textContent=op?op.dataset.title+' · '+op.dataset.days+' dias':'Sem planos ativos';price.textContent=op?money(op.dataset.price):'—';}
 }
 dialog.addEventListener('change',updateMode);$('.zix-boost-close').onclick=()=>dialog.close();$('.zix-boost-cancel').onclick=()=>dialog.close();
 dialog.addEventListener('close',()=>dialog.remove(),{once:true});
 $('.zix-boost-form').addEventListener('submit',async e=>{
  e.preventDefault();const alert=$('.zix-boost-alert'),send=$('.zix-boost-submit'),mode=$('input[name="mode"]:checked').value;
  const chosenPlan=planSelect.selectedOptions[0],pack=chosenPlan?.value,selected=[...dialog.querySelectorAll('input[name="platform"]:checked')].map(x=>x.value);
  if(mode==='interno'&&!chosenPlan){alert.textContent='Nenhum plano disponível. Peça ao administrador que ative uma opção.';return;}
  if(mode==='trafego'&&!selected.length){alert.textContent='Marque pelo menos uma plataforma de tráfego pago.';return;}
  const budgetValue=$('[name="budget"]').value;
  if(mode==='trafego'&&budgetValue&&(!Number.isFinite(Number(budgetValue))||Number(budgetValue)<1||Number(budgetValue)>1000000)){alert.textContent='Confira o orçamento sugerido.';return;}
  const traffic=mode==='trafego',baseChannel=selected.includes('google_ads')?'google_ads':'externo';
  const payload={listing_id:listing.value,user_id:user.id,channel:traffic?baseChannel:'interno',package:traffic?(baseChannel==='google_ads'?'google_personalizado':'externo_personalizado'):pack,price_brl:traffic?0:Number(chosenPlan.dataset.price),duration_days:traffic?null:Number(chosenPlan.dataset.days),channels_requested:traffic?selected:['interno'],campaign_objective:traffic?$('[name="objective"]').value:'visitas',request_notes:$('#boostNotes').value.trim().slice(0,600),media_budget_brl:traffic&&budgetValue?Number(budgetValue):0};
  send.disabled=true;alert.textContent='Enviando sua solicitação...';
  try{const {error}=await db.from('zix_boost_requests').insert(payload);if(error)throw error;
   alert.textContent='✅ Solicitação enviada! Acompanhe a confirmação com o suporte. Nenhuma campanha foi ativada automaticamente.';
   $('.zix-boost-form').reset();$('.zix-boost-actions').replaceChildren();
   const close=document.createElement('button');close.type='button';close.textContent='Fechar';close.className='zix-boost-submit';close.onclick=()=>dialog.close();$('.zix-boost-actions').append(close);
  }catch(err){alert.textContent=/channels_requested|campaign_objective|request_notes|schema cache/i.test(err.message)?'É necessário aplicar primeiro o arquivo SQL da atualização no Supabase.':('Não foi possível enviar: '+err.message);send.disabled=false;}
 });
 document.body.append(dialog);dialog.showModal();updateMode();
}
function enableRequest(){
 const target=document.getElementById('zixPlanos')||document.querySelector('main');if(!target||document.getElementById('zixBoostRequestButton'))return;
 const btn=document.createElement('button');btn.type='button';btn.id='zixBoostRequestButton';btn.textContent='📣 Solicitar impulsionamento';btn.className='zix-boost-request-button';target.append(btn);
 btn.addEventListener('click',async()=>{
  btn.disabled=true;
  try{const db=await boostClient();const {data:auth,error:ae}=await db.auth.getUser();if(ae)throw ae;
   if(!auth.user){alert('Entre em sua conta para solicitar impulsionamento.');return}
   const {data:own,error}=await db.from('listings').select('id,zix_code,title').eq('user_id',auth.user.id).eq('status','approved').limit(100);
   if(error)throw error;if(!own?.length){alert('Você precisa ter um anúncio aprovado para solicitar publicidade.');return;}
   const plans=await loadAvailablePlans(db);openBoostDialog(db,auth.user,own,plans);
  }catch(e){alert('Não foi possível abrir a solicitação: '+e.message)}finally{btn.disabled=false}
 });
}
loadShowcase();if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enableRequest);else enableRequest();

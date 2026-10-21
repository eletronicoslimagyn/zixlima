/* ZixLima: seção de anúncios internos patrocinados. Nunca substitui o ranking normal. */
import {SUPABASE_URL,SUPABASE_ANON_KEY} from './config.js';
const holder=document.getElementById('zixBoostShowcase');
if(holder && SUPABASE_URL && SUPABASE_ANON_KEY){
 try{
 const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
 const db=createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
 const {data:requests,error}=await db.from('zix_boost_requests').select('listing_id,ends_at').eq('channel','interno').eq('status','ativo').lte('starts_at',new Date().toISOString()).gt('ends_at',new Date().toISOString()).limit(18);
 if(error)throw error;
 const ids=[...new Set((requests||[]).map(x=>x.listing_id))];
 if(ids.length){
  const {data,error:e}=await db.from('listings').select('id,title,price,city,state,photos,category,zix_expires_at,status,zix_blocked,zix_paused_at').in('id',ids).eq('status','approved').eq('zix_blocked',false).is('zix_paused_at',null);
  if(e)throw e;
  const valid=(data||[]).filter(x=>!x.zix_expires_at||new Date(x.zix_expires_at)>new Date());
  if(valid.length){
   const title=document.createElement('h2');title.textContent='✨ Destaques patrocinados';holder.append(title);
   const grid=document.createElement('div');grid.className='zix-boost-grid';
   for(const item of valid){
    const a=document.createElement('a');a.className='zix-boost-card';a.href='./?anuncio='+encodeURIComponent(item.id);
    const pic=item.photos?.[0];if(pic&&/^https:\/\//i.test(pic)){const im=document.createElement('img');im.src=pic;im.alt='Foto do anúncio';im.loading='lazy';a.append(im)}
    const tag=document.createElement('small');tag.textContent='Patrocinado';a.append(tag);
    const name=document.createElement('strong');name.textContent=item.title;a.append(name);
    const price=document.createElement('p');price.textContent=Number(item.price).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});a.append(price);
    const loc=document.createElement('span');loc.textContent=[item.city,item.state].filter(Boolean).join(' - ');a.append(loc);
    grid.append(a);
   }
   holder.append(grid);holder.hidden=false;
  }
 }
 }catch(err){console.warn('Destaques indisponíveis:',err.message)}
}

// Solicitação autenticada pelo proprietário do anúncio (sem pagamento automático).
try {
 const btn=document.createElement('button');btn.type='button';btn.textContent='📣 Solicitar impulsionamento';btn.className='zix-boost-request-button';
 const target=document.getElementById('zixPlanos')||document.querySelector('main');
 if(target){target.append(btn);btn.addEventListener('click',async()=>{
  try{
   const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
   const db=createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
   const {data:auth}=await db.auth.getUser();if(!auth.user){alert('Entre em sua conta para solicitar um destaque.');return}
   const {data:own,error:e}=await db.from('listings').select('id,zix_code,title').eq('user_id',auth.user.id).eq('status','approved').limit(100);
   if(e)throw e;if(!own?.length){alert('Você precisa ter um anúncio aprovado.');return}
   const chooser=document.createElement('dialog');chooser.className='zix-boost-dialog';const form=document.createElement('form');form.method='dialog';
   const h=document.createElement('h2');h.textContent='Solicitar impulsionamento';form.append(h);
   const listing=document.createElement('select');for(const x of own){const op=document.createElement('option');op.value=x.id;op.textContent=(x.zix_code||x.id)+' — '+x.title;listing.append(op)}form.append(listing);
   const pack=document.createElement('select');for(const [value,text] of [['destaque_7','7 dias — R$ 9,90'],['premium_15','15 dias — R$ 24,90'],['supremo_30','30 dias — R$ 49,90'],['google_personalizado','Google Ads — orçamento personalizado']]){const op=document.createElement('option');op.value=value;op.textContent=text;pack.append(op)}form.append(pack);
   const ok=document.createElement('button');ok.textContent='Enviar solicitação';ok.value='yes';form.append(ok);
   const cancel=document.createElement('button');cancel.textContent='Cancelar';cancel.value='no';form.append(cancel);
   chooser.append(form);document.body.append(chooser);chooser.showModal();
   chooser.addEventListener('close',async()=>{if(chooser.returnValue==='yes'){
     const prices={destaque_7:9.9,premium_15:24.9,supremo_30:49.9,google_personalizado:0};
     const channel=pack.value==='google_personalizado'?'google_ads':'interno';
     const {error}=await db.from('zix_boost_requests').insert({listing_id:listing.value,user_id:auth.user.id,channel,package:pack.value,price_brl:prices[pack.value]});
     alert(error?'Não foi possível enviar: '+error.message:'Solicitação recebida! Aguarde orientação do suporte sobre pagamento.');
    }chooser.remove();},{once:true});
  }catch(e){alert('Solicitação indisponível: '+e.message)}
 });}
}catch(e){console.warn(e)}

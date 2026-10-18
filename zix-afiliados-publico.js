import {SUPABASE_URL,SUPABASE_ANON_KEY} from './config.js';
const grid=document.getElementById('zixAffiliateGrid'),status=document.getElementById('zixAffiliateStatus');
const storeName=x=>x==='shopee'?'Shopee':'Mercado Livre';
function https(v){try{const u=new URL(v);return u.protocol==='https:'?u.href:null}catch{return null}}
async function start(){
 try{
  const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  const db=createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
  const {data,error}=await db.from('zix_affiliate_products').select('id,title,description,store,price,image_url,affiliate_url').eq('published',true).order('created_at',{ascending:false}).limit(12);
  if(error)throw error;grid.replaceChildren();let count=0;
  for(const p of data||[]){const href=https(p.affiliate_url);if(!href)continue;count++;
   const article=document.createElement('article');article.className='zix-affiliate-card';
   if(https(p.image_url)){const img=document.createElement('img');img.src=https(p.image_url);img.alt='Foto do produto '+p.title;img.loading='lazy';article.append(img)}
   const body=document.createElement('div');body.className='zix-affiliate-card-body';const label=document.createElement('small');label.textContent=storeName(p.store)+' · Publicidade de afiliado';const h=document.createElement('h3');h.textContent=p.title;const price=document.createElement('strong');price.textContent=Number(p.price).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});const desc=document.createElement('p');desc.textContent=p.description||'Confira informações e condições na loja parceira.';const a=document.createElement('a');a.href=href;a.target='_blank';a.rel='sponsored noopener noreferrer';a.textContent='Ver produto na loja';body.append(label,h,price,desc,a);article.append(body);grid.append(article);
  }status.textContent=count?'Preços e disponibilidade devem ser confirmados na loja.':'Ainda não há ofertas de afiliados publicadas.';
 }catch(e){status.textContent='Vitrine de afiliados temporariamente indisponível.';console.warn(e)}
}
start();

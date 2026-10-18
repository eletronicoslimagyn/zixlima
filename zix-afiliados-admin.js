import {SUPABASE_URL,SUPABASE_ANON_KEY} from './config.js';
import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
const db=createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
const $=id=>document.getElementById(id), form=$('zixAfiliadoForm'), status=$('zixAffiliateAdminStatus'), list=$('zixAffiliateAdminList');
const fail=e=>{status.textContent='Erro: '+(e?.message||String(e));};
const allowedHost=(store,url)=>{const h=new URL(url).hostname.toLowerCase();return (store==='mercadolivre'&&(/(^|\.)mercadolivre\.com\.br$|(^|\.)mercadolivre\.com$|(^|\.)meli\.la$|(^|\.)mercadolibre\.com$/.test(h)))||(store==='shopee'&&(/(^|\.)shopee\.com\.br$|(^|\.)shopee\.com$|(^|\.)s\.shopee\.com\.br$/.test(h))));};
const httpsUrl=(v)=>{const u=new URL(v);if(u.protocol!=='https:')throw Error('Use somente links HTTPS.');return u.href;};
async function assertAdmin(){
 const {data:{user},error}=await db.auth.getUser();if(error||!user)throw Error('Entre como administrador.');
 const q=await db.from('admins').select('user_id').eq('user_id',user.id).maybeSingle();if(q.error||!q.data)throw Error('Sua conta não possui permissão administrativa.');return user;
}
async function refresh(){
 await assertAdmin();const {data,error}=await db.from('zix_affiliate_products').select('*').order('created_at',{ascending:false}).limit(200);
 if(error)throw error;list.replaceChildren();
 for(const p of data||[]){const div=document.createElement('div');div.className='zix-affiliate-entry';const title=document.createElement('strong');title.textContent=(p.store==='shopee'?'Shopee':'Mercado Livre')+' · '+p.title;const info=document.createElement('p');info.textContent=`R$ ${Number(p.price).toFixed(2)} · ${p.published?'Publicado':'Oculto'}`;div.append(title,info);
 const edit=document.createElement('button');edit.type='button';edit.textContent='Editar';edit.onclick=()=>{for(const key of ['title','description','price','affiliate_url','image_url','store'])form.elements.namedItem(key).value=p[key]||'';form.elements.namedItem('product_id').value=p.id;form.elements.namedItem('published').checked=p.published;form.scrollIntoView({behavior:'smooth'});};
 const del=document.createElement('button');del.type='button';del.className='danger';del.textContent='Excluir';del.onclick=async()=>{if(!confirm('Excluir este produto afiliado?'))return;try{await assertAdmin();const r=await db.from('zix_affiliate_products').delete().eq('id',p.id);if(r.error)throw r.error;await refresh()}catch(e){fail(e)}};div.append(edit,del);list.append(div);}
 if(!data?.length)list.textContent='Nenhum produto cadastrado.';
}
$('zixAffiliateCancelEdit').addEventListener('click',()=>{form.reset();form.elements.namedItem('product_id').value='';status.textContent='Formulário limpo.';});
form.addEventListener('submit',async ev=>{
 ev.preventDefault();const btn=form.querySelector('[type=submit]');btn.disabled=true;status.textContent='Verificando e salvando produto...';
 try{
  const user=await assertAdmin(),f=form.elements,store=f.namedItem('store').value,link=httpsUrl(f.namedItem('affiliate_url').value.trim());
  if(!allowedHost(store,link))throw Error('O link precisa pertencer à loja selecionada (incluindo links curtos oficiais).');
  const price=Number(f.namedItem('price').value);if(!Number.isFinite(price)||price<0)throw Error('Preço inválido.');
  let image=f.namedItem('image_url').value.trim();if(image)image=httpsUrl(image);
  const file=f.namedItem('photo_file').files?.[0];
  if(file){if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>3145728)throw Error('Foto precisa ser JPG, PNG ou WebP até 3 MB.');
   const ext=file.type==='image/jpeg'?'jpg':file.type.split('/')[1],path=user.id+'/'+crypto.randomUUID()+'.'+ext;
   const up=await db.storage.from('zix-affiliate-images').upload(path,file,{upsert:false,contentType:file.type});if(up.error)throw up.error;
   image=db.storage.from('zix-affiliate-images').getPublicUrl(path).data.publicUrl;
  }
  const values={store,title:f.namedItem('title').value.trim(),price,description:f.namedItem('description').value.trim(),affiliate_url:link,image_url:image||null,published:f.namedItem('published').checked};
  if(values.title.length<3)throw Error('Informe o nome do produto.');
  const id=f.namedItem('product_id').value;const q=id?db.from('zix_affiliate_products').update(values).eq('id',id):db.from('zix_affiliate_products').insert(values);
  const {error}=await q;if(error)throw error;
  form.reset();f.namedItem('product_id').value='';status.textContent='Produto salvo no Supabase. Confira na vitrine pública.';await refresh();
 }catch(e){fail(e)}finally{btn.disabled=false}
});
// Admin guarda autorização no Supabase: não confie apenas no HTML oculto.
async function start(){try{await refresh()}catch(e){if($('painel')?.style.display==='block')fail(e)}}
start();
const observer=new MutationObserver(()=>{if($('painel')?.style.display==='block')start()});
observer.observe($('painel'),{attributes:true,attributeFilter:['style']});

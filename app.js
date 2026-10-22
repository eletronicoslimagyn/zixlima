import {SUPABASE_URL,SUPABASE_ANON_KEY} from './config.js';
const $=id=>document.getElementById(id);
const cats=[['carros','🚗','Carros'],['motos','🏍️','Motos'],['caminhoes','🚚','Caminhões'],['pecas','🔧','Peças e acessórios'],['eletronicos','📱','Eletrônicos'],['imoveis','🏠','Imóveis'],['alugueis','🏘️','Aluguéis'],['casa','🛋️','Casa e móveis'],['servicos','🧰','Serviços'],['outros','📦','Outros']];
const label=Object.fromEntries(cats.map(x=>[x[0],x[2]]));
const icon=Object.fromEntries(cats.map(x=>[x[0],x[1]]));
const money=n=>Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const priceText=x=>
  x.category==='servicos' && Number(x.price)===0
    ? 'A combinar'
    : money(x.price);
const el=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e};
let editingId=null;
let db=null,user=null,cat='',page=0,more=false;const PAGE=12;
function msg(t){$('notice').textContent=t||'';$('notice').hidden=!t}
function dialog(id){const d=$(id);if(!d.open)d.showModal()}
function safe(url){try{const u=new URL(url);return ['https:','http:'].includes(u.protocol)?u.href:null}catch{return null}}
// Compartilhamento individual: o ID fica no banco e a URL funciona no GitHub Pages.
const zixLinkFor=x=>{
  // A Edge Function entrega titulo e foto aos aplicativos sociais.
  return 'https://zixlima-previa-anuncios.suportezixlima.workers.dev/?anuncio='+encodeURIComponent(String(x.id));
};
const zixIsPublished=x=>x.status==='approved'&&(!x.zix_expires_at||new Date(x.zix_expires_at).getTime()>Date.now());
let zixToastTimer;
function zixShareNotice(text){
  const area=$('zixShareNotice');if(!area){alert(text);return}
  area.textContent=text;
  clearTimeout(zixToastTimer);
  zixToastTimer=setTimeout(()=>area.textContent='',4500);
}
async function zixCopyLink(x){
  const link=zixLinkFor(x);
  try{
    if(!navigator.clipboard?.writeText)throw Error('Sem API Clipboard');
    await navigator.clipboard.writeText(link);
    zixShareNotice('Link do anúncio copiado!');
  }catch{
    const input=el('textarea');input.value=link;
    input.style.position='fixed';input.style.opacity='0';document.body.append(input);
    input.select();
    const done=document.execCommand?.('copy');input.remove();
    if(done)zixShareNotice('Link copiado!');
    else window.prompt('Copie o link do anúncio:',link);
  }
}
async function zixNativeShare(x){
  const url=zixLinkFor(x);
  if(navigator.share){
    try{
      await navigator.share({title:x.title,text:`${x.title} - ${priceText(x)} | ZixLima`,url});
      return;
    }catch(e){if(e?.name==='AbortError')return}
  }
  await zixCopyLink(x);
}
function zixWhatsPhone(value){
  let n=String(value||'').replace(/\D/g,'');
  if(n.startsWith('00'))n=n.slice(2);
  if((n.length===10||n.length===11)&&!n.startsWith('55'))n='55'+n;
  return /^55\d{10,11}$/.test(n)?n:'';
}
function zixShareControls(x){
  const controls=el('div','zix-share-actions');
  const share=el('button','zix-share-button','🔗 Compartilhar');share.type='button';
  share.onclick=ev=>{ev.stopPropagation();void zixNativeShare(x)};
  const copy=el('button','zix-share-button zix-share-copy','📋 Copiar link');copy.type='button';
  copy.onclick=ev=>{ev.stopPropagation();void zixCopyLink(x)};
  const whatsapp=el('a','zix-share-button zix-share-whatsapp','🟢 WhatsApp');
  const phone=zixWhatsPhone(x.phone);
  if(phone){
    whatsapp.href='https://wa.me/'+phone+'?text='+encodeURIComponent(`Olá! Tenho interesse neste anúncio no ZixLima:\n${x.title} - ${priceText(x)}\n${zixLinkFor(x)}`);
    whatsapp.target='_blank';whatsapp.rel='noopener noreferrer';
  }else{
    whatsapp.removeAttribute('href');whatsapp.title='Anunciante sem WhatsApp válido';
    whatsapp.setAttribute('aria-disabled','true');
    whatsapp.style.opacity='.5';whatsapp.style.pointerEvents='none';
  }
  whatsapp.onclick=ev=>ev.stopPropagation();
  controls.append(share,copy,whatsapp);
  return controls;
}
function showDetail(x){
  const r=$('detail');r.replaceChildren(el('h2','',x.title));
  const urls=(x.photos||[]).map(safe).filter(Boolean);
  if(urls.length){
    const img=el('img','detailPhoto');img.src=urls[0];img.alt='Foto do anúncio';r.append(img);
    const strip=el('div','detailPhotos');
    urls.forEach(url=>{const t=el('img');t.src=url;t.alt='Ver foto';t.onclick=()=>img.src=url;strip.append(t)});
    r.append(strip);
  }
  r.append(el('h2','price',priceText(x)),el('p','muted',`${x.city} - ${x.state} · ${label[x.category]||'Outros'}`),el('p','detailDescription',x.description));
  const phone=zixWhatsPhone(x.phone);
  if(phone){
    const a=el('a','primary','Conversar no WhatsApp');
    a.href='https://wa.me/'+phone+'?text='+encodeURIComponent('Olá! Tenho interesse no anúncio: '+x.title);
    a.target='_blank';a.rel='noopener noreferrer';r.append(a);
  }
  if(zixIsPublished(x))r.append(zixShareControls(x));
  else r.append(el('p','zix-share-pending','Este anúncio ainda não pode ser compartilhado publicamente. Aguarde a aprovação ou renovação.'));
  dialog('detailDialog');
}
async function zixOpenLinkedAd(){
  const id=new URL(window.location.href).searchParams.get('anuncio');
  if(!id)return;
  // O identificador do Supabase e um UUID. Nao carregar anuncios privados.
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)){
    zixUnavailable('Link de anúncio inválido.');return;
  }
  if(!db){zixUnavailable('Não foi possível conectar ao ZixLima. Atualize a página para tentar novamente.');return;}
  try{
    const {data,error}=await db.from('listings').select('*')
      .eq('id',id).eq('status','approved')
      .or('zix_expires_at.is.null,zix_expires_at.gt.'+new Date().toISOString()).maybeSingle();
    if(error)throw error;
    if(!data){zixUnavailable('Este anúncio não está disponível. Pode estar aguardando aprovação, vencido ou ter sido excluído.');return;}
    showDetail(data);
  }catch(e){
    console.error('Falha ao carregar link do anúncio:',e);
    zixUnavailable('Não foi possível carregar este anúncio. Tente novamente em instantes.');
  }
}
function zixUnavailable(text){
  const area=$('detail');area.replaceChildren(el('h2','','Anúncio indisponível'),el('p','',text));
  dialog('detailDialog');
}

function resetEditor(){
  editingId=null;
  $('postForm').reset();
  $('postForm').querySelector('h2').textContent='Publicar anúncio';
  $('postForm').querySelector('[type=submit]').textContent=
    'Enviar para aprovação';
  $('postMsg').textContent='';
}

function editListing(x){
  if(!user || x.user_id!==user.id){
    alert('Você não tem permissão para editar.');
    return;
  }

  resetEditor();
  editingId=x.id;
  const f=$('postForm');
  const set=(name,value)=>{
    const input=f.elements.namedItem(name);
    if(input) input.value=value??'';
  };

  set('title',x.title);
  set('category',x.category);
  set('price',x.price);
  zixPriceCheck.checked=
    x.category==='servicos' && Number(x.price)===0;
  syncPriceMode();
  set('city',x.city);
  set('state',x.state);
  set('phone',x.phone);

  let description=x.description||'';

  if(x.category==='alugueis'){
    const campos={
      rental_type:'TIPO DE ALUGUEL',
      rental_period:'PERÍODO',
      rental_rooms:'QUARTOS',
      rental_deposit:'CAUÇÃO'
    };
    for(const [field,label] of Object.entries(campos)){
      const line=description.split('\n').find(
        s=>s.startsWith(label+': ')
      );
      if(line){
        const value=line.slice(label.length+2);
        set(field,value==='Não informado'?'':value);
      }
    }
    if(description.includes('\n\n')){
      description=description.split('\n\n').slice(1).join('\n\n');
    }
  }

  set('description',description);
  syncRental();
  f.querySelector('h2').textContent='Editar anúncio';
  f.querySelector('[type=submit]').textContent='Salvar alterações';
  $('postMsg').textContent=
    'Ao salvar, o anúncio voltará para aprovação. '
    +'O código original será mantido.';
  dialog('postDialog');
}

function card(x,isMine=false){
  const c=el('article','card');
  const url=safe(x.photos?.[0]);
  if(url){const img=el('img','cover');img.src=url;img.alt='Foto do anúncio';img.loading='lazy';c.append(img)}
  else c.append(el('div','placeholder',icon[x.category]||'📦'));
  const body=el('div','cardbody');
  body.append(el('p','status','Código: '+(x.zix_code||x.id)),el('div','price',priceText(x)),el('h3','',x.title),el('p','muted',`${x.city} - ${x.state}`),el('span','chip',label[x.category]||'Outros'));
  if(isMine){
    const expired=x.zix_expires_at&&new Date(x.zix_expires_at).getTime()<=Date.now();
    body.append(el('p','status',expired?'Prazo vencido':x.status==='approved'?'Publicado':x.status==='pending'?'Aguardando aprovação':'Rejeitado'));
    if(x.zix_expires_at)body.append(el('p','muted','Vencimento: '+new Date(x.zix_expires_at).toLocaleString('pt-BR')));
    const del=el('button','danger','Excluir');del.type='button';
    del.onclick=async ev=>{ev.stopPropagation();if(!confirm('Excluir este anúncio?'))return;const {error}=await db.from('listings').delete().eq('id',x.id).eq('user_id',user.id);if(error)alert(error.message);else{await mine();await load()}};
    const edit=el('button','zix-edit-btn','✏️ Editar');edit.type='button';
    edit.onclick=ev=>{ev.stopPropagation();editListing(x)};
    const aviso=el('p','zix-edit-aviso','Ao editar, volta para aprovação.');
    body.append(aviso,del,edit);
  }
  if(zixIsPublished(x))body.append(zixShareControls(x));
  else if(isMine)body.append(el('p','zix-share-pending','🔒 Link disponível após aprovação e enquanto o anúncio estiver ativo.'));
  c.append(body);c.onclick=()=>showDetail(x);return c;
}

async function load(append=false){const area=$('listing');if(!append){page=0;area.replaceChildren()}if(!db){msg('Conexão com Supabase indisponível. Verifique a internet e o arquivo config.js.');area.append(el('div','empty','Não foi possível carregar os anúncios.'));return}try{let q=db.from('listings').select('*').eq('status','approved').or('zix_expires_at.is.null,zix_expires_at.gt.'+new Date().toISOString());const term=$('term').value.trim().replace(/[%_,()]/g,''),city=$('city').value.trim().replace(/[%_,()]/g,'');if(term)q=q.ilike('title',`%${term}%`);if(city)q=q.ilike('city',`%${city}%`);if(cat)q=q.eq('category',cat);if(cat==='alugueis'&&$('rentalKindFilter')?.value)q=q.ilike('description','TIPO DE ALUGUEL: '+$('rentalKindFilter').value+'%');const sort=$('sort').value;q=q.order(sort==='new'?'created_at':'price',{ascending:sort==='low'}).range(page*PAGE,page*PAGE+PAGE);const {data,error}=await q;if(error)throw error;msg('');more=data.length>PAGE;data.slice(0,PAGE).filter((x,i,arr)=>arr.findIndex(y=>y.id===x.id)===i).forEach(x=>area.append(card(x)));if(!area.children.length)area.append(el('div','empty','Nenhum anúncio aprovado encontrado.'));$('moreBtn').hidden=!more}catch(e){msg('Erro ao carregar anúncios: '+e.message);$('moreBtn').hidden=true}}
async function mine(){const area=$('myListing');area.replaceChildren();$('mineHint').textContent=user?'Seus anúncios e seus respectivos status.':'Entre na sua conta para gerenciar seus anúncios.';if(!user||!db)return;const {data,error}=await db.from('listings').select('*').eq('user_id',user.id).order('created_at',{ascending:false});if(error){$('mineHint').textContent=error.message;return}(data||[]).forEach(x=>area.append(card(x,true)))}
function authUI(){ $('loginBtn').textContent=user?'Sair':'Entrar';mine() }
$('categories').replaceChildren(...cats.map(([key,emoji,name])=>{const b=el('button','category');b.type='button';b.append(el('b','',emoji),document.createTextNode(name));b.onclick=()=>{cat=cat===key?'':key;document.querySelectorAll('.category').forEach(n=>n.classList.remove('active'));if(cat)b.classList.add('active');$('rentalFilter').hidden=cat!=='alugueis';$('rentalKindFilter').value='';load();$('anuncios').scrollIntoView({behavior:'smooth'})};return b}));
$('postCategory').replaceChildren(...cats.map(([key,,name])=>{const o=el('option','',name);o.value=key;return o}));
const zixPriceInput=$('postForm').elements.namedItem('price');
const zixPriceLabel=document.createElement('label');
zixPriceLabel.style.cssText=
  'display:flex;align-items:center;gap:9px;font-weight:700;';
const zixPriceCheck=document.createElement('input');
zixPriceCheck.type='checkbox';
zixPriceCheck.style.cssText=
  'width:22px;height:22px;flex-shrink:0;';
zixPriceLabel.append(
  zixPriceCheck,
  document.createTextNode(' Preco a combinar')
);
zixPriceInput.closest('label').after(zixPriceLabel);
function syncPriceMode(){
  const servico=$('postCategory').value==='servicos';
  zixPriceLabel.hidden=!servico;
  if(!servico)zixPriceCheck.checked=false;
  const combinar=servico&&zixPriceCheck.checked;
  zixPriceInput.disabled=combinar;
  zixPriceInput.required=!combinar;
  if(combinar)zixPriceInput.value='';
  zixPriceInput.placeholder=combinar?'A combinar':'Valor em reais';
}
zixPriceCheck.addEventListener('change',syncPriceMode);
$('postCategory').addEventListener('change',syncPriceMode);
$('postForm').addEventListener(
  'reset',()=>setTimeout(()=>{
    zixPriceCheck.checked=false;
    syncPriceMode();
  },0)
);
syncPriceMode();
const rentalFields=$('zzRentalFields');function syncRental(){if(rentalFields)rentalFields.hidden=$('postCategory').value!=='alugueis'}$('postCategory').addEventListener('change',syncRental);$('postForm').addEventListener('reset',()=>setTimeout(syncRental,0));syncRental();
$('year').textContent=new Date().getFullYear();document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());
$('searchForm').onsubmit=e=>{e.preventDefault();load();location.hash='anuncios'};
$('sort').onchange=()=>load();$('rentalKindFilter').onchange=()=>load();$('moreBtn').onclick=()=>{page++;load(true)};
$('loginBtn').onclick=async()=>{if(user&&db){await db.auth.signOut();user=null;authUI();load()}else dialog('authDialog')};
$('postBtn').onclick=()=>{if(!db){alert('Conexão com Supabase indisponível.');return}if(!user){dialog('authDialog');return}resetEditor();syncRental();dialog('postDialog')};
$('authForm').onsubmit=async e=>{e.preventDefault();if(!db)return;const {error}=await db.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});$('authMsg').textContent=error?error.message:'Login realizado.';if(!error){$('authDialog').close();const {data}=await db.auth.getUser();user=data.user;authUI()}};
$('signupBtn').onclick=async()=>{if(!db)return;const {error}=await db.auth.signUp({email:$('email').value.trim(),password:$('password').value});$('authMsg').textContent=error?error.message:'Cadastro solicitado. Verifique seu e-mail se necessário.'};
// Conversão e prévia ANTES do upload; só a versão <= 3 MB vai ao Supabase.
const zixPhotoInput=$('postForm').querySelector('[name=photos]');
const zixPhotoInfo=$('postPhotoStatus'),zixPhotoPreview=$('postPhotoPreviews');
let zixPhotoRevision=0,zixPreviewUrls=[];
function zixClearPreviews(){zixPreviewUrls.forEach(u=>URL.revokeObjectURL(u));zixPreviewUrls=[];zixPhotoPreview?.replaceChildren();}
async function zixConvertFotos(files,revision){
 if(files.length>5)throw Error('Escolha no máximo 5 fotos.');
 const out=[];
 for(let i=0;i<files.length;i++){
  if(revision!==zixPhotoRevision)throw Error('Seleção de fotos alterada.');
  const file=files[i];
  if(zixPhotoInfo)zixPhotoInfo.textContent=`Otimizando foto ${i+1} de ${files.length}...`;
  const smaller=await window.ZixImageOptimizer.cached(file,{maxBytes:3*1024*1024,maxInputBytes:30*1024*1024,maxDimension:2600});
  if(smaller.size>3*1024*1024)throw Error('Foto '+(i+1)+' excede 3 MB.');
  out.push(smaller);
 }
 return out;
}
let zixPrepared=null;
zixPhotoInput?.addEventListener('change',async()=>{
 const revision=++zixPhotoRevision,files=Array.from(zixPhotoInput.files||[]);
 zixClearPreviews();
 if(!files.length){zixPhotoInfo.textContent='Selecione até 5 fotos. O site reduz automaticamente para até 3 MB cada.';zixPrepared=null;return;}
 const promise=zixConvertFotos(files,revision);zixPrepared={revision,promise};
 try{
  const photos=await promise;if(revision!==zixPhotoRevision)return;
  for(let i=0;i<photos.length;i++){
   const url=URL.createObjectURL(photos[i]);zixPreviewUrls.push(url);
   const fig=document.createElement('figure'),img=document.createElement('img'),cap=document.createElement('figcaption');
   img.src=url;img.alt='Prévia da foto '+(i+1);
   cap.textContent=window.ZixImageOptimizer.formatSize(files[i].size)+' → '+window.ZixImageOptimizer.formatSize(photos[i].size);
   fig.append(img,cap);zixPhotoPreview?.append(fig);
  }
  zixPhotoInfo.textContent=`${photos.length} foto(s) pronta(s), até 3 MB cada. Só as otimizadas serão enviadas.`;
 }catch(err){if(revision===zixPhotoRevision)zixPhotoInfo.textContent='Erro na conversão: '+err.message;}
});
$('postForm').addEventListener('reset',()=>{
 ++zixPhotoRevision;zixPrepared=null;zixClearPreviews();
 if(zixPhotoInfo)zixPhotoInfo.textContent='Selecione até 5 fotos; conversão automática para até 3 MB cada.';
});
$('postForm').onsubmit=async e=>{e.preventDefault();if(!db||!user)return;const form=e.target,btn=form.querySelector('[type=submit]');btn.disabled=true;$('postMsg').textContent='Enviando...';try{const f=new FormData(form),files=Array.from(form.querySelector('[name=photos]').files);if(files.length>5)throw Error('Máximo de cinco fotos.');const optimized=(zixPrepared?.revision===zixPhotoRevision)?await zixPrepared.promise:await zixConvertFotos(files,zixPhotoRevision);
const photos=[];for(let i=0;i<optimized.length;i++){
 const file=optimized[i];
 if(zixPhotoInfo)zixPhotoInfo.textContent=`Enviando foto ${i+1} de ${optimized.length} (${window.ZixImageOptimizer.formatSize(file.size)})...`;
 const ext=file.type==='image/webp'?'webp':file.type==='image/png'?'png':'jpg';
 const path=`${user.id}/${crypto.randomUUID()}.${ext}`;
 const {error}=await db.storage.from('listing-images').upload(path,file,{contentType:file.type,upsert:false});
 if(error)throw error;
 photos.push(db.storage.from('listing-images').getPublicUrl(path).data.publicUrl);
}const phone=String(f.get('phone')||'').replace(/\D/g,'');if(phone&&(phone.length<10||phone.length>15))throw Error('WhatsApp inválido.');let description=String(f.get('description')||'').trim();if(f.get('category')==='alugueis'){const type=String(f.get('rental_type')||''),period=String(f.get('rental_period')||'');if(!type||!period)throw Error('Informe o tipo e período do aluguel.');description=`TIPO DE ALUGUEL: ${type}\nPERÍODO: ${period}\nQUARTOS: ${f.get('rental_rooms')||'Não informado'}\nCAUÇÃO: ${f.get('rental_deposit')||'A combinar'}\n\n${description}`}const payload={user_id:user.id,title:String(f.get('title')).trim(),description,category:String(f.get('category')),price:Number(f.get('price')),city:String(f.get('city')).trim(),state:String(f.get('state')).trim().toUpperCase(),phone:phone||null,photos,status:'pending'};if(editingId){
  const {error}=await db.rpc('zix_edit_own_listing',{
    p_id:editingId,
    p_title:payload.title,
    p_description:payload.description,
    p_category:payload.category,
    p_price:payload.price,
    p_city:payload.city,
    p_state:payload.state,
    p_phone:payload.phone,
    p_photos:photos.length?photos:null
  });
  if(error)throw error;
  resetEditor();
  $('postDialog').close();
  await mine();
  await load();
  msg('Anúncio atualizado e enviado novamente para aprovação.');
}else{
  const {data:novo,error}=await db.from('listings')
    .insert(payload).select('id,zix_code').single();
  if(error)throw error;
  const result=$('postMsg');
  result.replaceChildren(document.createTextNode(
    'Anúncio salvo! Código: '+(novo.zix_code||novo.id)
    +'. Seu link já foi gerado e ficará público após a aprovação. '));
  const copy=el('button','zix-share-button zix-share-copy','📋 Copiar link do anúncio');
  copy.type='button';copy.onclick=()=>void zixCopyLink(novo);
  result.append(copy);
  form.reset();
  await mine();
}}catch(e){$('postMsg').textContent='Erro: '+e.message}finally{btn.disabled=false}};
// UI inicial funciona mesmo quando o provedor de módulos estiver indisponível.
async function init(){if(!SUPABASE_URL||!SUPABASE_ANON_KEY){await load();return}try{let lib;try{lib=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm')}catch{lib=await import('https://esm.sh/@supabase/supabase-js@2')}db=lib.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);db.auth.onAuthStateChange((_event,session)=>{user=session?.user||null;authUI()});const {data}=await db.auth.getUser();user=data.user;authUI()}catch(e){msg('Não foi possível iniciar a conexão: '+e.message)}await load();await zixOpenLinkedAd()}
init();

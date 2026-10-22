/* ZIX-LIXEIRA-V3: histórico com lixeira administrativa recuperável. */
import {createClient} from 'https://esm.sh/@supabase/supabase-js@2';
import {SUPABASE_URL,SUPABASE_ANON_KEY} from './config.js';
const $=id=>document.getElementById(id);
const categories=[['carros','🚗 Carros'],['motos','🏍️ Motos'],['caminhoes','🚚 Caminhões'],['pecas','🔧 Peças e acessórios'],['eletronicos','📱 Eletrônicos'],['imoveis','🏠 Imóveis'],['alugueis','🏘️ Aluguéis'],['casa','🛋️ Casa e móveis'],['servicos','🧰 Serviços'],['outros','📦 Outros']];
const db=createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
let rows=[],loaded=false,selected=new Set(categories.map(c=>c[0])),visible=25,editing=null;
const message=s=>$('zixHistoryInfo').textContent=s;
const node=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e};
function numeric(x){const code=String(x.zix_code||'');const match=code.match(/(\d+)(?!.*\d)/);return match?Number(match[1]):Number.MAX_SAFE_INTEGER}
const fmtListingPrice=x=>
  x.category==='servicos' && Number(x.price)===0
    ? 'A combinar'
    : fmtPrice(x.price);
const fmtPrice=p=>Number(p||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
function categoryRender(){
 const wrap=$('zixHistoryCategories');
 categories.forEach(([k,label])=>{const lab=node('label');const cb=document.createElement('input');cb.type='checkbox';cb.value=k;cb.checked=true;cb.addEventListener('change',()=>{if(cb.checked)selected.add(k);else selected.delete(k);updateCategoryCount();render()});lab.append(cb,document.createTextNode(' '+label));wrap.append(lab)});
 $('zixHistoryAll').onclick=()=>{selected=new Set(categories.map(c=>c[0]));for(const cb of wrap.querySelectorAll('input'))cb.checked=true;updateCategoryCount();render()};
 $('zixHistoryNone').onclick=()=>{selected.clear();for(const cb of wrap.querySelectorAll('input'))cb.checked=false;updateCategoryCount();render()};updateCategoryCount();
}
function updateCategoryCount(){$('zixCategoryCount').textContent=selected.size===categories.length?'(todas)':`(${selected.size} selecionadas)`}
async function permitted(){const {data:{user},error}=await db.auth.getUser();if(error||!user)return false;const {data:admin,error:err}=await db.from('admins').select('user_id').eq('user_id',user.id).maybeSingle();return !err&&!!admin}
async function refresh(){
 if(!(await permitted())){message('Entre no painel com uma conta administrativa.');return}
 message('Carregando histórico do Supabase...');
 try{
  const all=[];let offset=0;
  for(;;){
    const {data,error}=await db.from('listings').select('id,zix_code,title,category,city,state,price,status,created_at,zix_expires_at,description,phone,zix_blocked,zix_paused_at,zix_history_archived_at').order('created_at',{ascending:false}).range(offset,offset+499);
    if(error)throw error; all.push(...(data||[]));if(!data||data.length<500)break;offset+=500;
    if(offset>=10000){message('Exibindo até 10.000 anúncios. Refine os filtros para localizar outros.');break}
  }
  rows=all;visible=25;loaded=true;render();
 }catch(e){message('Falha ao carregar histórico: '+e.message)}
}
function disabled(x){return x.status==='rejected'||x.zix_blocked||!!x.zix_paused_at||!!(x.zix_expires_at&&new Date(x.zix_expires_at).getTime()<=Date.now())}
function status(x){if(x.zix_history_archived_at)return 'trash';if(x.zix_blocked||x.zix_paused_at)return 'disabled';if(x.zix_expires_at&&new Date(x.zix_expires_at).getTime()<=Date.now())return 'expired';return x.status}
function render(){
 if(!loaded)return;const q=$('zixHistorySearch').value.trim().toLocaleLowerCase('pt-BR');const st=$('zixHistoryStatus').value;
 const arr=rows.filter(x=>selected.has(x.category)&&(st==='trash'?!!x.zix_history_archived_at:!x.zix_history_archived_at&&(st==='all'||(st==='disabled'?disabled(x):status(x)===st)))&&(!q||[x.zix_code,x.id,x.title,x.city].some(v=>String(v||'').toLocaleLowerCase('pt-BR').includes(q))));
 const dir=$('zixHistoryOrder').value;
 arr.sort((a,b)=>dir==='new'?Date.parse(b.created_at)-Date.parse(a.created_at):dir==='old'?Date.parse(a.created_at)-Date.parse(b.created_at):(numeric(a)-numeric(b))*(dir==='desc'?-1:1)||String(a.zix_code||a.id).localeCompare(String(b.zix_code||b.id),'pt-BR',{numeric:true})*(dir==='desc'?-1:1));
 const area=$('zixHistoryList');area.replaceChildren();
 for(const x of arr.slice(0,visible)){
  const item=node('article','zix-history-item');const heading=node('div','zix-history-row');
  heading.append(node('strong','zix-history-original-id',`Nº ${x.zix_code||x.id}`),node('span','',({expired:'Vencido',disabled:'Desativado',trash:'Na lixeira',approved:'Aprovado',pending:'Pendente',rejected:'Rejeitado'}[status(x)]||status(x))));
  item.append(heading,node('h4','',x.title),node('p','',`${categories.find(y=>y[0]===x.category)?.[1]||x.category} · ${x.city}/${x.state} · ${fmtListingPrice(x)}`),node('p','',`Cadastro: ${new Date(x.created_at).toLocaleString('pt-BR')}`));
  const actions=node('div','zix-history-actions');
  function actionButton(title,handler,cls=''){const b=node('button',cls,title);b.type='button';b.onclick=handler;actions.append(b);return b}
  if(x.zix_history_archived_at){
   actionButton('📂 Recuperar da lixeira',()=>listingControl(x,'restaurar'),'zix-history-restore');
  }else{
   actionButton('✏️ Editar',()=>openEdit(x));
   if(x.status==='approved'&&!disabled(x)){
    actionButton('🔗 Copiar link',async()=>{
     const u=new URL('https://zixlima-previa-anuncios.suportezixlima.workers.dev/');
     u.searchParams.set('anuncio',x.id);
     try{await navigator.clipboard.writeText(u.href);message('Link copiado para o anúncio '+(x.zix_code||x.id))}
     catch{window.prompt('Copie o link:',u.href)}
    });
   }
   if(x.status==='pending'){
    actionButton('Aprovar',()=>setStatus(x,'approved'));
    actionButton('Rejeitar',()=>setStatus(x,'rejected'));
   }
   if(disabled(x)){
    const del=actionButton('🗑️ Excluir desativado',()=>deleteListing(x,del),'zix-history-delete');
    del.title='Mover para a lixeira, sem apagar registros de pagamentos';
    actionButton('🔄 Reativar',()=>listingControl(x,'reativar'));
   }else if(x.status==='approved'){
    actionButton('🎁 Bônus de dias',()=>listingControl(x,'bonus'));
    actionButton('⛔ Cancelar',()=>listingControl(x,'cancelar'));
   }
  }
  item.append(actions);area.append(item);
 }
 if(!arr.length)area.append(node('p','','Nenhum anúncio corresponde aos filtros.'));
 $('zixHistoryMore').hidden=arr.length<=visible;
 message(`${arr.length} anúncio(s) encontrado(s) entre ${rows.length} cadastrado(s). Exibindo ${Math.min(visible,arr.length)}.`);
}
async function setStatus(x,status){if(!confirm(`Deseja ${status==='approved'?'aprovar':'rejeitar'} o anúncio ${x.zix_code||x.id}?`))return;if(!(await permitted()))return alert('Sessão administrativa expirada.');const {error}=await db.from('listings').update({status}).eq('id',x.id);if(error)alert(error.message);else await refresh()}
async function deleteListing(x,button){
 const code=String(x.zix_code||x.id);
 if(x.zix_history_archived_at||!disabled(x))return alert('Somente anúncios desativados podem ser enviados à lixeira.');
 if(!confirm('EXCLUIR O ANÚNCIO DESATIVADO '+code+'? Ele sairá do histórico principal e ficará recuperável na Lixeira. Campanhas ativas vinculadas serão canceladas.'))return;
 const typed=prompt('Digite o código EXATO para confirmar a exclusão:');
 if(typed!==code){if(typed!==null)alert('Código incorreto. Exclusão cancelada.');return}
 if(!(await permitted()))return alert('Somente o administrador pode excluir.');
 const note=prompt('Motivo para enviar à lixeira:','Exclusão administrativa de anúncio desativado');
 if(note===null)return;
 button.disabled=true;
 try{
  const {error}=await db.rpc('zix_listing_admin',{p_listing:x.id,p_action:'arquivar',p_days:0,p_note:note});
  if(error)throw error;
  await refresh();
  alert('Anúncio '+code+' movido para a Lixeira. Você pode recuperá-lo pelo filtro Situação.');
 }catch(err){alert('Exclusão não realizada: '+err.message);button.disabled=false;}
}
async function listingControl(x,action){
 if(!(await permitted()))return alert('Somente ADMIN.');
 let days=0;
 if(action==='reativar'||action==='bonus'){
   const ask=prompt('Quantidade de dias (1 a 365):','7');
   if(ask===null)return; days=Number(ask);
   if(!Number.isInteger(days)||days<1||days>365)return alert('Prazo inválido.');
 }
 const note=prompt(action==='reativar'?'Motivo da reativação (confirme autorização e pagamento quando aplicável):':'Motivo da ação:','Controle administrativo');if(note===null)return;
 if(!confirm('Confirmar '+action+' para '+(x.zix_code||x.id)+'?'))return;
 const {error}=await db.rpc('zix_listing_admin',{p_listing:x.id,p_action:action,p_days:days,p_note:note});
 if(error)alert(error.message);else await refresh();
}
let zixAdminPriceCheck=null;
function syncAdminPrice(){
  const f=$('zixHistoryEditForm');
  const price=f.elements.namedItem('price');
  const servico=f.elements.namedItem('category').value==='servicos';
  const label=zixAdminPriceCheck.closest('label');
  label.hidden=!servico;
  if(!servico)zixAdminPriceCheck.checked=false;
  const combinar=servico&&zixAdminPriceCheck.checked;
  price.disabled=combinar;
  price.required=!combinar;
  if(combinar)price.value='';
}
function openEdit(x){editing=x;const f=$('zixHistoryEditForm');for(const k of ['title','category','price','city','state','phone','description'])f.elements.namedItem(k).value=x[k]??'';zixAdminPriceCheck.checked=
  x.category==='servicos' && Number(x.price)===0;
 syncAdminPrice();
 $('zixHistoryEditCode').textContent='Código: '+(x.zix_code||x.id);$('zixHistoryEditMsg').textContent='';$('zixHistoryEditDialog').showModal()}
async function saveEdit(ev){ev.preventDefault();if(!editing||!(await permitted()))return;const f=ev.currentTarget,btn=f.querySelector('[type=submit]');btn.disabled=true;$('zixHistoryEditMsg').textContent='Salvando...';try{
 const data={title:f.elements.namedItem('title').value.trim(),category:f.elements.namedItem('category').value,price:Number(f.elements.namedItem('price').value),city:f.elements.namedItem('city').value.trim(),state:f.elements.namedItem('state').value.trim().toUpperCase(),phone:f.elements.namedItem('phone').value.replace(/\D/g,'')||null,description:f.elements.namedItem('description').value.trim()};
 if(data.phone&&!(data.phone.length>=10&&data.phone.length<=15))throw Error('WhatsApp deve conter de 10 a 15 números.');
 const {error}=await db.from('listings').update(data).eq('id',editing.id);if(error)throw error;
 $('zixHistoryEditDialog').close();editing=null;await refresh();
 }catch(err){$('zixHistoryEditMsg').textContent='Não foi possível salvar: '+err.message}finally{btn.disabled=false}
}
function init(){
 if(!$('zixHistorico'))return;
 const form=$('zixHistoryEditForm');
 const price=form.elements.namedItem('price');
 const label=document.createElement('label');
 label.style.cssText=
   'display:flex;align-items:center;gap:9px;font-weight:700;';
 zixAdminPriceCheck=document.createElement('input');
 zixAdminPriceCheck.type='checkbox';
 zixAdminPriceCheck.style.cssText=
   'width:22px;height:22px;flex-shrink:0;';
 label.append(
   zixAdminPriceCheck,
   document.createTextNode(' Preco a combinar')
 );
 price.closest('label').after(label);
 zixAdminPriceCheck.addEventListener('change',syncAdminPrice);
 form.elements.namedItem('category')
   .addEventListener('change',syncAdminPrice);
 categoryRender();const s=$('zixHistoryEditForm').elements.namedItem('category');categories.forEach(([k,t])=>{const o=new Option(t,k);s.append(o)});
 $('zixHistoryEditForm').addEventListener('submit',saveEdit);$('zixHistoryEditCancel').onclick=()=>$('zixHistoryEditDialog').close();
 $('zixHistoryRefresh').onclick=refresh;
 for(const id of ['zixHistorySearch','zixHistoryOrder','zixHistoryStatus'])$(id).addEventListener(id==='zixHistorySearch'?'input':'change',()=>{visible=25;render()});
 $('zixHistoryMore').onclick=()=>{visible+=25;render()};
 const moderation=$('zixHistorico').closest('.card');
 const obs=new MutationObserver(()=>{if(moderation.classList.contains('zix-admin-tab-current')&&getComputedStyle(moderation).display!=='none'&&!loaded)void refresh()});obs.observe(moderation,{attributes:true,attributeFilter:['class']});
 $('zixHistoryRefresh').addEventListener('click',()=>{visible=25});
 // Quando a aba Anúncios já estiver ativa, carregar na primeira abertura.
 if(moderation.classList.contains('zix-admin-tab-current'))void refresh();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();

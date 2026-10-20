import {createClient} from 'https://esm.sh/@supabase/supabase-js@2';
import {SUPABASE_URL,SUPABASE_ANON_KEY} from './config.js';
const $=id=>document.getElementById(id);
const categories=[['carros','🚗 Carros'],['motos','🏍️ Motos'],['caminhoes','🚚 Caminhões'],['pecas','🔧 Peças e acessórios'],['eletronicos','📱 Eletrônicos'],['imoveis','🏠 Imóveis'],['alugueis','🏘️ Aluguéis'],['casa','🛋️ Casa e móveis'],['servicos','🧰 Serviços'],['outros','📦 Outros']];
const db=createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
let rows=[],loaded=false,selected=new Set(categories.map(c=>c[0])),visible=25,editing=null;
const message=s=>$('zixHistoryInfo').textContent=s;
const node=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e};
function numeric(x){const code=String(x.zix_code||'');const match=code.match(/(\d+)(?!.*\d)/);return match?Number(match[1]):Number.MAX_SAFE_INTEGER}
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
    const {data,error}=await db.from('listings').select('id,zix_code,title,category,city,state,price,status,created_at,zix_expires_at,description,phone,zix_blocked').order('created_at',{ascending:false}).range(offset,offset+499);
    if(error)throw error; all.push(...(data||[]));if(!data||data.length<500)break;offset+=500;
    if(offset>=10000){message('Exibindo até 10.000 anúncios. Refine os filtros para localizar outros.');break}
  }
  rows=all;visible=25;loaded=true;render();
 }catch(e){message('Falha ao carregar histórico: '+e.message)}
}
function status(x){const expired=x.zix_expires_at&&new Date(x.zix_expires_at).getTime()<=Date.now();return expired||x.zix_blocked?'expired':x.status}
function render(){
 if(!loaded)return;const q=$('zixHistorySearch').value.trim().toLocaleLowerCase('pt-BR');const st=$('zixHistoryStatus').value;
 const arr=rows.filter(x=>selected.has(x.category)&&(st==='all'||status(x)===st)&&(!q||[x.zix_code,x.id,x.title,x.city].some(v=>String(v||'').toLocaleLowerCase('pt-BR').includes(q))));
 const dir=$('zixHistoryOrder').value;
 arr.sort((a,b)=>dir==='new'?Date.parse(b.created_at)-Date.parse(a.created_at):dir==='old'?Date.parse(a.created_at)-Date.parse(b.created_at):(numeric(a)-numeric(b))*(dir==='desc'?-1:1)||String(a.zix_code||a.id).localeCompare(String(b.zix_code||b.id),'pt-BR',{numeric:true})*(dir==='desc'?-1:1));
 const area=$('zixHistoryList');area.replaceChildren();
 for(const x of arr.slice(0,visible)){
  const item=node('article','zix-history-item');const heading=node('div','zix-history-row');
  heading.append(node('strong','',`Nº ${x.zix_code||x.id}`),node('span','',status(x)==='expired'?'Vencido':({approved:'Aprovado',pending:'Pendente',rejected:'Rejeitado'}[status(x)]||status(x))));
  item.append(heading,node('h4','',x.title),node('p','',`${categories.find(y=>y[0]===x.category)?.[1]||x.category} · ${x.city}/${x.state} · ${fmtPrice(x.price)}`),node('p','',`Cadastro: ${new Date(x.created_at).toLocaleString('pt-BR')}`));
  const actions=node('div','zix-history-actions');
  const edit=node('button','','✏️ Editar');edit.type='button';edit.onclick=()=>openEdit(x);actions.append(edit);
  if(x.status==='approved'&&!x.zix_blocked&&status(x)!=='expired'){
   const share=node('button','','🔗 Copiar link');share.type='button';share.onclick=async()=>{const u=new URL('https://zixlima-previa-anuncios.suportezixlima.workers.dev/');u.searchParams.set('anuncio',x.id);try{await navigator.clipboard.writeText(u.href);message('Link copiado para o anúncio '+(x.zix_code||x.id))}catch{window.prompt('Copie o link:',u.href)}};actions.append(share);
  }
  for(const [title,next] of x.status==='pending'?[['Aprovar','approved'],['Rejeitar','rejected']]:[]){const b=node('button','',title);b.type='button';b.onclick=()=>setStatus(x,next);actions.append(b)}
  item.append(actions);area.append(item);
 }
 if(!arr.length)area.append(node('p','','Nenhum anúncio corresponde aos filtros.'));
 $('zixHistoryMore').hidden=arr.length<=visible;
 message(`${arr.length} anúncio(s) encontrado(s) entre ${rows.length} cadastrado(s). Exibindo ${Math.min(visible,arr.length)}.`);
}
async function setStatus(x,status){if(!confirm(`Deseja ${status==='approved'?'aprovar':'rejeitar'} o anúncio ${x.zix_code||x.id}?`))return;if(!(await permitted()))return alert('Sessão administrativa expirada.');const {error}=await db.from('listings').update({status}).eq('id',x.id);if(error)alert(error.message);else await refresh()}
function openEdit(x){editing=x;const f=$('zixHistoryEditForm');for(const k of ['title','category','price','city','state','phone','description'])f.elements.namedItem(k).value=x[k]??'';$('zixHistoryEditCode').textContent='Código: '+(x.zix_code||x.id);$('zixHistoryEditMsg').textContent='';$('zixHistoryEditDialog').showModal()}
async function saveEdit(ev){ev.preventDefault();if(!editing||!(await permitted()))return;const f=ev.currentTarget,btn=f.querySelector('[type=submit]');btn.disabled=true;$('zixHistoryEditMsg').textContent='Salvando...';try{
 const data={title:f.elements.namedItem('title').value.trim(),category:f.elements.namedItem('category').value,price:Number(f.elements.namedItem('price').value),city:f.elements.namedItem('city').value.trim(),state:f.elements.namedItem('state').value.trim().toUpperCase(),phone:f.elements.namedItem('phone').value.replace(/\D/g,'')||null,description:f.elements.namedItem('description').value.trim()};
 if(data.phone&&!(data.phone.length>=10&&data.phone.length<=15))throw Error('WhatsApp deve conter de 10 a 15 números.');
 const {error}=await db.from('listings').update(data).eq('id',editing.id);if(error)throw error;
 $('zixHistoryEditDialog').close();editing=null;await refresh();
 }catch(err){$('zixHistoryEditMsg').textContent='Não foi possível salvar: '+err.message}finally{btn.disabled=false}
}
function init(){
 if(!$('zixHistorico'))return;categoryRender();const s=$('zixHistoryEditForm').elements.namedItem('category');categories.forEach(([k,t])=>{const o=new Option(t,k);s.append(o)});
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

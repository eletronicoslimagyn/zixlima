/* Decora somente icones; eventos e textos originais permanecem. */
(()=>{'use strict';
const cats={'Carros':'🚘','Motos':'🏍️','Caminhões':'🚛','Peças e acessórios':'⚙️','Eletrônicos':'💻','Imóveis':'🏡','Aluguéis':'🗝️','Casa e móveis':'🛋️','Serviços':'🧰','Outros':'📦'};
const top={'Início':'🏠','Anúncios':'📚','Meus anúncios':'🏷️','Admin':'⚙️'};
function decorate(){
 document.querySelectorAll('#categories button.category').forEach(b=>{
  if(b.dataset.zixIcon==='1')return;
  const name=b.textContent.trim();const symbol=cats[name];if(!symbol)return;
  const old=b.querySelector('b');if(!old)return;
  old.textContent=symbol;old.classList.add('zix-modern-icon');b.dataset.zixIcon='1';
 });
 document.querySelectorAll('header nav a').forEach(a=>{
  if(a.dataset.zixIcon==='1')return;const symbol=top[a.textContent.trim()];if(!symbol)return;
  const span=document.createElement('span');span.className='zix-top-icon';span.setAttribute('aria-hidden','true');span.textContent=symbol;a.prepend(span);a.dataset.zixIcon='1';
 });
 const post=document.getElementById('postBtn');if(post&&!post.dataset.zixIcon){const span=document.createElement('span');span.className='zix-top-icon';span.setAttribute('aria-hidden','true');span.textContent='📣';post.prepend(span);post.dataset.zixIcon='1';}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',decorate);else decorate();
const target=document.getElementById('categories');if(target){new MutationObserver(decorate).observe(target,{childList:true});}
})();

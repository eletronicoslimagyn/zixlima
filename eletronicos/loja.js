'use strict';
const menu=document.querySelector('#menu');const toggle=document.querySelector('.menu-toggle');
function closeMenu(){menu.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Abrir menu');}
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';menu.classList.toggle('open',open);toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');});
menu.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.classList.contains('open')){closeMenu();toggle.focus();}});
const cards=[...document.querySelectorAll('.store-service-card')];
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{const filter=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));let count=0;cards.forEach(card=>{const show=filter==='all'||filter===card.dataset.group;card.hidden=!show;if(show)count++;});document.querySelector('#service-count').textContent=count===1?'1 opção para você escolher':count+' opções para você escolher';}));
document.querySelector('#year').textContent=String(new Date().getFullYear());


(() => {
 'use strict';
 let installPrompt = null;
 window.addEventListener('beforeinstallprompt', ev => {
   ev.preventDefault();
   installPrompt = ev;
 });

 function iniciar() {
   const top = document.querySelector('header .top');
   const actions = top?.querySelector(':scope > .actions');
   const clock = document.getElementById('zixRelogio');
   const post = document.getElementById('postBtn');
   const login = document.getElementById('loginBtn');
   const nav = top?.querySelector(':scope > nav');
   if (!actions || !clock || !post || !login || !nav) return;


   // Reutiliza o relogio original, sem criar copia.
   function organizar() {
     if (clock.previousElementSibling !== post ||
         clock.nextElementSibling !== login) {
       post.after(clock);
       if (clock.nextElementSibling !== login) {
         clock.after(login);
       }
     }
   }

   organizar();
   window.addEventListener('load', organizar);

   // Corrige movimentacoes posteriores dos scripts antigos.
   const observer = new MutationObserver(() => organizar());
   observer.observe(top, {childList:true, subtree:true});

   if (!document.getElementById('zixInstallApp')) {
     const area = document.createElement('div');
     area.className = 'zix-install-area';
     const button = document.createElement('button');
     button.type = 'button';
     button.id = 'zixInstallApp';
     button.textContent = '⬇ Download ZixLima Classificados';
     button.addEventListener('click', async () => {
       if (installPrompt) {
         const prompt = installPrompt;
         installPrompt = null;
         await prompt.prompt();
       } else {
         alert('Para instalar o ZixLima, abra o menu do Chrome e escolha Instalar aplicativo ou Adicionar à tela inicial. No computador, procure Instalar na barra de endereço ou no menu do navegador.');
       }
     });
     area.append(button);
     top.after(area);
   }
 }
 if (document.readyState === 'loading') {
   document.addEventListener('DOMContentLoaded', iniciar);
 } else iniciar();
})();

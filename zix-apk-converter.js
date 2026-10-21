/* ZixLima - Editor HTML para APK: sem execucao de codigo do usuario no ADM. */
(()=>{
 'use strict';
 function init(){
   const panel=document.getElementById('painel');
   const nav=document.getElementById('zixAdminTabs');
   const old=document.getElementById('zixMonstroAdminCard');
   if(!panel||!nav||!old||document.getElementById('zixApkEditor'))return;
   const button=nav.querySelector('[data-tab="monstro"]');
   if(!button)return;
   button.innerHTML='<span aria-hidden="true">📱</span><span>Criar APK</span>';
   button.title='Transformar HTML/CSS/JavaScript em aplicativo Android';
   old.id='zixApkEditor';
   old.replaceChildren();
   old.innerHTML=`<h2>📱 Conversor de Código para APK</h2>
   <p>Importe um arquivo HTML ou escreva seu código. Esta versão gera APK Android para projetos web (HTML/CSS/JavaScript). Não converte código Python, Java ou arquivos ZIP arbitrários.</p>
   <label for="zixApkName">Nome do aplicativo</label><input id="zixApkName" value="Meu aplicativo" maxlength="60" />
   <label for="zixApkFile">Importar código HTML (.html)</label><input id="zixApkFile" type="file" accept=".html,.htm,text/html" />
   <label for="zixApkCode">Editor de código HTML (CSS e JavaScript podem estar dentro do HTML)</label>
   <textarea id="zixApkCode" spellcheck="false" style="box-sizing:border-box;display:block;width:100%;min-height:290px;border:1px solid #aabbd3;border-radius:10px;padding:12px;font-family:monospace;font-size:15px" placeholder="Cole seu HTML aqui"></textarea>
   <p><button type="button" id="zixApkPreviewBtn">👁️ Visualizar</button> <button type="button" id="zixApkDownload" class="ok">⬇️ Baixar código para APK</button></p>
   <iframe id="zixApkPreview" title="Prévia isolada do aplicativo" sandbox="allow-scripts" style="width:100%;height:300px;border:1px solid #ced8e7;border-radius:12px;background:#fff"></iframe>
   <h3>Como gerar o APK instalável</h3>
   <p>1. Baixe o HTML acima. 2. No Termux, copie o arquivo baixado para <code>apk-builder/app/src/main/assets/index.html</code> no repositório ZixLima. 3. Envie a atualização ao GitHub. 4. Em <a href="https://github.com/eletronicoslimagyn/zixlima/actions/workflows/build-apk.yml" target="_blank" rel="noopener">GitHub Actions → Construir APK ZixLima</a>, aguarde a compilação e baixe o arquivo APK na seção <b>Artifacts</b>.</p>
   <p><small>O APK é uma compilação de teste (debug), não assinada para publicação na Play Store. O HTML é processado localmente neste navegador. Nunca insira senhas, tokens ou dados sigilosos no código exportado.</small></p>
   <p id="zixApkStatus" role="status" aria-live="polite"></p>`;
   const area=old.querySelector('#zixApkCode'),status=old.querySelector('#zixApkStatus');
   const initial='<!doctype html>\n<html lang="pt-BR">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>Meu aplicativo</title>\n</head>\n<body>\n<h1>Olá, Android!</h1>\n</body>\n</html>';
   area.value=initial.replaceAll('\\n','\n');
   old.querySelector('#zixApkFile').addEventListener('change',async ev=>{
     const file=ev.target.files?.[0];if(!file)return;
     if(!/\.html?$/i.test(file.name)||file.size>2_000_000){status.textContent='Selecione um HTML de até 2 MB.';return;}
     area.value=await file.text();status.textContent='HTML importado. Agora visualize e exporte.';
   });
   old.querySelector('#zixApkPreviewBtn').addEventListener('click',()=>{
     old.querySelector('#zixApkPreview').srcdoc=area.value;
     status.textContent='Prévia carregada em ambiente isolado.';
   });
   old.querySelector('#zixApkDownload').addEventListener('click',()=>{
     if(!area.value.trim()){status.textContent='Insira o código HTML primeiro.';return;}
     const code=area.value;
     const blob=new Blob([code],{type:'text/html;charset=utf-8'});
     const url=URL.createObjectURL(blob),a=document.createElement('a');
     a.href=url;a.download='index.html';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
     status.textContent='Arquivo index.html exportado. Copie-o para o projeto Android e compile no GitHub Actions.';
   });
   // Previne carregar o iframe antigo. A função de navegação original mantém a aba monstro como identificador interno.
   const orig=button.cloneNode(true);
   button.replaceWith(orig);
   orig.addEventListener('click',()=>{
     nav.querySelectorAll('.zix-admin-tab').forEach(b=>{b.classList.remove('zix-admin-tab-selected');b.setAttribute('aria-pressed','false');b.removeAttribute('aria-current');});
     orig.classList.add('zix-admin-tab-selected');orig.setAttribute('aria-pressed','true');orig.setAttribute('aria-current','page');
     panel.querySelectorAll('.zix-admin-tab-content').forEach(e=>e.classList.remove('zix-admin-tab-current'));
     old.classList.add('zix-admin-tab-current');
     const hint=document.getElementById('zixAdminTabsHint');if(hint)hint.textContent='Crie seu aplicativo Android a partir de HTML, CSS e JavaScript.';
     try{sessionStorage.setItem('zix-admin-active-tab','monstro');}catch(e){}
     nav.scrollIntoView({block:'start',behavior:'smooth'});
   });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,50));
 else setTimeout(init,50);
})();

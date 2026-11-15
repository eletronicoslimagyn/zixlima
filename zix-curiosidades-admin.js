/* ZixLima Curiosidades — editor do Admin, edição 2026.
 * Token usado somente em requisições diretas ao GitHub durante a publicação.
 * Não se grava token em localStorage, sessionStorage, cookies ou arquivos.
 */
(() => {
  'use strict';
  const REPO = 'eletronicoslimagyn/zixlima';
  const PATH = 'curiosidades/index.html';
  const URL = 'https://api.github.com/repos/' + REPO + '/contents/' + PATH;
  const $ = id => document.getElementById(id);
  const BASE = [
    ['informática', 'Informática'],
    ['celulares', 'Celulares'],
    ['inteligência-artificial', 'Inteligência artificial'],
    ['segurança-digital', 'Segurança digital'],
    ['empreendedorismo', 'Empreendedorismo'],
    ['tecnologia-no-dia-a-dia', 'Tecnologia no dia a dia']
  ];
  const SUGESTOES = [
    ['informática', 'Aprenda Microsoft Word: documentos e formatação', 'Tutoriais de edição, tabelas, impressão, revisão e organização de documentos.', 'https://support.microsoft.com/pt-br/word', 'tutorial'],
    ['informática', 'Aprenda Microsoft Excel: tabelas, fórmulas e gráficos', 'Material de apoio para criar planilhas, utilizar fórmulas, formatar células e apresentar dados.', 'https://support.microsoft.com/pt-br/excel', 'tutorial'],
    ['informática', 'LibreOffice: alternativa para Word e Excel', 'Conheça o Writer e o Calc e encontre versões oficiais para download.', 'https://pt-br.libreoffice.org/', 'download'],
    ['informática', 'Ferramentas PDF24 para juntar, dividir e converter PDF', 'Conheça ferramentas online para organizar PDFs. Evite enviar arquivos sensíveis sem avaliar a política de privacidade.', 'https://tools.pdf24.org/pt/', 'link'],
    ['informática', 'Adobe Acrobat: recursos para arquivos PDF', 'Veja ferramentas para organizar, converter e editar documentos PDF e confira os requisitos de uso.', 'https://www.adobe.com/br/acrobat/online.html', 'link'],
    ['celulares', 'Central de ajuda do Android', 'Encontre explicações oficiais para configurar o celular, gerenciar aplicativos e resolver problemas comuns.', 'https://support.google.com/android/?hl=pt-BR', 'tutorial'],
    ['celulares', 'Como fazer backup de fotos e vídeos', 'Documentação do Google Fotos sobre backup e recuperação de arquivos.', 'https://support.google.com/photos/?hl=pt-BR', 'tutorial'],
    ['inteligência-artificial', 'Prompts do ChatGPT para programação', 'Confira exemplos de pedidos para gerar código, analisar erros e estudar desenvolvimento. Revise os resultados antes de usar.', 'https://canaltech.com.br/inteligencia-artificial/prompts-do-chatgpt-para-desenvolvedores/', 'tutorial'],
    ['inteligência-artificial', 'Como escrever bons prompts de IA', 'Dica: descreva o objetivo, o público, os requisitos, o formato desejado e peça revisão dos resultados.', '', 'artigo'],
    ['segurança-digital', 'Cartilha de Segurança para Internet', 'Consulte orientações educativas do CERT.br sobre senhas, golpes, privacidade e uso seguro da internet.', 'https://cartilha.cert.br/', 'tutorial'],
    ['segurança-digital', 'Verificação em duas etapas da Conta Google', 'Saiba como proteger o acesso à conta com uma segunda etapa de verificação.', 'https://support.google.com/accounts/answer/185839?hl=pt-BR', 'tutorial'],
    ['empreendedorismo', 'Sebrae: cursos e orientação para empreender', 'Acesse materiais de gestão, vendas, marketing e planejamento para pequenos negócios.', 'https://sebrae.com.br/', 'tutorial'],
    ['empreendedorismo', 'WhatsApp Business para atendimento', 'Conheça recursos de perfil comercial, catálogo e respostas rápidas para organizar o relacionamento com clientes.', 'https://www.whatsapp.com/business/', 'link'],
    ['tecnologia-no-dia-a-dia', 'Aprenda a usar o Google Drive', 'Conheça os recursos de organização, compartilhamento e cópia de documentos na nuvem.', 'https://support.google.com/drive/?hl=pt-BR', 'tutorial'],
    ['tecnologia-no-dia-a-dia', 'Guias do Microsoft 365', 'Encontre apoio para ferramentas de produtividade e colaboração usadas no dia a dia.', 'https://support.microsoft.com/pt-br/', 'tutorial']
  ];
  const uniqueId = () => 'zix-info-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  const slug = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 65);
  const typeNames = { tutorial:'Tutorial', download:'Download', link:'Site útil', artigo:'Artigo' };
  let model, editing = null, saving = false, publishedData = null, loadedOk = false;

  function initialState() {
    const categories = BASE.map(([id,name]) => ({id,name,items:[]}));
    for (const [category,title,summary,url,type] of SUGESTOES) {
      categories.find(c => c.id === category).items.push({id:uniqueId(),title,summary,url,type});
    }
    return {version:1,categories};
  }
  function normalize(raw) {
    if (!raw || !Array.isArray(raw.categories)) throw new Error('Dados da biblioteca inválidos.');
    const original = BASE.map(([id,name]) => {
      const matched = raw.categories.find(c => c.id === id);
      return {id,name,items:Array.isArray(matched?.items) ? matched.items : []};
    });
    for (const c of raw.categories) {
      if (BASE.some(([id]) => id === c.id)) continue;
      if (!/^zix-cat-[a-z0-9-]+$/.test(c.id)) continue;
      original.push({id:c.id,name:String(c.name || 'Nova categoria').slice(0,90),items:Array.isArray(c.items) ? c.items : []});
    }
    return {version:1,categories:original};
  }
  function message(value, error=false) {
    const el = $('zixCmsStatus');
    el.textContent = value;
    el.style.color = error ? '#b91c1c' : '#14532d';
  }
  const current = () => model.categories.find(c => c.id === $('zixCmsCategory').value);
  function resetForm() {
    editing = null;
    ['zixCmsTitle','zixCmsSummary','zixCmsLink'].forEach(id => $(id).value = '');
    $('zixCmsType').value = 'tutorial';
    $('zixCmsSaveItem').textContent = '➕ Adicionar informação';
  }
  function render() {
    const chosen = $('zixCmsCategory').value;
    const select = $('zixCmsCategory');
    select.replaceChildren();
    for (const c of model.categories) {
      const option = document.createElement('option');
      option.value = c.id;
      option.textContent = c.name + ' (' + c.items.length + ' novas informações)';
      select.append(option);
    }
    if (model.categories.some(c => c.id === chosen)) select.value = chosen;
    const category = current();
    $('zixCmsCategoryName').textContent = category.name;
    const isOriginal = BASE.some(([id]) => id === category.id);
    $('zixCmsRemoveCategory').disabled = isOriginal;
    $('zixCmsRenameCategory').disabled = isOriginal;
    const total = model.categories.reduce((n,c) => n + c.items.length, 0);
    $('zixCmsCount').textContent = model.categories.length + ' categorias · ' + total + ' informações adicionais gerenciadas aqui.';
    const list = $('zixCmsItems'); list.replaceChildren();
    if (!category.items.length) {
      list.textContent = 'Ainda não há itens adicionais nesta categoria. Os textos originais do site permanecem preservados.';
    }
    category.items.forEach((item, index) => {
      const box = document.createElement('div'); box.className = 'zix-cms-row';
      const title = document.createElement('strong'); title.textContent = item.title;
      const description = document.createElement('p'); description.textContent = item.summary;
      const meta = document.createElement('small'); meta.textContent = (typeNames[item.type] || 'Link') + ' · ' + (item.url || 'Sem link externo');
      const buttons = document.createElement('div');
      const edit = document.createElement('button'); edit.type = 'button'; edit.textContent = '✏️ Editar'; edit.dataset.cmsEdit = String(index);
      const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = '🗑️ Excluir'; remove.dataset.cmsDelete = String(index);
      buttons.append(edit,remove); box.append(title,description,meta,buttons); list.append(box);
    });
  }
  function verifiedLink(value) {
    if (!value.trim()) return '';
    let url;
    try { url = new URL(value.trim()); } catch (_) { throw new Error('Use um endereço completo começando por https://'); }
    if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error('Somente links HTTP ou HTTPS são permitidos.');
    if (url.username || url.password) throw new Error('Remova usuário e senha do endereço.');
    return url.href;
  }
  function addItem() {
    const c = current(); const title = $('zixCmsTitle').value.trim(); const summary = $('zixCmsSummary').value.trim();
    try {
      if (title.length < 5) throw new Error('O título precisa ter pelo menos cinco caracteres.');
      if (summary.length < 12) throw new Error('A descrição precisa ter pelo menos doze caracteres.');
      const url = verifiedLink($('zixCmsLink').value);
      const type = $('zixCmsType').value;
      if (type !== 'artigo' && !url) throw new Error('Para tutoriais, downloads e sites úteis, informe um link completo.');
      const item = {id:editing?.id || uniqueId(),title:title.slice(0,140),summary:summary.slice(0,850),url,type};
      if (editing && editing.category === c.id) c.items[editing.index] = item;
      else c.items.push(item);
      resetForm(); render(); message('Informação preparada. Clique em “Gravar no GitHub” para publicar.');
    } catch (error) { message(error.message,true); }
  }
  function addCategory() {
    const name = $('zixCmsNewCategory').value.trim();
    const id = 'zix-cat-' + slug(name);
    if (name.length < 3 || !slug(name)) return message('Informe um nome de categoria com pelo menos três caracteres.',true);
    if (model.categories.some(c => c.id === id || c.name.toLowerCase() === name.toLowerCase())) return message('Essa categoria já existe.',true);
    model.categories.push({id,name:name.slice(0,90),items:[]});
    $('zixCmsNewCategory').value = '';
    render(); $('zixCmsCategory').value = id; render(); resetForm();
    message('Nova aba preparada. Publique para ela aparecer em Curiosidades.');
  }
  async function load() {
    try {
      const response = await fetch('/curiosidades/index.html?cms=' + Date.now(), {cache:'no-store'});
      if (!response.ok) throw new Error('HTTP '+ response.status);
      const parsed = new DOMParser().parseFromString(await response.text(),'text/html');
      const stored = parsed.getElementById('zixCmsData');
      publishedData = stored ? stored.textContent : null;
      model = stored ? normalize(JSON.parse(stored.textContent)) : initialState();
      loadedOk = true;
      render();
      message(stored ? 'Informações carregadas da página publicada.' : 'Editor carregado com sugestões sobre Word, Excel, PDF, IA e outras categorias. Confira e publique quando quiser.');
    } catch (error) {
      model = {version:1,categories:BASE.map(([id,name]) => ({id,name,items:[]}))};
      loadedOk = false;
      render(); message('Não foi possível ler a página publicada: ' + error.message + '. Recarregue antes de publicar.',true);
    }
  }
  function articleNode(doc, item) {
    const article = doc.createElement('article'); article.className = 'answer'; article.dataset.zixCmsItem = '1'; article.id = item.id;
    const heading = doc.createElement('h3'); heading.textContent = item.title;
    const text = doc.createElement('p'); text.textContent = item.summary;
    article.append(heading,text);
    if (item.url) {
      const link = doc.createElement('a');
      link.href = verifiedLink(item.url);
      link.target='_blank'; link.rel='noopener noreferrer';
      link.textContent = item.type === 'download' ? 'Abrir página oficial ou recomendada de download' : item.type === 'tutorial' ? 'Ler tutorial' : 'Visitar site útil';
      article.append(link,doc.createTextNode(' · '));
    }
    const anchor = doc.createElement('a'); anchor.href='#'+item.id; anchor.textContent='Link direto para este assunto';
    article.append(anchor);
    return article;
  }
  function buildPage(source) {
    const doc = new DOMParser().parseFromString(source,'text/html');
    const grid = doc.querySelector('main .grid');
    if (!grid) throw new Error('Não encontrei as categorias originais. Nada foi alterado.');
    // Remove apenas o conteúdo previamente gerado por este editor.
    doc.querySelectorAll('[data-zix-cms-item],[data-zix-cms-category],#zixCmsData').forEach(element => element.remove());
    for (const category of model.categories) {
      let section = doc.getElementById(category.id);
      if (!section) {
        if (BASE.some(([id]) => id === category.id)) throw new Error('Categoria original ausente: ' + category.name);
        section = doc.createElement('section');section.className='category';section.id=category.id;section.dataset.zixCmsCategory='1';
        const details=doc.createElement('details');
        const summary=doc.createElement('summary');
        const name=doc.createElement('span');name.textContent=category.name;
        const count=doc.createElement('span');count.className='count';summary.append(name,count);
        const inside=doc.createElement('div');inside.className='inside';
        details.append(summary,inside);section.append(details);grid.append(section);
      }
      const inside=section.querySelector('.inside');
      if(!inside) throw new Error('Estrutura da categoria inválida: '+category.name);
      for (const item of category.items) inside.append(articleNode(doc,item));
      const total=section.querySelectorAll('article.answer').length;
      const count=section.querySelector('.count'); if(count)count.textContent=total+' assuntos';
    }
    const stats=doc.querySelector('header .stats');
    if (stats) {
      const labels=stats.querySelectorAll('span');
      if(labels[0])labels[0].textContent=grid.querySelectorAll('.category').length+' categorias';
      if(labels[1])labels[1].textContent=grid.querySelectorAll('.answer').length+' assuntos';
    }
    const data=doc.createElement('script'); data.type='application/json';data.id='zixCmsData';
    data.textContent=JSON.stringify(model).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026');
    doc.body.append(data);
    // HTML real no repositório: os links e textos ficam visíveis sem JavaScript.
    return '<!doctype html>\n' + doc.documentElement.outerHTML + '\n';
  }
  function parseBase64(encoded) {
    const raw=atob(encoded.replace(/\s/g,''));
    const bytes=Uint8Array.from(raw,char=>char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }
  function base64Utf8(str) {
    const bytes=new TextEncoder().encode(str); let raw='';
    for(let i=0;i<bytes.length;i+=8192)raw+=String.fromCharCode(...bytes.subarray(i,i+8192));
    return btoa(raw);
  }
  async function publish() {
    if (saving) return;
    if (!loadedOk) return message('A leitura da página falhou. Atualize o Admin antes de tentar publicar.',true);
    const input=$('zixCmsToken');
    const token=input.value.trim();
    if(!token)return message('Cole o token somente na hora de publicar.',true);
    if(!/^[\x21-\x7e]+$/.test(token))return message('Token inválido. Não use espaços, quebras de linha ou emojis.',true);
    const button=$('zixCmsPublish'); saving=true; button.disabled=true;
    try {
      message('Lendo a última versão no GitHub...');
      const headers={Accept:'application/vnd.github+json',Authorization:'Bearer '+token,'X-GitHub-Api-Version':'2022-11-28'};
      const get=await fetch(URL+'?ref=main', {headers,cache:'no-store'});
      const old=await get.json();
      if(!get.ok)throw new Error('HTTP '+get.status+': '+(old.message||'Erro ao ler arquivo no GitHub'));
      const original=parseBase64(old.content);
      const remoteDoc=new DOMParser().parseFromString(original,'text/html');
      const remoteData=remoteDoc.getElementById('zixCmsData')?.textContent || null;
      if(remoteData!==publishedData)throw new Error('Outra publicação foi feita depois que abriu o editor. Atualize a página do Admin para evitar sobrescrever alterações.');
      const html=buildPage(original);
      if(new TextEncoder().encode(html).length > 950000)throw new Error('A página ficou grande demais. Considere criar páginas próprias para os guias mais longos.');
      message('Gravando a atualização no GitHub...');
      const put=await fetch(URL, {method:'PUT',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({message:'Atualizar Curiosidades pelo Admin',sha:old.sha,branch:'main',content:base64Utf8(html)})});
      const result=await put.json();
      if(!put.ok)throw new Error('HTTP '+put.status+': '+(result.message||'Falha ao gravar no GitHub'));
      const generated=new DOMParser().parseFromString(html,'text/html');
      publishedData=generated.getElementById('zixCmsData')?.textContent || null;
      message('✅ Atualização salva no GitHub! O GitHub Pages publicará a nova versão conforme o deploy.');
    } catch(error) {message('Não foi possível publicar: '+error.message,true);}
    finally {
      // Esvazia o campo após a tentativa, independentemente do resultado.
      input.value='';input.type='password';
      $('zixCmsEye').textContent='👁️';$('zixCmsEye').setAttribute('aria-pressed','false');
      button.disabled=false;saving=false;
    }
  }
  function init() {
    const panel=$('painel');if(!panel||$('zixCuriosidadesAdmin'))return;
    const section=document.createElement('section');section.className='card';section.id='zixCuriosidadesAdmin';
    section.innerHTML=`
      <h2>📚 Editor da ZixLima Curiosidades</h2>
      <p>Crie novas abas e adicione artigos, tutoriais, ferramentas e links para baixar programas de sites confiáveis. Os conteúdos atuais permanecem preservados.</p>
      <p id="zixCmsCount"></p>
      <label for="zixCmsCategory">Selecione a aba de Curiosidades</label>
      <select id="zixCmsCategory"></select>
      <p><strong id="zixCmsCategoryName"></strong></p>
      <div class="zix-cms-actions">
        <input id="zixCmsNewCategory" maxlength="90" placeholder="Nova aba: Word, Excel, PDF, Downloads..." aria-label="Nome da nova aba">
        <button type="button" id="zixCmsAddCategory">➕ Criar nova aba</button>
      </div>
      <div class="zix-cms-actions"><button type="button" id="zixCmsRenameCategory">✏️ Renomear nova aba</button><button type="button" id="zixCmsRemoveCategory">🗑️ Excluir nova aba</button></div>
      <h3>Adicionar tutorial, artigo ou link</h3>
      <label for="zixCmsTitle">Título</label>
      <input id="zixCmsTitle" maxlength="140" placeholder="Ex.: Como usar fórmulas no Excel">
      <label for="zixCmsSummary">Descrição informativa</label>
      <textarea id="zixCmsSummary" maxlength="850" rows="4" placeholder="Explique o que o visitante encontrará neste tutorial ou programa..."></textarea>
      <label for="zixCmsType">Tipo de conteúdo</label>
      <select id="zixCmsType"><option value="tutorial">Tutorial</option><option value="download">Página para baixar programa</option><option value="link">Site ou ferramenta útil</option><option value="artigo">Artigo sem link externo</option></select>
      <label for="zixCmsLink">Link completo (HTTP ou HTTPS)</label>
      <input type="url" inputmode="url" id="zixCmsLink" placeholder="https://site-oficial.com/download">
      <button type="button" id="zixCmsSaveItem">➕ Adicionar informação</button>
      <button type="button" id="zixCmsCancel">Cancelar edição</button>
      <h3>Itens adicionais nesta aba</h3>
      <div id="zixCmsItems"></div>
      <section class="zix-cms-publish">
        <h3>🔐 Gravar alterações no GitHub</h3>
        <p><small>O token só é necessário no momento de salvar e será apagado do campo depois da tentativa. Crie um token refinado limitado ao repositório, com permissão Contents: Read and write. Não envie tokens a terceiros.</small></p>
        <label for="zixCmsToken">Token temporário GitHub</label>
        <div class="zix-cms-secret">
          <input type="password" id="zixCmsToken" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Cole o token para gravar">
          <button type="button" id="zixCmsEye" title="Mostrar ou ocultar o token" aria-label="Mostrar token" aria-pressed="false">👁️</button>
        </div>
        <button type="button" class="ok" id="zixCmsPublish">💾 Gravar no GitHub</button>
        <a href="/curiosidades/" target="_blank" rel="noopener noreferrer">Abrir Curiosidades</a>
        <p id="zixCmsStatus" role="status" aria-live="polite"></p>
      </section>`;
    const style=document.createElement('style');style.id='zixCuriosidadesAdminCss';
    style.textContent=`
      #zixCuriosidadesAdmin {overflow-wrap:anywhere}
      #zixCuriosidadesAdmin textarea{width:100%;min-height:104px;display:block;padding:12px;border:1px solid #cbd5e1;border-radius:9px;font:inherit}
      #zixCuriosidadesAdmin label{display:block;margin:14px 0 3px;font-weight:700}
      #zixCuriosidadesAdmin .zix-cms-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
      #zixCuriosidadesAdmin .zix-cms-actions input{min-width:200px;flex:1}
      #zixCuriosidadesAdmin .zix-cms-row{padding:13px 0;border-bottom:1px solid #dbe1eb}
      #zixCuriosidadesAdmin .zix-cms-row strong,#zixCuriosidadesAdmin .zix-cms-row small{display:block;overflow-wrap:anywhere}
      #zixCuriosidadesAdmin .zix-cms-row p{margin:6px 0}
      #zixCuriosidadesAdmin .zix-cms-publish{border:1px solid #b7d7bf;background:#f1fff4;padding:16px;border-radius:14px;margin-top:20px}
      #zixCuriosidadesAdmin .zix-cms-secret{position:relative}
      #zixCuriosidadesAdmin .zix-cms-secret input{padding-right:58px}
      #zixCuriosidadesAdmin #zixCmsEye{position:absolute;right:4px;top:50%;transform:translateY(-50%);background:transparent;border:0;color:#14233a;font-size:23px;padding:7px}
      #zixCuriosidadesAdmin #zixCmsStatus{font-weight:700;overflow-wrap:anywhere}
      @media(max-width:620px){#zixCuriosidadesAdmin .zix-cms-actions{display:block}}
    `;
    document.head.append(style);panel.append(section);
    $('zixCmsCategory').addEventListener('change',()=>{resetForm();render();});
    $('zixCmsAddCategory').onclick=addCategory;
    $('zixCmsSaveItem').onclick=addItem;
    $('zixCmsCancel').onclick=resetForm;
    $('zixCmsPublish').onclick=publish;
    $('zixCmsEye').onclick=()=>{
      const input=$('zixCmsToken');const visible=input.type==='password';
      input.type=visible?'text':'password';
      $('zixCmsEye').textContent=visible?'🙈':'👁️';
      $('zixCmsEye').setAttribute('aria-pressed',String(visible));
      $('zixCmsEye').setAttribute('aria-label',visible?'Ocultar token':'Mostrar token');
    };
    $('zixCmsRenameCategory').onclick=()=>{
      const cat=current();if(BASE.some(([id])=>id===cat.id))return;
      const name=prompt('Novo nome da aba:',cat.name);if(name===null)return;
      if(name.trim().length<3)return message('Nome de categoria muito curto.',true);
      cat.name=name.trim().slice(0,90);render();message('Nome alterado. Publique para aplicar.');
    };
    $('zixCmsRemoveCategory').onclick=()=>{
      const cat=current();if(BASE.some(([id])=>id===cat.id))return;
      if(!confirm('Excluir a aba “'+cat.name+'” e os seus itens adicionais?'))return;
      model.categories=model.categories.filter(c=>c!==cat);resetForm();render();message('Aba excluída do editor. Publique para aplicar.');
    };
    $('zixCmsItems').onclick=event=>{
      const button=event.target.closest('button');if(!button)return;
      const cat=current();
      if(button.dataset.cmsEdit!==undefined){
        const index=Number(button.dataset.cmsEdit),item=cat.items[index];
        editing={category:cat.id,index,id:item.id};
        $('zixCmsTitle').value=item.title;$('zixCmsSummary').value=item.summary;
        $('zixCmsType').value=item.type;$('zixCmsLink').value=item.url||'';
        $('zixCmsSaveItem').textContent='💾 Atualizar informação';$('zixCmsTitle').focus();
      } else if(button.dataset.cmsDelete!==undefined){
        const index=Number(button.dataset.cmsDelete);
        if(confirm('Excluir “'+cat.items[index].title+'”?')){
          cat.items.splice(index,1);resetForm();render();message('Item excluído. Publique para aplicar.');
        }
      }
    };
    load();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();

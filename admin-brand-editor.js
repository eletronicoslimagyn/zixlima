(() => {
  const $ = id => document.getElementById(id);
  const repo = 'eletronicoslimagyn/zixlima';
  const defaults = {
    logoPath: '',
    sloganPath: '',
    logoWm: 56,
    logoHm: 56,
    logoWd: 84,
    logoHd: 84,
    logoXm: 0, logoYm: 0, logoXd: 0, logoYd: 0,
    nameSm: 36,
    nameSd: 72,
    nameSx: 100,
    nameSy: 100,
    nameY: 0,
    nameLs: -1,
    sloganTextSm: 24,
    sloganTextSd: 40,
    sloganWm: 36,
    sloganHm: 36,
    sloganWd: 52,
    sloganHd: 52,
    nameColor: "original", nameLed: "none", nameGlow: 6,
    sloganColor: "original", sloganLed: "none", sloganGlow: 6,
    sloganX: 0, sloganY: 0, sloganImgX: 0, sloganImgY: 0
  };

  const ids = [
    'zzLogoWm','zzLogoHm','zzLogoWd','zzLogoHd',
    'zzLogoXm','zzLogoYm','zzLogoXd','zzLogoYd',
    'zzNameSm','zzNameSd','zzNameSx','zzNameSy','zzNameY','zzNameLs',
    'zzSloganTextSm','zzSloganTextSd','zzSloganWm','zzSloganHm','zzSloganWd','zzSloganHd','zzNameColor','zzNameGlowColor','zzNameLightEffect','zzNameLightIntensity','zzSloganColor','zzSloganGlowColor','zzSloganLightEffect','zzSloganLightIntensity',
    'zzNameGlow','zzSloganGlow','zzSloganX','zzSloganY','zzSloganImgX','zzSloganImgY',
    'zzNameColor','zzNameLed','zzSloganColor','zzSloganLed'
  ];

  let current = {...defaults};
  let pendingLogo = '';
  let pendingSlogan = '';
  const savedText = {nome:'ZixLima', slogan:'ZixLima Anúncie Aqui'};

  function msg(t, ok=false){
    const el = $('zzMarcaMensagem');
    if(!el) return;
    el.style.color = ok ? '#15803d' : '#b91c1c';
    el.textContent = t || '';
  }

  function val(id, fallback=0){
    const n = Number($(id)?.value);
    return Number.isFinite(n) ? n : fallback;
  }

  function collect(){
    return {...current,
      logoPath: current.logoPath || '',
      sloganPath: current.sloganPath || '',
      logoWm: val('zzLogoWm',56),
      logoHm: val('zzLogoHm',56),
      logoWd: val('zzLogoWd',84),
      logoHd: val('zzLogoHd',84),
      logoXm: val('zzLogoXm'), logoYm: val('zzLogoYm'),
      logoXd: val('zzLogoXd'), logoYd: val('zzLogoYd'),
      nameSm: val('zzNameSm',36),
      nameSd: val('zzNameSd',72),
      nameSx: val('zzNameSx',100),
      nameSy: val('zzNameSy',100),
      nameY: val('zzNameY',0),
      nameLs: val('zzNameLs',-1),
      sloganTextSm: val('zzSloganTextSm',24),
      sloganTextSd: val('zzSloganTextSd',40),
      sloganWm: val('zzSloganWm',36),
      sloganHm: val('zzSloganHm',36),
      sloganWd: val('zzSloganWd',52),
      sloganHd: val('zzSloganHd',52),
      nameColor: $('zzNameColor').value, nameLed: $('zzNameLed').value, nameGlow: val('zzNameGlow',6),
      sloganColor: $('zzSloganColor').value, sloganLed: $('zzSloganLed').value, sloganGlow: val('zzSloganGlow',6),
      sloganX: val('zzSloganX'), sloganY: val('zzSloganY'), sloganImgX: val('zzSloganImgX'), sloganImgY: val('zzSloganImgY'),
      bannerExtended: $('zzBannerEstendido')?.value !== 'false',
      effectsModeMobile: $('zixEffectsMobile')?.value || current.effectsModeMobile || 'led',
      effectsModeDesktop: $('zixEffectsDesktop')?.value || current.effectsModeDesktop || 'led',
      quick: window.zixQuickData || current.quick || {},
      sloganGallery: window.zixGalleryCollect?.() || current.sloganGallery || {},
      ledTicker: window.zixLedCollect?.() || current.ledTicker || {}
    };
  }

  function fill(data={}){
    current = {...defaults, ...data};
    if($('zixEffectsMobile')) $('zixEffectsMobile').value = current.effectsModeMobile === 'original' ? 'original' : 'led';
    if($('zixEffectsDesktop')) $('zixEffectsDesktop').value = current.effectsModeDesktop === 'original' ? 'original' : 'led';
    if($('zzBannerEstendido')) $('zzBannerEstendido').value = String(current.bannerExtended !== false);
    window.zixQuickData = JSON.parse(JSON.stringify(current.quick || {}));
    $('zzLogoWm').value = current.logoWm;
    $('zzLogoHm').value = current.logoHm;
    $('zzLogoWd').value = current.logoWd;
    $('zzLogoHd').value = current.logoHd;
    for(const key of ['logoXm','logoYm','logoXd','logoYd']){
      $('zz'+key[0].toUpperCase()+key.slice(1)).value = current[key] ?? 0;
    }
    $('zzNameSm').value = current.nameSm;
    $('zzNameSd').value = current.nameSd;
    $('zzNameSx').value = current.nameSx;
    $('zzNameSy').value = current.nameSy;
    $('zzNameY').value = current.nameY;
    $('zzNameLs').value = current.nameLs;
    $('zzSloganTextSm').value = current.sloganTextSm;
    $('zzSloganTextSd').value = current.sloganTextSd;
    $('zzSloganWm').value = current.sloganWm;
    $('zzSloganHm').value = current.sloganHm;
    $('zzSloganWd').value = current.sloganWd;
    $('zzSloganHd').value = current.sloganHd;
    if($('zzNameColor')) $('zzNameColor').value = current.nameColor || 'verde-led';
    if($('zzNameGlowColor')) $('zzNameGlowColor').value = current.nameGlowColor || 'prateado';
    if($('zzNameLightEffect')) $('zzNameLightEffect').value = current.nameLightEffect || 'led-pulsante';
    if($('zzNameLightIntensity')) $('zzNameLightIntensity').value = current.nameLightIntensity ?? 10;
    if($('zzSloganColor')) $('zzSloganColor').value = current.sloganColor || 'verde-led';
    if($('zzSloganGlowColor')) $('zzSloganGlowColor').value = current.sloganGlowColor || 'prateado';
    if($('zzSloganLightEffect')) $('zzSloganLightEffect').value = current.sloganLightEffect || 'led-movimento';
    if($('zzSloganLightIntensity')) $('zzSloganLightIntensity').value = current.sloganLightIntensity ?? 10;
    for(const [key,id] of Object.entries({nameColor:'zzNameColor',nameLed:'zzNameLed',nameGlow:'zzNameGlow',sloganColor:'zzSloganColor',sloganLed:'zzSloganLed',sloganGlow:'zzSloganGlow',sloganX:'zzSloganX',sloganY:'zzSloganY',sloganImgX:'zzSloganImgX',sloganImgY:'zzSloganImgY'})){ $(id).value=current[key]; }
    renderPreview();
    if(current.logoPath) showPreviewImage('zzLogoPreviewBox', current.logoPath);
    if(current.sloganPath) showPreviewImage('zzSloganPreviewBox', current.sloganPath);
    window.zixQuickSync?.();
  }

  function fileToDataURL(file){
    return new Promise((resolve,reject)=>{
      const r = new FileReader();
      r.onload = () => resolve(String(r.result||''));
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  function showPreviewImage(boxId, src){
    const box = $(boxId);
    if(!box) return;
    box.innerHTML = '';
    const img = document.createElement('img');
    img.src = src;
    box.appendChild(img);
  }


  const colors = {original:'',white:'#ffffff',green:'#5dff62',yellow:'#ffef53',gold:'#ffd058',silver:'#e1eaf5',blue:'#49b9ff',red:'#ff6262',black:'#111827'};
  function previewLed(el,color,mode,intensity){
    const hex=colors[color]||'';
    el.style.color=hex||'';
    el.style.webkitTextFillColor=hex||'';
    el.style.backgroundImage=hex?'none':'';
    el.style.setProperty('--zz-led-shine',hex||'#66ff77');
    el.style.setProperty('--zz-led-blur',Math.max(0,Math.min(20,Number(intensity)||0))+'px');
    el.classList.toggle('zz-led-steady',mode==='steady');
    el.classList.toggle('zz-led-pulse',mode==='pulse');
    el.classList.toggle('zz-led-cycle',mode==='cycle');
    el.style.textShadow=mode==='none'?'none':'';
  }


  function colorMap(nome){
    const mapa = {
      'preto':'#111111',
      'branco':'#ffffff',
      'prateado':'#d9dee7',
      'dourado':'#f6c84c',
      'verde':'#16a34a',
      'verde-led':'#7dff61',
      'amarelo':'#ffd800',
      'azul':'#4db3ff',
      'vermelho':'#ff4d4d'
    };
    return mapa[nome] || nome || '#ffffff';
  }

  function aplicarLed(el, corTexto, corLed, efeito, intensidade){
    const txt = colorMap(corTexto);
    const led = colorMap(corLed);
    const i = Math.max(0, Math.min(20, Number(intensidade || 0)));
    el.style.color = txt;
    el.style.textShadow = 'none';
    el.style.animation = 'none';
    el.style.backgroundImage = 'none';
    el.style.webkitTextFillColor = '';
    el.style.backgroundClip = '';
    el.style.webkitBackgroundClip = '';

    if(!efeito || efeito === 'sem-luz') return;

    const brilho = Math.max(2, i);
    const sombra =
      `0 0 ${brilho}px ${led},
       0 0 ${brilho*2}px ${led},
       0 0 ${brilho*3}px ${led}`;

    if(efeito === 'luz-fixa'){
      el.style.textShadow = sombra;
      return;
    }

    if(efeito === 'led-pulsante'){
      el.style.textShadow = sombra;
      el.style.animation = 'zzPulseGlow 1.3s ease-in-out infinite';
      return;
    }

    if(efeito === 'led-movimento'){
      el.style.textShadow = sombra;
      el.style.backgroundImage = `linear-gradient(90deg, ${txt}, ${led}, ${txt})`;
      el.style.backgroundSize = '200% auto';
      el.style.webkitBackgroundClip = 'text';
      el.style.backgroundClip = 'text';
      el.style.webkitTextFillColor = 'transparent';
      el.style.animation = 'zzMoveGlow 2s linear infinite';
    }
  }

  
function renderPreview(){
    const c = collect();

    const nameText = ($('zzTextoMarca')?.value?.trim() || 'ZixLima');
    const sloganTextValue = ($('zzTextoSlogan')?.value?.trim() || 'ZixLima Anúncie Aqui');

    function setText(id, txt){
      const el = $(id);
      if(el) el.textContent = txt;
    }

    function setImg(id, src, w, h){
      const el = $(id);
      if(!el) return;
      if(src){
        el.src = src;
        el.style.display = 'block';
        el.style.objectFit = 'contain';
        el.style.maxWidth = '100%';
        el.style.maxHeight = '100%';
        el.style.minWidth = '0';
        el.style.flexShrink = '1';
      }else{
        el.removeAttribute('src');
        el.style.display = 'none';
      }
      if(w != null) el.style.width = Math.max(1, Number(w)||1) + 'px';
      if(h != null) el.style.height = Math.max(1, Number(h)||1) + 'px';
    }

    function applyNameStyle(el, fontSize){
      if(!el) return;
      el.style.fontSize = fontSize + 'px';
      el.style.transform = `translateY(${c.nameY}px) scaleX(${c.nameSx/100}) scaleY(${c.nameSy/100})`;
      el.style.letterSpacing = c.nameLs + 'px';
      aplicarLed(el, c.nameColor, c.nameGlowColor, c.nameLightEffect, c.nameLightIntensity);
      previewLed(el, c.nameColor, c.nameLed, c.nameGlow);
    }

    function applySloganStyle(el, fontSize, tx=0, ty=0){
      if(!el) return;
      el.style.fontSize = fontSize + 'px';
      el.style.lineHeight = '1.15';
      el.style.overflowWrap = 'break-word';
      el.style.transform = `translate(${tx}px,${ty}px)`;
      aplicarLed(el, c.sloganColor, c.sloganGlowColor, c.sloganLightEffect, c.sloganLightIntensity);
      previewLed(el, c.sloganColor, c.sloganLed, c.sloganGlow);
    }

    // textos
    [
      'zzTopLogoText','zzMobileLogoText',
      'zzMiniNameM','zzMiniNameD'
    ].forEach(id => setText(id, nameText));

    [
      'zzTopSloganText','zzMiniSloganTextM','zzMiniSloganTextD','zzSloganStageText'
    ].forEach(id => setText(id, sloganTextValue));

    // estilos nome
    applyNameStyle($('zzTopLogoText'), Math.max(20, c.nameSd));
    applyNameStyle($('zzMobileLogoText'), Math.max(16, c.nameSm));
    applyNameStyle($('zzMiniNameM'), Math.max(18, c.nameSm));
    applyNameStyle($('zzMiniNameD'), Math.max(24, c.nameSd));

    // estilos slogan
    applySloganStyle($('zzTopSloganText'), Math.max(18, c.sloganTextSd), c.sloganX, c.sloganY);
    applySloganStyle($('zzMiniSloganTextM'), Math.max(16, c.sloganTextSm), c.sloganX, c.sloganY);
    applySloganStyle($('zzMiniSloganTextD'), Math.max(18, c.sloganTextSd), c.sloganX, c.sloganY);
    applySloganStyle($('zzSloganStageText'), Math.max(20, c.sloganTextSd), c.sloganX, c.sloganY);

    // imagens logo
    const logoSrc = pendingLogo || current.logoPath || '';
    setImg('zzTopLogoImg', logoSrc, c.logoWd, c.logoHd);
    setImg('zzMobileLogoImg', logoSrc, c.logoWm, c.logoHm);
    setImg('zzMiniLogoM', logoSrc, c.logoWm, c.logoHm);
    setImg('zzMiniLogoD', logoSrc, c.logoWd, c.logoHd);

    // imagens slogan
    const sloganSrc = pendingSlogan || current.sloganPath || '';
    setImg('zzTopSloganImg', sloganSrc, c.sloganWd, c.sloganHd);
    setImg('zzMobileSloganImg', sloganSrc, Math.max(72, c.sloganWm), Math.max(32, c.sloganHm));
    setImg('zzMiniSloganImgM', sloganSrc, c.sloganWm, c.sloganHm);
    setImg('zzMiniSloganImgD', sloganSrc, c.sloganWd, c.sloganHd);
    setImg('zzSloganStageImg', sloganSrc, Math.max(46, c.sloganWd), Math.max(46, c.sloganHd));

    // deslocamentos imagem slogan
    const tsi = $('zzTopSloganImg');
    if(tsi) tsi.style.transform = `translate(${c.sloganImgX}px,${c.sloganImgY}px)`;
    const msi = $('zzMobileSloganImg');
    if(msi) msi.style.transform = `translate(${c.sloganImgX}px,${c.sloganImgY}px)`;
    const sm = $('zzMiniSloganImgM');
    if(sm) sm.style.transform = `translate(${c.sloganImgX}px,${c.sloganImgY}px)`;
    const sd = $('zzMiniSloganImgD');
    if(sd) sd.style.transform = `translate(${c.sloganImgX}px,${c.sloganImgY}px)`;
    const ss = $('zzSloganStageImg');
    if(ss) ss.style.transform = `translate(${c.sloganImgX}px,${c.sloganImgY}px)`;
    const wrap = $('zzSloganStageWrap');
    if(wrap){
      wrap.classList.remove('is-none','is-steady','is-pulse','is-cycle');
      wrap.classList.add('is-'+(c.sloganLed||'none'));
    }
    window.zixQuickRender?.();
  }


  async function request(path, opts={}){
    const token = $('zzToken')?.value?.trim();
    if(!token) throw new Error('Informe o token GitHub.');
    const r = await fetch('https://api.github.com/repos/' + repo + path, {
      ...opts,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: 'Bearer ' + token,
        'X-GitHub-Api-Version': '2022-11-28',
        ...(opts.headers || {})
      }
    });
    const data = await r.json().catch(()=>({}));
    if(!r.ok){
      const e = new Error('HTTP ' + r.status + ': ' + (data.message || 'Erro GitHub'));
      e.status = r.status;
      throw e;
    }
    return data;
  }

  async function putTextFile(path, text, message){
    let sha = null;
    try{
      const old = await request('/contents/' + path);
      sha = old.sha;
    }catch(e){
      if(e.status !== 404) throw e;
    }

    const bytes = new TextEncoder().encode(text);
    let bin = '';
    for(const b of bytes) bin += String.fromCharCode(b);

    const payload = {
      message,
      content: btoa(bin),
      branch: 'main'
    };
    if(sha) payload.sha = sha;

    await request('/contents/' + path, {
      method:'PUT',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
  }

  async function putBinaryFile(path, base64Content, message){
    let sha = null;
    try{
      const old = await request('/contents/' + path);
      sha = old.sha;
    }catch(e){
      if(e.status !== 404) throw e;
    }

    const payload = {
      message,
      content: base64Content,
      branch: 'main'
    };
    if(sha) payload.sha = sha;

    await request('/contents/' + path, {
      method:'PUT',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
  }

  async function saveVisualBrand(){
    const btn = $('zzSalvarMarcaGithub');
    const logoFile = $('zzLogoFile')?.files?.[0];
    const sloganFile = $('zzSloganFile')?.files?.[0];

    try{
      btn.disabled = true;
      msg('Enviando personalização visual...');

      if(logoFile){
        const dataUrl = await fileToDataURL(logoFile);
        const base64 = dataUrl.split(',')[1];
        await putBinaryFile('assets/zixlima-logo-topo-custom.png', base64, 'Atualizar logo do topo pelo Admin');
        current.logoPath = './assets/zixlima-logo-topo-custom.png';
      }

      if(sloganFile){
        const dataUrl = await fileToDataURL(sloganFile);
        const base64 = dataUrl.split(',')[1];
        await putBinaryFile('assets/zixlima-slogan-icone-custom.png', base64, 'Atualizar icone do slogan pelo Admin');
        current.sloganPath = './assets/zixlima-slogan-icone-custom.png';
      }

      // Confere programação LED antes de publicar outros ajustes.
      window.zixLedValidate?.();
      // Valida e envia apenas as novas fotos antes de gravar a programação.
      window.zixGalleryValidate?.();
      await window.zixGalleryUploadPending?.(putBinaryFile);
      const settings = collect();
      settings.logoPath = current.logoPath || '';
      settings.sloganPath = current.sloganPath || '';

      // Mesma fonte de textos da página principal; preserva contatos públicos atuais.
      const nome = $('zzTextoMarca').value.trim();
      const slogan = $('zzTextoSlogan').value.trim();
      if(nome.length>60 || slogan.length>160){
        throw new Error('Nome até 60 e slogan até 160 caracteres.');
      }
      const existing = await request('/contents/site-settings.json');
      const bytes = Uint8Array.from(atob(existing.content.replace(/\s/g,'')), ch=>ch.charCodeAt(0));
      const siteSettings = JSON.parse(new TextDecoder().decode(bytes));
      siteSettings.nome = nome;
      siteSettings.slogan = slogan;
      await putTextFile('site-settings.json', JSON.stringify(siteSettings,null,2)+'\n', 'Atualizar textos da marca pelo Admin');
      // Mantém o editor de medidas/fotos no arquivo visual já existente.
      await putTextFile(
        'site-brand-settings.json',
        JSON.stringify(settings, null, 2) + '\n',
        'Atualizar editor visual da marca pelo Admin'
      );

      // ZIX_GITHUB_SAVE_VERIFICATION_V1
      // GitHub Contents PUT retorna sucesso antes da implantacao do Pages.
      // Confere o arquivo de configuracoes na API para distinguir gravacao de cache.
      msg('Gravação enviada. Verificando configuração no GitHub...');
      const confirmed = await request('/contents/site-brand-settings.json?ref=main&t=' + Date.now());
      if(!confirmed.content){throw new Error('Gravado, mas resposta de verificação sem conteúdo. Verifique o GitHub.');}
      const raw = Uint8Array.from(atob(confirmed.content.replace(/\s/g,'')), ch=>ch.charCodeAt(0));
      const stored = JSON.parse(new TextDecoder().decode(raw));
      const expected = JSON.stringify(settings);
      if(JSON.stringify(stored) !== expected){
        throw new Error('Gravação não confirmada: configuração diferente no GitHub. Atualize e tente novamente.');
      }
      msg('Confirmado no GitHub! As configurações foram gravadas. Aguarde o Pages atualizar.', true);
    }catch(e){
      msg('Falha: ' + e.message, false);
    }finally{
      btn.disabled = false;
    }
  }

  // ZIX_IMAGE_ONLY_SAVE_20261018
  // Mantem dados de texto/LED do repositorio; grava somente campos de imagem e novas fotos.
  async function saveImagesOnly(){
    const btn=$('zzSalvarImagensGithub');
    if(!btn)return;
    const logoFile=$('zzLogoFile')?.files?.[0]||null;
    const photoFile=$('zzSloganFile')?.files?.[0]||null;
    btn.disabled=true;
    try{
      msg('Salvando apenas fotos, tamanhos e posicoes no GitHub...');
      const res=await request('/contents/site-brand-settings.json?ref=main&t='+Date.now());
      if(!res.content)throw new Error('Arquivo de configuracao sem conteudo no GitHub');
      const raw=Uint8Array.from(atob(res.content.replace(/\s/g,'')), c=>c.charCodeAt(0));
      const remote=JSON.parse(new TextDecoder().decode(raw));
      // Nao sobrescreve nome, slogan, cores ou LEDs ja publicados.
      const local=collect();
      const fields=['logoWm','logoHm','logoWd','logoHd','logoXm','logoYm','logoXd','logoYd',
                    'sloganWm','sloganHm','sloganWd','sloganHd','sloganImgX','sloganImgY'];
      for(const k of fields){if(Object.hasOwn(local,k))remote[k]=local[k];}
      remote.quick=remote.quick||{};
      const localQuick=local.quick||{};
      for(const d of ['mobile','desktop']){
        remote.quick[d]=remote.quick[d]||{};
        for(const target of ['logo','photo']){
          if(localQuick[d]?.[target]){
            const prev=remote.quick[d][target]||{};
            const next=localQuick[d][target];
            remote.quick[d][target]={...prev,
              x:Number(next.x)||0,y:Number(next.y)||0,size:Number(next.size)||0,
              widthDelta:Number(next.widthDelta)||0,heightDelta:Number(next.heightDelta)||0};
          }
        }
      }
      // Confere tipos e tamanho antes de tentar atualizar imagens publicas.
      for(const [file,descr] of [[logoFile,'logotipo'],[photoFile,'imagem do slogan']]){
        if(!file)continue;
        if(!['image/jpeg','image/png','image/webp'].includes(file.type))
          throw new Error('A '+descr+' precisa ser JPG, PNG ou WebP');
        if(file.size>8*1024*1024)throw new Error('A '+descr+' deve ter ate 8 MB');
      }
      if(logoFile){
        const b64=(await fileToDataURL(logoFile)).split(',')[1];
        await putBinaryFile('assets/zixlima-logo-topo-custom.png',b64,'Atualizar imagem da marca pelo Admin');
        remote.logoPath='./assets/zixlima-logo-topo-custom.png';current.logoPath=remote.logoPath;
      }
      if(photoFile){
        const b64=(await fileToDataURL(photoFile)).split(',')[1];
        await putBinaryFile('assets/zixlima-slogan-icone-custom.png',b64,'Atualizar foto do slogan pelo Admin');
        remote.sloganPath='./assets/zixlima-slogan-icone-custom.png';current.sloganPath=remote.sloganPath;
      }
      await putTextFile('site-brand-settings.json',JSON.stringify(remote,null,2)+'\n','Atualizar apenas imagens e medidas da marca');
      const check=await request('/contents/site-brand-settings.json?ref=main&t='+Date.now());
      const bin=Uint8Array.from(atob(check.content.replace(/\s/g,'')), c=>c.charCodeAt(0));
      const confirmed=JSON.parse(new TextDecoder().decode(bin));
      if(JSON.stringify(confirmed)!==JSON.stringify(remote))throw new Error('Gravacao enviada, mas diferiu na verificacao');
      msg('Imagens e medidas confirmadas no GitHub. As letras e efeitos LED nao foram modificados. Aguarde o Pages atualizar.',true);
    }catch(e){msg('Falha ao salvar imagens: '+e.message,false)}
    finally{btn.disabled=false;}
  }

  function setupFilePreviews(){
    const logoInput = $('zzLogoFile');
    const sloganInput = $('zzSloganFile');

    logoInput?.addEventListener('change', async e => {
      const f = e.target.files?.[0];
      if(!f) return;
      const dataUrl = await fileToDataURL(f);
      showPreviewImage('zzLogoPreviewBox', dataUrl);
      pendingLogo = dataUrl;
      renderPreview();
    });

    sloganInput?.addEventListener('change', async e => {
      const f = e.target.files?.[0];
      if(!f) return;
      const dataUrl = await fileToDataURL(f);
      showPreviewImage('zzSloganPreviewBox', dataUrl);
      pendingSlogan = dataUrl;
      renderPreview();
    });
  }

  function setupPreview(){
    ids.forEach(id => $(id)?.addEventListener('input', renderPreview));
    $('zzTextoMarca')?.addEventListener('input', renderPreview);
    $('zzTextoSlogan')?.addEventListener('input', renderPreview);
    $('zzAplicarMarcaPreview')?.addEventListener('click', renderPreview);
  }

  function restoreDefaults(){
    current = {...defaults, logoPath:'', sloganPath:''};
    pendingLogo = '';
    pendingSlogan = '';
    $('zzLogoFile').value = '';
    $('zzSloganFile').value = '';
    $('zzLogoPreviewBox').textContent = 'Sem logo selecionado';
    $('zzSloganPreviewBox').textContent = 'Sem imagem do slogan';
    ['zzMiniLogoM','zzMiniLogoD','zzMiniSloganImgM','zzMiniSloganImgD'].forEach(id=>{
      const img=$(id); if(img){img.removeAttribute('src');img.style.display='none';}
    });
    fill(current);
    $('zzTextoMarca').value='ZixLima';
    $('zzTextoSlogan').value='ZixLima Anúncie Aqui';
    renderPreview();
    msg('Medidas e textos padrão restaurados na prévia. Clique em salvar para publicar.', true);
  }

  function setupPasswordEye(){
    const btn = $('zzToggleSenhaLogin');
    const inp = $('senha');
    if(btn && inp){
      btn.addEventListener('click', ()=>{
        const visivel = inp.type === 'text';
        inp.type = visivel ? 'password' : 'text';
        btn.textContent = visivel ? '👁️' : '🙈';
      });
    }

    const chk = $('zixSenhaAdminMostrar');
    const n1 = $('zixSenhaAdminNova');
    const n2 = $('zixSenhaAdminConfirma');
    if(chk && n1 && n2){
      chk.addEventListener('change', ()=>{
        const t = chk.checked ? 'text' : 'password';
        n1.type = t;
        n2.type = t;
      });
    }
  }

  async function loadSaved(){
    try{
      const r = await fetch('./site-brand-settings.json?ts=' + Date.now(), {cache:'no-store'});
      if(!r.ok) throw new Error('sem arquivo');
      const data = await r.json();
      fill(data);
      pendingLogo = '';
      pendingSlogan = '';
      renderPreview();
    }catch{
      fill(defaults);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    if(!$('zzixbrConfig')) return;
    setupPasswordEye();
    setupFilePreviews();
    setupPreview();
    $('zzRestaurarMarca')?.addEventListener('click', restoreDefaults);
    fetch('./site-settings.json?ts='+Date.now(),{cache:'no-store'})
      .then(r=>r.ok?r.json():Promise.reject(new Error('Arquivo de textos ausente')))
      .then(c=>{
        if(typeof c.nome==='string') $('zzTextoMarca').value=c.nome;
        if(typeof c.slogan==='string') $('zzTextoSlogan').value=c.slogan;
        renderPreview();
      }).catch(()=>{});
    $('zzSalvarMarcaGithub')?.addEventListener('click', saveVisualBrand);
    $('zzSalvarImagensGithub')?.addEventListener('click', saveImagesOnly);
    loadSaved();
  });
})();

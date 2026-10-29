/* ZixLima IA — Balões e Downloads */
const ZixDownloads = (() => {
  function baixar(nome, conteudo, tipo = 'text/plain') {
    const blob = new Blob([conteudo], {
      type: tipo + ';charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nome;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }

  function extensao(lang) {
    const tipos = {
      html: 'html',
      css: 'css',
      javascript: 'js',
      js: 'js',
      typescript: 'ts',
      python: 'py',
      sql: 'sql',
      bash: 'sh',
      json: 'json'
    };
    return tipos[lang.toLowerCase()] || 'txt';
  }

  function criarBalao(codigo, linguagem = 'html') {
    const painel = document.createElement('section');
    painel.className = 'zix-code-panel';

    const topo = document.createElement('div');
    topo.className = 'zix-code-top';

    const titulo = document.createElement('strong');
    titulo.textContent = linguagem.toUpperCase();
    topo.appendChild(titulo);

    const copiar = document.createElement('button');
    copiar.type = 'button';
    copiar.textContent = 'Copiar';
    copiar.onclick = async () => {
      await navigator.clipboard.writeText(codigo);
      copiar.textContent = 'Copiado!';
    };

    const baixarBtn = document.createElement('button');
    baixarBtn.type = 'button';
    baixarBtn.textContent = 'Baixar arquivo';
    baixarBtn.onclick = () => {
      const ext = extensao(linguagem);
      const nome = ext === 'html'
        ? 'index.html'
        : 'codigo.' + ext;
      baixar(nome, codigo);
    };

    const zipBtn = document.createElement('button');
    zipBtn.type = 'button';
    zipBtn.textContent = 'Baixar ZIP';
    zipBtn.onclick = async () => {
      if (typeof JSZip === 'undefined') {
        alert('Biblioteca JSZip ainda não carregada.');
        return;
      }
      const zip = new JSZip();
      const ext = extensao(linguagem);
      zip.file(
        ext === 'html' ? 'index.html' : 'codigo.' + ext,
        codigo
      );
      const arquivo = await zip.generateAsync({
        type: 'blob'
      });
      const url = URL.createObjectURL(arquivo);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'zixlima-projeto.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    };

    topo.append(copiar, baixarBtn, zipBtn);

    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.textContent = codigo;
    pre.appendChild(code);

    painel.append(topo, pre);
    return painel;
  }

  return { baixar, criarBalao };
})();

window.ZixDownloads = ZixDownloads;

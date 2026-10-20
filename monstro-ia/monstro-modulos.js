(()=>{
'use strict';
const core=window.zixMonstroBridge;
if(!core)return;
const $=id=>document.getElementById(id);
const menu=document.querySelector('.tabs');
const main=document.querySelector('main');
function addPane(id,button,markup){
 const b=document.createElement('button');b.dataset.tab=id;b.textContent=button;menu.append(b);
 const sec=document.createElement('section');sec.dataset.pane=id;sec.className='hidden';sec.innerHTML=markup;main.append(sec);
 b.addEventListener('click',()=>core.activate(id));
 return sec;
}
addPane('termux','🛠️ Termux PRO',`
 <div class="card"><h2>🛠️ Engenheiro de código para Termux</h2>
 <p class="hint">O MONSTRO usa o modelo de IA conectado para propor scripts Bash. Revise antes de executar. Ele não possui acesso direto ao celular, não instala automaticamente nem conhece seu repositório até você informar.</p>
 <label for="tmTask">Descreva a melhoria ou o erro</label><textarea id="tmTask" placeholder="Ex.: O layout desktop do meu site está desalinhado. Gere uma correção segura para Termux com backup e verificação antes de git push."></textarea>
 <div class="row"><button class="primary" id="tmGenerate">👾 Gerar correção com IA</button><button id="tmImport">Puxar último script da conversa</button></div>
 <label for="tmCode">Script para inspecionar (não é executado)</label><textarea id="tmCode" spellcheck="false" style="font:13px ui-monospace,monospace;min-height:290px" placeholder="O script gerado aparece aqui depois de importar a resposta."></textarea>
 <div class="row"><button id="tmInspect">🔎 Examinar riscos</button><button id="tmDownload">⬇ Baixar .sh</button><button id="tmCopy">📋 Copiar</button></div>
 <p class="stat" id="tmStatus" role="status"></p>
 <p class="warn tiny">Os níveis Instantâneo/Médio/Alto/Monstro são instruções de análise, não garantias de qualidade. Nenhum verificador automático substitui a leitura humana. Nunca cole tokens ou senhas no chat.</p></div>`);
addPane('apk','📱 APK Studio',`
 <div class="card"><h2>📱 Estúdio HTML → Projeto Android</h2>
 <p>Converta um site ou aplicação HTML em um <b>projeto Android Studio com WebView</b>, que poderá ser compilado em APK num computador com Java, Android Studio/SDK e Gradle. O pacote inclui o gerador <code>criar_projeto_apk.py</code>.</p>
 <p class="warn tiny">O MONSTRO não gera um APK final dentro do navegador e não converte automaticamente aplicativos Windows, EXE ou programas em outras linguagens. Recursos nativos complexos exigem adaptação e permissões específicas.</p>
 <label for="apkTitle">Nome do aplicativo</label><input id="apkTitle" value="Meu Aplicativo">
 <label for="apkPackage">Identificador Android</label><input id="apkPackage" value="br.com.exemplo.meuapp" pattern="[a-zA-Z][a-zA-Z0-9_]*(\\.[a-zA-Z][a-zA-Z0-9_]*)+">
 <label for="apkHtml">Selecione a página HTML principal</label><input type="file" id="apkHtml" accept=".html,.htm,text/html">
 <div class="row"><button class="primary" id="apkSave">⬇ Preparar HTML para projeto</button><button id="apkPrompt">👾 Pedir plano Android à IA</button></div>
 <p class="stat" id="apkStatus" role="status"></p>
 <p class="hint">Termux/Linux: <code>python criar_projeto_apk.py index.html --nome "Meu App" --pacote br.com.exemplo.meuapp</code><br>Windows: <code>py criar_projeto_apk.py index.html --nome "Meu App" --pacote br.com.exemplo.meuapp</code><br>Depois abra o ZIP gerado no Android Studio. Não coloque senhas ou chaves privadas no HTML.</p></div>`);
addPane('aparelho','🔐 Meu celular',`
 <div class="card"><h2>🔐 Recuperação legítima do próprio celular</h2>
 <p><b>Se você sabe a senha atual:</b> altere-a nas Configurações do aparelho, na seção de bloqueio de tela/segurança.</p>
 <p><b>Se esqueceu o PIN/padrão/senha:</b> não existe uma função universal de HTML ou Termux que possa removê-lo com segurança. Consulte os métodos oficiais da fabricante e do Google, para o aparelho de sua propriedade.</p>
 <p><b>Antes de redefinir o dispositivo:</b> verifique backup das fotos e arquivos, acesso à conta Google/Samsung e opções de recuperação. Uma restauração de fábrica pode apagar dados e exigir o login na conta anterior após o reinício (proteção FRP).</p>
 <div class="row"><a href="https://support.google.com/android/" target="_blank" rel="noopener noreferrer">Ajuda oficial Android</a><a href="https://support.google.com/accounts/" target="_blank" rel="noopener noreferrer">Recuperar conta Google</a><a href="https://www.samsung.com/br/support/" target="_blank" rel="noopener noreferrer">Suporte Samsung</a></div>
 <p class="hint">Nenhuma operação de desbloqueio ou redefinição é executada por esta ferramenta. Não compartilhe seu PIN, senha Google ou códigos de verificação.</p></div>`);
const riskPatterns=[
 [/\brm\s+(-\w*r\w*\s+)?(-\w*f\w*\s+)?\//i,'Comando de exclusão em caminho absoluto'],
 [/(?:curl|wget)[^\n|]*\|\s*(?:ba)?sh\b/i,'Baixar e executar código remoto'],
 [/\b(?:mkfs(?:\.[\w]+)?|fdisk|parted|wipefs)\b/i,'Manipulação de partições/discos'],
 [/\bdd\s+if=|\bdd\s+of=/i,'Gravação bruta em dispositivo'],
 [/git\s+(?:push\s+[^\n]*--force|reset\s+--hard|clean\s+-fd)/i,'Operação Git destrutiva'],
 [/\b(?:DROP\s+(?:TABLE|DATABASE)|TRUNCATE\s+TABLE)\b/i,'Comando SQL destrutivo'],
 [/chmod\s+(?:-R\s+)?777\b/i,'Permissões inseguras'],
 [/\bsudo\b/i,'Comando com privilégios elevados'],
 [/\b(?:eval\s+|bash\s+-c\s+\$)/i,'Execução dinâmica difícil de auditar']
];
function cleanName(name){return String(name||'arquivo').replace(/[^\w.\-]/g,'_').slice(0,120)}
function download(name,content,type='text/plain;charset=utf-8'){
 const u=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a');a.download=cleanName(name);a.href=u;a.click();setTimeout(()=>URL.revokeObjectURL(u),3000);
}
$('tmGenerate').onclick=()=>{
 const t=$('tmTask').value.trim();if(!t)return $('tmStatus').textContent='Descreva primeiro o problema.';
 core.activate('chat');
 core.send('Atue como engenheiro sênior de Termux/Android e manutenção de projetos web. Produza UMA SOLUÇÃO SEGURA para a tarefa abaixo. Explique as hipóteses e diferenças entre Termux e Linux. Se for apropriado gerar script, use exatamente UM bloco ```bash com script instalador completo, Bash compatível com Termux, checagens de dependências, cópia de segurança, set -euo pipefail, e verificações de sintaxe antes de alterar arquivos. Não apague dados, não force push, não invente caminhos ou tokens e não execute nada automaticamente. Solicite arquivos necessários quando o contexto for insuficiente. TAREFA: '+t);
};
$('tmImport').onclick=()=>{
 const replies=core.project().messages.filter(x=>x.role==='assistant');const latest=replies.at(-1)?.content||'';
 const match=latest.match(/```(?:bash|sh|shell)\s*\n([\s\S]*?)```/i);
 if(!match)return $('tmStatus').textContent='A última resposta não contém um bloco ```bash. Peça à IA um script completo ou cole manualmente.';
 $('tmCode').value=match[1].trim()+'\n';$('tmStatus').textContent='Script importado. Faça inspeção antes de executar.';
};
$('tmInspect').onclick=()=>{
 const t=$('tmCode').value;if(!t.trim())return $('tmStatus').textContent='Nenhum script para examinar.';
 const hits=riskPatterns.filter(([re])=>re.test(t)).map(([,message])=>message);
 $('tmStatus').textContent=hits.length?'⚠️ Atenção: '+hits.join('; ')+'. Revisão manual obrigatória.':'Nenhum padrão perigoso comum encontrado. Isso NÃO garante segurança; revise todo o script antes de executar.';
};
$('tmDownload').onclick=()=>{if(!$('tmCode').value.trim())return;$('tmInspect').click();download('zixlima-correcao-termux.sh',$('tmCode').value)};
$('tmCopy').onclick=async()=>{try{await navigator.clipboard.writeText($('tmCode').value);$('tmStatus').textContent='Código copiado; analise antes de executar.'}catch{$('tmStatus').textContent='Não foi possível copiar; selecione manualmente.'}};
$('apkSave').onclick=async()=>{const f=$('apkHtml').files?.[0];if(!f)return $('apkStatus').textContent='Selecione um HTML primeiro.';if(f.size>3e6)return $('apkStatus').textContent='HTML acima do limite de 3 MB. Use o gerador Python diretamente.';download('app-para-conversao.html',await f.text(),'text/html;charset=utf-8');$('apkStatus').textContent='HTML salvo. Extraia o ZIP completo do MONSTRO, renomeie o HTML para index.html e execute criar_projeto_apk.py na mesma pasta.';};
$('apkPrompt').onclick=()=>{core.activate('chat');core.send('Desenhe um plano para transformar a aplicação HTML em aplicativo Android com Android Studio, Kotlin ou Java e WebViewAssetLoader. Explique recursos que não funcionarão em WebView e como testar, permissões, assinatura, SDK, Gradle e segurança. Não prometa APK pronto sem ambiente Android de compilação. Nome: '+$('apkTitle').value+'; ID: '+$('apkPackage').value)};
})();

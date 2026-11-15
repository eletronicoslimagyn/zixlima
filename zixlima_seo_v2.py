from pathlib import Path
from html import escape
from datetime import date
import re, shutil, sys

root=Path.cwd()
page=root/'curiosidades'/'index.html'
if not page.is_file():
    sys.exit('ERRO: execute na pasta que contem curiosidades/index.html')
source=page.read_text(encoding='utf-8')
if 'id="busca"' not in source or 'class="category"' not in source:
    sys.exit('ERRO: estrutura inesperada; nada alterado')

articles=[
('informática','Como deixar o computador mais rápido','Feche programas que iniciam automaticamente, confira o espaço livre no disco e instale atualizações do sistema. Se o computador usa HD, trocar por SSD costuma melhorar bastante a abertura de programas. Antes de comprar peças, verifique a compatibilidade e faça backup dos arquivos.'),
('celulares','Como cuidar da bateria do celular','Evite calor excessivo, use carregadores confiáveis e mantenha o sistema atualizado. Ative os recursos de proteção de bateria disponíveis no aparelho. Não é necessário descarregar a bateria até zero para carregá-la.'),
('celulares','Como liberar espaço no celular','Confira o armazenamento nas configurações e identifique vídeos, downloads e aplicativos que ocupam mais espaço. Faça backup dos arquivos importantes antes de excluir qualquer conteúdo. Limpe arquivos temporários pelos recursos do sistema e evite aplicativos desconhecidos que prometem limpeza milagrosa.'),
('empreendedorismo','Como atender clientes pelo WhatsApp','Configure o perfil comercial com horário, descrição e catálogo atualizado. Use mensagens de saudação e respostas rápidas sem perder a personalização. Informe preços, prazos e condições com clareza e peça autorização antes de enviar mensagens promocionais.'),
('segurança-digital','Como reconhecer mensagens fraudulentas','Desconfie de links encurtados, pedidos urgentes de pagamento e solicitações de códigos recebidos por SMS. Entre no aplicativo ou site oficial por conta própria, sem usar o link da mensagem. Nunca compartilhe senhas ou códigos de verificação.'),
('informática','SSD ou HD: qual a diferença?','SSD armazena dados em memória flash e costuma oferecer inicialização e abertura de aplicativos mais rápidas. HD utiliza discos magnéticos e frequentemente custa menos por gigabyte. Para escolher, compare capacidade, compatibilidade, garantia e preço.'),
]

def slug(s):
    import unicodedata
    s=unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower()
    return re.sub('-+','-',re.sub('[^a-z0-9]+','-',s)).strip('-')

# Arquivos de segurança: backup sem sobrescrever
backup=page.with_name('index.html.pre-v2.bak')
if not backup.exists(): shutil.copy2(page,backup)

# Corrige a busca: ao encontrar resultados, abre os detalhes relevantes.
# Usa replace apenas na primeira ocorrencia do trecho JS original.
old="cats.forEach(c=>c.classList.remove('match'));let found=[];"
new="cats.forEach(c=>c.classList.remove('match'));let found=[];"
if old not in source:
    sys.exit('ERRO: busca nao reconhecida; nada alterado')
# Insere abertura apos o loop de artigos, sem mudar o comportamento do botao expandir.
needle="out.replaceChildren();if(!q)"
replacement="if(q){cats.forEach(c=>{if(c.classList.contains('match'))c.querySelector('details').open=true})}out.replaceChildren();if(!q)"
if needle not in source:
    sys.exit('ERRO: script nao reconhecido; nada alterado')
source=source.replace(needle,replacement,1)
# Garante que o link direto abra a categoria correta.
anchor_js="<script>window.addEventListener('DOMContentLoaded',()=>{const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(target){const details=target.closest('details');if(details)details.open=true}});window.addEventListener('hashchange',()=>{const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(target){const details=target.closest('details');if(details)details.open=true}});</script>"
source=source.replace('</body>',anchor_js+'</body>',1)

links=[]
for cat,title,body in articles:
    path=root/'curiosidades'/slug(title)/'index.html'
    path.parent.mkdir(parents=True,exist_ok=True)
    url='https://zixlima.com.br/curiosidades/'+slug(title)+'/'
    desc=body[:155]
    html=f'''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="index,follow"><link rel="canonical" href="{url}"><title>{escape(title)} | ZixLima</title><meta name="description" content="{escape(desc,quote=True)}"><style>body{{margin:0;background:#081225;color:#f0f5ff;font:17px/1.8 system-ui,sans-serif}}main{{max-width:780px;margin:auto;padding:30px 20px}}a{{color:#7de0d4}}h1{{line-height:1.2}}article{{background:#111f38;border:1px solid #2c4265;border-radius:18px;padding:24px}}p{{color:#d2e2f5}}</style><script type="application/ld+json">{{"@context":"https://schema.org","@type":"Article","headline":"{escape(title)}","inLanguage":"pt-BR","mainEntityOfPage":"{url}","publisher":{{"@type":"Organization","name":"ZixLima"}}}}</script></head><body><main><nav><a href="/">ZixLima</a> · <a href="/curiosidades/">Todas as curiosidades</a></nav><article><p>{escape(cat.replace('-',' ').title())}</p><h1>{escape(title)}</h1><p>{escape(body)}</p><h2>O que observar antes de agir?</h2><p>Verifique as informações no manual ou no suporte oficial do fabricante ou serviço. Antes de mudanças importantes, preserve seus dados e avalie suas necessidades.</p></article><p><a href="/curiosidades/">← Voltar para a biblioteca</a></p></main></body></html>'''
    if not path.exists(): path.write_text(html,encoding='utf-8')
    links.append((title,url))

# Adiciona secao discreta com links para artigos individuais.
section='<section aria-label="Guias completos" style="margin:30px 0;padding:22px;border:1px solid #2c4265;border-radius:16px;background:#111f38"><h2>Guias práticos</h2><p class="muted">Explore artigos com endereço próprio.</p><ul>'+''.join(f'<li><a href="{url}">{escape(title)}</a></li>' for title,url in links)+'</ul></section>'
source=source.replace('<aside class="zix"',section+'<aside class="zix"',1)
page.write_text(source,encoding='utf-8')

sitemap=root/'sitemap.xml'
if sitemap.exists():
    xml=sitemap.read_text(encoding='utf-8')
    if '</urlset>' in xml:
        for _,url in links:
            if url not in xml:
                xml=xml.replace('</urlset>',f'  <url><loc>{url}</loc></url>\n</urlset>',1)
        sitemap.write_text(xml,encoding='utf-8')
    else:
        print('AVISO: sitemap nao tem </urlset>; nao foi modificado')
print('OK: busca corrigida, 6 artigos individuais e links criados. Nada publicado.')

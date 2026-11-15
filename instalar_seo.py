from pathlib import Path
import shutil
from datetime import datetime
root=Path(__file__).resolve().parent
site=Path.cwd()
if not (site/'index.html').is_file():
    raise SystemExit('ERRO: execute na pasta do repositorio ZixLima (com index.html).')
backup=site/('backup-seo-'+datetime.now().strftime('%Y%m%d-%H%M%S'))
backup.mkdir()
for f in ['index.html','sitemap.xml']:
    if (site/f).exists():shutil.copy2(site/f,backup/f)
(site/'curiosidades').mkdir(exist_ok=True)
# shutil.copy2(root/'curiosidades/index.html',site/'curiosidades/index.html')
p=site/'index.html';s=p.read_text(encoding='utf-8')
if 'href="/curiosidades/"' not in s:
    link='<a href="/curiosidades/" style="display:inline-block;padding:12px 18px;margin:12px;border-radius:12px;background:#123d73;color:#fff;font-weight:700;text-decoration:none">✦ Curiosidades de tecnologia e IA</a>'
    if '</body>' not in s:raise SystemExit('HTML principal sem fechamento body; alteracao interrompida')
    s=s.replace('</body>', '<div style="text-align:center" id="acesso-curiosidades">'+link+'</div>\n</body>',1)
    p.write_text(s,encoding='utf-8')
p=site/'sitemap.xml'
s=p.read_text(encoding='utf-8') if p.exists() else '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>'
if 'https://zixlima.com.br/curiosidades/' not in s:
    s=s.replace('</urlset>','  <url><loc>https://zixlima.com.br/curiosidades/</loc></url>\n</urlset>')
    p.write_text(s,encoding='utf-8')
print('OK: pagina de curiosidades, link na home e sitemap atualizados. Backup:',backup)

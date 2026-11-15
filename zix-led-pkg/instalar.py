from pathlib import Path
import shutil
root=Path.home()/'zixlima'
page=root/'curiosidades'/'index.html'
if not page.is_file():
 raise SystemExit('ERRO: arquivo curiosidades/index.html não encontrado em ~/zixlima')
here=Path(__file__).resolve().parent
for filename in ('fundo-tecnologico.png','zix-led.css','zix-led.js'):
 shutil.copyfile(here/filename,root/'curiosidades'/filename)
s=page.read_text(encoding='utf-8')
css='<link rel="stylesheet" href="/curiosidades/zix-led.css?v=2">'
js='<script defer src="/curiosidades/zix-led.js?v=2"></script>'
if 'zix-led.css' not in s:
 if '</head>' not in s:raise SystemExit('ERRO: tag </head> não encontrada')
 s=s.replace('</head>',css+'\n</head>',1)
if 'zix-led.js' not in s:
 if '</body>' not in s:raise SystemExit('ERRO: tag </body> não encontrada')
 s=s.replace('</body>',js+'\n</body>',1)
page.write_text(s,encoding='utf-8')
print('OK: fundo azul e linhas LED instalados. Conteúdo original preservado.')

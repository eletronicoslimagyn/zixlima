from pathlib import Path
p=Path('curiosidades/index.html')
if not p.exists():
 raise SystemExit('Execute na pasta ~/zixlima')
s=p.read_text(encoding='utf-8')
if 'zix-galeria-2026.css' in s:
 print('Galeria ja instalada');raise SystemExit(0)
css='''
.zix-gallery{margin:30px 0}.zix-gallery h2{color:#173d2c}.zix-photo-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:15px}.zix-photo-card{background:#fffefa;border:1px solid #d0dad1;border-radius:16px;overflow:hidden;box-shadow:0 3px 12px #163b2417}.zix-photo-card img{width:100%;height:170px;object-fit:cover;display:block}.zix-photo-card div{padding:15px}.zix-photo-card h3{margin:0 0 7px;font-size:1.1rem;color:#123a27}.zix-photo-card p{margin:0 0 12px;color:#334b40;font-size:.94rem}.zix-photo-card a{display:inline-block;background:#087448;color:white!important;padding:8px 12px;border-radius:9px;text-decoration:none;font-weight:750}.zix-article{background:#fffefa;color:#233e30;border:1px solid #d0dad1;border-radius:14px;padding:16px;margin:12px 0}.zix-article summary{cursor:pointer;font-weight:800;font-size:1.1rem}.zix-article p{color:#304b3c}.zix-article a{color:#087448}@media(max-width:760px){.zix-photo-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.zix-photo-card img{height:125px}}@media(max-width:480px){.zix-photo-grid{grid-template-columns:1fr}.zix-photo-card img{height:190px}}
'''
Path('curiosidades/zix-galeria-2026.css').write_text(css,encoding='utf-8')
photo=lambda id:'https://images.unsplash.com/'+id+'?auto=format&fit=crop&w=720&q=78'
items=[
('História dos computadores','Do ENIAC aos computadores atuais.','photo-1518770660439-4636190af475','historia'),
('Padrão de rede Furukawa','Cabeamento estruturado, conectores e boas práticas.','photo-1558494949-ef010cbdcc31','furukawa'),
('Tudo sobre USB-C','O mesmo conector pode ter velocidades e potências diferentes.','photo-1583863788434-e58a36330cf0','usbc'),
('Como limpar a tela do notebook','Cuidados simples para evitar riscos e danos.','photo-1498050108023-c5249f4df085','limpeza'),
('Backup de dados','Proteja arquivos com cópias seguras e verificadas.','photo-1544197150-b99a580bb7a8','backup'),
('CPU, RAM e SSD','Entenda o papel dos componentes do computador.','photo-1518770660439-4636190af475','hardware'),
('Redes Wi-Fi','Posicionamento do roteador, interferências e segurança.','photo-1558494949-ef010cbdcc31','wifi'),
('Segurança digital','Senhas fortes e proteção contra golpes.','photo-1563013544-824ae1b704d3','seguranca'),
('Inteligência artificial','Aplicações, oportunidades e cuidados com IA.','photo-1677442136019-21780ecad995','ia')]
content={
'historia':['Na década de 1940, o ENIAC utilizava válvulas e ocupava uma grande sala. Transistores, circuitos integrados e microprocessadores reduziram o tamanho dos computadores e ampliaram suas aplicações.','A partir dos anos 1970 e 1980, os computadores pessoais se popularizaram. Hoje, smartphones, nuvem e sistemas de inteligência artificial fazem parte dessa evolução.'],
'furukawa':['Furukawa é fabricante de soluções para redes e cabeamento estruturado. Em projetos, escolha cabos, conectores, patch panels e componentes compatíveis com a categoria do sistema e as normas aplicáveis.','Os esquemas T568A e T568B especificam a ordem dos condutores nos conectores de oito posições. Para um cabo direto, use o mesmo esquema nas duas pontas. Respeite raio de curvatura, distâncias e especificações do fabricante.','Para dados oficiais de produtos e instalação, consulte a documentação em https://www.furukawalatam.com/.'],
'usbc':['USB-C define o formato do conector, mas não garante velocidade de transferência, saída de vídeo ou potência de carregamento.','Confira a compatibilidade dos aparelhos, a capacidade do cabo em Gbps e a potência em watts. Alguns cabos de alta potência precisam de identificação eletrônica.'],
'limpeza':['Desligue o notebook e desconecte o carregador. Passe um pano de microfibra limpo e macio, sem pressionar a tela.','Se necessário, umedeça levemente o pano com produto aprovado pelo fabricante. Nunca borrife líquido diretamente na tela.'],
'backup':['Mantenha cópias dos arquivos importantes em mais de um lugar, como armazenamento externo e serviço em nuvem confiável.','Automatize as cópias quando possível, proteja as contas e teste a restauração periodicamente.'],
'hardware':['A CPU executa instruções e coordena tarefas. A RAM mantém temporariamente os dados em uso; o SSD armazena arquivos mesmo quando o computador está desligado.','Antes de comprar peças, verifique compatibilidade, capacidade, interface, temperatura e garantia.'],
'wifi':['Paredes, distância e interferências podem enfraquecer o sinal Wi-Fi. Posicione o roteador em local aberto e relativamente central, evitando obstáculos metálicos.','Use criptografia moderna, senha forte e atualize o firmware quando houver versão oficial compatível.'],
'seguranca':['Use senhas longas e exclusivas e ative a autenticação em duas etapas.','Desconfie de mensagens urgentes e links inesperados; confirme endereços e remetentes antes de informar dados.'],
'ia':['A inteligência artificial pode ajudar a resumir textos, estudar e organizar informações, mas pode cometer erros.','Confira afirmações importantes em fontes confiáveis e evite enviar informações confidenciais a serviços sem avaliar suas políticas.']}
from html import escape
cards=''.join('<article class="zix-photo-card"><img loading="lazy" decoding="async" src="'+photo(img)+'" alt="Fotografia ilustrativa de '+escape(title)+'"><div><h3>'+escape(title)+'</h3><p>'+escape(desc)+'</p><a href="#zix-guia-'+key+'">Ler o guia →</a></div></article>' for title,desc,img,key in items)
articles=''.join('<details class="zix-article" id="zix-guia-'+key+'"><summary>'+escape(title)+'</summary>'+''.join('<p>'+escape(t)+'</p>' for t in content[key])+'</details>' for title,desc,img,key in items)
block='<section class="zix-gallery" aria-label="Galeria de tecnologia"><h2>📸 Guias ilustrados de tecnologia</h2><p>Fotografias ilustrativas e explicações originais para aprender mais.</p><div class="zix-photo-grid">'+cards+'</div><h2>📚 Aprenda com os guias</h2>'+articles+'<p><small>Fotografias ilustrativas fornecidas via Unsplash; disponibilidade depende do serviço externo. Informações educacionais sujeitas a atualização.</small></p></section>'
anchor='<aside class="zix" id="zix">'
if anchor not in s:raise SystemExit('Estrutura do site diferente; nenhuma alteracao no HTML')
s=s.replace(anchor,block+anchor,1)
s=s.replace('</head>','<link rel="stylesheet" href="/curiosidades/zix-galeria-2026.css?v=1"></head>',1)
p.write_text(s,encoding='utf-8')
print('Galeria instalada: 9 cards e 9 guias. Categorias originais preservadas.')

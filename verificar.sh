#!/bin/bash

echo "📦 Atualizando pacotes e instalando Git..."
pkg update -y && pkg install git -y

echo "⬇️ Clonando o repositório do GitHub..."
# Remove a pasta se ela já existir para evitar conflitos
rm -rf zixlima
git clone https://github.com/electronicoslimagn/zixlima.git

cd zixlima

echo "✅ Repositório clonado com sucesso!"
echo "--------------------------------------------------"
echo "🔍 Verificando os arquivos principais:"

# Verifica se o index.html e o style.css existem
if [ -f "index.html" ]; then
    echo "✔️ index.html encontrado."
    echo "   Últimas linhas do <head> no index.html (para ver se o CSS está linkado):"
    grep -n -i "style.css" index.html | head -n 3
else
    echo "❌ index.html não encontrado na raiz."
fi

if [ -f "style.css" ]; then
    echo "✔️ style.css encontrado."
    echo "   Tamanho do arquivo: $(wc -l < style.css) linhas."
else
    echo "❌ style.css não encontrado na raiz."
fi
echo "--------------------------------------------------"

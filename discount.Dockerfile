# Imagem base derivada do Node
FROM node

# Diretório de trabalho
WORKDIR /app

# Copia todo o projeto para dentro do container
COPY . /app

# Instala as dependências
RUN npm install

# Inicializa o microserviço de desconto
CMD ["node", "/app/services/discount/index.js"]

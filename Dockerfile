# Dockerfile (na raiz do projeto)
FROM node:18-alpine

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia os package.json e package-lock.json
COPY package*.json ./

# Instala TODAS as dependências (incluindo devDependencies para nodemon e serve)
RUN npm install

# Copia todo o resto do seu projeto para dentro do contêiner
COPY . .

# Expõe as portas que seus serviços usam internamente
EXPOSE 3000 3001 3002 3003 5000

# Comando padrão (será sobrescrito pelo Docker Compose)
CMD ["npm", "start"]
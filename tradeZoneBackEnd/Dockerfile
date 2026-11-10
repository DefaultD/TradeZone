# Usa a imagem base oficial do Node
FROM node:20

# Define o diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copia apenas os arquivos de dependência primeiro (para otimizar cache)
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia o restante do código para dentro do container
COPY . .

# Expõe a porta que o Nest vai usar
EXPOSE 3000

# Roda o NestJS em modo de desenvolvimento (com hot reload)
CMD ["npm", "run", "start:dev"]

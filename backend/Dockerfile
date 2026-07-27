FROM node:18-alpine

WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código do backend
COPY . .

EXPOSE 5000

CMD ["npm", "start"]
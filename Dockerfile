# Stage 1: сборка приложения
FROM node:18-alpine AS builder
WORKDIR /app

# Копируем package.json (и package-lock.json, если есть)
COPY package*.json ./

# Устанавливаем зависимости (включая dev)
RUN npm install

# Копируем исходники
COPY . .

# Компилируем TypeScript
RUN npm run build

# Stage 2: финальный образ
FROM node:18-alpine
WORKDIR /app

# Копируем package.json для установки только production зависимостей
COPY package*.json ./
RUN npm install --only=production

# Копируем скомпилированные файлы из builder'а
COPY --from=builder /app/dist ./dist

# Открываем порт (укажи тот, который используется в приложении, например, 3000)
EXPOSE 3000

# Копируем JSON-файлы для сидинга
COPY --from=builder /app/src/seeders/authors.json /app/dist/src/seeders/authors.json
COPY --from=builder /app/src/seeders/books.json /app/dist/src/seeders/books.json

CMD ["sh", "-c", "npm run migrateProd && npm run seedProd && npm start"]
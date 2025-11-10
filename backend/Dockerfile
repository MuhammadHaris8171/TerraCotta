FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --production

FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app ./
RUN apk add --no-cache bash netcat-openbsd
RUN chmod +x /app/wait-for-postgres.sh
USER node
EXPOSE 4000
ENTRYPOINT ["sh", "/app/wait-for-postgres.sh", "db", "5432"]
CMD ["npm", "run", "start"]

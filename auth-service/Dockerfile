FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && adduser -S collector -u 1001
COPY --from=builder /app/node_modules ./node_modules
COPY src/ ./src/
USER collector
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://localhost:3001/auth/health || exit 1
CMD ["node", "src/server.js"]

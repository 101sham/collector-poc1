FROM node:20-alpine AS builder
WORKDIR /app
# Outils de compilation pour better-sqlite3
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci --only=production
COPY src/ ./src/

FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache python3 make g++
RUN addgroup -g 1001 -S nodejs && adduser -S collector -u 1001
COPY --from=builder /app/node_modules ./node_modules
COPY src/ ./src/
RUN mkdir -p /data uploads && chown -R collector:nodejs /app /data
USER collector
ENV DB_PATH=/data/listings.db
EXPOSE 3002
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://localhost:3002/health || exit 1
CMD ["node", "src/server.js"]

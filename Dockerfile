# 1) Etapa de build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamos los archivos de dependencias
COPY package*.json ./

# Instalamos dependencias (usa npm ci porque tienes package-lock.json)
RUN npm ci

# Copiamos el resto del código
COPY . .

# Desactivamos telemetría de Next
ENV NEXT_TELEMETRY_DISABLED=1

# Build de producción
RUN npm run build

# 2) Etapa de runtime
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Copiamos solo lo necesario desde el builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

EXPOSE 3000

# Comando de arranque
CMD ["npm", "start"]

# Stage 1: Build Vite React SPA
FROM node:20-alpine AS builder

WORKDIR /app

COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

COPY frontend/ ./
RUN npm run build

# Stage 2: Serve via Nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


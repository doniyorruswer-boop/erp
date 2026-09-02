# ==========================================
# Stage 1: Build Vue Application
# ==========================================
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY babel.config.js vue.config.js tailwind.config.js ./
COPY public ./public
COPY src ./src

# Set default production API URL or allow build arg
ARG VUE_APP_API_URL="/api"
ENV VUE_APP_API_URL=$VUE_APP_API_URL

RUN npm run build

# ==========================================
# Stage 2: Serve with Nginx
# ==========================================
FROM nginx:alpine AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

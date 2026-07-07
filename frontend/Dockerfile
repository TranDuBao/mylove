# Build Stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Nginx Stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Custom Nginx configuration to support client-side routing fallback if needed (though we use hash router, it is good practice!)
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

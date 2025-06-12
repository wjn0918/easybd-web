# 构建阶段：Node 构建前端代码
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 拷贝代码和依赖
COPY package*.json ./
RUN npm install

# 拷贝源代码并构建
COPY . .
RUN npm run build

# ------------------------------------------

# 生产阶段：Nginx 容器 + 构建结果
FROM nginx:stable-alpine

# 拷贝构建产物到 Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# 自定义 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

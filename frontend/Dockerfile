# 1. 빌드 스테이지: 정적 파일 생성
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
# Nginx가 /api, /ws-* 를 백엔드로 프록시하므로 같은 오리진(상대경로)으로 호출합니다.
ENV VITE_API_BASE_URL=""
RUN npm run build

# 2. 실행 스테이지: Nginx로 정적 서빙 + API 프록시
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

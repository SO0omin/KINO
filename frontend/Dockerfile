# 1. 빌드 스테이지: 리액트 소스를 빌드
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2. 실행 스테이지: 빌드된 파일을 Nginx에 올림
FROM nginx:alpine
# Vite의 기본 빌드 결과물 폴더는 'dist'입니다.
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
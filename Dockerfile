FROM node:18-alpine AS build

WORKDIR /app

RUN npm install -g pnpm@10

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/
COPY packages/configs/package.json packages/configs/
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm --filter @capsa/web build

FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

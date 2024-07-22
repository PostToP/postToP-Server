FROM denoland/deno:alpine

WORKDIR /app

COPY . .

EXPOSE 8000
EXPOSE 8080

CMD ["run", "--allow-net", "--allow-read", "--allow-write", "--allow-env","src/index.ts"]

FROM    node:20.2.0

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json", "./"]

RUN npm install

ENV IN_DOCKER=1

COPY ["bot.ts", "lib.ts", "credentials.json", "./"]

CMD ["npm", "run", "docker_internal"]

FROM    node:20.2.0

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json", "./"]

RUN npm install

ENV IN_DOCKER=1

COPY ["bot.ts", "lib.ts", "./"]

# condtional copy, bot.ts will always copy but credential[s].json is optional
COPY ["bot.ts", "credential[s].json", "./"]

CMD ["npm", "run", "docker_internal"]

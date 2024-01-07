# CryptPad registration counter & results clearer
This is code for a [Telegram](https://telegram.org) bot which automatically counts the results of a [CryptPad](https://cryptpad.org) form every thursday 16:00(and on a `/count` command), and deletes it every thursday midnight. Very specific, I know.

Normally you'd use an API for this but I don't think cryptpad has an API so it uses selenium as a scraper which is not cursed at all

## getting it up and running

### setting up environment

If you would like the bot to be able to clear the entries:
 1. create a bot cryptpad account especially for this bot
 2. make it an owner of your cryptpad form
 3. then open developer tools(usually F12) in your browser
 4. go to the terminal and type `JSON.stringify(localStorage)` and copy its output and put it into `credentials.json`

If you use docker, put the following fields in an `.env` file:
```
CP_URL=<the URL of the results of your cryptpad form>
TG_TOKEN=<the token of your telegram bot>
TG_CHANNEL_ID=<the channel ID of the channel where you want to broadcast the registration count message>
```
If you run locally, you have to `export` them manually youself. :(


### Running locally
You need to have `node` with at least version 18, best to use `nvm`([link](https://github.com/nvm-sh/nvm))

```sh
nvm use 18
npm run dev
```

### Running with docker
```sh
docker-compose up
```

### More configuration
In `lib.ts` you can find more configuration, such as the column to which get the sum of registrations for. In `bot.ts` you can specify when to send a registration count to the telegram channel and when to delete.

By default, it will use the first input field as the field to sum up.

Also your environment would need a PWD field(which is normal for any setup)

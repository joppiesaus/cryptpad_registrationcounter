
# getting it up and running

TODO download chrome webdriver: https://googlechromelabs.github.io/chrome-for-testing/

NOTE: requires env with a PWD.

TODO CP_URL and TG_TOKEN, TG_CHANNEL_ID

```sh
# tODO: nvm install
sudo apt-get install chromium-browser -y
nvm use 18
npm run dev
```

If you would like to delete entries:
create a bot account
make it an owner of your cryptpad form
then open developer tools(usually F12) in your browser
go to the terminal and type `JSON.stringify(localStorage)` and copy its output and put it into `credentials.json`

import { Bot } from "grammy";
import { ProcessOptions, RequestManager, URL, deleteFormResponses, getAmountOfRegistrationsByWebpage } from "./lib";
import { WebDriver } from "selenium-webdriver";
import { schedule } from "node-cron";

const bot = new Bot(process.env.TG_TOKEN ?? "none lol");
const channelId = parseInt(process.env.TG_CHANNEL_ID ?? "-1");

const reqManager = new RequestManager();

// so much for DRY
async function checkRegistrationsAndSendToChannel() {

    try {

        const result = await reqManager.executeScriptTask( async function( driver: WebDriver ): Promise<number> {

            return await getAmountOfRegistrationsByWebpage(driver);

        }, <ProcessOptions>{ requiresLocalStorageParsing: false });

        await bot.api.sendMessage( channelId, `There are ${result} registrations. Please [check out the comments](${URL}).`, { parse_mode: "Markdown" } );

    } catch (e) {
        await bot.api.sendMessage( channelId, `Something went wrong checking the registrations: ${e}. Please check [the results manually](${URL}).`, { parse_mode: "Markdown" } );
    }

}

async function deleteResponses() {

    await reqManager.executeScriptTask( async function( driver: WebDriver ): Promise<void> {

        await deleteFormResponses(driver);

    }, <ProcessOptions>{ requiresLocalStorageParsing: true, ignoreLock: true } );

}

bot.command("count", async (ctx) => {

    const msg = await ctx.reply("Fetching, just a moment...", { parse_mode: "Markdown" });

    try {

        const result = await reqManager.executeScriptTask( async function( driver: WebDriver ): Promise<number> {

            return await getAmountOfRegistrationsByWebpage(driver);

        }, <ProcessOptions>{ requiresLocalStorageParsing: false });

        await ctx.reply(`There are ${result} registrations. Please [check out the comments](${URL}).`, { parse_mode: "Markdown" } );

    } catch (e) {
        await ctx.reply(`Something went wrong: ${e}. Please check [the results manually](${URL}).`, { parse_mode: "Markdown" } );
    }

});

bot.on("message", async (ctx) => {
    console.log(ctx.message);
});

bot.start();

// send message every thursday 16:00
schedule("0 0 16 * * thursday", () => {

    checkRegistrationsAndSendToChannel();

});

// clear form around midnight on a friday(so just after thursday)
schedule("23 9 0 * * friday", () => {

    deleteResponses();

});

import { Bot } from "grammy";
import { ProcessOptions, RequestManager, URL, deleteFormResponses, getAmountOfRegistrationsByWebpage } from "./lib";
import { WebDriver } from "selenium-webdriver";
import { schedule } from "node-cron";

if (!process.env?.TG_TOKEN) {
    throw Error("TG_TOKEN was not provided");
}

const bot = new Bot(process.env.TG_TOKEN ?? "none lol");

const reqManager = new RequestManager();

// so much for DRY
async function checkRegistrationsAndSendToChannel() {

    if ( process.env.TG_CHANNEL_ID === undefined ) {
        console.warn("Tried to check registrations and send to the channel, but TG_CHANNEL_ID was not specified.")
        return;
    }

    const channelId = parseInt(process.env.TG_CHANNEL_ID);

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

// bot.command("delete", async (ctx) => {

//     const msg = await ctx.reply("will delete, just a moment...", { parse_mode: "Markdown" });

//     try {

//         await deleteResponses();
//         await ctx.reply("worked");

//     } catch (e) {
//         await ctx.reply(`Something went wrong: ${e}. Please check [the results manually](${URL}).`, { parse_mode: "Markdown" } );
//     }

// });

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

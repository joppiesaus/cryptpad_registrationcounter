import { Bot } from "grammy";
import { ProcessOptions, RequestManager, URL, getAmountOfRegistrationsByWebpage } from "./lib";
import { WebDriver } from "selenium-webdriver";

const bot = new Bot(process.env.TG_TOKEN ?? "none lol");

const reqManager = new RequestManager();

// TODO: CRON NODE

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
    // console.log(ctx.message);
});

bot.start();

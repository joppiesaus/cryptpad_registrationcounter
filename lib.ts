import { Builder, By, ChromiumWebDriver, until } from "selenium-webdriver";
import chrome from  "selenium-webdriver/chrome";
import fs from "node:fs/promises";

const URL = process.env.CP_URL ?? "none"; // TODO

const main = async function() {

    let options = new chrome.Options();
    options.setUserPreferences({
        "download.default_directory": process.env.PWD
    });
//     options.addArguments("--headless=new");

    let driver = await new Builder()
        .forBrowser("chrome")
        .setChromeOptions(options)
        .build();

    // try {

        await driver.get(URL);

        console.log(await driver.getTitle())

        await driver.manage().setTimeouts({ implicit: 5000 }); // wait 5 seconds

        await driver.wait(until.elementLocated(By.id("sbox-iframe")), 10000);

        let iframe = await driver.findElement(By.id("sbox-iframe"));

        driver.switchTo().frame(iframe);


        await driver.wait(until.elementLocated(By.css(".cp-form-creator-results-controls .cp-dropdown-container .btn.btn-primary")), 10000);

        let dropdownButton = driver.findElement(By.css(".cp-form-creator-results-controls .cp-dropdown-container .btn.btn-primary"));

        dropdownButton.click();

        let csvDownloadButton = driver.findElement(By.css("a.cp-form-export-csv"));

        csvDownloadButton.click();


    // } catch (e) {

    //     console.error(e);

    // } finally {

    //     await driver.quit();

    // }

};

// main();

/**
 * Sums up the registrations of a CSV file in a specific format
 * @param data entire CSV file as a string
 * @returns the sum
 */
let parse = function(data: string): number {

    const lines = data.split("\n");
    let sum = 0;

    for (const line of lines) {

        const cols = line.split(",");

        if (cols.length < 4) {
            continue;
        }

        const value = parseInt(cols[2]);

        if (!Number.isNaN(value)) {
            sum += parseInt(cols[2])
        }

    }

    return sum;

}

let parseCSVFile = async function(filename: string): Promise<number> {

    try {
        const data = await fs.readFile(filename, { encoding: "utf8" } );

        return parse(data);

    } catch (e) {
        console.error(e);
        throw e;
    }
    return NaN;
}

parseCSVFile("a.csv");

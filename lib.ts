import { Builder, By, WebDriver, until } from "selenium-webdriver";
import chrome from  "selenium-webdriver/chrome";
import fs from "node:fs/promises";

export const URL = process.env.CP_URL ?? "none"; // TODO

// TODO: clean up this stuff

export interface ProcessOptions
{
    requiresLocalStorageParsing?: boolean, // true if it needs localStorage parsing.
    ignoreLock?: boolean, // if true, will ignore the lock, i.e. will allow running multiple instances at the same time
};

export const getAmountOfRegistrationsByWebpage = async function(driver: WebDriver): Promise<number> {

    let dropdownButton = driver.findElement(By.css(".cp-form-creator-results-controls .cp-dropdown-container .btn.btn-primary"));

    dropdownButton.click();

    let csvDownloadButton = driver.findElement(By.css("a.cp-form-export-csv"));

    csvDownloadButton.click();

    let sum = NaN;

    // TODO: race condition, though very unlikely
    // ideally, poll until we find the CSV file(or certain timeout is reached)
    await new Promise(resolve => setTimeout( async () => {

        const filename = `${(await driver.getTitle()).replace(' ', '-')}.csv`;
        try {
            sum = await parseCSVFile(filename);
            console.log(sum);
            resolve(sum);
        } catch (e) {
            console.log(`Failed to parse CSV file: ${e}`);
            return NaN;
        }

        try {
            // we are done, remove the file
            await fs.unlink(filename);
        } catch(e) {
            console.log(`Failed to delete CSV file: ${e}`);
        }

    }, 200 ));

    return sum;

}

/**
 * Deletes the form responses. Requires authentication/localStorage parsing. DESTRUCTIVE FUNCTION.
 * @param driver 
 */
export const deleteFormResponses = async function(driver: WebDriver) {

    let deleteButton = await driver.findElement(By.css(".cp-form-creator-results-controls .btn.cp-form-results-delete"));

    // click the delete button
    await deleteButton.click();

    const confirmButtonBy = By.css(".cp-form-creator-results-controls .cp-button-confirm .btn.danger");

    await driver.wait(until.elementLocated(confirmButtonBy), 100);

    let confirmButton = await driver.findElement(confirmButtonBy);

    // click the "are you sure" button to confirm
    await confirmButton.click();

};

export class RequestManager {

    private isProcessing: boolean;

    constructor() {
        this.isProcessing = false;
    }

    /**
     * Executes something on the cryptpad form results.
     */
    public async executeScriptTask(
            internalCode: (driver: WebDriver) => Promise<any>,
            pOptions?: ProcessOptions ): Promise<any>
        {

        if (this.isProcessing === true && !(pOptions?.ignoreLock === true)) {

            throw Error("an operation is already pending, try again in a minute");
            return;

        }

        this.isProcessing = true;

        let options = new chrome.Options();
        options.setUserPreferences({
            "download.default_directory": process.env.PWD
        });
        options.addArguments("--headless=new");

        let driver = await new Builder()
            .forBrowser("chrome")
            .setChromeOptions(options)
            .build();

        let result: null | any = null;

        try {

            await driver.get(URL);

            if (pOptions?.requiresLocalStorageParsing) {

                await parseLocalStorage(driver, "credentials.json");

                // console.log(await driver.getTitle())
                if (await driver.getTitle() === "cryptpad_registrationcounter: FAILED TO PARSE localStorage JSON") {
                    throw Error("Failed to parse localStorage JSON: " + await driver.findElement(By.css("body")).getText());
                }

            }

            await driver.manage().setTimeouts({ implicit: 5000 }); // wait 5 seconds

            await driver.wait(until.elementLocated(By.id("sbox-iframe")), 10000);

            let iframe = await driver.findElement(By.id("sbox-iframe"));

            driver.switchTo().frame(iframe);

            try {

                await driver.wait(until.elementLocated(By.css(".cp-form-creator-results-controls .cp-dropdown-container .btn.btn-primary")), 10000);

            } catch (e) {

                // if it fails, check for no responses. Else, raise again.
                const noResponsesBy = By.css(".cp-form-creator-results .alert");

                await driver.wait(until.elementLocated(noResponsesBy), 1000);

                const noResponsesEl = await driver.findElement(noResponsesBy);

                if (await noResponsesEl.getText() === "There are no responses") {
                    throw Error("No responses");
                } else {
                    throw Error(`weird error, can find the noResponsesEl but text is: ${await noResponsesEl.getText()}`);
                }

            }

            result = await internalCode(driver);

        } catch (e) {

            console.error(e);
            throw e;

        } finally {

            await driver.quit();
            this.isProcessing = false;

        }

        if (result !== null) {
            return result;
        }

    }

}

/**
 * Sums up the registrations of a CSV file in a specific format
 * @param data entire CSV file as a string
 * @returns the sum
 */
let parse = function(data: string): number {

    // bad for memory usage but whatever, need to skip the first line
    const lines = data.split("\n").slice(1);
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

let parseLocalStorage = async function(driver: WebDriver, filename: string) {
    try {

        let data = await fs.readFile(filename, { encoding: "utf8" } );

        // escape the backticks so it doesn't break the script when inserting it
        data = data.replace("`", "\\`");

        // is this how actual selenium developers would do this stuff? this feels a bit cursed
        await driver.executeScript(`
        try {
            (function(obj) {

                const keys = Object.keys(obj);

                for ( const key of Object.keys(obj) ) {
                    localStorage.setItem( key, obj[key] );
                }

            })(JSON.parse(\`${data}\`));
        } catch (e) {
            document.title = "cryptpad_registrationcounter: FAILED TO PARSE localStorage JSON";
            document.body.innerHTML = \`\${e}\`;
        }`);

    } catch (e) {
        console.error(e);
        throw e;
    }
}

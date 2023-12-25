// const { Builder, By, until } = require("selenium-webdriver");
import { Builder, By, ChromiumWebDriver, until } from "selenium-webdriver";
import chrome from  "selenium-webdriver/chrome";

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

main();

const puppeteer = require('puppeteer');

const createBrowserInstance = async () => {
    //Create a browser instance
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();
    return {browser, page};
}

module.exports = {createBrowserInstance}
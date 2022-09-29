require('dotenv').config({path: './.env'});
require('puppeteer');
const helper = require("./helper");

const RANDOM_LIST_URL = "https://randomtodolistgenerator.herokuapp.com/library";
const TODO_LIST_URL = "https://todoist.com/auth/login";

const getTasks = async (url) => {
    //Create browser instance
    const {browser, page} = await helper.createBrowserInstance();

    let tasks = [];

    await page.goto(url, {
        waitUntil:["load","domcontentloaded","networkidle0","networkidle2"]
    });

    //search HTML elements by attributes
    const cardSelector = '.card-body';
    const taskCards = await page.$$(cardSelector);

    //Helper to get the content of previous elements
    for (const taskCard of taskCards) {
        let taskObject = {};
        let title = "Null";
        let description = "Null";
        try{
            title = await page.evaluate(el => el.querySelector(".task-title > div").textContent, taskCard);
        } catch(error){
            console.log("[GET_TASKS] An error occurred getting title task", error);
        }
        try{
            description = await page.evaluate(el => el.querySelector(".card-text").textContent, taskCard);
        }catch(error){
            console.log("[GET_TASKS] An error occurred getting description task", error);
        }
        taskObject = {
            title, 
            description
        }
        tasks.push(taskObject);
    }

    //To delete the last task due that I got 6 task and only need 5
    tasks.pop();

    await browser.close();

    return tasks;
}

const saveTasks = async (tasks) => {

    //Create a browser instance
    const {browser, page} = await helper.createBrowserInstance();
    try {
        await login(page);
    }catch(error){
        console.log("[LOGIN] An error occurred login to TODO page", error);
        await browser.close();
    }
 
    const addTaskBtnSelector = '.plus_add_button';

    try{
        await page.waitForSelector(addTaskBtnSelector);
        const element = await page.$(addTaskBtnSelector);
        await page.evaluate(element => element.click(), element);
    }catch(error){
        console.log("[SAVE_TASK] An error occurred on click to new task", error);
    }

    const taskTitleInputSelector = '.public-DraftStyleDefault-block span'
    const taskDescriptionInputSelector = '.task_editor__description_field';
    const submitTaskBtnSelector = '[data-testid="task-editor-submit-button"]';
    
    for (const task of tasks) {
        try{
            await page.type(taskTitleInputSelector, task.title);
            await page.type(taskDescriptionInputSelector, task.description);
            await page.click(submitTaskBtnSelector);
        }catch(error){
            console.log("[SAVING DATA] An error occurred adding a task", error);
        }
    }
}
const login = async (page) => {
    const EMAIL = process.env.EMAIL;
    const PASSWORD = process.env.PASSWORD;
    await page.goto(TODO_LIST_URL, {
        waitUntil:["load","domcontentloaded","networkidle0","networkidle2"]
    });

    await page.type('[type="email"]',EMAIL);
    await page.type('[type="password"]',PASSWORD);
    await page.click('[type="submit"]');
}

(
    async()=> {
        let tasks = await getTasks(RANDOM_LIST_URL);
        await saveTasks(tasks);
    }
)();

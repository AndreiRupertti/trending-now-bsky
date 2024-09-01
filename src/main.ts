import { AtpAgent, RichText } from '@atproto/api';
import * as dotenv from 'dotenv';
import jsdom from 'jsdom';
const { JSDOM } = jsdom;

dotenv.config();
const args = process.argv.slice(2);
const SEARCH_URl = 'https://bsky.app/search?q='

const REGION = args[0]
const NUMBER_OF_TRENDS_TO_SHOW = 10
// Create a Bluesky Agent 
const agent = new AtpAgent({
    service: 'https://bsky.social',
})

const removeWhiteSpace = (str: string) => {
    return str.replace(/\s+/g, ' ');
};

const mapNewLines = (str: string) => {
    return str.replace(/\n+/g, '.');
};

const capitalizeFirstLetter = (str: string)  => {
    return str.charAt(0).toUpperCase() + str.slice(1);
}


async function main() {
    const region = REGION === 'world' ? '' : `${REGION}/`
    const response = await fetch(`https://trends50.net/${region}`)

    if (!response.ok) return console.error('Error!')
    const data = await response.text()

    const dom = new JSDOM(data);
    const elements = [...dom.window.document.querySelectorAll('.list-group-item:not([aria-current=true])')]

    const result = elements.slice(0, NUMBER_OF_TRENDS_TO_SHOW)
        .map((el) => { console.log(el.textContent); return el })
        .map((el) => mapNewLines((el.textContent!).trim()))
        .map((v) => v.replace(' tweets', ''))
        .map((v) => removeWhiteSpace(v))
        .map((v) => v.split('.').filter((a) => a !== ' '))
    console.log(result)

    
    const message = `📢📈 | Trending Topics on Twitter (${capitalizeFirstLetter(REGION!)}):\n\n${result.map(r => `${r[0]} -${r[1]} (${r[2] ? r[2] : 'N/A'})\n`).join('')}
    `
    console.log(message)
    
    const rt = new RichText({
        text: message
    })


    await agent.login({ identifier: process.env.BLUESKY_USERNAME!, password: process.env.BLUESKY_PASSWORD! })
    await agent.post({
        $type: 'app.bsky.feed.post',
        text: rt.text,
        facets: rt.facets,
    });
    console.log("Just posted!")
    //console.log(JSON.stringify(elements))
}

main();
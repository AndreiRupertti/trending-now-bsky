import { AtpAgent, RichText } from '@atproto/api';
import * as dotenv from 'dotenv';
import jsdom from 'jsdom';
const { JSDOM } = jsdom;

dotenv.config();

const SEARCH_URl = 'https://bsky.app/search?q='

// Create a Bluesky Agent 
const agent = new AtpAgent({
    service: 'https://bsky.social',
})

function escapeRegExp(str: string) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function replaceAll(str: string, find: string, replace: string) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

const removeWhiteSpace = (str: string) => {
    return str.replace(/\s+/g, ' ');
};

const mapNewLines = (str: string) => {
    return str.replace(/\n+/g, '.');
};
const reTrending = /(?<=\<span id="select_txt_."><a\shref=.*?\>).*?(?=\<\/span\>)/g;
const reCount = /(?<=\<h2 class="card-title"><a\shref=.*?\>).*?(?=\<\/a\>)/g;

async function main() {
    const response = await fetch('https://trends50.net/brazil/')

    if (!response.ok) return console.error('Error!')
    const data = await response.text()

    const dom = new JSDOM(data);
    const elements = [...dom.window.document.querySelectorAll('.list-group-item:not([aria-current=true])')]

    const result = elements.slice(0, 10)
        .map((el) => { console.log(el.textContent); return el })
        .map((el) => mapNewLines((el.textContent!).trim()))
        .map((v) => v.replace(' tweets', ''))
        .map((v) => removeWhiteSpace(v))
        .map((v) => v.split('.').filter((a) => a !== ' '))
    console.log(result)

    
    const message = `📈 - Trending Topics on Twitter:

    ${result[0][0]} -${result[0][1]} (${result[0][2]})
    ${result[1][0]} -${result[1][1]} (${result[1][2]})
    ${result[2][0]} -${result[2][1]} (${result[2][2]})
    ${result[3][0]} -${result[3][1]} (${result[3][2]})
    ${result[4][0]} -${result[4][1]} (${result[4][2]})
    ${result[5][0]} -${result[5][1]} (${result[5][2]})
    ${result[6][0]} -${result[6][1]} (${result[6][2]})
    ${result[7][0]} -${result[7][1]} (${result[7][2]})
    ${result[8][0]} -${result[8][1]} (${result[8][2]})
    ${result[9][0]} -${result[9][1]} (${result[9][2]})
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
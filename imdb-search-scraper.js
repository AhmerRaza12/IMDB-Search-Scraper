const puppeteer=require("puppeteer");
const path=require("path");
const imdb_url="https://www.imdb.com/?ref_=nv_home";
const movie_title="Hera Pheri";
const xlsx=require("xlsx");
async function scraper(page){
    const recommendation=[{}]
   await page.waitForSelector("li[role='option'] a");
const link=await page.$eval("li[role='option'] a",link=>link.href);
await page.goto(link);
const titles=await page.$$eval(`span[data-testid="title"]`,(titles)=>{
    return titles.map(title=>title.innerHTML);
});
const ratings=await page.$$eval(`div.ipc-poster-card__rating-star-group.sc-73d0305e-0.gDrIpe > span`,(ratings)=>{
return ratings.map(rating=>rating.innerText);
});
const links=await page.$$eval(`div.ipc-poster.ipc-poster--base.ipc-poster--dynamic-width.ipc-poster-card__poster.ipc-sub-grid-item.ipc-sub-grid-item--span-2 > a`,(links)=>{
    return links.map(link=>link.href);
})

for ( i = 0; i< titles.length; i++) {
    recommendation[i]={
        title:titles[i],
        rating:ratings[i],
        link:links[i]
    }
}
for(const link of links){
    await page.goto(link);
    await page.waitForTimeout(1500);
}
return recommendation;
}



async function main(){
    
const browser=await puppeteer.launch({
    defaultViewport:false, 
    headless:false
});
const page=await browser.newPage({});
await page.goto(imdb_url);
await page.type(".react-autosuggest__container input",movie_title);
data=await scraper(page);
const wb=xlsx.utils.book_new();
const ws=xlsx.utils.json_to_sheet(data);
xlsx.utils.book_append_sheet(wb,ws);
xlsx.writeFile(wb,"imdb-recommendations.xlsx");
await browser.close();
}
main();
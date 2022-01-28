const axios = require("axios");
const cheerio = require('cheerio');
const baseUrl = "https://www.discudemy.com/language/english"
const imgbaseUrl = "https://img-c.udemycdn.com/course/750x422/"


async function formateImageUrl(imgUrl){
    return(imgbaseUrl+(imgUrl.split('/')[5].replace('"><',''))); 
}

async function getCoupenCode(url){
    var goUrl = url.split("/")
    goUrl.splice(3,1,'go')
    goUrl = goUrl.join("/")
    try{
        const res = await axios.get(goUrl)
        const $ = cheerio.load(res.data)
        const udemyUrl=$('p[class="text centered ui green label"]').next().text()
        return(udemyUrl);
    } catch (error){
        return error
    }
}

async function getUdemydata(){

    try{
        const res = await axios.get(baseUrl)
        const $ = cheerio.load(res.data);

            //for (const el of $('div[class="content"]').toArray()){
        const promises = $('div[class="content"]')
        .toArray()
        .map(async (el,i) => {
            const courseTitle = $(el).find("a").text()
            const aa = $(el).html() 
            const courseUrl = await getCoupenCode($(el).find("a").attr("href"))
            const courseDescription = $(el).find(".description").text().trim()
            const courseImage = await formateImageUrl($(el).find(".image").html())
            var dataObj = {
            "title": courseTitle,
            "description": courseDescription,
            "image": courseImage,
            "link": courseUrl
            }
            return dataObj
        })
        const finalArray = await Promise.all(promises);
        return finalArray
    } catch(error){
        console.error(error);
    }

}

module.exports = getUdemydata


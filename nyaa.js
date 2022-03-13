const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");

// https://github.com/Ryuk-me/Torrents-Api/torrent/nyaaSI.js#L15

const nameRegex = /[a-zA-Z\W].+/g;

async function getNyaaData(query, ord_by, page) {
  try {
    var baseUrl = `https://nyaa.si/?q=${query}&s=${ord_by}&o=desc&page=${page}`;
    const res = await axios.get(baseUrl);
    const $ = cheerio.load(res.data);
    const nyaaPromises = $("table > tbody > tr")
      .toArray()
      .map(async (el, i) => {
        const tds = $(el).find("td");
        const type = $(tds[0]).find("a").find("img").attr("alt");
        const name = $(tds[1]).text().trim().match(nameRegex)[0].trim();
        const torrent =
          "https://nyaa.si" + $(tds[2]).find("a").first().attr("href");
        const magnet = $(tds[2]).find("a").last().attr("href");
        const size = $(tds[3]).text();
        const upload_date = $(tds[4]).text().trim();
        const seeders = $(tds[5]).text().trim();
        const leechers = $(tds[6]).text().trim();
        const complete_downloads = $(tds[7]).text().trim();

        var dataObj = {
          type,
          name,
          torrent,
          magnet,
          size,
          upload_date,
          seeders,
          leechers,
          complete_downloads,
        };
        return dataObj;
      });
    const finalArray = await Promise.all(nyaaPromises);
    finalObj = {
      status: "success",
      orderedBy: ord_by === "id" ? "date" : ord_by,
      query: query,
      length: finalArray.length,
      page: page,
      data: finalArray,
    };
    return finalObj;
  } catch (error) {
    return {
      status: "error",
      error_code: error.code,
      error_message: error.message,
      error_stack: error.stack,
    };
  }
}

module.exports = getNyaaData;

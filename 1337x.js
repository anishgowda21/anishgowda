const cheerio = require("cheerio");
const axios = require("axios");

const BASE_URL = "https://1337x.to";

function getLastPageNumber($) {
  const lastPageLink = $("li.last a").attr("href");
  if (lastPageLink) {
    const match = lastPageLink.match(/\/(\d+)(?:\/|\?.*)?$/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
  }
  return 1;
}

function getQueryUrl(query, page = 1, category, sort, order) {
  let url;
  if (category && sort) {
    url = `${BASE_URL}/sort-category-search/${encodeURIComponent(query)}/${encodeURIComponent(category)}/${encodeURIComponent(sort)}/${encodeURIComponent(order)}/${page}/`;
  } else if (category) {
    url = `${BASE_URL}/category-search/${encodeURIComponent(query)}/${encodeURIComponent(category)}/${page}/`;
  } else if (sort) {
    url = `${BASE_URL}/sort-search/${encodeURIComponent(query)}/${encodeURIComponent(sort)}/${encodeURIComponent(order)}/${page}/`;
  } else {
    url = `${BASE_URL}/search/${encodeURIComponent(query)}/${page}/`;
  }
  return url;
}

async function search(
  query,
  page = 1,
  category = null,
  sort = null,
  order = "desc",
) {
  const url = getQueryUrl(query, page, category, sort, order);
  try {
    const res = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    const $ = cheerio.load(res.data);
    const lastPage = getLastPageNumber($);

    const results = $("table > tbody > tr")
      .toArray()
      .map((el) => {
        const tds = $(el).find("td");
        const nameAndLinkEle = $(tds[0]).find("a").last();
        const name = nameAndLinkEle.text() || "Unknown";
        const link = nameAndLinkEle.attr("href") || "";
        const seeds = $(tds[1]).text() || "0";
        const leeches = $(tds[2]).text() || "0";
        const date = $(tds[3]).text() || "Unknown";
        const size = $(tds[4]).contents().first().text() || "Unknown";
        return {
          name,
          link,
          seeds,
          leeches,
          date,
          size,
          category: category || "All",
        };
      });

    return {
      results,
      pagination: {
        currentPage: parseInt(page),
        lastPage,
        perPageResults: results.length,
      },
      filters: {
        category: category || "All",
        sort: sort || null,
        order,
      },
    };
  } catch (error) {
    throw new Error(`Failed to fetch data: ${error.message}`);
  }
}

async function getDetails(link) {
  const url = `${BASE_URL}${link}`;
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });
    const $ = cheerio.load(response.data);

    const name = $(".box-info-heading h1").text().trim() || "Unknown";
    const magnet =
      $('a[href^="magnet:"]').first().attr("href") || "Not available";
    const category =
      $('ul.list li:contains("Category") span')
        .not(".seeds, .leeches")
        .text()
        .trim() || "Unknown";
    const type =
      $('ul.list li:contains("Type") span')
        .not(".seeds, .leeches")
        .text()
        .trim() || "Unknown";
    const language =
      $('ul.list li:contains("Language") span')
        .not(".seeds, .leeches")
        .text()
        .trim() || "Unknown";
    const uploadDate =
      $('ul.list li:contains("Date uploaded") span')
        .not(".seeds, .leeches")
        .text()
        .trim() || "Unknown";
    const size =
      $('ul.list li:contains("Total size") span')
        .not(".seeds, .leeches")
        .text()
        .trim() || "Unknown";
    const seeds = $("ul.list .seeds").text().trim() || "0";
    const leeches = $("ul.list .leeches").text().trim() || "0";
    const uploader =
      $('ul.list li:contains("Uploaded By") a').text().trim() || "Unknown";

    const files = $("#files.file-content ul li")
      .map((i, el) => {
        const $li = $(el);
        $li.find("i").remove();
        const text = $li.text().trim();
        const lastParenIndex = text.lastIndexOf(" (");
        if (lastParenIndex === -1) return null;
        const name = text.substring(0, lastParenIndex).trim();
        const size = text.substring(lastParenIndex + 2, text.length - 1).trim();
        return {
          name,
          size,
        };
      })
      .get()
      .filter((file) => file !== null);

    return {
      name,
      magnet,
      category,
      uploadDate,
      size,
      language,
      type,
      seeds,
      leeches,
      uploader,
      files,
    };
  } catch (error) {
    throw new Error(`Failed to fetch torrent details: ${error.message}`);
  }
}

async function run() {
  console.time("scraping");
  try {
    const res = await search("Iron Man", 1, "Movies", "seeders", "desc");
    console.timeEnd("scraping");
    console.log(res);
  } catch (error) {
    console.error("Error during scraping:", error.message);
  }
}

async function test() {
  try {
    const details = await getDetails(
      "/torrent/6091764/Iron-Man-3-2013-1080p-BluRay-DD-7-1-x265-edge2020/",
    );
    console.log(JSON.stringify(details, null, 2));
  } catch (error) {
    console.error(error.message);
  }
}

// test()
// run();

module.exports = {
  search,
  getDetails,
};

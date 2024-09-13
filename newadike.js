const axios = require('axios');
const cheerio = require('cheerio');
const { data } = require('cheerio/lib/api/attributes');
var qs = require('qs');

var branches = [
    "SHIMOGA",
    "SAGARA",
    "HOSANAGARA",
    "THIRTHAHALLI",
    "KOPPA",
    "SRINGERI",
    "BIRUR",
    "CHANNAGIRI",
    "BHADRAVATHI",
    "TARIKERE",
    "SHIKARIPURA",
    "SORABA BRANCH",
    "DP KOTE ROAD"
]
MAMCOS_URL = "https://unnathisoft.com/mamcos-admin/mamcos_rates_api_chart.php"

async function getNewArecaData(branch) {
    try {
        if (branches.indexOf(branch.toUpperCase()) === -1) {
            return { "error": "Branch not found" };
        }
        let body = { "branch": branch.toUpperCase() }
        var res = await axios.post(MAMCOS_URL, qs.stringify(body), { "timeout": 20000 });
        const $ = cheerio.load(res.data);
        const tableRows = $("tbody tr"); // Assuming you have the table rows here
        let data = [];
        let currentDate = '';
        let currentLocation = '';

        tableRows.each((index, row) => {
            const tds = $(row).find("td");
            const ths = $(row).find("th");

            if (ths.length > 0) {
                // This is a header row with the date and location
                const headerText = ths.text().trim();
                const [date, location] = headerText.split(" / ");
                currentDate = date.trim();
                currentLocation = location.trim();
                data.push({
                    date: currentDate,
                    location: currentLocation,
                    products: []
                });
            } else if (tds.length > 0) {
                // This is a product row
                const productName = tds.eq(0).text().trim();
                const minRate = parseInt(tds.eq(1).text().trim());
                const maxRate = parseInt(tds.eq(2).text().trim());
                const modelRate = parseInt(tds.eq(3).text().trim());

                // Push the product details to the latest date entry
                data[data.length - 1].products.push({
                    name: productName,
                    minRate: minRate,
                    maxRate: maxRate,
                    modelRate: modelRate
                });
            }
        });

        return data;

    } catch (error) {
        console.error(error);
        return { "error": "Internal server error" }
    }
}

module.exports = getNewArecaData
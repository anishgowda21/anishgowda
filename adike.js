const axios = require("axios");
const cheerio = require('cheerio');
var qs = require('qs');
var data = { "rt_bnc_Id": 0, "rt_Date": "", "I": "" }


async function getArecaData(city_data, city_id, date) {
    try {
        data["rt_bnc_Id"] = city_id;
        data["rt_Date"] = date;
        var res = await axios.post("https://www.unnathisoft.com/mamcos-admin/current-rates.php", qs.stringify(data), { "timeout": 20000 })
        const $ = cheerio.load(res.data);
        const arecaPromises = $('table > tbody > tr')
            .toArray()
            .map(async (el, i) => {
                const tds = $(el).find("td");
                const date = $(tds[0]).text()
                const product = $(tds[1]).text()
                const minRate = $(tds[2]).text()
                const maxRate = $(tds[3]).text()
                var dataObj = {
                    "date": date,
                    "product": product,
                    "minRate": minRate,
                    "maxRate": maxRate
                }
                //console.log(dataObj);
                return dataObj
            });
        const finalArray = await Promise.all(arecaPromises);
        finalObj = {
            "status": "success",
            "city": city_data[city_id],
            "data": finalArray
        }
        return finalObj
    } catch (error) {
        errObj = {
            "status": "error",
            "error_code": error.code,
            "error_message": error.message,
            "error_stack": error.stack
        }
        return errObj
    }
}

module.exports = getArecaData
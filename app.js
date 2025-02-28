const express = require("express");
const udemy = require("./udemy.js");
const yts = require("./yts.js");
const adike = require("./adike.js");
const nyaa = require("./nyaa.js");
const newAdike = require("./newadike.js")
const app = express();

var adike_city_data = {
  "2": "Birur",
  "3": "Koppa",
  "4": "Sringeri",
  "5": "Tarikere",
  "6": "Chennagiri",
  "7": "Bhadravati",
  "8": "Hosanagara",
  "9": "Sagara",
  "10": "Shivamogga",
  "11": "Thirthahalli",
  "12": "Shikaripura"
}

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/udemy", (req, res) => {
  (async () => {
    try {
      var data = await udemy(req.query.query);
      res.setHeader("content-type", "application/json");
      res.status(200).json(data);
    } catch (err) {
      res.send(err);
    }
  })();
});

app.get("/newAdike", (req, res) => {
  if (req.query.branch === undefined) {
    return res.end("Please provide a query\nExample: /newAdike?branch=koppa");
  }

  console.log(req.query.branch);
  (async () => {
    let data = await newAdike(req.query.branch)
    return res.send(data);
  })();

})

app.get("/yts", (req, res) => {
  if (req.query.query === undefined) {
    res.end("Please provide a query\nExample: /yts?query=hulk");
  } else {
    console.log(req.query.query);
    (async () => {
      try {
        let image = req.query.img ? true : false
        var data = await yts(req.query.query, image);
        res.setHeader("content-type", "application/json");
        if (data.status==="ok"){
        res.status(200).json(data);
          return;
        }
        res.status(500).json(data);
      } catch (err) {
        res.send(err);
      }
    })();
  }
});

app.get("/adike", (req, res) => {
  if (req.query.city_id === undefined || req.query.date === undefined) {
    res.end(
      `Please provide a city_id and date\nExample: /adike?city_id=3&date=2021-11\n ${JSON.stringify(adike_city_data)}`
    );
  } else {
    console.log(req.query.city_id, req.query.date);
    (async () => {
      try {
        var data = await adike(adike_city_data, req.query.city_id, req.query.date);
        res.setHeader("content-type", "application/json");
        res.status(200).json(data);
      } catch (err) {
        res.send(err);
      }
    })();
  }
});

app.get("/nyaa", (req, res) => {
  if (req.query.query === undefined) {
    res.end("Please provide a query\nExample: /nyaa?query=naruto");
  } else {
    var ob = req.query.ord_by === "date" ? "id" : "seeders";
    var p = req.query.page || 1;
    (async () => {
      try {
        var enQuery = encodeURI(req.query.query);
        var data = await nyaa(enQuery, ob, p);
        res.setHeader("content-type", "application/json");
        res.status(200).json(data);
      } catch (err) {
        res.send(err);
      }
    })();
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));

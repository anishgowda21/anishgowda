const express = require("express");
const fs = require("fs");
const path = require("path");
const marked = require("marked");
const dotenv = require("dotenv");
const { Redis } = require("@upstash/redis");
const udemy = require("./udemy.js");
const yts = require("./yts.js");
const adike = require("./adike.js");
const nyaa = require("./nyaa.js");
const newAdike = require("./newadike.js");
const _1337x = require("./1337x.js");
const app = express();

dotenv.config();

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

var adike_city_data = {
  2: "Birur",
  3: "Koppa",
  4: "Sringeri",
  5: "Tarikere",
  6: "Chennagiri",
  7: "Bhadravati",
  8: "Hosanagara",
  9: "Sagara",
  10: "Shivamogga",
  11: "Thirthahalli",
  12: "Shikaripura",
};

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
    let data = await newAdike(req.query.branch);
    return res.send(data);
  })();
});

app.get("/yts", (req, res) => {
  if (req.query.query === undefined) {
    res.end("Please provide a query\nExample: /yts?query=hulk");
  } else {
    console.log(req.query.query);
    (async () => {
      try {
        let image = req.query.img ? true : false;
        var data = await yts(req.query.query, image);
        res.setHeader("content-type", "application/json");
        if (data.status === "ok") {
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
      `Please provide a city_id and date\nExample: /adike?city_id=3&date=2021-11\n ${JSON.stringify(adike_city_data)}`,
    );
  } else {
    console.log(req.query.city_id, req.query.date);
    (async () => {
      try {
        var data = await adike(
          adike_city_data,
          req.query.city_id,
          req.query.date,
        );
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

app.get("/clear-cache", async (req, res) => {
  const { password } = req.query;

  if (!password || password !== process.env.CACHE_CLEAR_PASSWORD) {
    return res.status(403).json({ error: "Invalid or missing password" });
  }

  try {
    await redis.flushall();
    res.status(200).json({ message: "Cache cleared successfully" });
  } catch (err) {
    res.status(500).json({ error: `Failed to clear cache: ${err.message}` });
  }
});

const router = express.Router();

router.get("/", (req, res) => {
  const mdPath = path.join(__dirname, "docs", "api-1337x-info.md");
  const markdownContent = fs.readFileSync(mdPath, "utf8");
  const htmlContent = marked.parse(markdownContent);
  res.setHeader("Content-Type", "text/html");
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>1337x API Info</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: auto; }
        pre { background: #f4f4f4; padding: 10px; border-radius: 5px; }
      </style>
    </head>
    <body>
      ${htmlContent}
    </body>
    </html>
  `);
});

router.get("/search", async (req, res) => {
  const { query, page, category, sort, order } = req.query;

  // Check for required parameter
  if (!query || !query.trim()) {
    return res
      .status(400)
      .json({ error: "Please provide a valid search query" });
  }

  const trimmedQuery = query.trim();

  try {
    const cacheKey = `search:${trimmedQuery.toLowerCase()}:${page || 1}:${category || "all"}:${sort || "seeders"}:${order || "desc"}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      res.setHeader("X-Cache", "HIT");
      return res.status(200).json(cached);
    }

    const data = await _1337x.search(trimmedQuery, page, category, sort, order);
    await redis.set(cacheKey, JSON.stringify(data), { ex: 900 });
    res.setHeader("X-Cache", "MISS");
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: `Error: ${err.message}`,
    });
  }
});

router.get("/details", async (req, res) => {
  const { link } = req.query;
  if (!link) {
    return res.status(400).json({
      error: "Please provide a torrent link",
    });
  }
  try {
    const cacheKey = `details:${link}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      res.setHeader("X-Cache", "HIT");
      return res.status(200).json(cached);
    }

    const data = await _1337x.getDetails(link);

    await redis.set(cacheKey, JSON.stringify(data), { ex: 86400 });
    res.setHeader("X-Cache", "MISS");

    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: `Error: ${err.message}`,
    });
  }
});

app.use(express.static(path.join(__dirname, "public")));
app.use("/1337x", router);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));

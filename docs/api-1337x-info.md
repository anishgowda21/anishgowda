# 1337x API

Welcome to the 1337x API! Below are the available endpoints and how to use them.

## Search Endpoint
- **Method**: GET
- **Path**: `/1337x/search`
- **Description**: Search for torrents on 1337x.to

### Parameters
- **query** (required): Search term (e.g., "avengers")
- **page** (optional, default: 1): Page number
- **category** (optional): One of "Movies", "TV", "Games", "Music", "Apps", "Documentaries", "Anime", "Other"
- **sort** (optional): One of "time", "size", "seeders", "leechers"
- **order** (optional, default: "desc"): Sort order, "asc" or "desc"

### Example
`/1337x/search?query=avengers&page=1&category=Movies&sort=seeders&order=desc`

## Torrent Details Endpoint
- **Method**: GET
- **Path**: `/1337x/details`
- **Description**: Get details of a specific torrent

### Parameters
- **link** (required): The torrent link path (e.g., "/torrent/5281893/...")

### Example
`/1337x/details?link=/torrent/5281893/...`

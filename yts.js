const axios = require("axios");

function build_magnet(info_hash){
    magnet = "magnet:?xt=urn:btih:"+info_hash+"&tr=udp://tracker.coppersurfer.tk:6969/announce&tr=udp://9.rarbg.to:2920/announce&tr=udp://tracker.opentrackr.org:1337&\tr=udp://tracker.internetwarriors.net:1337/announce&tr=udp://tracker.leechers-paradise.org:6969/announce&tr=udp://tracker.coppersurfer.tk:6969/announce&tr=udp://tracker.pirateparty.gr:6969/announce&tr=udp://tracker.cyberia.is:6969/announce"
    return magnet
}

async function getMoviedata(query){
    console.log("yup got the movie name");
    finalObj = {
        "status" : "ok",
        "movie_count" : 0,
        "query" : query,
        "data" : []
    }
    url = "https://yts.am/api/v2/list_movies.json?query_term="+query+"&sort_by=download_count"
    query = query.replace(" ","+");

    try{
        var res = await axios.get(url)
        res = res.data.data
        console.log("yup got the movie");
    }
    catch (err){
        finalObj.status = "error"
        finalObj.error = err
        return finalObj
    }

    if (res.movie_count === 0)
        return finalObj
    finalObj.movie_count = res.movie_count
    var allMovies = res.movies
    const moviePromises = allMovies.map(async (movie) => {
        try{
            var name = movie.title_long
        }catch(e){
            var name = null
        }
        var torrents = []
        try{
            (movie.torrents).forEach(torr => {
                try{
                    var quality = torr.quality;
                }catch(e){
                    var quality = null
                }
                try{
                    var download = torr.url;
                }catch(e){
                    var download = null
                }
                try{
                    var hash = torr.hash;
                    var magnet =  build_magnet(hash)
                }catch(e){
                    var magnet = null
                    var hash = null
                }
                try{   
                    var type = torr.type;
                }catch(e){
                    var type = null
                }
                try{
                    var seeds = torr.seeds;
                }catch(e){
                    var seeds = null
                }
                try{
                    var peers = torr.peers;
                }catch(e){
                    var peers = null
                }
                try{
                    var size = torr.size;
                }catch(e){
                    var size = null
                }
                try{
                    var up_data = torr.date_uploaded;
                }catch(e){
                    var up_data = null
                }
                var torrObj = {
                    "torrent_file" : download,
                    "magnet" : magnet,
                    "quality" : quality,
                    "type" : type,
                    "seeds" : seeds,
                    "peers" : peers,
                    "size" : size,
                    "uploade_date" : up_data,
                    "hash" : hash
                }
                torrents.push(torrObj)
            });
        }catch(e){}
        try{
            var imdb = movie.imdb_code
        }catch(e){
            var imdb = null
        }
        try{
            movie_url = movie.url
        }catch(e){
            movie_url = null
        }
        try{
            var year = movie.year
        }catch(e){
            var year = null
        }
        try{
            var lang = movie.language
        }catch(e){
            var lang = null
        }
        var movieObj = {
            "name" : name,
            "url" : movie_url,
            "imdb" : imdb,
            "year" : year,
            "language" : lang,
            "torrents" : torrents
        }
        return movieObj
        });
    finalObj.data = await Promise.all(moviePromises)
    return finalObj   
}


module.exports = getMoviedata
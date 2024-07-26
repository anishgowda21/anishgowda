const axios = require('axios');

function buildMagnet(infoHash) {
    return `magnet:?xt=urn:btih:${infoHash}&tr=udp://tracker.coppersurfer.tk:6969/announce&tr=udp://9.rarbg.to:2920/announce&tr=udp://tracker.opentrackr.org:1337&tr=udp://tracker.internetwarriors.net:1337/announce&tr=udp://tracker.leechers-paradise.org:6969/announce&tr=udp://tracker.pirateparty.gr:6969/announce&tr=udp://tracker.cyberia.is:6969/announce`;
}

const base64EncodeImage = async (imageUrl) => {
    try {
        const { data, headers } = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const image = Buffer.from(data, 'binary').toString('base64');
        return `data:${headers['content-type'].toLowerCase()};base64,${image}`;
    } catch (error) {
        console.error('Error encoding image:', error);
        return ''; // Return empty string on error
    }
};

async function getMovieData(query, cimage) {
    console.log("Fetching movie data for:", query);

    const finalObj = {
        status: "ok",
        movie_count: 0,
        query,
        data: []
    };

    const url = `https://yts.am/api/v2/list_movies.json?query_term=${encodeURIComponent(query)}&sort_by=download_count`;

    try {
        const { data } = await axios.get(url);
        const { movie_count, movies } = data.data;
        finalObj.movie_count = movie_count;

        if (movie_count === 0) return finalObj;

        const moviePromises = movies.map(async (movie) => {
            // Encode movie cover image
            const coverImage = cimage ? (movie.large_cover_image ? await base64EncodeImage(movie.large_cover_image) : null) : '';

            // Process torrents
            const torrents = await Promise.all(
                (movie.torrents || []).map(async (torr) => {
                    const torrentObj = {
                        torrent_file: torr.url || null,
                        magnet: torr.hash ? buildMagnet(torr.hash) : null,
                        quality: torr.quality || null,
                        type: torr.type || null,
                        seeds: torr.seeds || null,
                        peers: torr.peers || null,
                        size: torr.size || null,
                        upload_date: torr.date_uploaded || null,
                        hash: torr.hash || null
                    };
                    return torrentObj;
                })
            );

            return {
                name: movie.title_long || null,
                cover_image: coverImage,
                description: movie.synopsis || null,
                imdb: movie.imdb_code || null,
                year: movie.year || null,
                language: movie.language || null,
                torrents
            };
        });

        finalObj.data = await Promise.all(moviePromises);
        return finalObj;
    } catch (error) {
        finalObj.status = "error";
        finalObj.error = error.message;
        return finalObj;
    }
}

module.exports = getMovieData;

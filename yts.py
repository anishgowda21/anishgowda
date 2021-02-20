import requests

from collections import OrderedDict

from requests import exceptions


def build_magnet(info_hash):
    magnet = "magnet:?xt=urn:btih:"+info_hash+"&tr=udp://tracker.coppersurfer.tk:6969/announce&tr=udp://9.rarbg.to:2920/announce&tr=udp://tracker.opentrackr.org:1337&\tr=udp://tracker.internetwarriors.net:1337/announce&tr=udp://tracker.leechers-paradise.org:6969/announce&tr=udp://tracker.coppersurfer.tk:6969/announce&tr=udp://tracker.pirateparty.gr:6969/announce&tr=udp://tracker.cyberia.is:6969/announce"
    return magnet


def getJson(query):
    final_dic = OrderedDict()
    final_dic["status"] = "ok"
    final_dic["movie_count"] = 0
    final_dic["query"] = query
    final_dic["data"] = []

    url = "https://yts.am/api/v2/list_movies.json?query_term=" + \
        query+"&sort_by=download_count"
    query = query.replace(' ', '+')
    try:
        raw_data = requests.get(url).json()
    except exceptions as e:
        final_dic["error"] = str(e.message)
        return final_dic

    if raw_data["data"]["movie_count"] == 0:
        return final_dic

    final_dic["movie_count"] = raw_data["data"]["movie_count"]

    all_movies = raw_data["data"]["movies"]
    for movie in all_movies:
        try:
            name = movie["title_long"]
        except AttributeError:
            name = None
        torrents = []
        try:
            for torr in movie["torrents"]:
                try:
                    quality = torr["quality"]
                except AttributeError:
                    quality = None
                try:
                    download = torr["url"]
                except AttributeError:
                    download = None
                try:
                    hash = torr["hash"]
                    magnet = build_magnet(hash)
                except Exception:
                    hash = None
                    magnet = None
                try:
                    type = torr["type"]
                except AttributeError:
                    type = None

                try:
                    seeds = torr["seeds"]
                except AttributeError:
                    seeds = None

                try:
                    peers = torr["peers"]
                except AttributeError:
                    peers = None

                try:
                    size = torr["size"]
                except AttributeError:
                    size = None

                try:
                    date = torr["date_uploaded"]
                except AttributeError:
                    date = None

                torrObjs = {
                    "torrent_file": download,
                    "magnet": magnet,
                    "quality": quality,
                    "type": type,
                    "seeds": seeds,
                    "peers": peers,
                    "size": size,
                    "upload_date": date,
                    "hash": hash
                }
                torrents.append(torrObjs)
        except Exception:
            pass
        try:
            imdb = movie["imdb_code"]
        except AttributeError:
            imdb = None

        try:
            movie_url = movie["url"]
        except AttributeError:
            movie_url = None

        try:
            year = movie["year"]
        except AttributeError:
            year = None

        try:
            language = movie["language"]
        except AttributeError:
            language = None

        movieObj = {
            "name": name,
            "url": movie_url,
            "imdb_code": imdb,
            "year": year,
            "language": language,
            "torrents": torrents
        }

        final_dic["data"].append(movieObj)

    return (final_dic)

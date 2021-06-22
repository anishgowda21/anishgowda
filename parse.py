import requests
from bs4 import BeautifulSoup as bs
import json


imgbaseUrl = "https://img-c.udemycdn.com/course/750x422/"
url = "https://www.discudemy.com/feed"


def course_url(url):
    gourl = url.split('/')
    gourl[-2] = "go"
    goresp = requests.get('/'.join(gourl)).text
    courseurl = bs(goresp, "html.parser").findAll("a")[11]
    return courseurl


def img_url(input):
    imgurl = imgbaseUrl+(input.find("enclosure")['url'].split("/")[5])
    return imgurl


def getData():
    data = []
    re = requests.get(url).text
    bs_content = bs(re, "lxml")
    results = bs_content.findAll("item")
    for result in results:
        title = result.find("a").contents[0]
        description = result.find("p").getText()
        image = img_url(result)
        link = course_url(result.find("a")['href'])
        finalObj = {
            "title": title,
            "description": description,
            "image": image,
            "link": link.text
        }
        data.append(finalObj)
    return data

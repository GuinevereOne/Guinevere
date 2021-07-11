import requests
import util
from time import time
from json import loads, dumps


def create(string, entities):
    content = None

    if("reply" in util.getQuery()["extra"]):
        content = util.getQuery()["extra"]["reply"]["content"]

    if not content:
        return util.output("end", "empty_paste", util.translate("empty_paste"))

    query = { "apikey": util.config("apikey") }
    payload = { "text": content, "title": "Automatic Upload", "name": "Guinevere"}
    request = requests.post("https://paste.gemwire.uk/api/create", params=query, data=payload)

    url = request.text.strip()

    return util.output("end", "paste_made", util.translate("paste_made", { "paste": url }))

def view_all(string, entities):

    query = { "apikey": util.config("apikey") }
    response = requests.get("https://paste.gemwire.uk/api/recent", params=query)
    list = response.json()

    result = ""

    for element in list:
        result += util.translate("paste_list_element", {
            "id": element["pid"],
            "title": element["title"],
            "user": element["name"]
        })

    return util.output("end", "paste_list", util.translate("paste_list", {
        "count": len(list),
        "result": result
    }))

def view(string, entities):

    pasteID = ""

    for item in entities:
        if item["entity"] == "paste":
            pasteID = item["utteranceText"].lower().strip()
    
    response = requests.get(f"https://paste.gemwire.uk/view/raw/{pasteID}")
    text = response.text

    if len(text) > 1023:
        util.output("end", "text", text[0:1019] + " ...")
    elif len(text) > 0:
        util.output("end", "text", text)
    else:
        util.output("end", "missing_paste", util.translate("missing_paste"))

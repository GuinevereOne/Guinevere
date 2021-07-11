import requests
import util
from time import time
from json import loads, dumps
from random import randint

def view_random(string, entities):

    response = requests.get(util.config("quoteData"))
    data = response.json()

    quoteExists = False

    while not quoteExists:
        quoteNumber = randint(0, len(data["quotes"]))
        quoteExists = data["quotes"][quoteNumber]
    
    quote = data["quotes"][quoteNumber]

    return util.output("end", "quote", util.translate("quote", {
        "ID": quoteNumber,
        "author": quote["user"],
        "text": quote["text"]
    }))

def view(string, entities):
    response = requests.get(util.config("quoteData"))
    data = response.json()

    quoteNumber = 111

    for item in entities:
        if item["entity"] == "quote" or item["entity"] == "id" or item["entity"] == "number":
            quoteNumber = item["utteranceText"].lower().strip()

    quote = data["quotes"][int(quoteNumber) - 1]

    if quote is None:
        return util.output("end", "quote_doesnt_exist", util.translate("quote_doesnt_exist", { "ID": quoteNumber}))

    # TODO: quote side_text
    return util.output("end", "quote", util.translate("quote", {
        "ID": quoteNumber,
        "author": quote["user"],
        "text": quote["text"]
    }))

from json import loads, dumps
from os import path
from random import choice
from sys import argv, stdout
from time import sleep

dirname = path.dirname(path.realpath(__file__))

querypath = argv[1]
codes = []

flow = True

queryfile = open(querypath, "r", encoding = "utf8")
queryobj = loads(queryfile.read())
queryfile.close()

def getQuery():
    return queryobj

def getFlow():
    return flow

def setFlow(newFlow):
    global flow
    flow = newFlow

def config(key):
    file = open(dirname + "/../../data/packages/" + queryobj["package"] + "/config/config.json", "r", encoding = "utf8")
    obj = loads(file.read())
    file.close()
    return obj[queryobj["module"]][key]

def output(type, code, message = ""):
    codes.append(code)

    output = {
        "package":  queryobj["package"],
        "module":   queryobj["module"],
        "action":   queryobj["action"],
        "lang":     queryobj["lang"],
        "input":    queryobj["query"],
        "entities": queryobj["entities"],
        "flow":     flow,
        "output": {
            "type": type,
            "codes": codes,
            "text": message,
            "options": config("options")
        }
    }

    print(dumps(output))

    stdout.flush()

def translate(key, replacements = []):
    output = ""

    file = open(dirname + "/../../data/packages/" + queryobj["package"] + "/answers/" + queryobj["lang"] + ".json", "r", encoding = "utf8")
    obj = loads(file.read())
    file.close()

    prop = obj[queryobj["module"]][key]
    if isinstance(prop, list):
        output = choice(prop)
    else:
        output = prop

    if(replacements):
        for k in replacements:
            output = output.replace("%" + k + "%", str(replacements[k]))

    sleep(0.2)

    return output
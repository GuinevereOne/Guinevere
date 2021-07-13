import util

def conversation(string, entities):
    testFeature = ""

    for item in entities:
        if item["entity"] == "feature":
            testFeature = item["utteranceText"].lower().strip()
        
    return util.output("end", "conversation", util.translate("conversation", { "feature": testFeature }))

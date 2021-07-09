import datetime
from random import randint
import util

def run(string, entities):

    time = datetime.time(datetime.now())

    if(randint(0, 1) != 0):
        if time.hour >= 5 and time.hour <= 10:
            return util.output("end", "morning_1", util.translate("morning_1"))
        if time.hour == 11:
            return util.output("end", "morning", util.translate("morning"))
        if time.hour >= 12 and time.hour <= 17:
            return util.output("end", "afternoon", util.translate("afternoon"))
        if time.hour >= 18 and time.hour <= 21:
            return util.output("end", "evening", util.translate("evening"))
        if time.hour >= 22 and time.hour <= 23:
            return util.output("end", "night", util.translate("night"))
        
        return util.output("end", "late", util.translate("late"))

    return util.output("end", "default", util.translate("default"))
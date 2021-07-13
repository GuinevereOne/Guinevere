import util
import requests
from pyowm import OWM

def getOWM():
    return OWM(util.config("apikey"))

def getWeather(entities, owm):
    for item in entities:
        if item["entity"] == "city":
            util.output("intermediate", "fetching", util.translate("fetching", { "city": item["sourceText"] }))

            city = item["sourceText"]
            report = owm.weather_manager().weather_at_place(city)
            weather = report.weather

            val = {
                "city": city,
                "report": report,
                "weather": weather
            }

            return val

    return util.output("end", "error", util.translate("error"))

def weather_city(source, entities):
    report = getWeather(entities, getOWM())

    detail = report["weather"].detailed_status
    temperature = report["weather"].temperature("celsius")
    humidity = report["weather"].humidity

    return util.output("end", "weather_city", util.translate("weather_city", {
        "status": detail.capitalize(),
        "city": report["city"],
        "temperature": temperature["temp"],
        "humidity": humidity
    }))

def weather_default(source, entities):
    defaultCity = [ { "entity": "city", "sourceText": util.config("default_city") } ]
    weather_city("", defaultCity)


def temperature_city(source, entities):
    report = getWeather(entities, getOWM())
    temperature = report["weather"].temperature("celsius")
    
    return util.output("end", "temperature", util.translate("temperature", {
        "city": report["city"],
        "temperature": temperature["temp"]
    }))

def sunrise_city(source, entities):
    report = getWeather(entities, getOWM())
    datetime = report["weather"].sunrise_time(report["weather"])
    datetime = datetime.astimezone(get_localzone())

    return util.output("end", "sunrise", util.translate("sunrise", {
        "time": datetime.strftime("%H:%M:%S"),
        "city": report["city"]
    }))

def sunset_city(source, entities):
    report = getWeather(entities, getOWM())
    datetime = report["weather"].sunset_time(report["weather"])
    datetime = datetime.astimezone(get_localzone())

    return util.output("end", "sunset", util.translate("sunset", {
        "time": datetime.strftime("%H:%M:%S"),
        "city": report["city"]
    }))
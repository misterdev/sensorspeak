# Sensor Speak


# Table of Contents
1. [Previous Work](#previous-work)
2. [Project Structure+ link setup / deployment](#project-structure)
3. [Intent List](#intent-list)
4. [User Manual](#user-manual)

## Intent List

|INTENT|UTTERANCE|SLOTS|
| ---- | ---- |----|
|AMAZON.LaunchRequest|"sensor speak"||
|-AMAZON.CancelIntent|?||
|-AMAZON.HelpIntent|?||
|-AMAZON.StopIntent|?|
|ListDevicesIntent|"list all sensors"||
|ListLocationsIntent|"list all locations"||
|-GetInfoIntent|"get info in {location}"|location|
|ListByLocationIntent|"list sensors in the {location}"|location|
|GetValueIntent|"get {type} of {location}"|type, location|
|ListByTypeIntent|"list {type} sensors"|type|
|GetAverageIntent|"get average {type}"|type|
|GetAverageOfLocationIntent|"get average {type} of {location}"|type, location|
|GetLastUpdateTimeIntent|"get last update time of {location} {type} sensor"  (//TODO |type, location|
|GetMaxOfLocationIntent| "get maximum {type} of {location}"|type, location|
|GetMinOfLocationIntent| "get minimum {type} of {location}"|type, location|
|-GetUpdateIntervalIntent|"get update interval of {location} {type}"|type, location|
|-GetStateIntent|"get state of {location} {type}"|type, location|
|-SetUpdateIntervalIntent|"set update interval of {location} {type} to {interval}"|type, location|
|-TurnOnOffAllIntent|"turn {on_off} all sensors"|state|
|-TurnOnOffByLocationIntent|"turn {on_off} all sensors in {location}"|location, state|
|-TurnOnOffByTypeIntent|"turn {on_off} all {type} "|type, state|
|-TurnOnOffIntent|"turn {on_off} {location} {type}"|type, location, state|
|-ListByStateIntent|"list all sensor in {on_off} mode"|state|

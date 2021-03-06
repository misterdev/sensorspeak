# Sensor Speak


# Table of Contents
1. [Project Structure](#project-structure)
2. [Intent List](#intent-list)
3. [SEPA Structure](#sepa-structure)
4. [User Manual](#user-manual)

- [Presentation](https://docs.google.com/presentation/d/1z1K3b1ayt4vse97CCCZw-YXvw6vxNNqit3ZHSa7MjD0/edit#slide=id.g4f1755e562_4_30)

## Project Structure

See the [README](../README.md) for the setup/development instructions.

```
|_ .ask
    |_ config                   // Skill & Lambda deployment config (skill_id, functionName, ...)
|_ lambda
    |_ index.js                 // lambda function entry
    |_ sepa
        |_ index.js             // SEPA utility entry point
        |_ queryBuilder.js      // SEPA query templates
    |_ utils
        |_ alexa.js             // alexa utility
        |_ responseBuilder.js   // alexa response templates
|_ hooks/                       // no touch pls thx
|_ models
    |_ en-US.json               // english skill model
    |_ (it-IT.json)             // here you can define new localized models
|_ tests
    |_ response.test.yml        // tests
    |_ SEPAFilter.json          // SEPA server mock
|_ skill.json                   // Skill settings (name, description, ...)
|_ testing.json                 // bespoked testing configurations
```


## Intent List

|INTENT|UTTERANCE|SLOTS|
| ---- | ---- |----|
|AMAZON.LaunchRequest|"sensor speak"||
|-AMAZON.CancelIntent|?||
|-AMAZON.HelpIntent|?||
|-AMAZON.StopIntent|?||
|ListDevicesIntent|"list all sensors"||
|ListLocationsIntent|"list all locations"||
|ListByLocationIntent|"list sensors in the {location}"|location|
|ListByTypeIntent|"list {type} sensors"|type|
|ListByStateIntent|"list all sensor in {status} mode"|state|
|GetValueIntent|"get {type} of {location}"|type, location|
|GetAverageOfTypeIntent|"get average {type}"|type|
|GetAverageOfLocationIntent|"get average {type} of {location}"|type, location|
|GetLastUpdateTimeIntent|"get last update time of {location} {type} sensor"  (|type, location|
|GetMaxOfLocationIntent| "get maximum {type} of {location}"|type, location|
|GetMinOfLocationIntent| "get minimum {type} of {location}"|type, location|
|GetStateIntent|"get state of {location} {type}"|type, location|
|TurnOnOffIntent|"turn {status} {location} {type}"|type, location, state|
|TurnOnOffByLocationIntent|"turn {status} all sensors in {location}"|location, state|
|TurnOnOffByTypeIntent|"turn {status} all {type} "|type, state|
|SetUpdateIntervalIntent|"set update interval of {location} {type} to {interval}"|type, location|
|GetUpdateIntervalIntent|"get update interval of {location} {type}"|type, location|

## SEPA Structure
### Current Structure (as of March 1st 2019)
```sparql
?obs a sosa:Observation ;
    sosa:hasResult ?result ;
    sosa:resultTime "2019-03-01T16:19:12.411296"
    sosa:hasFeatureOfInterest ?place ;
    rdf:label "MML Core 3 (Mars)" ;
    rdf:comment 'Temperatura Server MML Core 3' ;
    arces-monitor:hasMqttTopic 'arces/servers/mars/mml/cpu/core-3/temperature' .

?place a schema:Place ;
    schema:containedInPlace ?place2 ;
    schema:name String ;
    schema:GeoCoordinates <nodeID://XXXX> .

?result a qudt-1-1:QuantityValue ;
    qudt-1-1:unit qudt-unit-1-1:DegreeCelsius ;
    qudt-1-1:numericValue 25.9 .

?value arces-monitor:refersTo ?obs ;
    time:inXSDDateTimeStamp	"2019-02-07T14:53:15.274146" ;
    qudt-1-1:numericValue 23.93 .
```

### Additions

#### 1. TYPE
Per definire il tipo dei sensori è stato usato [m3lite](https://github.com/fiesta-iot/ontology/blob/master/m3-lite.owl):

```sparql
m3lite:Temperature a sosa:ObservableProperty .
m3lite:BoardTemperature a sosa:ObservableProperty .
m3lite:BuildingTemperature a sosa:ObservableProperty .
m3lite:SoilHumidity a sosa:ObservableProperty .
m3lite:Humidity a sosa:ObservableProperty .
m3lite:Voltage a sosa:ObservableProperty .
m3lite:AtmosphericPressure a sosa:ObservableProperty .
m3lite:BatteryLevel a sosa:ObservableProperty .
```

Ogni Observation è fatta da un sensore `sensor = <sensor/XXXX>`

```sparql
?obs sosa:madeBySensor ?sensor .
```

Ogni sensore osserva una `sosa:ObservedProperty`

```sparql
?sensor sosa:observes m3lite:Temperature .
```


#### 2. UPDATE INTERVAL
L'update interval è stato definito come:

```sparql
?obs arces-monitor:hasUpdateInterval ?interval .
?interval a qudt:QuantityValue ;
    qudt:unit qudt-unit:Hour ;
    qudt:numericValue (XMLSchema#decimal) 2 .
```


#### 3. STATE

Ogni sensore ha il proprio stato on/off:

```sparql
    <sensor/XXX> ssn:hasProperty <sensor/XXXX#state> . 
```

Ogni stato è una `sosa:ActuatableProperty` gestita dall'attuatore `arces-monitor:alexa-actuator`

```sparql
<sensor/XXXX#state> a sosa:ActuatableProperty ;
    sosa:isActedOnBy <actuation/XXXX> .

arces-monitor:alexa-actuator a sosa:Actuator ;
    sosa:madeActuation <actuation/XXXX> ;
    ssn:forProperty <sensor/XXXX#state> .
```

Ogni switch di stato è registrato come `sosa:Actuation`:

```sparql
<actuation/XXXX> a sosa:Actuation ;
    sosa:actsOnProperty  <sensor/XXXX#state> ;
    sosa:actuationMadeBy <actuator/XXXX> ; 
    sosa:hasSimplResult true ;
    sosa:resultTime "2017-04-18T17:24:00+02:00"^^xsd:dateTimeStamp .
```

### User Manual
La skill risponde a richieste in inglese, per una lista vedi la lista di [intent](#intent-list).

Alcune skill richiedono dei parametri (slot) che possono essere: tipo, location, stato e interval, es: `alexa tell sensor speak to get all devices in mars garden`.

**NB** per le richieste che hanno come parametri il luogo ed un altro slot, l'unica modalità di interazione possibile è quella dialogo:

```
User> alexa tell sensor speak to get the temperature in mars garden ❌

User> alexa tell sensor speak to get the temperature ✔️
    Alexa> In which location?
    User> Mars garden
    Alexa> The temperature in mars garden is 20°

User> alexa tell sensor speak to get the value for mars garden ✔️
    Alexa> Which type?
    User> Temperature
    Alexa> The temperature in mars garden is 20°
```

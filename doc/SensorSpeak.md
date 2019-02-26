# Sensor Speak


# Table of Contents
1. [Project Structure](#project-structure)
2. [Intent List](#intent-list)
3. [SEPA Structure](#sepa-structure)
4. [User Manual](#user-manual)
5. [Presentation](https://docs.google.com/presentation/d/1z1K3b1ayt4vse97CCCZw-YXvw6vxNNqit3ZHSa7MjD0/edit#slide=id.g4f1755e562_4_30)

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
|_ hooks
    |_ pre_deply_hook.sh        // no touch pls thx
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
|GetValueIntent|"get {type} of {location}"|type, location|
|ListByTypeIntent|"list {type} sensors"|type|
|GetAverageIntent|"get average {type}"|type|
|GetAverageOfLocationIntent|"get average {type} of {location}"|type, location|
|==GetLastUpdateTimeIntent|"get last update time of {location} {type} sensor"  (//TODO |type, location|
|==GetMaxOfLocationIntent| "get maximum {type} of {location}"|type, location|
|==GetMinOfLocationIntent| "get minimum {type} of {location}"|type, location|
|=GetUpdateIntervalIntent|"get update interval of {location} {type}"|type, location|
|-GetStateIntent|"get state of {location} {type}"|type, location|
|-SetUpdateIntervalIntent|"set update interval of {location} {type} to {interval}"|type, location|
|-TurnOnOffAllIntent|"turn {on_off} all sensors"|state|
|-TurnOnOffByLocationIntent|"turn {on_off} all sensors in {location}"|location, state|
|-TurnOnOffByTypeIntent|"turn {on_off} all {type} "|type, state|
|-TurnOnOffIntent|"turn {on_off} {location} {type}"|type, location, state|
|-ListByStateIntent|"list all sensor in {on_off} mode"|state|

## SEPA Structure
### Current Structure (as of Feb. 2019)
```sparql
?obs a sosa:Observation ;
    sosa:hasResult ?result ;
    sosa:hasFeatureOfInterest ;
    rdf:label (XMLSchema#string) "MML Core 3 (Mars)" ;
    rdf:comment (XMLSchema#string) 'Temperatura Server MML Core 3' ;
    arces-monitor:hasMqttTopic 'arces/servers/mars/mml/cpu/core-3/temperature' .

?place a schema:Place ;
    schema:containedInPlace ?place2 ;
    schema:name String ;
    schema:GeoCoordinates <nodeID://XXXX> .

?result a qudt-1-1:QuantityValue ;
    qudt-1-1:unit qudt-unit-1-1:Millibar ;
    qudt-1-1:numericValue (XMLSchema#decimal) 0.36 .

// value = nodeID://YYYY
?value arces-monitor:refersTo ?result ;
    time:inXSDDateTimeStamp (XMLSchema#dateTime) 2018-11-11T04:01:39.544057 ;
    qudt-1-1:numericValue (XMLSchema#decimal) 27.35 .
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
qudt-unit
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


```
INSERT {
  GRAPH <http://devidtest/graph> {
    m3lite:Temperature a sosa:ObservableProperty .
    m3lite:BoardTemperature a sosa:ObservableProperty .
    m3lite:BuildingTemperature a sosa:ObservableProperty .
    m3lite:SoilHumidity a sosa:ObservableProperty .
    m3lite:Humidity a sosa:ObservableProperty .
    m3lite:Voltage a sosa:ObservableProperty .
    m3lite:AtmosphericPressure a sosa:ObservableProperty .
    m3lite:BatteryLevel a sosa:ObservableProperty .

      
    arces-monitor:alexa-actuator a sosa:Actuator ;
      sosa:madeActuation <actuation://devid-temp-1> ;
      sosa:madeActuation <actuation://devid-temp-2> ;
      sosa:madeActuation <actuation://devid-temp-3> ;
      sosa:madeActuation <actuation://devid-temp-4> ;
      sosa:madeActuation <actuation://devid-temp-5> ;
      sosa:madeActuation <actuation://devid-temp-6> ;
      sosa:madeActuation <actuation://devid-temp-7> ;
      sosa:madeActuation <actuation://devid-temp-8> ;
      sosa:madeActuation <actuation://devid-temp-9> .

    arces-monitor:devid-temp-1 a sosa:Observation ;
      rdf:label "Devid Test 1(Temperature)" ;
      sosa:madeBySensor <sensor://devid-temp-1> ;
      sosa:hasResult <result://devid-temp-1> ;
      sosa:hasFeatureOfInterest <place://devid-temp-1> ;
      arces-monitor:hasUpdateInterval <interval://devid-temp-1> .
    <interval://devid-temp-1> a qudt:QuantityValue ;
        qudt:unit qudt-unit:MilliSecond ;
        qudt:numericValue (XMLSchema#decimal) 3600000 .
    <result://devid-temp-1> a qudt-1-1:QuantityValue ;
      qudt-1-1:numericValue 0.36 .
    <place://devid-temp-1> a schema:Place ;
      schema:name "DEVID HOUSE 1" .
    <sensor://devid-temp-1> a sosa:Sensor ;
      sosa:observes m3lite:Temperature ;
      ssn:hasProperty <sensor://devid-temp-1#state> .
    <sensor://devid-temp-1#state> a sosa:ActuatableProperty ;
      sosa:isActedOnBy <actuation://devid-temp-1> .
    <actuation://devid-temp-1> a sosa:Actuation ;
      sosa:actsOnProperty  <sensor://devid-temp-1#state> ;
      sosa:actuationMadeBy arces-monitor:alexa-actuator ; 
      sosa:hasSimplResult true ;
      sosa:resultTime "2017-04-18T17:24:00+02:00"^^xsd:dateTimeStamp .

    arces-monitor:devid-temp-2 a sosa:Observation ;
      rdf:label "Devid Test 2(Temperature)" ;
      sosa:madeBySensor <sensor://devid-temp-2> ;
      sosa:hasResult <result://devid-temp-2> ;
      sosa:hasFeatureOfInterest <place://devid-temp-2> ;
      arces-monitor:hasUpdateInterval <interval://devid-temp-2> .
    <interval://devid-temp-2> a qudt:QuantityValue ;
        qudt:unit qudt-unit:MilliSecond ;
        qudt:numericValue (XMLSchema#decimal) 3600000 .
    <result://devid-temp-2> a qudt-1-1:QuantityValue ;
      qudt-1-1:numericValue 0.36 .
    <place://devid-temp-2> a schema:Place ;
      schema:name "DEVID HOUSE 2" .
    <sensor://devid-temp-2> a sosa:Sensor ;
      sosa:observes m3lite:Temperature ;
      ssn:hasProperty <sensor://devid-temp-2#state> .
    <sensor://devid-temp-2#state> a sosa:ActuatableProperty ;
      sosa:isActedOnBy <actuation://devid-temp-2> .
    <actuation://devid-temp-2> a sosa:Actuation ;
      sosa:actsOnProperty  <sensor://devid-temp-2#state> ;
      sosa:actuationMadeBy arces-monitor:alexa-actuator ; 
      sosa:hasSimplResult true ;
      sosa:resultTime "2017-04-18T17:24:00+02:00"^^xsd:dateTimeStamp .

    arces-monitor:devid-temp-3 a sosa:Observation ;
      rdf:label "Devid Test 3(Temperature)" ;
      sosa:madeBySensor <sensor://devid-temp-3> ;
      sosa:hasResult <result://devid-temp-3> ;
      sosa:hasFeatureOfInterest <place://devid-temp-3> ;
      arces-monitor:hasUpdateInterval <interval://devid-temp-3> .
    <interval://devid-temp-3> a qudt:QuantityValue ;
        qudt:unit qudt-unit:MilliSecond ;
        qudt:numericValue (XMLSchema#decimal) 3600000 .
    <result://devid-temp-3> a qudt-1-1:QuantityValue ;
      qudt-1-1:numericValue 0.36 .
    <place://devid-temp-3> a schema:Place ;
      schema:name "DEVID HOUSE 3" .
    <sensor://devid-temp-3> a sosa:Sensor ;
      sosa:observes m3lite:Temperature ;
      ssn:hasProperty <sensor://devid-temp-3#state> .
    <sensor://devid-temp-3#state> a sosa:ActuatableProperty ;
      sosa:isActedOnBy <actuation://devid-temp-3> .
    <actuation://devid-temp-3> a sosa:Actuation ;
      sosa:actsOnProperty  <sensor://devid-temp-3#state> ;
      sosa:actuationMadeBy arces-monitor:alexa-actuator ; 
      sosa:hasSimplResult true ;
      sosa:resultTime "2017-04-18T17:24:00+02:00"^^xsd:dateTimeStamp .

    arces-monitor:devid-temp-4 a sosa:Observation ;
      rdf:label "Devid Test 4(BoardTemperature)" ;
      sosa:madeBySensor <sensor://devid-temp-4> ;
      sosa:hasResult <result://devid-temp-4> ;
      sosa:hasFeatureOfInterest <place://devid-temp-4> ;
      arces-monitor:hasUpdateInterval <interval://devid-temp4> .
    <interval://devid-temp4> a qudt:QuantityValue ;
        qudt:unit qudt-unit:MilliSecond ;
        qudt:numericValue (XMLSchema#decimal) 3600000 .
    <result://devid-temp-4> a qudt-1-1:QuantityValue ;
      qudt-1-1:numericValue 0.40 .
    <place://devid-temp-4> a schema:Place ;
      schema:name "DEVID HOUSE 4" .
    <sensor://devid-temp-4> a sosa:Sensor ;
      sosa:observes m3lite:BoardTemperature ;
      ssn:hasProperty <sensor://devid-temp-4#state> .
    <sensor://devid-temp-4#state> a sosa:ActuatableProperty ;
      sosa:isActedOnBy <actuation://devid-temp-4> .
    <actuation://devid-temp-4> a sosa:Actuation ;
      sosa:actsOnProperty  <sensor://devid-temp-4#state> ;
      sosa:actuationMadeBy arces-monitor:alexa-actuator ; 
      sosa:hasSimplResult false ;
      sosa:resultTime "2017-04-18T17:24:00+02:00"^^xsd:dateTimeStamp .

    arces-monitor:devid-temp-5 a sosa:Observation ;
      rdf:label "Devid Test 5(SoilHumidity)" ;
      sosa:madeBySensor <sensor://devid-temp-5> ;
      sosa:hasResult <result://devid-temp-5> ;
      sosa:hasFeatureOfInterest <place://devid-temp-5> ;
      arces-monitor:hasUpdateInterval <interval://devid-temp-5> .
    <interval://devid-temp-5> a qudt:QuantityValue ;
        qudt:unit qudt-unit:MilliSecond ;
        qudt:numericValue (XMLSchema#decimal) 3600000 .
    <result://devid-temp-5> a qudt-1-1:QuantityValue ;
      qudt-1-1:numericValue 36 .
    <place://devid-temp-5> a schema:Place ;
      schema:name "DEVID HOUSE 5" .
    <sensor://devid-temp-5> a sosa:Sensor ;
      sosa:observes m3lite:SoilHumidity ;
      ssn:hasProperty <sensor://devid-temp-5#state> .
    <sensor://devid-temp-5#state> a sosa:ActuatableProperty ;
      sosa:isActedOnBy <actuation://devid-temp-5> .
    <actuation://devid-temp-5> a sosa:Actuation ;
      sosa:actsOnProperty  <sensor://devid-temp-5#state> ;
      sosa:actuationMadeBy arces-monitor:alexa-actuator ; 
      sosa:hasSimplResult true ;
      sosa:resultTime "2017-04-18T17:24:00+02:00"^^xsd:dateTimeStamp .
      
    arces-monitor:devid-temp-6 a sosa:Observation ;
      rdf:label "Devid Test 6(Humidity)" ;
      sosa:madeBySensor <sensor://devid-temp-6> ;
      sosa:hasResult <result://devid-temp-6> ;
      sosa:hasFeatureOfInterest <place://devid-temp-6> ;
      arces-monitor:hasUpdateInterval <interval://devid-temp-6> .
    <interval://devid-temp-6> a qudt:QuantityValue ;
        qudt:unit qudt-unit:MilliSecond ;
        qudt:numericValue (XMLSchema#decimal) 3600000 .
    <result://devid-temp-6> a qudt-1-1:QuantityValue ;
      qudt-1-1:numericValue 36 .
    <place://devid-temp-6> a schema:Place ;
      schema:name "DEVID HOUSE 6" .
    <sensor://devid-temp-6> a sosa:Sensor ;
      sosa:observes m3lite:Humidity ;
      ssn:hasProperty <sensor://devid-temp-6#state> .
    <sensor://devid-temp-6#state> a sosa:ActuatableProperty ;
      sosa:isActedOnBy <actuation://devid-temp-6> .
    <actuation://devid-temp-6> a sosa:Actuation ;
      sosa:actsOnProperty  <sensor://devid-temp-6#state> ;
      sosa:actuationMadeBy arces-monitor:alexa-actuator ; 
      sosa:hasSimplResult false ;
      sosa:resultTime "2017-04-18T17:24:00+02:00"^^xsd:dateTimeStamp .

    arces-monitor:devid-temp-7 a sosa:Observation ;
      rdf:label "Devid Test 7(Voltage)" ;
      sosa:madeBySensor <sensor://devid-temp-7> ;
      sosa:hasResult <result://devid-temp-7> ;
      sosa:hasFeatureOfInterest <place://devid-temp-7> ;
      arces-monitor:hasUpdateInterval <interval://devid-temp-7> .
    <interval://devid-temp-7> a qudt:QuantityValue ;
        qudt:unit qudt-unit:MilliSecond ;
        qudt:numericValue (XMLSchema#decimal) 3600000 .
    <result://devid-temp-7> a qudt-1-1:QuantityValue ;
      qudt-1-1:numericValue 38 .
    <place://devid-temp-7> a schema:Place ;
      schema:name "DEVID HOUSE 7" .
    <sensor://devid-temp-7> a sosa:Sensor ;
      sosa:observes m3lite:Voltage ;
      ssn:hasProperty <sensor://devid-temp-7#state> .
    <sensor://devid-temp-7#state> a sosa:ActuatableProperty ;
      sosa:isActedOnBy <actuation://devid-temp-7> .
    <actuation://devid-temp-7> a sosa:Actuation ;
      sosa:actsOnProperty  <sensor://devid-temp-7#state> ;
      sosa:actuationMadeBy arces-monitor:alexa-actuator ; 
      sosa:hasSimplResult false ;
      sosa:resultTime "2017-04-18T17:24:00+02:00"^^xsd:dateTimeStamp .

    arces-monitor:devid-temp-8 a sosa:Observation ;
      rdf:label "Devid Test 8(AtmosphericPressure)" ;
      sosa:madeBySensor <sensor://devid-temp-8> ;
      sosa:hasResult <result://devid-temp-8> ;
      sosa:hasFeatureOfInterest <place://devid-temp-8> ;
      arces-monitor:hasUpdateInterval <interval://devid-temp-8> .
    <interval://devid-temp-8> a qudt:QuantityValue ;
        qudt:unit qudt-unit:MilliSecond ;
        qudt:numericValue (XMLSchema#decimal) 3600000 .
    <result://devid-temp-8> a qudt-1-1:QuantityValue ;
      qudt-1-1:numericValue 89 .
    <place://devid-temp-8> a schema:Place ;
      schema:name "DEVID HOUSE 8" .
    <sensor://devid-temp-8> a sosa:Sensor ;
      sosa:observes m3lite:AtmosphericPressure .
      ssn:hasProperty <sensor://devid-temp-8#state> .
    <sensor://devid-temp-8#state> a sosa:ActuatableProperty ;
      sosa:isActedOnBy <actuation://devid-temp-8> .
    <actuation://devid-temp-8> a sosa:Actuation ;
      sosa:actsOnProperty  <sensor://devid-temp-8#state> ;
      sosa:actuationMadeBy arces-monitor:alexa-actuator ; 
      sosa:hasSimplResult true ;
      sosa:resultTime "2017-04-18T17:24:00+02:00"^^xsd:dateTimeStamp .

    arces-monitor:devid-temp-9 a sosa:Observation ;
      rdf:label "Devid Test 9(BatteryLevel)" ;
      sosa:madeBySensor <sensor://devid-temp-9> ;
      sosa:hasResult <result://devid-temp-9> ;
      sosa:hasFeatureOfInterest <place://devid-temp-9> ;
      arces-monitor:hasUpdateInterval <interval://devid-XXX> .
    <interval://devid-XXX> a qudt:QuantityValue ;
        qudt:unit qudt-unit:MilliSecond ;
        qudt:numericValue (XMLSchema#decimal) 3600000 .
    <result://devid-temp-9> a qudt-1-1:QuantityValue ;
      qudt-1-1:numericValue 99 .
    <place://devid-temp-9> a schema:Place ;
      schema:name "DEVID HOUSE 9" .
    <sensor://devid-temp-9> a sosa:Sensor ;
      sosa:observes m3lite:BatteryLevel ;
      ssn:hasProperty <sensor://devid-XXX#state> .
    <sensor://devid-XXX#state> a sosa:ActuatableProperty ;
      sosa:isActedOnBy <actuation://devid-XXX> .
    <actuation://devid-XXX> a sosa:Actuation ;
      sosa:actsOnProperty  <sensor://devid-XXX#state> ;
      sosa:actuationMadeBy arces-monitor:alexa-actuator ; 
      sosa:hasSimplResult false ;
      sosa:resultTime "2017-04-18T17:24:00+02:00"^^xsd:dateTimeStamp .
  }
}
```
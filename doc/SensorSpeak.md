# Sensor Speak


# Table of Contents
1. [Previous Work](#previous-work)
2. [Project Structure+ link setup / deployment](#project-structure)
3. [Intent List](#intent-list)
4. [SEPA Structure](#sepa-structure)
5. [Work Done](#work-done)
6. [User Manual](#user-manual)


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
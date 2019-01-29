# SEPA DATA STRUCTURE
```sparql
O a sosa:Observation
O sosa:hasResult R
O sosa:hasFeatureOfInterest P
O rdf:label (XMLSchema#string) "MML Core 3 (Mars)"
O rdf:comment (XMLSchema#string) 'Temperatura Server MML Core 3'
O arces-monitor:hasMqttTopic 'arces/servers/mars/mml/cpu/core-3/temperature'

P a schema:Place
P schema:containedInPlace P2
P schema:name String
P schema:GeoCoordinates <nodeID://...>

R = [nodeID://... , arces-monitor:QuantityValue]
R a qudt-1-1:QuantityValue
R qudt-1-1:unit qudt-unit-1-1:Millibar
R qudt-1-1:numericValue (XMLSchema#decimal) 0.36

N = nodeID://....
N arces-monitor:refersTo R
N time:inXSDDateTimeStamp (XMLSchema#dateTime) 2018-11-11T04:01:39.544057
N qudt-1-1:numericValue (XMLSchema#decimal) 27.35
```

## STRUTTURA AGGIUNTIVA

Questa e' la struttura proposta per aggiungere i seguenti dati al SEPA:

- Tipo di sensore (umidità, pressione, temperatura, ...)
- Energia residua per sensori dotati di batteria
- Update Interval del sensore
- Stato on/off di accensione del sensore

```sparql
m3lite:Temperature a sosa:ObservableProperty .
m3lite:BoardTemperature a sosa:ObservableProperty .
m3lite:BuildingTemperature a sosa:ObservableProperty .
m3lite:SoilHumidity a sosa:ObservableProperty .
m3lite:Humidity a sosa:ObservableProperty .
m3lite:Voltage a sosa:ObservableProperty .
m3lite:AtmosphericPressure a sosa:ObservableProperty .
m3lite:BatteryLevel a sosa:ObservableProperty .

// --- TYPE
// Ogni Observation è fatta da un sensore S = <sensor/XXXX> con X = 1, 2, 3, ...

O sosa:madeBySensor S .

// Ogni sensore S osserva una sosa:ObservedProperty, che corrisponde ad una delle Classi di m3lite
// che estendono http://purl.org/NET/ssnx/qu/qu#QuantityValue

S sosa:observes m3lite:Temperature .

// --- ON/OFF State
// Ogni sensore ha il proprio stato

<sensor/XXX> ssn:hasProperty <sensor/XXXX#state> . 

// Ogni stato è una ActuatableProperty gestita da un attuatore

<sensor/XXXX#state> a sosa:ActuatableProperty ;
  sosa:isActedOnBy <actuation/XXXX> .

<actuator/XXXX> a sosa:Actuator ;
  sosa:madeActuation <actuation/XXXX> ;
  ssn:forProperty <sensor/XXXX#state> .

<actuation/XXXX> a sosa:Actuation ;
  sosa:actsOnProperty  <sensor/XXXX#state> ;
  sosa:actuationMadeBy <actuator/XXXX> ; 
  sosa:hasSimplResult true .

// --- Battery
// Per ogni sensore con batteria si crea una Observation che ha come featureOfInterest il sensore stesso
// e come tipo m3lite:BatteryLevel

// --- Update Interval

O arces-monitor:hasUpdateInterval R .
R a qudt:QuantityValue ;
    qudt:unit qudt-unit:Hour ;
    qudt:numericValue (XMLSchema#decimal) 2 .
```

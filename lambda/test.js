const fs = require('fs')
const _ = require('lodash')

const SparqlClient = require('sparql-client-2')
const Fuse = require('fuse.js')
const SEPA = require('./sepa')
const Alexa = require('./utils/alexa')

const endpoint = 'http://mml.arces.unibo.it:8000/query'
const updateEndpoint = 'http://mml.arces.unibo.it:8000/update'
const queryString = require('query-string')

const client = new SparqlClient(endpoint, { updateEndpoint }).register({
  schema: 'http://schema.org/',
  rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  rdfs: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  sosa: 'http://www.w3.org/ns/sosa/',
  'qudt-1-1': 'http://qudt.org/1.1/schema/qudt#',
  'qudt-unit-1-1': 'http://qudt.org/1.1/vocab/unit#',
  'arces-monitor': 'http://wot.arces.unibo.it/monitor#',
  mqtt: 'http://wot.arces.unibo.it/mqtt#',
  time: 'http://www.w3.org/2006/time#',
  xsd: 'http://www.w3.org/2001/XMLSchema#',
  m3lite: 'http://purl.org/iot/vocab/m3-lite#'
})

// new Date(new Date(request.timestamp).getTime() - 24*60*60*1000)
const queryByDate = `
    SELECT DISTINCT ?t
    WHERE {
        <http://wot.arces.unibo.it/monitor#ServerSambaHDDSda> sosa:hasResult ?r .
        ?r a qudt-1-1:QuantityValue .
        ?n arces-monitor:refersTo ?r ;
            time:inXSDDateTimeStamp ?t .
        FILTER ( ?t <= xsd:dateTime('2018-11-10T19:29:09.484990') )
    }
`

// TODO aggiungere type e time
const GetAverageOfLocationQuery = (location, type) => `
    SELECT DISTINCT ?label AVG(?val) as ?avgVal
    WHERE {
        ?obs sosa:hasFeatureOfInterest ${location} ;
            rdf:label ?label ;
            sosa:hasResult ?r .
        ?r a qudt-1-1:QuantityValue .
        ?node arces-monitor:refersTo ?r ;
            time:inXSDDateTimeStamp ?t ;
            qudt-1-1:numericValue ?val
    }
    GROUP BY ?label
`

const insert = () => `
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
`

const getGraph = () => `
    SELECT *
    WHERE {
        ?obs a sosa:Observation ;
          rdf:label ?label ;
          sosa:madeBySensor ?sensor ;
          sosa:hasResult ?result ;
          sosa:hasFeatureOfInterest ?place .
        ?sensor a sosa:Sensor ;
          sosa:observes ?type .
        ?result a qudt-1-1:QuantityValue ;
          qudt-1-1:numericValue ?value .
        ?place a schema:Place ;
          schema:name ?name .
    }
`

const type = () => `
    SELECT ?label
    WHERE {
        ?obs a sosa:Observation ;
          rdf:label ?label ;
          sosa:madeBySensor ?sensor .
        ?sensor a sosa:Sensor ;
          sosa:observes m3lite:Humidity .
    }
`
const LaunchRequestQuery = () => `
    SELECT *
    WHERE {
        ?x a sosa:Observation .
    }
`
const GetInfoIntentQuery = () => `
    SELECT *
    WHERE {
        ?x a sosa:Observation .
    }
`

async function x () {
  let query
  query = LaunchRequestQuery
  const result = await SEPA.query(query, {
    location: 'http://wot.arces.unibo.it/monitor#Mars_Garden',
    type: 'http://purl.org/iot/vocab/m3-lite#Temperature'
  })
  console.log(result)
}
x()

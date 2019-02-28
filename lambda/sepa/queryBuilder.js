const LaunchRequestQuery = () => `
    SELECT DISTINCT ?x
    WHERE {
        arces-monitor:swamp_devices_moisture1_up_Battery_Level ?p ?o ;
            rdf:label ?x .
    }
`
const ListDevicesQuery = () => `
    SELECT DISTINCT ?x
    WHERE {
        ?obs ?p sosa:Observation ;
            rdf:label ?x .
    }
`

const ListByLocationQuery = ({ location }) => `
    SELECT DISTINCT ?x
    WHERE {
        ?obs sosa:hasFeatureOfInterest <${location}> ;
            rdf:label ?x .
    }
`

const GetValueQuery = ({ location, type }) => `
    SELECT DISTINCT ?label ?val
    WHERE {
        ?obs a sosa:Observation ; 
            sosa:hasFeatureOfInterest <${location}> ;
            rdf:label ?label ;
            sosa:hasResult ?result ;
            sosa:madeBySensor ?sensor .
        ?sensor a sosa:Sensor ;
            sosa:observes <${type}> .
        ?result qudt-1-1:numericValue ?val .
    }
`

const ListLocationsQuery = () => `
    SELECT DISTINCT ?x
    WHERE {
        ?o a sosa:Observation ;
            sosa:hasFeatureOfInterest ?p .
        ?p schema:name ?x .
    }  
`

const ListByTypeQuery = ({ type }) => `
    SELECT ?x
    WHERE {
        ?obs a sosa:Observation ;
            rdf:label ?x ;
            sosa:madeBySensor ?sensor .
        ?sensor a sosa:Sensor ;
            sosa:observes <${type}> .
    }
`

const GetAverageQuery = ({ type }) => `
    SELECT AVG(?val) as ?x
    WHERE {
        ?obs a sosa:Observation ;
            sosa:hasResult ?result ;
            sosa:madeBySensor ?sensor .
        ?sensor a sosa:Sensor ;
            sosa:observes <${type}> .
        ?result qudt-1-1:numericValue ?val .
    }
`

// TODO mettere type
// TODO in sepa i result non sono QUANTITY VALUE
const GetAverageOfLocationQuery = ({ location, type }) => {
  const date = new Date(
    new Date().setDate(new Date().getDate() - 1)
  ).toISOString()
  return `
    SELECT AVG(?val) as ?x
    WHERE {
        ?obs sosa:hasFeatureOfInterest <${location}> ;
            sosa:hasResult ?result .
        ?node arces-monitor:refersTo ?result ;
            time:inXSDDateTimeStamp ?date ;
            qudt-1-1:numericValue ?val .
        FILTER (?date > "${date}"^^xsd:dateTime)
    }`
}
// TODO mettere type
// TODO in sepa i result non sono QUANTITY VALUE

const GetMaxOfLocationQuery = ({ location, type }) => {
  const date = new Date(
    new Date().setDate(new Date().getDate() - 7)
  ).toISOString()
  return `
    SELECT MAX(?val) as ?x
    WHERE {
        ?obs sosa:hasFeatureOfInterest <${location}> ;
            sosa:hasResult ?result .
        ?node arces-monitor:refersTo ?result ;
            time:inXSDDateTimeStamp ?date ;
            qudt-1-1:numericValue ?val .
        FILTER (?date > "${date}"^^xsd:dateTime)
    }`
}
// TODO mettere type
// TODO in sepa i result non sono QUANTITY VALUE
const GetMinOfLocationQuery = ({ location, type }) => {
  const date = new Date(
    new Date().setDate(new Date().getDate() - 7)
  ).toISOString()
  return `
    SELECT MIN(?val) as ?x
    WHERE {
        ?obs sosa:hasFeatureOfInterest <${location}> ;
            sosa:hasResult ?result .
        ?node arces-monitor:refersTo ?result ;
            time:inXSDDateTimeStamp ?date ;
            qudt-1-1:numericValue ?val .
        FILTER (?date > "${date}"^^xsd:dateTime)
    }`
}

// TODO mettere type
// TODO in sepa i result non sono QUANTITY VALUE
const GetLastUpdateTimeQuery = ({ location, type }) => {
  // Filtriamo solo le observation relative all'ultimo anno
  // altrimenti il tempo necessario alla query e' ~10s e la
  // lambda function muore. Cosi' facendo abbiamo tempi 1.42s
  const date = new Date(
    new Date().setDate(new Date().getDate() - 12 * 30)
  ).toISOString()
  return `
        SELECT ?label ?date
        WHERE {
            ?obs sosa:hasFeatureOfInterest <${location}> ;
                rdf:label ?label ;
                sosa:hasResult ?result .
            ?node arces-monitor:refersTo ?result ;
                time:inXSDDateTimeStamp ?date ;
                qudt-1-1:numericValue ?val .
            FILTER (?date > "${date}"^^xsd:dateTime)
        }
        ORDER BY DESC(?date)
        LIMIT 1
`
}

const ListByStateQuery = ({ status }) => `
    SELECT ?x
    WHERE {
        ?obs a sosa:Observation ;
          sosa:madeBySensor ?sensor ;
          rdf:label ?x .
        ?sensor a sosa:Sensor ;
          ssn:hasProperty ?sensorstate .
        ?actuation sosa:actsOnProperty ?sensorstate ;
          sosa:actuationMadeBy arces-monitor:alexa-actuator ; 
          sosa:hasSimpleResult ${status === 'on'} .
    }
`

const GetStateQuery = ({ location, type }) => `
  SELECT DISTINCT ?label ?status
  WHERE {
    ?obs a sosa:Observation ;
        sosa:madeBySensor ?sensor ;
        sosa:hasFeatureOfInterest <${location}> ;
        rdf:label ?label .
    ?sensor a sosa:Sensor ;
        ssn:hasProperty ?sensorstate ;
        sosa:observes <${type}> .
    ?actuation sosa:actsOnProperty ?sensorstate ;
        sosa:actuationMadeBy arces-monitor:alexa-actuator ; 
        sosa:hasSimpleResult ?status .
  }
`

const TurnOnOffQuery = ({ location, type, status }) => `
  WITH <http://devidtest/graph>
  DELETE { 
    ?actuation sosa:hasSimpleResult ?state ;
        sosa:resultTime ?oldTimestamp .
  }
  INSERT {
    ?actuation sosa:hasSimpleResult ${status === 'on'} ;
      sosa:resultTime ?timestamp .
  }
  WHERE {
    ?obs a sosa:Observation ;
      sosa:madeBySensor ?sensor ;
      sosa:hasFeatureOfInterest <${location}> .
    ?sensor a sosa:Sensor ;
      sosa:observes <${type}> ;
      ssn:hasProperty ?sensorstate .
    ?actuation sosa:actsOnProperty ?sensorstate ;
      sosa:actuationMadeBy arces-monitor:alexa-actuator ; 
      sosa:hasSimpleResult ?state ;
      sosa:resultTime ?oldTimestamp .
      BIND(now() AS ?timestamp)
  }
`

const TurnOnOffByLocationQuery = ({ location, status }) => `
  WITH <http://devidtest/graph>
  DELETE { 
    ?actuation sosa:hasSimpleResult ?state ;
        sosa:resultTime ?oldTimestamp .
  }
  INSERT {
    ?actuation sosa:hasSimpleResult ${status === 'on'} ;
      sosa:resultTime ?timestamp .
  }
  WHERE {
    ?obs a sosa:Observation ;
      sosa:madeBySensor ?sensor ;
      sosa:hasFeatureOfInterest <${location}> .
    ?sensor a sosa:Sensor ;
      ssn:hasProperty ?sensorstate .
    ?actuation sosa:actsOnProperty ?sensorstate ;
      sosa:actuationMadeBy arces-monitor:alexa-actuator ; 
      sosa:hasSimpleResult ?state ;
      sosa:resultTime ?oldTimestamp .
      BIND(now() AS ?timestamp)
  }
`

const TurnOnOffByTypeQuery = ({ type, status }) => `
  WITH <http://devidtest/graph>
  DELETE { 
    ?actuation sosa:hasSimpleResult ?state ;
        sosa:resultTime ?oldTimestamp .
  }
  INSERT {
    ?actuation sosa:hasSimpleResult ${status === 'on'} ;
      sosa:resultTime ?timestamp .
  }
  WHERE {
    ?obs a sosa:Observation ;
      sosa:madeBySensor ?sensor .
    ?sensor a sosa:Sensor ;
      sosa:observes <${type}> ;
      ssn:hasProperty ?sensorstate .
    ?actuation sosa:actsOnProperty ?sensorstate ;
      sosa:actuationMadeBy arces-monitor:alexa-actuator ; 
      sosa:hasSimpleResult ?state ;
      sosa:resultTime ?oldTimestamp .
      BIND(now() AS ?timestamp)
  }
`

const GetUpdateIntervalQuery = ({ type, location }) => `
  SELECT ?label ?interval
  WHERE {
    ?obs a sosa:Observation ;
      rdf:label ?label ;
      sosa:madeBySensor ?sensor ;
      sosa:hasFeatureOfInterest <${location}> ;
      arces-monitor:hasUpdateInterval ?updateInterval .
    ?updateInterval a qudt-1-1:QuantityValue ;
        qudt-1-1:unit qudt-unit-1-1:MilliSecond ;
        qudt-1-1:numericValue ?interval .
    ?sensor a sosa:Sensor ;
      sosa:observes <${type}> .
  }
`

const SetUpdateIntervalQuery = ({ type, location, interval }) => `
  WITH <http://devidtest/graph>
  DELETE { 
    ?updateInterval qudt-1-1:numericValue ?oldInterval .
  }
  INSERT {
    ?updateInterval qudt-1-1:numericValue ${interval} .
  }
  WHERE {
    ?obs a sosa:Observation ;
      rdf:label ?label ;
      sosa:madeBySensor ?sensor ;
      sosa:hasFeatureOfInterest <${location}> ;
      arces-monitor:hasUpdateInterval ?updateInterval .
    ?updateInterval a qudt-1-1:QuantityValue ;
        qudt-1-1:unit qudt-unit-1-1:MilliSecond ;
        qudt-1-1:numericValue ?oldInterval .
    ?sensor a sosa:Sensor ;
      sosa:observes <${type}> .
  }
`

module.exports = {
  LaunchRequestQuery,
  ListDevicesQuery,
  ListByLocationQuery,
  ListByTypeQuery,
  ListLocationsQuery,
  GetValueQuery,
  GetAverageQuery,
  GetAverageOfLocationQuery,
  GetMaxOfLocationQuery,
  GetMinOfLocationQuery,
  GetLastUpdateTimeQuery,
  ListByStateQuery,
  GetStateQuery,
  TurnOnOffQuery,
  TurnOnOffByLocationQuery,
  TurnOnOffByTypeQuery,
  GetUpdateIntervalQuery,
  SetUpdateIntervalQuery
}

const LaunchRequestQuery = () => `
    SELECT DISTINCT ?x
    WHERE {
        arces-monitor:Italy-Site1-Pressure ?p ?o ;
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
        ?obs sosa:hasFeatureOfInterest ${location} ;
            rdf:label ?x .
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

// TODO implementare type
const GetAverageOfLocationQuery = ({ location, type }) => {
  const date = new Date(
    new Date().setDate(new Date().getDate() - 1)
  ).toISOString()
  return `
    SELECT AVG(?val) as ?x
    WHERE {
        ?obs sosa:hasFeatureOfInterest <${location}> ;
            sosa:hasResult ?result .
        ?result a qudt-1-1:QuantityValue .
        ?node arces-monitor:refersTo ?result ;
            time:inXSDDateTimeStamp ?date ;
            qudt-1-1:numericValue ?val .
        FILTER (?date > "${date}"^^xsd:dateTime)
    }`
}

const GetMaxOfLocationQuery = ({ location, type }) => {
  const date = new Date(
    new Date().setDate(new Date().getDate() - 7)
  ).toISOString()
  return `
    SELECT MAX(?val) as ?x
    WHERE {
        ?obs sosa:hasFeatureOfInterest <${location}> ;
            sosa:hasResult ?result .
        ?result a qudt-1-1:QuantityValue .
        ?node arces-monitor:refersTo ?result ;
            time:inXSDDateTimeStamp ?date ;
            qudt-1-1:numericValue ?val .
        FILTER (?date > "${date}"^^xsd:dateTime)
    }`
}

const GetMinOfLocationQuery = ({ location, type }) => {
  const date = new Date(
    new Date().setDate(new Date().getDate() - 7)
  ).toISOString()
  return `
    SELECT MIN(?val) as ?x
    WHERE {
        ?obs sosa:hasFeatureOfInterest <${location}> ;
            sosa:hasResult ?result .
        ?result a qudt-1-1:QuantityValue .
        ?node arces-monitor:refersTo ?result ;
            time:inXSDDateTimeStamp ?date ;
            qudt-1-1:numericValue ?val .
        FILTER (?date > "${date}"^^xsd:dateTime)
    }`
}

// // TODO mettere type
// const GetLastUpdateTimeQuery = ({ location, type }) => `
//     SELECT DISTINCT ?label max(?t) as ?lastTs
//     WHERE {
//         ?obs sosa:hasFeatureOfInterest ${location} ;
//             rdf:label ?label ;
//             sosa:hasResult ?r .
//         ?r a qudt-1-1:QuantityValue .
//         ?node arces-monitor:refersTo ?r ;
//             time:inXSDDateTimeStamp ?t .
//     }
//     GROUP BY ?label
// `

// // TODO aggiungere type e time
// const GetMaxOfLocationQuery = ({ location, type }) => `
//     SELECT DISTINCT ?label MAX(?val) as ?maxVal
//     WHERE {
//         ?obs sosa:hasFeatureOfInterest ${location} ;
//             rdf:label ?label ;
//             sosa:hasResult ?r .
//         ?r a qudt-1-1:QuantityValue .
//         ?node arces-monitor:refersTo ?r ;
//             time:inXSDDateTimeStamp ?t ;
//             qudt-1-1:numericValue ?val
//     }
//     GROUP BY ?label
// `

// // TODO aggiungere type e time
// const GetMinOfLocationQuery = ({ location, type }) => `
//     SELECT DISTINCT ?label MIN(?val) as ?minVal
//     WHERE {
//         ?obs sosa:hasFeatureOfInterest ${location} ;
//             rdf:label ?label ;
//             sosa:hasResult ?r .
//         ?r a qudt-1-1:QuantityValue .
//         ?node arces-monitor:refersTo ?r ;
//             time:inXSDDateTimeStamp ?t ;
//             qudt-1-1:numericValue ?val
//     }
//     GROUP BY ?label
// `

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
  GetMinOfLocationQuery
  //   GetLastUpdateTimeQuery,
}

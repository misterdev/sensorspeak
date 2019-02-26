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
  GetMinOfLocationQuery,
  GetLastUpdateTimeQuery
}

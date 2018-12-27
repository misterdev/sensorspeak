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

const ListByLocationQuery = (location) => `
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

// TODO mettere type
const GetValueQuery = (location, type) => `
    SELECT DISTINCT ?label ?val
    WHERE {
        ?obs sosa:hasFeatureOfInterest ${location} ;
            rdf:label ?label ;
            sosa:hasResult ?result .
        ?result qudt-1-1:numericValue ?val .
    }
`

// TODO mettere type
const GetLastUpdateTimeQuery = (location, type) => `
    SELECT DISTINCT ?label max(?t) as ?lastTs
    WHERE {
        ?obs sosa:hasFeatureOfInterest ${location} ;
            rdf:label ?label ;
            sosa:hasResult ?r .
        ?r a qudt-1-1:QuantityValue .
        ?node arces-monitor:refersTo ?r ;
            time:inXSDDateTimeStamp ?t .
    }
    GROUP BY ?label
`

module.exports = {
    LaunchRequestQuery,
    ListDevicesQuery,
    ListByLocationQuery,
    ListLocationsQuery,
    GetValueQuery,
    GetLastUpdateTimeQuery
}
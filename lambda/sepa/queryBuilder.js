const LaunchRequestQuery = () => `
    SELECT DISTINCT ?x
    WHERE {
        arces-monitor:Italy-Site1-Pressure ?p ?o ;
            rdf:label ?x .
    }
`
const ListDevicesIntentQuery = () => `
    SELECT DISTINCT ?x
    WHERE {
        ?obs ?p sosa:Observation ;
            rdf:label ?x .
    }
`

const ListByLocationIntent = (location) => `
    SELECT DISTINCT ?x
    WHERE {
        ?obs sosa:hasFeatureOfInterest ${location} ;
            rdf:label ?x .
    }
`

const ListLocations = () => `
    SELECT DISTINCT ?x
    WHERE {
        ?o a sosa:Observation ;
            sosa:hasFeatureOfInterest ?p .
        ?p schema:name ?x .
    }  
`

const ListLocationsIntent = () => `
    SELECT DISTINCT ?x
    WHERE {
        ?o a sosa:Observation ;
            sosa:hasFeatureOfInterest ?p .
        ?p schema:name ?x .
    }  
`


module.exports = {
    LaunchRequestQuery,
    ListDevicesIntentQuery,
    ListByLocationIntent,
    ListLocationsIntent
}
const LaunchRequestQuery =`
    SELECT DISTINCT ?x
    WHERE {
        arces-monitor:Italy-Site1-Pressure ?p ?o ;
            rdf:label ?x
    }
`
const ListDevicesIntentQuery = `
    SELECT DISTINCT ?x
    WHERE {
        ?obs ?p sosa:Observation ;
            rdf:label ?x
    }
`

const ListByLocationIntent = ``

module.exports = {
    LaunchRequestQuery,
    ListDevicesIntentQuery
}
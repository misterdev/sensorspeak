const SparqlClient = require('sparql-client-2')
const queryBuilder = require('./queryBuilder.js')

const endpoint = 'http://mml.arces.unibo.it:8000/query'

// queryBuilder expexts those namespaces
const client = new SparqlClient(endpoint)
    .register({
        "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        "rdfs": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        "sosa": "http://www.w3.org/ns/sosa/",
        "qudt-1-1": "http://qudt.org/1.1/schema/qudt#",
        "qudt-unit-1-1": "http://qudt.org/1.1/vocab/unit#",
        "arces-monitor": "http://wot.arces.unibo.it/monitor#",
        "mqtt": "http://wot.arces.unibo.it/mqtt#"
    })

const query = (q) => new Promise( (resolve, reject) => 
    client.query(q).execute()
        .then( response => {
            let ret = null
            if ( response && response.results && response.results.bindings ) {
                ret = response.results.bindings
                    .map( e => ( e && e.x && e.x.value ) ? e.x.value : null )
            }
            resolve(ret)
        })
)

module.exports = {
    query,
    queryBuilder
}

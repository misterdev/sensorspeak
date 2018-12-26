const SparqlClient = require('sparql-client-2')
const queryBuilder = require('./queryBuilder.js')
const _ = require('lodash/object');

const endpoint = 'http://mml.arces.unibo.it:8000/query'

// queryBuilder expexts those namespaces
const client = new SparqlClient(endpoint)
    .register({
        "schema": "http://schema.org/",
        "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        "rdfs": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        "sosa": "http://www.w3.org/ns/sosa/",
        "qudt-1-1": "http://qudt.org/1.1/schema/qudt#",
        "qudt-unit-1-1": "http://qudt.org/1.1/vocab/unit#",
        "arces-monitor": "http://wot.arces.unibo.it/monitor#",
        "mqtt": "http://wot.arces.unibo.it/mqtt#"
    })


const query = (q) => new Promise((resolve, reject) =>
    client.query(q).execute()
    .then(response => resolve(_.get(response, "results.bindings")))
    .catch(error => reject(error))
)

module.exports = {
    query,
    ...queryBuilder
}
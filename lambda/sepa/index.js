const SparqlClient = require('sparql-client-2')
const queryBuilder = require('./queryBuilder.js')
const _ = require('lodash/object')

const queryEndpoint = 'http://mml.arces.unibo.it:8000/query'
const updateEndpoint = 'http://mml.arces.unibo.it:8000/update'

const client = new SparqlClient(queryEndpoint, { updateEndpoint })
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

const query = (queryTemplate, parameters) =>
    new Promise((resolve, reject) =>
        client.query(queryTemplate(parameters))
        .execute()
        .then(response => resolve(_.get(response, "results.bindings")))
        .catch(error => reject(error)))

module.exports = {
    query,
    ...queryBuilder
}
const queries = require('./queries.js');
const SparqlClient = require('sparql-client-2');

const endpoint = 'http://mml.arces.unibo.it:8000/query';

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

const query = (q) => client.query(q).execute()

module.exports = {
    query,
    queries
}

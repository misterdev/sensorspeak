# SEPA DATA STRUCTURE
```
O a sosa:Observation
O sosa:hasResult R
O sosa:hasFeatureOfInterest P
O rdf:label (XMLSchema#string) "MML Core 3 (Mars)"
O comment (XMLSchema#string) 'Temperatura Server MML Core 3'
O arces-monitor:hasMqttTopic 'arces/servers/mars/mml/cpu/core-3/temperature'

P a schema:Place
P schema:containedInPlace P2
P schema:name String
P schema:GeoCoordinates <nodeID://...>

R = [nodeID://... , arces-monitor:QuantityValue]
R a qudt:QuantityValue
R qudt:unit qudt-unit:Millibar
R qudt:numericValue (XMLSchema#decimal) 0.36
    // solo i nodeID://...
N arces-monitor:refersTo R

N = nodeID://....
N arces-monitor:refersTo R
N inXSDDateTimeStamp (XMLSchema#dateTime) 2018-11-11T04:01:39.544057
N qudt:numericValue (XMLSchema#decimal) 27.35
```
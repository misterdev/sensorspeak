

## STRUTTURA AGGIUNTIVA

Questa e' la struttura proposta per aggiungere i seguenti dati al SEPA:

- Tipo di sensore (umidità, pressione, temperatura, ...)
- Energia residua per sensori dotati di batteria
- Update Interval del sensore
- Stato on/off di accensione del sensore

```sparql


// --- ON/OFF State
// Ogni sensore ha il proprio stato

<sensor/XXX> ssn:hasProperty <sensor/XXXX#state> . 

// Ogni stato è una ActuatableProperty gestita da un attuatore

<sensor/XXXX#state> a sosa:ActuatableProperty ;
  sosa:isActedOnBy <actuation/XXXX> .

<actuator/Alexa> a sosa:Actuator ;
  sosa:madeActuation <actuation/XXX0> ;
  sosa:madeActuation <actuation/XXX1> ;
  ssn:forProperty <sensor/XXXX#state> .

<actuation/XXXX> a sosa:Actuation ;
  sosa:actsOnProperty  <sensor/XXXX#state> ;
  sosa:actuationMadeBy <actuator/XXXX> ; 
  sosa:hasSimplResult true .
  // time

```
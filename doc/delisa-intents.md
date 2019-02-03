# DELISA INTENTS

### MAIN
- [ ] AMAZON.CancelIntent
- [ ] AMAZON.HelpIntent
- [ ] AMAZON.StopIntent
- [ ] GetInfoIntent               - "get info in {location}"
- [x] ListByLocationIntent        - "list sensors in the {location}"
- [x] ListDevicesIntent           - "list all sensors"

### TYPE
- [x] GetValueIntent              - "get {type} of {location}"
- [x] ListByTypeIntent            - "list {type} sensors"
- [ ] GetAverageIntent            - "get average {type}"
- [ ] GetAverageOfLocationIntent  - "get average {type} of {location}"
- [ ] GetEnergyIntent             - "get energy of {location} {type} sensor"
- [ ] GetLastUpdateTimeIntent     - "get last update time of {location} {type} sensor"  (//TODO Type)
- [ ] GetMaxOfLocationIntent      - "get maximum {type} of {location}"
- [ ] GetMinOfLocationIntent      - "get minimum {type} of {location}"
- [ ] CreateDeviceIntent          - "create {type} sensor in {location} "
- [ ] RemoveDeviceIntent          - "remove {type} sensor in the 
{location}"

### INTERVAL
- [ ] GetUpdateIntervalIntent     - "get update interval of {location} {type}"

### ENERGY
- [ ] GetAllEnergyIntent          - "get energy of all sensors"

### ON/OFF
- [ ] GetStateIntent              - "get state of {location} {type}"
- [ ] SetUpdateIntervalIntent     - "set update interval of {location} {type} to {interval}"
- [ ] TurnOnOffAllIntent          - "turn {on_off} all sensors"
- [ ] TurnOnOffByLocationIntent   - "turn {on_off} all sensors in {location}"
- [ ] TurnOnOffByTypeIntent       - "turn {on_off} all {type} "
- [ ] TurnOnOffIntent             - "turn {on_off} {location} {type}"
- [ ] ListByStateIntent           - "list all sensor in {on_off} mode"


### AGGIUNTE DA ME
- [x] ListLocationsIntent         - "list all locations"

### DATI DA INSERIRE IN SEPA
- [x] **Type**, tipo del dato rilevato dal sensore. I dati presenti sul SEPA sono di tipo:
  - Temperature 
  - Board temperature
  - Room temperature
  - Moisture    
  - Humidity    
  - Voltage     
  - Athmospheric Pressure
  
  L'ontologia scelta è [m3lite](https://github.com/fiesta-iot/ontology/blob/master/m3-lite.owl): 
  ```
  saref:measuresProperty m3lite:Temperature
  saref:measuresProperty m3lite:BoardTemperature
  saref:measuresProperty m3lite:BuildingTemperature
  saref:measuresProperty m3lite:SoilHumidity
  saref:measuresProperty m3lite:Humidity
  saref:measuresProperty m3lite:Voltage
  saref:measuresProperty m3lite:AtmosphericPressure
  ```

- [ ] **Energy**, vale solo per i dispositivi dotati di batteria.
  
  **Requisiti:** è necessario che i sensori aggiornino il dato sul SEPA.

  L'ontologia scelta per rappresentare lo stato di carica della batteria è [seasb](https://ci.mines-stetienne.fr/seas/BatteryOntology-1.0.ttl):
  ```
  seas:stateOfChargeRatio 55
  ```


- [ ] **Status**, indica lo stato on/off di un sensore.

  **Requisiti:** è necessario che i sensori aggiornino/leggano costantemente il dato sul SEPA

  L'ontologia scelta per definire gli stati è [saref](http://ontology.tno.nl/saref/):

  ```
  saref:has_state saref:Off_state
  saref:has_state saref:On_state
  ```

  La struttura semantica da aggiungere è quindi:
  ```
  O sosa:isObservedBy S .

  S a sosa:Sensor ;
    saref:measuresProperty <TYPE> ;
    saref:has_state <STATE> ;
    seas:stateOfChargeRatio 55 .
  ```

- [ ] **Update Interval**, intervallo fra una rilevazione e l'altra
  
  **Requisiti:** i sensori devono leggere questo dato dal SEPA e modificare il proprio intervallo di conseguenza
  ```
  O a sosa:Observation ;
    arces-monitor:hasUpdateInterval R .
    R a qudt:QuantityValue ;
      qudt:unit qudt-unit:Hour ;
      qudt:numericValue (XMLSchema#decimal) 2 .
  ```  
  

- [ ] **Create Sensor**, aggiunge i dati relativi ad un sensore
  
  **Requisiti:**
  - label, del sensore
  - commento, che descriva il sensore
  - type, del dato rilevato
  - location, del sensore
  
  Per costruire una struttura (TODO aggiungere Type): 
  ```
  arces-monitor:[ID] a sosa:Observation ;
    sosa:hasResult [R] ;
    sosa:hasFeatureOfInterest {location} ;
    rdf:label {label} ;
    comment {comment} ;
    arces-monitor:hasMqttTopic [MQTTTOPIC] .

    R a qudt:QuantityValue ;
      qudt:unit qudt-unit:[UNIT] .
  ```

- [ ] **Remove Sensor**, rimuove i dati relativi ad un sensore
  
  **Requisiti:** nome del sensore
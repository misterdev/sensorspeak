# DELISA INTENTS

### MAIN
- [ ] AMAZON.CancelIntent
- [ ] AMAZON.HelpIntent
- [ ] AMAZON.StopIntent
- [ ] GetInfoIntent               - "get info in {location}"
- [x] ListByLocationIntent        - "list sensors in the {location}"
- [x] ListDevicesIntent           - "list all sensors"

### TYPE
- [x] GetValueIntent              - "get {type} of {location}" (TODO Type)
- [ ] ListByTypeIntent            - "list {type} sensors"
- [ ] GetAverageIntent            - "get average {type}"
- [ ] GetAverageOfLocationIntent  - "get average {type} of {location}"
- [ ] GetEnergyIntent             - "get energy of {location} {type} sensor"
- [ ] GetLastUpdateTimeIntent     - "get last update time of {location} {type} sensor"
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
  - temperature
  - moisture
  - humidity
  - voltage
  
  La struttura semantica da aggiungere è:
  ```
  arces-monitor:Temperature a sosa:ObservableProperty .
  arces-monitor:Humidity a sosa:ObservableProperty .
  arces-monitor:Moisture a sosa:ObservableProperty .
  arces-monitor:Voltage a sosa:ObservableProperty .
  arces-monitor:Pressure a sosa:ObservableProperty .

  O a sosa:Observation ;
    sosa:observedProperty T .
  T a sosa:ObservableProperty .
  ```

- [] **Energy**, vale solo per i dispositivi dotati di batteria.
  
  **Requisiti:** è necessario che i sensori aggiornino il dato sul SEPA.

  La struttura semantica da aggiungere è:
  ```
  O a sosa:Observation ;
    arces-monitor:batteryStatus R .
  R a qudt:QuantityValue ;
    qudt:unit qudt-unit:Percentage ;
    qudt:numericValue 99 .
  ```

- [] **Status**, indica lo stato on/off di un sensore.

  **Requisiti:** è necessario che i sensori aggiornino/leggano costantemente il dato sul SEPA

  La struttura semantica da aggiungere è:
  ```
  O a sosa:Observation ;
    arces-monitor:switchedOn qudt-1-1:TRUE .
  O2 arces-monitor:switchedOn qudt-1-1:FALSE .
  ```

- [] **Update Interval**, intervallo fra una rilevazione e l'altra
  
  **Requisiti:** i sensori devono leggere questo dato dal SEPA e modificare il proprio intervallo di conseguenza
  ```
  O a sosa:Observation ;
    arces-monitor:hasUpdateInterval R .
    R a qudt:QuantityValue ;
      qudt:unit qudt-unit:Hour ;
      qudt:numericValue (XMLSchema#decimal) 2 .
  ```  
  

- [] **Create Sensor**, aggiunge i dati relativi ad un sensore
  
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

- [] **Remove Sensor**, rimuove i dati relativi ad un sensore
  
  **Requisiti:** nome del sensore
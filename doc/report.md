## Funzionalità
- Aggiunta/Rimozione devices
- Ottenere l'elenco di:
  - tutti i device
  - device di un tipo specifico (es. sensori temperatura)
  - device in una location specifica (es. ufficio)
  - device in uno status specifico (es. tutti i dispositivi spenti o accesi)
- Accensione/spegnimento di:
  - uno o tutti i device
  - di un tipo specifico 
  - in una location specifica
- Ottenere
  - il valore rilevato da un sensore
  - l'intervallo di aggiornamento di un device
  - lo status di un device
  - il livello di batteria di un device e previsione di durata
  - media dei valori rilevati dai sensori di un tipo specifico (es. media temperatura)
  - valore massimo/minimo rilevato da un sensore (es. temperatura massima)
  - quando è stato l'ultimo aggiornamento di un device, ultimo collegamento al cloud
- Impostare l'intervallo di aggiornamento di un device, ossia ogni quanto deve eseguire una azione


## Google Assistant
Actions on Google
- DialogFlow
- Actions SDK

### Smart home Actions
Smart home Actions rely on Home Graph, a database that stores and provides contextual data about the home and its devices. For example, Home Graph can store the concept of a living room that contains multiple types of devices (a light, television, and speaker) from different manufacturers. This information is passed to the Google Assistant in order to execute user requests based on the appropriate context.

## Alexa

### Skills available for the Regions ([doc](https://developer.amazon.com/docs/custom-skills/develop-skills-in-multiple-languages.html))

- US East (N. Virginia)
- EU (Ireland): eu-west-1
- US West (Oregon)
- Asia Pacific (Tokyo)

### Configuration

- `skill.json` ([doc](https://developer.amazon.com/docs/smapi/skill-manifest.html))

## Tutorials & Boilerplate

- [alexa-skills-kit-sdk-for-nodejs](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs)
- [Code Deep Dive ask-sdk-core](https://developer.amazon.com/blogs/alexa/post/dff6f892-ee90-4fef-954f-27ad84eb7739/code-deep-dive-introduction-to-the-ask-software-development-kit-for-node-js)

### Test

- [echosim.io](https://echosim.io/)

### Ontologies
- [m3lite](https://github.com/fiesta-iot/ontology/blob/master/m3-lite.owl)
- [sosa](https://github.com/w3c/sdw/blob/gh-pages/ssn/integrated/sosa.ttl)
- [saref](http://ontology.tno.nl/saref/)
- [seasb](https://ci.mines-stetienne.fr/seas/BatteryOntology-1.0.ttl)
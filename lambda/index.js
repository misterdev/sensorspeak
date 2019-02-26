const _ = require('lodash/object')
const Ask_SDK = require('ask-sdk-core')
const Fuse = require('fuse.js')

const SEPA = require('./sepa')
const Alexa = require('./utils/alexa')
const RESPONSE = require('./utils/responseBuilder')

const listify = results =>
  results
    .map(
      (entry, index) => `\u{2022} #${index + 1}, ${_.get(entry, 'x.value')} .`
    )
    .join('\n')

const units = {
  'http://purl.org/iot/vocab/m3-lite#Temperature': '°',
  'http://purl.org/iot/vocab/m3-lite#BoardTemperature': '°',
  'http://purl.org/iot/vocab/m3-lite#BuildingTemperature': '°',
  'http://purl.org/iot/vocab/m3-lite#Humidity': '%',
  'http://purl.org/iot/vocab/m3-lite#SoilHumidity': '%',
  'http://purl.org/iot/vocab/m3-lite#AtmosphericPressure': 'TODO',
  'http://purl.org/iot/vocab/m3-lite#Voltage': 'TODO',
  'http://purl.org/iot/vocab/m3-lite#BatteryLevel': '%'
}

const wrapMeasurement = (value, type) =>
  '' + (Math.round(value * 10) / 10).toFixed(1) + units[type]

const fuseOptions = {
  shouldSort: true,
  tokenize: true,
  threshold: 0.2,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: ['label']
}

const LaunchRequestHandler = {
  canHandle (handlerInput) {
    return Alexa.checkRequestType(handlerInput, 'LaunchRequest')
  },
  async handle (handlerInput) {
    const results = await SEPA.query(SEPA.LaunchRequestQuery)
    const text = _.get(results, '[0].x.value')
    if (text === undefined) return Alexa.continueDialog(handlerInput, '🙀')

    const speechText = RESPONSE.LaunchRequest({
      sensor: 'swamp_devices_moisture1_up_Battery_Level',
      label: text
    })
    return Alexa.continueDialog(handlerInput, speechText)
  }
}

const ListLocationsIntentHandler = {
  canHandle (handlerInput) {
    return Alexa.checkIntentName(handlerInput, 'ListLocationsIntent')
  },
  async handle (handlerInput) {
    const results = await SEPA.query(SEPA.ListLocationsQuery)
    if (!results)
      return Alexa.continueDialog(handlerInput, RESPONSE.ListLocationsError())
    const locations = listify(results)
    const speechText = RESPONSE.ListLocations({
      locations,
      length: results.length
    })
    return Alexa.continueDialog(handlerInput, speechText)
  }
}

const ListDevicesIntentHandler = {
  canHandle (handlerInput) {
    return Alexa.checkIntentName(handlerInput, 'ListDevicesIntent')
  },
  async handle (handlerInput) {
    const results = await SEPA.query(SEPA.ListDevicesQuery)
    if (!results)
      return Alexa.continueDialog(handlerInput, RESPONSE.ListDevicesError())
    const devices = listify(results)
    const speechText = RESPONSE.ListDevices({ devices, length: results.length })
    return Alexa.continueDialog(handlerInput, speechText)
  }
}

const ListByLocationIntentHandler = {
  canHandle (handlerInput) {
    return (
      Alexa.checkRequestType(handlerInput, 'IntentRequest') &&
      Alexa.checkIntentName(handlerInput, 'ListByLocationIntent')
    )
  },
  async handle (handlerInput) {
    const locationSlot = Alexa.getSlot(handlerInput, 'location')
    if (!locationSlot)
      return Alexa.continueDialog(handlerInput, Alexa.ERROR.NO_LOCATION)

    const location = new Fuse(SEPA.locations, fuseOptions).search(locationSlot)
    const locationId = _.get(location, '[0].id')
    if (!locationId)
      resolve(Alexa.continueDialog(handlerInput, Alexa.ERROR.NO_LOCATION))

    const results = await SEPA.query(SEPA.ListByLocationQuery, {
      location: locationId
    })
    if (!results) return Alexa.continueDialog(handlerInput, '🙀')

    const sensors = listify(results)
    const locationLabel = _.get(location, '[0].label', 'this location')
    const speechText = RESPONSE.ListByLocation({
      sensors,
      location: locationLabel
    })
    return Alexa.continueDialog(handlerInput, speechText)
  }
}

const GetValueIntentHandler = {
  canHandle (handlerInput) {
    return (
      Alexa.checkRequestType(handlerInput, 'IntentRequest') &&
      Alexa.checkIntentName(handlerInput, 'GetValueIntent')
    )
  },
  async handle (handlerInput) {
    if (!Alexa.checkDialogState(handlerInput, 'COMPLETED'))
      return Alexa.elicitSlots(handlerInput)

    const locationSlot = Alexa.getSlot(handlerInput, 'location')
    if (!locationSlot)
      return Alexa.continueDialog(handlerInput, Alexa.ERROR.NO_LOCATION)

    const typeSlot = Alexa.getSlot(handlerInput, 'type')
    if (!typeSlot && !SEPA.types[typeSlot])
      return Alexa.continueDialog(handlerInput, Alexa.ERROR.NO_TYPE)

    const type = SEPA.types[typeSlot]
    const location = new Fuse(SEPA.locations, fuseOptions).search(locationSlot)
    const locationId = _.get(location, '[0].id')
    const locationLabel = _.get(location, '[0].label', 'this location')
    if (!locationId)
      resolve(Alexa.continueDialog(handlerInput, Alexa.ERROR.NO_LOCATION))

    const query = SEPA.GetValueQuery
    const results = await SEPA.query(query, {
      location: locationId,
      type
    })
    if (!results) return Alexa.continueDialog(handlerInput, '🙀')
    if (results.length == 0)
      return Alexa.continueDialog(
        handlerInput,
        RESPONSE.NoValue({
          location: locationLabel,
          type: typeSlot
        })
      )
    const observations = results
      .map((sensor, i) => {
        const label = _.get(sensor, 'label.value')
        const value = _.get(sensor, 'val.value')

        return `\u{2022} #${i + 1}, ${label}: ${value}° .`
      })
      .join('\n')

    const speechText = RESPONSE.GetValue({
      location: locationLabel,
      observations
    })
    return Alexa.continueDialog(handlerInput, speechText)
  }
}

const ListByTypeIntentHandler = {
  canHandle (handlerInput) {
    return (
      Alexa.checkRequestType(handlerInput, 'IntentRequest') &&
      Alexa.checkIntentName(handlerInput, 'ListByTypeIntent')
    )
  },
  async handle (handlerInput) {
    if (!Alexa.checkDialogState(handlerInput, 'COMPLETED'))
      return Alexa.elicitSlots(handlerInput)

    const typeSlot = Alexa.getSlot(handlerInput, 'type')
    if (!typeSlot && !SEPA.types[typeSlot])
      return Alexa.continueDialog(handlerInput, Alexa.ERROR.NO_TYPE)

    const type = SEPA.types[typeSlot]

    const results = await SEPA.query(SEPA.ListByTypeQuery, { type })
    if (!results)
      return Alexa.continueDialog(handlerInput, RESPONSE.NoResults())
    if (results.length == 0)
      return Alexa.continueDialog(
        handlerInput,
        RESPONSE.NoValueType({
          type: typeSlot
        })
      )

    const sensors = listify(results)

    const speechText = RESPONSE.ListByType({
      type: typeSlot,
      sensors,
      length: results.length
    })
    return Alexa.continueDialog(handlerInput, speechText)
  }
}

const GetAverageIntentHandler = {
  canHandle (handlerInput) {
    return (
      Alexa.checkRequestType(handlerInput, 'IntentRequest') &&
      Alexa.checkIntentName(handlerInput, 'GetAverageIntent')
    )
  },
  async handle (handlerInput) {
    if (!Alexa.checkDialogState(handlerInput, 'COMPLETED'))
      return Alexa.elicitSlots(handlerInput)

    const typeSlot = Alexa.getSlot(handlerInput, 'type')
    if (!typeSlot && !SEPA.types[typeSlot])
      return Alexa.continueDialog(handlerInput, Alexa.ERROR.NO_TYPE)

    const type = SEPA.types[typeSlot]

    const query = SEPA.GetAverageQuery
    const results = await SEPA.query(query, { type })
    if (!results)
      return Alexa.continueDialog(handlerInput, RESPONSE.NoResults())
    if (results.length == 0)
      return Alexa.continueDialog(
        handlerInput,
        RESPONSE.NoValueType({
          type: typeSlot
        })
      )

    const average = _.get(results, '[0].x.value')
    const speechText = RESPONSE.GetAverage({
      type: typeSlot,
      average
    })
    return Alexa.continueDialog(handlerInput, speechText)
  }
}

const GetAverageOfLocationIntentHandler = {
  canHandle (handlerInput) {
    return (
      Alexa.checkRequestType(handlerInput, 'IntentRequest') &&
      Alexa.checkIntentName(handlerInput, 'GetAverageOfLocationIntent')
    )
  },
  async handle (handlerInput) {
    if (!Alexa.checkDialogState(handlerInput, 'COMPLETED'))
      return Alexa.elicitSlots(handlerInput)

    const locationSlot = Alexa.getSlot(handlerInput, 'location')
    if (!locationSlot)
      return Alexa.continueDialog(handlerInput, Alexa.ERROR.NO_LOCATION)

    const typeSlot = Alexa.getSlot(handlerInput, 'type')
    if (!typeSlot && !SEPA.types[typeSlot])
      return Alexa.continueDialog(handlerInput, Alexa.ERROR.NO_TYPE)
    const type = SEPA.types[typeSlot]

    const location = new Fuse(SEPA.locations, fuseOptions).search(locationSlot)
    const locationId = _.get(location, '[0].id')
    const locationLabel = _.get(location, '[0].label', 'this location')
    if (!locationId)
      resolve(Alexa.continueDialog(handlerInput, Alexa.ERROR.NO_LOCATION))

    const query = SEPA.GetAverageOfLocationQuery
    const results = await SEPA.query(query, {
      location: locationId,
      type
    })
    if (!results)
      return Alexa.continueDialog(handlerInput, RESPONSE.NoResults())
    if (results.length == 0)
      return Alexa.continueDialog(
        handlerInput,
        RESPONSE.NoValue({
          location: locationLabel,
          type: typeSlot
        })
      )

    const average = _.get(results, '[0].x.value')
    const speechText = RESPONSE.GetAverageOfLocation({
      location: locationLabel,
      type: typeSlot,
      average: wrapMeasurement(average, type)
    })

    return Alexa.continueDialog(handlerInput, speechText)
  }
}

const GetMaxOfLocationIntentHandler = {
  canHandle (handlerInput) {
    return (
      Alexa.checkRequestType(handlerInput, 'IntentRequest') &&
      Alexa.checkIntentName(handlerInput, 'GetMaxOfLocationIntent')
    )
  },
  async handle (handlerInput) {
    if (!Alexa.checkDialogState(handlerInput, 'COMPLETED'))
      return Alexa.elicitSlots(handlerInput)

    const locationSlot = Alexa.getSlot(handlerInput, 'location')
    if (!locationSlot)
      return Alexa.continueDialog(handlerInput, Alexa.ERROR.NO_LOCATION)

    const typeSlot = Alexa.getSlot(handlerInput, 'type')
    if (!typeSlot && !SEPA.types[typeSlot])
      return Alexa.continueDialog(handlerInput, Alexa.ERROR.NO_TYPE)
    const type = SEPA.types[typeSlot]

    const location = new Fuse(SEPA.locations, fuseOptions).search(locationSlot)
    const locationId = _.get(location, '[0].id')
    const locationLabel = _.get(location, '[0].label', 'this location')
    if (!locationId)
      resolve(Alexa.continueDialog(handlerInput, Alexa.ERROR.NO_LOCATION))

    const query = SEPA.GetMaxOfLocationQuery
    const results = await SEPA.query(query, {
      location: locationId,
      type
    })
    if (!results)
      return Alexa.continueDialog(handlerInput, RESPONSE.NoResults())
    if (results.length == 0)
      return Alexa.continueDialog(
        handlerInput,
        RESPONSE.NoValue({
          location: locationLabel,
          type: typeSlot
        })
      )

    const max = _.get(results, '[0].x.value')
    const speechText = RESPONSE.GetMaxOfLocation({
      location: locationLabel,
      type: typeSlot,
      max: wrapMeasurement(max, type)
    })

    return Alexa.continueDialog(handlerInput, speechText)
  }
}

const GetMinOfLocationIntentHandler = {
  canHandle (handlerInput) {
    return (
      Alexa.checkRequestType(handlerInput, 'IntentRequest') &&
      Alexa.checkIntentName(handlerInput, 'GetMinOfLocationIntent')
    )
  },
  async handle (handlerInput) {
    if (!Alexa.checkDialogState(handlerInput, 'COMPLETED'))
      return Alexa.elicitSlots(handlerInput)

    const locationSlot = Alexa.getSlot(handlerInput, 'location')
    if (!locationSlot)
      return Alexa.continueDialog(handlerInput, Alexa.ERROR.NO_LOCATION)

    const typeSlot = Alexa.getSlot(handlerInput, 'type')
    if (!typeSlot && !SEPA.types[typeSlot])
      return Alexa.continueDialog(handlerInput, Alexa.ERROR.NO_TYPE)
    const type = SEPA.types[typeSlot]

    const location = new Fuse(SEPA.locations, fuseOptions).search(locationSlot)
    const locationId = _.get(location, '[0].id')
    const locationLabel = _.get(location, '[0].label', 'this location')
    if (!locationId)
      resolve(Alexa.continueDialog(handlerInput, Alexa.ERROR.NO_LOCATION))

    const query = SEPA.GetMinOfLocationQuery
    const results = await SEPA.query(query, {
      location: locationId,
      type
    })
    if (!results)
      return Alexa.continueDialog(handlerInput, RESPONSE.NoResults())
    if (results.length == 0)
      return Alexa.continueDialog(
        handlerInput,
        RESPONSE.NoValue({
          location: locationLabel,
          type: typeSlot
        })
      )

    const min = _.get(results, '[0].x.value')
    const speechText = RESPONSE.GetMinOfLocation({
      location: locationLabel,
      type: typeSlot,
      min: wrapMeasurement(min, type)
    })

    return Alexa.continueDialog(handlerInput, speechText)
  }
}

const GetLastUpdateTimeIntentHandler = {
  canHandle (handlerInput) {
    return (
      Alexa.checkRequestType(handlerInput, 'IntentRequest') &&
      Alexa.checkIntentName(handlerInput, 'GetLastUpdateTimeIntent')
    )
  },
  async handle (handlerInput) {
    if (!Alexa.checkDialogState(handlerInput, 'COMPLETED'))
      return Alexa.elicitSlots(handlerInput)

    const locationSlot = Alexa.getSlot(handlerInput, 'location')
    if (!locationSlot)
      return Alexa.continueDialog(handlerInput, Alexa.ERROR.NO_LOCATION)

    const typeSlot = Alexa.getSlot(handlerInput, 'type')
    if (!typeSlot && !SEPA.types[typeSlot])
      return Alexa.continueDialog(handlerInput, Alexa.ERROR.NO_TYPE)
    const type = SEPA.types[typeSlot]

    const location = new Fuse(SEPA.locations, fuseOptions).search(locationSlot)
    const locationId = _.get(location, '[0].id')
    const locationLabel = _.get(location, '[0].label', 'this location')
    if (!locationId)
      resolve(Alexa.continueDialog(handlerInput, Alexa.ERROR.NO_LOCATION))

    const query = SEPA.GetLastUpdateTimeQuery
    const results = await SEPA.query(query, {
      location: locationId,
      type
    })
    if (!results)
      return Alexa.continueDialog(handlerInput, RESPONSE.NoResults())
    if (results.length == 0)
      return Alexa.continueDialog(
        handlerInput,
        RESPONSE.NoValue({
          location: locationLabel,
          type: typeSlot
        })
      )

    const sensor = _.get(results, '[0].label.value')
    const date = _.get(results, '[0].date.value')
    const speechText = RESPONSE.GetLastUpdateTime({
      location: locationLabel,
      type: typeSlot,
      sensor,
      date: new Date(date).toString()
    })
    return Alexa.continueDialog(handlerInput, speechText)
  }
}

const ListByStateIntentHandler = {
  canHandle (handlerInput) {
    return (
      Alexa.checkRequestType(handlerInput, 'IntentRequest') &&
      Alexa.checkIntentName(handlerInput, 'ListByStateIntent')
    )
  },
  async handle (handlerInput) {
    if (!Alexa.checkDialogState(handlerInput, 'COMPLETED'))
      return Alexa.elicitSlots(handlerInput)

    const status = Alexa.getSlot(handlerInput, 'status')
    if (status !== 'on' && status !== 'off')
      return Alexa.continueDialog(handlerInput, Alexa.ERROR.NO_STATE)

    const results = await SEPA.query(SEPA.ListByStateQuery, { status })
    if (!results)
      return Alexa.continueDialog(handlerInput, RESPONSE.NoResults())
    if (results.length == 0)
      return Alexa.continueDialog(
        handlerInput,
        RESPONSE.NoValueStatus({
          status
        })
      )

    const sensors = listify(results)

    const speechText = RESPONSE.ListByState({
      status,
      sensors,
      length: results.length
    })
    return Alexa.continueDialog(handlerInput, speechText)
  }
}

const GetStateIntentHandler = {
  canHandle (handlerInput) {
    return (
      Alexa.checkRequestType(handlerInput, 'IntentRequest') &&
      Alexa.checkIntentName(handlerInput, 'GetStateIntent')
    )
  },
  async handle (handlerInput) {
    if (!Alexa.checkDialogState(handlerInput, 'COMPLETED'))
      return Alexa.elicitSlots(handlerInput)

    const typeSlot = Alexa.getSlot(handlerInput, 'type')
    if (!typeSlot && !SEPA.types[typeSlot])
      return Alexa.continueDialog(handlerInput, Alexa.ERROR.NO_TYPE)
    const type = SEPA.types[typeSlot]

    const locationSlot = Alexa.getSlot(handlerInput, 'location')
    if (!locationSlot)
      return Alexa.continueDialog(handlerInput, Alexa.ERROR.NO_LOCATION)
    const location = new Fuse(SEPA.locations, fuseOptions).search(locationSlot)
    const locationId = _.get(location, '[0].id')
    const locationLabel = _.get(location, '[0].label', 'this location')
    if (!locationId)
      resolve(Alexa.continueDialog(handlerInput, Alexa.ERROR.NO_LOCATION))

    const query = SEPA.GetStateQuery
    const results = await SEPA.query(query, {
      location: locationId,
      type
    })
    if (!results)
      return Alexa.continueDialog(handlerInput, RESPONSE.NoResults())
    if (results.length == 0)
      return Alexa.continueDialog(
        handlerInput,
        RESPONSE.NoValue({
          location: locationLabel,
          type: typeSlot
        })
      )

    const sensors = results
      .map((sensor, index) => {
        const label = _.get(sensor, 'label.value')
        const status = _.get(sensor, 'status.value')
        let on_off = 'unknown'
        if (status == 1 || status == 0) on_off = status ? 'on' : 'off'
        return `\u{2022} #${index + 1}, ${label} is ${on_off}.`
      })
      .join('\n')
    console.log(sensors)

    const speechText = RESPONSE.GetState({
      location: locationLabel,
      type: typeSlot,
      length: results.length,
      sensors
    })

    return Alexa.continueDialog(handlerInput, speechText)
  }
}

const ErrorHandler = {
  canHandle (handlerInput) {
    console.log(handlerInput)
    return true
  },
  handle (handlerInput, error) {
    console.log(`Error handled: ${error}`)

    return handlerInput.responseBuilder
      .speak("Sorry, I can't understand the command. Please say again.")
      .reprompt("Sorry, I can't understand the command. Please say again.")
      .getResponse()
  }
}

// const HelpIntentHandler = {
//     canHandle(handlerInput) {
//         return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
//             handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent'
//     },
//     handle(handlerInput) {
//         const speechText = 'You can say hello to me!'

//         return handlerInput.responseBuilder
//             .speak(speechText)
//             .reprompt(speechText)
//             .withSimpleCard('Sensor Speak', speechText)
//             .getResponse()
//     },
// }

// const CancelAndStopIntentHandler = {
//     canHandle(handlerInput) {
//         return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
//             (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent' ||
//                 handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent')
//     },
//     handle(handlerInput) {
//         const speechText = 'Goodbye!'

//         return handlerInput.responseBuilder
//             .speak(speechText)
//             .withSimpleCard('Sensor Speak', speechText)
//             .getResponse()
//     },
// }

// const SessionEndedRequestHandler = {
//     canHandle(handlerInput) {
//         return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest'
//     },
//     handle(handlerInput) {
//         console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`)

//         return handlerInput.responseBuilder.getResponse()
//     },
// }

const skillBuilder = Ask_SDK.SkillBuilders.custom()

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    ListDevicesIntentHandler,
    ListLocationsIntentHandler,
    ListByLocationIntentHandler,
    ListByTypeIntentHandler,
    GetValueIntentHandler,
    GetAverageIntentHandler,
    GetAverageOfLocationIntentHandler,
    GetMaxOfLocationIntentHandler,
    GetMinOfLocationIntentHandler,
    GetLastUpdateTimeIntentHandler,
    ListByStateIntentHandler,
    GetStateIntentHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda()

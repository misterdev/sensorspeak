const _ = require('lodash/object')
const Ask_SDK = require('ask-sdk-core')
const Fuse = require('fuse.js')

const SEPA = require('./sepa')
const Alexa = require('./utils/alexa')
const LOCATIONS = require('./utils/locations')
const RESPONSE = require('./utils/responseBuilder')

const listify = (results) => results
.map((entry, index) => `\u{2022} #${index + 1}, ${_.get(entry, 'x.value')} .`)
.join('\n')

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
    if (text === undefined) return Alexa.endDialog(handlerInput, '🙀')

    const speechText = RESPONSE.LaunchRequest({ text })
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
      return Alexa.endDialog(handlerInput, RESPONSE.ListLocationsError())
    const locations = listify(results)
    const speechText = RESPONSE.ListLocations({
      locations,
      length: results.length
    })
    return Alexa.endDialog(handlerInput, speechText)
  }
}

const ListDevicesIntentHandler = {
  canHandle (handlerInput) {
    return Alexa.checkIntentName(handlerInput, 'ListDevicesIntent')
  },
  async handle (handlerInput) {
    const results = await SEPA.query(SEPA.ListDevicesQuery)
    if (!results)
      return Alexa.endDialog(handlerInput, RESPONSE.ListDevicesError())
    const devices = listify(results)
    const speechText = RESPONSE.ListDevices({ devices, length: results.length })
    return Alexa.endDialog(handlerInput, speechText)
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
    const locationName = Alexa.getSlot(handlerInput, 'location')
    if (!locationName)
      return Alexa.endDialog(handlerInput, Alexa.ERROR.NO_LOCATION)

    const location = new Fuse(LOCATIONS, fuseOptions).search(locationName)
    const locationId = _.get(location, '[0].id')
    if (!locationId)
      resolve(Alexa.endDialog(handlerInput, Alexa.ERROR.NO_LOCATION))

    const results = await SEPA.query(SEPA.ListByLocationQuery, {
      location: `<${locationId}>`
    })
    if (!results) return Alexa.endDialog(handlerInput, '🙀')

    const sensors = listify(results)
    const locationLabel = _.get(location, '[0].label', 'this location')
    const speechText = RESPONSE.ListByLocation({ sensors, location: locationLabel })
    return Alexa.endDialog(handlerInput, speechText)
  }
}

const GetValueIntentHandler = {
  canHandle (handlerInput) {
    return (
      Alexa.checkRequestType(handlerInput, 'IntentRequest') &&
      Alexa.checkIntentName(handlerInput, 'GetValueIntent')
    )
  },
  handle (handlerInput) {
    if (!Alexa.checkDialogState(handlerInput, 'COMPLETED'))
      return Alexa.elicitSlots(handlerInput)

    const locationName = Alexa.getSlot(handlerInput, 'location')
    if (!locationName)
      return Alexa.endDialog(handlerInput, Alexa.ERROR.NO_LOCATION)

    const type = Alexa.getSlot(handlerInput, 'type')
    if (!type) return Alexa.endDialog(handlerInput, Alexa.ERROR.NO_TYPE)

    return new Promise((resolve, reject) => {
      var location = new Fuse(LOCATIONS, fuseOptions).search(locationName)

      const locationId = _.get(location, '[0].id')
      if (!locationId)
        resolve(Alexa.endDialog(handlerInput, Alexa.ERROR.NO_LOCATION))

      const query = SEPA.GetValueQuery
      SEPA.query(query, { location: `<${locationId}>`, type })
        .then(result => {
          const data = result
            .map((sensor, i) => {
              const label = _.get(sensor, 'label.value')
              const value = _.get(sensor, 'val.value')

              return `\u{2022} #${i + 1}, ${label}: ${value}° .`
            })
            .join('\n')

          const locationLabel = _.get(location, '[0].label', 'this location')
          const speechText = `The most recent observations in ${locationLabel} are: ${data}`

          resolve(Alexa.endDialog(handlerInput, speechText))
        })
        .catch(error => {
          resolve(Alexa.endDialog(handlerInput, '🙀'))
        })
    })
  }
}

const GetLastUpdateTimeIntentHandler = {
  canHandle (handlerInput) {
    return (
      Alexa.checkRequestType(handlerInput, 'IntentRequest') &&
      Alexa.checkIntentName(handlerInput, 'GetLastUpdateTimeIntent')
    )
  },
  handle (handlerInput) {
    if (!Alexa.checkDialogState(handlerInput, 'COMPLETED'))
      return Alexa.elicitSlots(handlerInput)

    const locationName = Alexa.getSlot(handlerInput, 'location')
    if (!locationName)
      return Alexa.endDialog(handlerInput, Alexa.ERROR.NO_LOCATION)

    const type = Alexa.getSlot(handlerInput, 'type')
    if (!type) return Alexa.endDialog(handlerInput, Alexa.ERROR.NO_TYPE)

    return new Promise((resolve, reject) => {
      var location = new Fuse(LOCATIONS, fuseOptions).search(locationName)

      const locationId = _.get(location, '[0].id')
      if (!locationId)
        resolve(Alexa.endDialog(handlerInput, Alexa.ERROR.NO_LOCATION))

      const query = SEPA.GetLastUpdateTimeQuery
      SEPA.query(query, { location: `<${locationId}>`, type })
        .then(result => {
          const data = result
            .map((sensor, i) => {
              const label = _.get(sensor, 'label.value')
              const timestamp = _.get(sensor, 'lastTs.value')
              let lastTs = 'unknown'
              if (timestamp) lastTs = new Date(timestamp).toLocaleString()
              return `\u{2022} #${i + 1}, ${label}: updated at ${lastTs} .`
            })
            .join('\n')

          const locationLabel = _.get(location, '[0].label', 'this location')
          const speechText = `The most recent observations in ${locationLabel} are: ${data}`

          resolve(Alexa.endDialog(handlerInput, speechText))
        })
        .catch(error => {
          resolve(Alexa.endDialog(handlerInput, '🙀'))
        })
    })
  }
}

const GetMaxOfLocationIntentHandler = {
  canHandle (handlerInput) {
    return (
      Alexa.checkRequestType(handlerInput, 'IntentRequest') &&
      Alexa.checkIntentName(handlerInput, 'GetMaxOfLocationIntent')
    )
  },
  handle (handlerInput) {
    if (!Alexa.checkDialogState(handlerInput, 'COMPLETED'))
      return Alexa.elicitSlots(handlerInput)

    const locationName = Alexa.getSlot(handlerInput, 'location')
    if (!locationName)
      return Alexa.endDialog(handlerInput, Alexa.ERROR.NO_LOCATION)

    const type = Alexa.getSlot(handlerInput, 'type')
    if (!type) return Alexa.endDialog(handlerInput, Alexa.ERROR.NO_TYPE)

    return new Promise((resolve, reject) => {
      var location = new Fuse(LOCATIONS, fuseOptions).search(locationName)

      const locationId = _.get(location, '[0].id')
      if (!locationId)
        resolve(Alexa.endDialog(handlerInput, Alexa.ERROR.NO_LOCATION))

      const query = SEPA.GetMaxOfLocationQuery
      SEPA.query(query, { location: `<${locationId}>`, type })
        .then(result => {
          const data = result
            .map((sensor, i) => {
              const label = _.get(sensor, 'label.value')
              const maxVal = _.get(sensor, 'maxVal.value')

              return `\u{2022} #${i + 1}, ${label}, detected ${maxVal}° .`
            })
            .join('\n')

          const locationLabel = _.get(location, '[0].label', 'this location')
          const speechText = `Those are the maximum values observed in ${locationLabel}: ${data}`

          resolve(Alexa.endDialog(handlerInput, speechText))
        })
        .catch(error => {
          resolve(Alexa.endDialog(handlerInput, '🙀' + error)) // TODO mai printare error
        })
    })
  }
}

const GetMinOfLocationIntentHandler = {
  canHandle (handlerInput) {
    return (
      Alexa.checkRequestType(handlerInput, 'IntentRequest') &&
      Alexa.checkIntentName(handlerInput, 'GetMinOfLocationIntent')
    )
  },
  handle (handlerInput) {
    if (!Alexa.checkDialogState(handlerInput, 'COMPLETED'))
      return Alexa.elicitSlots(handlerInput)

    const locationName = Alexa.getSlot(handlerInput, 'location')
    if (!locationName)
      return Alexa.endDialog(handlerInput, Alexa.ERROR.NO_LOCATION)

    const type = Alexa.getSlot(handlerInput, 'type')
    if (!type) return Alexa.endDialog(handlerInput, Alexa.ERROR.NO_TYPE)

    return new Promise((resolve, reject) => {
      var location = new Fuse(LOCATIONS, fuseOptions).search(locationName)

      const locationId = _.get(location, '[0].id')
      if (!locationId)
        resolve(Alexa.endDialog(handlerInput, Alexa.ERROR.NO_LOCATION))

      const query = SEPA.GetMinOfLocationQuery
      SEPA.query(query, { location: `<${locationId}>`, type })
        .then(result => {
          const data = result
            .map((sensor, i) => {
              const label = _.get(sensor, 'label.value')
              const minVal = _.get(sensor, 'minVal.value')

              return `\u{2022} #${i + 1}, ${label}, detected ${minVal}° .`
            })
            .join('\n')

          const locationLabel = _.get(location, '[0].label', 'this location')
          const speechText = `Those are the minimum values observed in ${locationLabel}: ${data}`

          resolve(Alexa.endDialog(handlerInput, speechText))
        })
        .catch(error => {
          resolve(Alexa.endDialog(handlerInput, '🙀' + error)) // TODO mai printare error
        })
    })
  }
}

const GetAverageOfLocationIntentHandler = {
  canHandle (handlerInput) {
    return (
      Alexa.checkRequestType(handlerInput, 'IntentRequest') &&
      Alexa.checkIntentName(handlerInput, 'GetAverageOfLocationIntent')
    )
  },
  handle (handlerInput) {
    if (!Alexa.checkDialogState(handlerInput, 'COMPLETED'))
      return Alexa.elicitSlots(handlerInput)

    const locationName = Alexa.getSlot(handlerInput, 'location')
    if (!locationName)
      return Alexa.endDialog(handlerInput, Alexa.ERROR.NO_LOCATION)

    const type = Alexa.getSlot(handlerInput, 'type')
    if (!type) return Alexa.endDialog(handlerInput, Alexa.ERROR.NO_TYPE)

    return new Promise((resolve, reject) => {
      var location = new Fuse(LOCATIONS, fuseOptions).search(locationName)

      const locationId = _.get(location, '[0].id')
      if (!locationId)
        resolve(Alexa.endDialog(handlerInput, Alexa.ERROR.NO_LOCATION))

      const query = SEPA.GetAverageOfLocationQuery
      SEPA.query(query, { location: `<${locationId}>`, type })
        .then(result => {
          const data = result
            .map((sensor, i) => {
              const label = _.get(sensor, 'label.value')
              const avgVal = _.get(sensor, 'avgVal.value')

              return `\u{2022} #${i + 1}, ${label}, detected ${avgVal}° .`
            })
            .join('\n')

          const locationLabel = _.get(location, '[0].label', 'this location')
          const speechText = `Those are the average values observed in ${locationLabel}: ${data}`

          resolve(Alexa.endDialog(handlerInput, speechText))
        })
        .catch(error => {
          resolve(Alexa.endDialog(handlerInput, '🙀' + error)) // TODO mai printare error
        })
    })
  }
}

const ErrorHandler = {
  canHandle (handlerInput) {
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

const skillBuilder = Ask_SDK.SkillBuilders.custom()

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    ListDevicesIntentHandler,
    ListLocationsIntentHandler,
    ListByLocationIntentHandler,
    GetValueIntentHandler,
    GetLastUpdateTimeIntentHandler,
    GetMaxOfLocationIntentHandler,
    GetMinOfLocationIntentHandler,
    GetAverageOfLocationIntentHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda()

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

const _ = require('lodash/object');

const checkRequestType = (handlerInput, type) => handlerInput.requestEnvelope.request.type === type
const checkIntentName = (handlerInput, name) => handlerInput.requestEnvelope.request.intent.name === name

const buildResponse = (handlerInput, speechText) =>
    handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .withSimpleCard('SensorSpeak', speechText)
        .getResponse()

const getSlots = (handlerInput) => {
    const ret = {}
    const slots = _.get(handlerInput, "requestEnvelope.request.intent.slots")
    if (slots) {
        for (const name in slots) {
            const slot = _.get(slots, `[${name}].resolutions.resolutionsPerAuthority[0].values[0].value`)
            if (slot) {
                ret[name] = {
                    id: slot.id,
                    name: slot.name
                }
            }
        }
    }
    return ret
}

module.exports = {
    checkRequestType,
    checkIntentName,
    getSlots,
    buildResponse
}
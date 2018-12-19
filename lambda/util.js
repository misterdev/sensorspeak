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
    if( handlerInput.requestEnvelope.request 
        && handlerInput.requestEnvelope.request.intent 
        && handlerInput.requestEnvelope.request.intent.slots
    ) {
        const slots = handlerInput.requestEnvelope.request.intent.slots
        for (const name in slots) {
            if( slots[name] 
                && slots[name].resolutions 
                && slots[name].resolutions.resolutionsPerAuthority
                && slots[name].resolutions.resolutionsPerAuthority[0]
                && slots[name].resolutions.resolutionsPerAuthority[0].values
                && slots[name].resolutions.resolutionsPerAuthority[0].values[0]
                && slots[name].resolutions.resolutionsPerAuthority[0].values[0].value
            ) {
                const s = slots[name].resolutions.resolutionsPerAuthority[0].values[0].value
                ret[name] = {
                    id: s.id,
                    name: s.name
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
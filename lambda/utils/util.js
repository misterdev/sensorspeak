const _ = require('lodash/object');

const checkRequestType = (handlerInput, type) => _.get(handlerInput, 'requestEnvelope.request.type') === type
const checkIntentName = (handlerInput, name) => _.get(handlerInput, 'requestEnvelope.request.intent.name') === name
const checkDialogState = (handlerInput, state) => _.get(handlerInput, 'requestEnvelope.request.dialogState') === state

const DialogState = {
    STARTED: 'STARTES',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED'
}

const endDialog = (handlerInput, speechText) =>
    handlerInput.responseBuilder
    .speak(speechText)
    .withSimpleCard('SensorSpeak', speechText)
    .getResponse()

const continueDialog = (handlerInput, speechText) =>
    handlerInput.responseBuilder
    .speak(speechText)
    .withSimpleCard('SensorSpeak', speechText)
    .reprompt(speechText)
    .getResponse()

const elicitSlots = (handlerInput) =>
    handlerInput.responseBuilder
    .addDelegateDirective()
    .getResponse()

const getSlots = (handlerInput) => {
    const ret = {}
    const slots = _.get(handlerInput, "requestEnvelope.request.intent.slots")
    if (slots) {
        for (const n in slots) {
            const slot = _.get(slots, `[${n}].resolutions.resolutionsPerAuthority[0].values[0].value`)
            if (slot) {
                ret[n] = {
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
    checkDialogState,
    elicitSlots,
    getSlots,
    endDialog,
    continueDialog
}
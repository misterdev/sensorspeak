const _ = require('lodash/object')

const checkRequestType = (handlerInput, type) =>
  _.get(handlerInput, 'requestEnvelope.request.type') === type
const checkIntentName = (handlerInput, name) =>
  _.get(handlerInput, 'requestEnvelope.request.intent.name') === name
const checkDialogState = (handlerInput, state) =>
  _.get(handlerInput, 'requestEnvelope.request.dialogState') === state

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

const elicitSlots = handlerInput =>
  handlerInput.responseBuilder.addDelegateDirective().getResponse()

const getSlot = (handlerInput, slotName) =>
  _.get(handlerInput, `requestEnvelope.request.intent.slots.${slotName}.value`)

const ERROR = {
  NO_LOCATION: `Sorry, I don't know this location`,
  NO_TYPE: `Sorry, I don't know this type`
}

module.exports = {
  checkRequestType,
  checkIntentName,
  checkDialogState,
  elicitSlots,
  getSlot,
  endDialog,
  continueDialog,
  ERROR
}

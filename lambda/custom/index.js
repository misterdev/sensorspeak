/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const SEPA = require('./sepa');
const utils = require('./util.js')

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return utils.checkRequestType(handlerInput, 'LaunchRequest')
    },
    handle(handlerInput) {
        return new Promise((resolve, reject) => SEPA.query( SEPA.queryBuilder.LaunchRequestQuery() )
            .then((results) => {
                console.log(results)
                const speechText = `Hi, I'm Alexa and I am able to talk with the SEPA. The label of the sensor Italy-Site1-Pressure is ${results[0].x.value}`
                resolve( utils.buildResponse(handlerInput, speechText) )
            })
            .catch((error) => {
                resolve( utils.buildResponse(handlerInput, '🙀') )
            })
        )
    },
};

const ListLocationsIntentHandler = {
    canHandle(handlerInput) {
        return utils.checkIntentName(handlerInput, 'ListLocationsIntent');
    },
    handle(handlerInput) {
        return new Promise((resolve, reject) => SEPA.query( SEPA.queryBuilder.ListLocationsIntent() )
            .then((results) => {
                const data = results.map( (el, i) => `\u{2022} #${i+1}, ${el.x.value} .` ).join("\n")
                const speechText = `There are ${results.length} locations: ${data}`
                resolve( utils.buildResponse(handlerInput, speechText) )
            })
            .catch((error) => {
                const speechText = "Sorry, I can't find the list of location at the moment"
                resolve( utils.buildResponse(handlerInput, speechText) )
            })
        )
    },
}

const ListDevicesIntentHandler = {
    canHandle(handlerInput) {
        return utils.checkIntentName(handlerInput, 'ListDevicesIntent');
    },
    handle(handlerInput) {
        return new Promise((resolve, reject) => SEPA.query( SEPA.queryBuilder.ListDevicesIntentQuery() )
            .then((results) => {
                const data = results.map( (el, i) => `\u{2022} #${i+1}, ${el.x.value} .` ).join("\n")
                const speechText = `There are ${results.length} devices: ${data}`
                resolve( utils.buildResponse(handlerInput, speechText) )
            })
            .catch((error) => {
                const speechText = "Sorry, I can't find this list at the moment"
                resolve( utils.buildResponse(handlerInput, speechText) )
            })
        )
    },
};

const ListByLocationIntentHandler = {
    canHandle(handlerInput) {
        return utils.checkIntentName(handlerInput, 'ListByLocationIntent')
    },
    handle(handlerInput) {
        const slots = utils.getSlots(handlerInput)
        if( !(slots && slots.location && slots.location.id ) ) return "Sorry, I don't know the location"
        const query = SEPA.queryBuilder.ListByLocationIntent(`<${slots.location.id}>`)
        return new Promise((resolve, reject) => SEPA.query(query)
            .then((results) => {
                const data = results.map( (el, i) => `\u{2022} #${i+1}, ${el.x.value} .` ).join("\n")
                const speechText = `The list of sensors in ${slots.location.name || "this location"} is: ${data}`
                resolve( utils.buildResponse(handlerInput, speechText) )                    
            })
            .catch((error) => {
                console.log(error)
                resolve( utils.buildResponse(handlerInput, '🙀') )
            })
        )
    }
};










const HelloWorldIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'HelloWorldIntent';
    },
    handle(handlerInput) {
        const speechText = 'Hello World!';

        return handlerInput.responseBuilder
            .speak(speechText)
            .withSimpleCard('Sensor Speak', speechText)
            .getResponse();
    },
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speechText = 'You can say hello to me!';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withSimpleCard('Sensor Speak', speechText)
            .getResponse();
    },
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent' ||
                handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speechText = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speechText)
            .withSimpleCard('Sensor Speak', speechText)
            .getResponse();
    },
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

        return handlerInput.responseBuilder.getResponse();
    },
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`Error handled: ${error.message}`);

        return handlerInput.responseBuilder
            .speak('Sorry, I can\'t understand the command. Please say again.')
            .reprompt('Sorry, I can\'t understand the command. Please say again.')
            .getResponse();
    },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
    .addRequestHandlers(
        LaunchRequestHandler,
        HelloWorldIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        ListDevicesIntentHandler,
        ListLocationsIntentHandler,
        ListByLocationIntentHandler
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();
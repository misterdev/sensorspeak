/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const SEPA = require('./sepa');

// ListByLocationIntent

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        // const speechText = 'Welcome to the Alexa Skills Kit, you can say hello!';

        return new Promise((resolve, reject) => SEPA.query(SEPA.queries.LaunchRequestQuery)
            .then(function(results) {
                const speechText = `Hi, I'm Alexa and I am able to talk with the SEPA. The label of the sensor Italy-Site1-Pressure is ${results.results.bindings[0].x.value}`
                const response = handlerInput.responseBuilder
                    .speak(speechText)
                    .reprompt(speechText)
                    .withSimpleCard('Sensor Speak', speechText)
                    .getResponse()

                resolve(response)
            })
            .catch(function(error) {
                console.error('🙀', error)
            })
        )
    },
};

const ListDevicesIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.intent.name === 'ListDevicesIntent';
    },
    handle(handlerInput) {
        return new Promise((resolve, reject) => SEPA.query(SEPA.queries.ListDevicesIntentQuery)
            .then(function(results) {
                const speechText = results.results.bindings.map(e => e.x.value).toString()
                const response = handlerInput.responseBuilder
                    .speak(speechText)
                    .reprompt(speechText)
                    .withSimpleCard('SensorSpeak', speechText)
                    .getResponse()

                resolve(response)
            })
            .catch(function(error) {
                const speechText = "Sorry, I can't find this list at the moment"
                const response = handlerInput.responseBuilder
                    .speak(speechText)
                    .reprompt(speechText)
                    .withSimpleCard('SensorSpeak', speechText)
                    .getResponse()
            })
        )
    },
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
        ListDevicesIntentHandler
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();
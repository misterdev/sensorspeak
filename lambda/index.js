const _ = require('lodash/object')
const Alexa = require('ask-sdk-core')
const Fuse = require('fuse.js')

const SEPA = require('./sepa')
const utils = require('./utils/util')
const locations = require('./utils/locations')

const fuseOptions = {
    shouldSort: true,
    tokenize: true,
    threshold: 0.2,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: [
        "label"
    ]
};

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return utils.checkRequestType(handlerInput, 'LaunchRequest')
    },
    handle(handlerInput) {
        return new Promise((resolve, reject) => SEPA.query(SEPA.queryBuilder.LaunchRequestQuery())
            .then((results) => {
                const speechText = `Hi, I'm Alexa and I am able to talk with the SEPA. For example, I know that the label of the sensor "Italy-Site1-Pressure" is: ${results[0].x.value}`
                resolve(utils.buildResponse(handlerInput, speechText));
            })
            .catch((error) => {
                resolve(utils.buildResponse(handlerInput, '🙀'));
            })
        )
    },
};

const ListLocationsIntentHandler = {
    canHandle(handlerInput) {
        return utils.checkIntentName(handlerInput, 'ListLocationsIntent');
    },
    handle(handlerInput) {
        return new Promise((resolve, reject) => SEPA.query(SEPA.queryBuilder.ListLocationsIntent())
            .then((results) => {
                const data = results.map((el, i) => `\u{2022} #${i+1}, ${el.x.value} .`).join("\n")
                const speechText = `There are ${results.length} locations: ${data}`
                resolve(utils.buildResponse(handlerInput, speechText))
            })
            .catch((error) => {
                const speechText = "Sorry, I can't find the list of location at the moment"
                resolve(utils.buildResponse(handlerInput, speechText))
            })
        )
    },
}

const ListDevicesIntentHandler = {
    canHandle(handlerInput) {
        return utils.checkIntentName(handlerInput, 'ListDevicesIntent');
    },
    handle(handlerInput) {
        return new Promise((resolve, reject) => SEPA.query(SEPA.queryBuilder.ListDevicesIntentQuery())
            .then((results) => {
                const data = results.map((el, i) => `\u{2022} #${i+1}, ${el.x.value} .`).join("\n")
                const speechText = `There are ${results.length} devices: ${data}`
                resolve(utils.buildResponse(handlerInput, speechText))
            })
            .catch((error) => {
                const speechText = "Sorry, I can't find this list at the moment"
                resolve(utils.buildResponse(handlerInput, speechText))
            })
        )
    },
};

const ListByLocationIntentHandler = {
    canHandle(handlerInput) {
        return utils.checkRequestType(handlerInput, 'IntentRequest') &&
            utils.checkIntentName(handlerInput, 'ListByLocationIntent')
    },
    handle(handlerInput) {
        const slotLocation = _.get(handlerInput, "requestEnvelope.request.intent.slots.location.value")
        if (!slotLocation) return utils.buildResponse(handlerInput, "Sorry, I don't know this location")

        return new Promise((resolve, reject) => {
            var location = new Fuse(locations, fuseOptions).search(slotLocation);

            const locationId = _.get(location, "[0].label")
            if (!locationId) return utils.buildResponse(handlerInput, "Sorry, I don't know this location")

            const query = SEPA.queryBuilder.ListByLocationIntent(`<${locationId}>`)
            SEPA.query(query)
                .then((sensors) => {
                    const data = sensors.map((s, i) => `\u{2022} #${i+1}, ${s.x.value} .`).join("\n")
                    const speechText = `The list of sensors in ${_.get(location, "[0].label", "this location")} is: ${data}`
                    resolve(utils.buildResponse(handlerInput, speechText))
                })
                .catch((error) => {
                    resolve(utils.buildResponse(handlerInput, '🙀'))
                })
        })
    }
};

const GetInfoIntentIntentHandler = {
    canHandle(handlerInput) {
        return utils.checkRequestType(handlerInput, 'IntentRequest') &&
            utils.checkIntentName(handlerInput, 'GetInfoIntent')
    },
    handle(handlerInput) {
        const slotLocation = _.get(handlerInput, "requestEnvelope.request.intent.slots.location.value")
        if (!slotLocation) return utils.buildResponse(handlerInput, "Sorry, I don't know this location")

        return new Promise((resolve, reject) => {
            var location = new Fuse(locations, fuseOptions).search(slotLocation);

            const locationId = _.get(location, "[0].label")
            if (!locationId) return utils.buildResponse(handlerInput, "Sorry, I don't know this location")

            const query = SEPA.queryBuilder.ListByLocationIntent(`<${locationId}>`)
            SEPA.query(query)
                .then((sensors) => {
                    const data = sensors.map((s, i) => `\u{2022} #${i+1}, ${s.x.value} .`).join("\n")
                    const speechText = `The list of sensors in ${_.get(location, "[0].label", "this location")} is: ${data}`
                    resolve(utils.buildResponse(handlerInput, speechText))
                })
                .catch((error) => {
                    resolve(utils.buildResponse(handlerInput, '🙀'))
                })
        })
    }
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
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        ListDevicesIntentHandler,
        ListLocationsIntentHandler,
        ListByLocationIntentHandler,
        GetInfoIntentIntentHandler
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();
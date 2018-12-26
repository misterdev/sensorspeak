const _ = require('lodash/object')
const Alexa = require('ask-sdk-core')
const Fuse = require('fuse.js')

const SEPA = require('./sepa')
const utils = require('./utils/util')
const LOCATIONS = require('./utils/locations')

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
        return new Promise((resolve, reject) => SEPA.query(SEPA.queryBuilder.ListLocationsQuery())
            .then((results) => {
                const locations = results.map((l, i) => `\u{2022} #${i+1}, ${_.get(l, 'x.value')} .`).join("\n")
                const speechText = `There are ${results.length} locations: ${locations}`
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
        return new Promise((resolve, reject) => SEPA.query(SEPA.queryBuilder.ListDevicesQuery())
            .then((results) => {
                const devices = results.map((s, i) => `\u{2022} #${i+1}, ${_.get(s, 'x.value')} .`).join("\n")
                const speechText = `There are ${results.length} devices: ${devices}`
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
            var location = new Fuse(LOCATIONS, fuseOptions).search(slotLocation);

            const locationId = _.get(location, "[0].id")
            if (!locationId) resolve(utils.buildResponse(handlerInput, "Sorry, I don't know this location"))

            const query = SEPA.queryBuilder.ListByLocationQuery(`<${locationId}>`)
            SEPA.query(query)
                .then((result) => {
                    const sensors = result.map((sensor, i) =>
                        `\u{2022} #${i+1}, ${_.get(sensor, 'x.value')
                    } .`).join("\n")

                    const speechText = `The list of sensors in ${_.get(location, "[0].label", "this location")} is: ${sensors}`
                    resolve(utils.buildResponse(handlerInput, speechText))
                })
                .catch((error) => {
                    resolve(utils.buildResponse(handlerInput, '🙀'))
                })
        })
    }
};

const GetValueIntentHandler = {
    canHandle(handlerInput) {
        return utils.checkRequestType(handlerInput, 'IntentRequest') &&
            utils.checkIntentName(handlerInput, 'GetValueIntent')
    },
    handle(handlerInput) {
        const slotLocation = _.get(handlerInput, "requestEnvelope.request.intent.slots.location.value")
        if (!slotLocation) return utils.buildResponse(handlerInput, "Sorry, I don't know this location")

        const slotType = _.get(handlerInput, "requestEnvelope.request.intent.slots.type")
        if (!slotType) return utils.buildResponse(handlerInput, "Sorry, I don't know this type")

        return new Promise((resolve, reject) => {
            var location = new Fuse(LOCATIONS, fuseOptions).search(slotLocation);

            const locationId = _.get(location, "[0].id")
            if (!locationId) resolve(utils.buildResponse(handlerInput, "Sorry, I don't know this location"))

            const query = SEPA.queryBuilder.GetValueIntent(`<${locationId}>`, slotType)
            SEPA.query(query)
                .then((result) => {
                    const data = result.map((sensor, i) => {
                        const label = _.get(sensor, 'label.value')
                        const value = _.get(sensor, 'val.value')

                        return `\u{2022} #${i+1}, ${label}: ${value}° .`
                    }).join("\n");

                    const locationLabel = _.get(location, "[0].label", "this location");
                    const speechText = `The most recent observations in ${locationLabel} are: ${data}`

                    resolve(utils.buildResponse(handlerInput, speechText))
                })
                .catch((error) => {
                    resolve(utils.buildResponse(handlerInput, '🙀'))
                })
        })
    }
};


const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
    .addRequestHandlers(
        LaunchRequestHandler,
        ListDevicesIntentHandler,
        ListLocationsIntentHandler,
        ListByLocationIntentHandler,
        GetValueIntentHandler
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();









// const HelpIntentHandler = {
//     canHandle(handlerInput) {
//         return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
//             handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
//     },
//     handle(handlerInput) {
//         const speechText = 'You can say hello to me!';

//         return handlerInput.responseBuilder
//             .speak(speechText)
//             .reprompt(speechText)
//             .withSimpleCard('Sensor Speak', speechText)
//             .getResponse();
//     },
// };

// const CancelAndStopIntentHandler = {
//     canHandle(handlerInput) {
//         return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
//             (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent' ||
//                 handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
//     },
//     handle(handlerInput) {
//         const speechText = 'Goodbye!';

//         return handlerInput.responseBuilder
//             .speak(speechText)
//             .withSimpleCard('Sensor Speak', speechText)
//             .getResponse();
//     },
// };

// const SessionEndedRequestHandler = {
//     canHandle(handlerInput) {
//         return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
//     },
//     handle(handlerInput) {
//         console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

//         return handlerInput.responseBuilder.getResponse();
//     },
// };
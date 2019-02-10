const nock = require('nock')
const queryString = require('query-string')
const _ = require('lodash')
const SEPA = require('../lambda/sepa')

module.exports = {
  onRequest: (test, request) => {
    const intentName = _.get(request, 'request.intent.name')
    const intentType = _.get(request, 'request.type')
    const intent = intentName || intentType // TODO perche' funziona?

    const response = request.SEPAResponse
    switch (intent) {
      case 'LaunchRequest':
        LaunchRequestFilter()
        break
      case 'ListDevicesIntent':
        ListDevicesIntentFilter(response)
        break
    }
  }
}

function LaunchRequestFilter () {
  nock('http://mml.arces.unibo.it:8000')
    .post('/query')
    .reply(200, (uri, requestBody) => {
      const query = queryString.parse(requestBody).query
      const expectedQuery = SEPA.LaunchRequestQuery()
      if (query.indexOf(expectedQuery) > 0)
        return simpleResponse('Italy-Site1-Pressure-label')
      else return 'error'
    })
}

function ListDevicesIntentFilter (response) {
  nock('http://mml.arces.unibo.it:8000')
    .post('/query')
    .reply(200, (uri, requestBody) => {
      const query = queryString.parse(requestBody).query
      const expectedQuery = SEPA.ListDevicesQuery()
      if (query.indexOf(expectedQuery) > 0) return multiResponse(response)
      else return 'error'
    })
}

const simpleResponse = value => ({
  results: {
    bindings: [
      {
        x: {
          value
        }
      }
    ]
  }
})

const multiResponse = values => {
  let bindings = values.map(value => ({
    x: {
      value
    }
  }))
  return {
    results: {
      bindings
    }
  }
}

const nock = require('nock')
const queryString = require('query-string')
const _ = require('lodash')
const SEPA = require('../lambda/sepa')

module.exports = {
  onTestStart: test => {
    const intent = _.get(test, '_interactions[0]._utterance')
    switch (intent) {
      case 'LaunchRequest':
        LaunchRequestFilter()
        break
    }
  }
}

function LaunchRequestFilter () {
  nock('http://mml.arces.unibo.it:8000')
    .persist()
    .post('/query')
    .reply(200, (uri, requestBody) => {
      const query = queryString.parse(requestBody).query
      const expectedQuery = SEPA.LaunchRequestQuery()
      if (query.indexOf(expectedQuery) > 0)
        return simpleResponse('Italy-Site1-Pressure-label')
      else return 'error'
    })
  nock('http://mml.arces.unibo.it:8000')
    .persist()
    .get('/query')
    .reply(200, (uri, requestBody) => {
      const query = queryString.parse(requestBody).query
      const expectedQuery = SEPA.LaunchRequestQuery()
      if (query.indexOf(expectedQuery) > 0)
        return simpleResponse('Italy-Site1-Pressure-label')
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

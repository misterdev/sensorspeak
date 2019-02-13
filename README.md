[![Build Status](https://travis-ci.com/misterdev/sensorspeak.svg?branch=master)](https://travis-ci.com/misterdev/sensorspeak) [![codecov](https://codecov.io/gh/misterdev/sensorspeak/branch/master/graph/badge.svg)](https://codecov.io/gh/misterdev/sensorspeak)

# SensorSpeak
Repo of SensorSpeak's Skill & AWS Lambda

# Setup

## 1. Clone this repo
```bash
git clone https://github.com/misterdev/sensorspeak.git
cd sensorspeak
```

## 2. Install dependencies
```bash
yarn
```

## 3. Setup a IAM user ([link](https://developer.amazon.com/docs/smapi/quick-start-alexa-skills-kit-command-line-interface.html#set-up-iam-user))

## 4. Install and initialize ASK CLI ([link](https://developer.amazon.com/docs/smapi/quick-start-alexa-skills-kit-command-line-interface.html))

```bash
yarn global add ask-cli
ask init 
```

# Develop
## 1. Deploy
Deploy your model and lambda function
```bash
yarn deploy
``` 
Alternatively deploy only the lambda or the model
```bash
yarn deploy:lambda
yarn deploy:model
```

## 2. Interaction
Interact with your skill using
```bash
yarn dialog
Alexa> alexa tell sensor speak to list all devices
```
## 3. Testing
Run your test suite (🥦just 3 tests🥦)
```bash
yarn test
```

You can add a new test in `tests/response.test.yml`
NB: You can mock the SEPA while running tests adding an interceptor in `tests/SEPAFilter.js`


# Deploy to a new instance

## 1. Replace `.ask/config/ with a new configuration file: 

```json
{
  "deploy_settings": {
    "default": {
      "skill_id": "",
      "was_cloned": false,
      "merge": {}
    }
  }
}
```

## 2. Customize Informations ([doc](https://developer.amazon.com/docs/smapi/skill-manifest.html))
You can customize your skill name and settings in `skill.json`

## 3. Deploy
Running `yarn deploy` for the first time will create an Alexa Skills and an AWS lambda function


# Read More
- [Alexa SDK for Node Examples](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs)
- [Code Deep Dive ask-sdk-core](https://developer.amazon.com/blogs/alexa/post/dff6f892-ee90-4fef-954f-27ad84eb7739/code-deep-dive-introduction-to-the-ask-software-development-kit-for-node-js)
- [Skill Availability by Region](https://developer.amazon.com/docs/custom-skills/develop-skills-in-multiple-languages.html)
- [Alexa Emulator](https://echosim.io/)
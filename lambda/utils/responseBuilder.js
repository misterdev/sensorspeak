module.exports = {
  NoValue: ({ location, type }) =>
    `There aren't data about the ${type} in ${location}. I'm sorry 🤷‍`,
  NoValueType: ({ type }) =>
    `There aren't data about the ${type} sensors. I'm sorry 🤷‍`,
  NoResults: () =>
    `Something went wrong 🙀, I can't communicate with the SEPA. Try again later.`,
  LaunchRequest: ({ text }) =>
    `Hi, I'm Alexa and I am able to talk with the SEPA. For example, I know that the label of the sensor \"Italy-Site1-Pressure\" is ${text}`,
  ListLocations: ({ locations, length }) =>
    `There are ${length} locations: ${locations}`,
  ListLocationsError: () =>
    "Sorry, I can't find the list of location at the moment",
  ListDevices: ({ devices, length }) =>
    `There are ${length} devices: ${devices}`,
  ListDevicesError: () => "Sorry, I can't find this list at the moment",
  ListByLocation: ({ location, sensors }) =>
    `The list of sensors in ${location} is: ${sensors}`,
  ListByLocationError: () => 'null',
  GetValue: ({ location, observations }) =>
    `The most recent observations in ${location} are: ${observations}`,
  GetLastUpdateTime: ({ location, data }) =>
    `The most recent observations in ${location} are: ${data}`,
  ListByType: ({ type, sensors, length }) =>
    `There are ${length} ${type} sensors: ${sensors}`,
  ListByTypeError: ({ type }) => `There aren't ${type} sensors.`,
  GetAverage: ({ type, average }) => `The average ${type} is ${average}`,
  GetAverageOfLocation: ({ location, type, average }) =>
    `The daily average ${type} in ${location} is ${average}`,
  GetMaxOfLocation: ({ location, type, max }) =>
    `The maximum ${type} observed in ${location} is ${max}`
}

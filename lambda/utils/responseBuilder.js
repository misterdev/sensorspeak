module.exports = {
  LaunchRequest: ({ sensor, label }) =>
    `Hi, I'm Alexa and I am able to talk with the SEPA. For example, I know that the label of the sensor \"${sensor}\" is: ${label}`,
  Help: () =>
    `I'm Sensor Speak, you can ask me to read data from the SEPA, ask me something like: "list all sensors", "turn on sensors" or "get value"`,
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
  ListByState: ({ status, sensors, length }) =>
    `There are ${length} sensor with state ${status}: ${sensors}`,
  GetValue: ({ location, observations }) =>
    `The most recent observations in ${location} are: ${observations}`,
  GetLastUpdateTime: ({ location, data }) =>
    `The most recent observations in ${location} are: ${data}`,
  ListByType: ({ type, sensors, length }) =>
    `There are ${length} ${type} sensors: ${sensors}`,
  ListByTypeError: ({ type }) => `There aren't ${type} sensors.`,
  GetAverageOfType: ({ type, average }) => `The average ${type} is ${average}`,
  GetAverageOfLocation: ({ location, type, average }) =>
    `The daily average ${type} in ${location} is ${average}`,
  GetMaxOfLocation: ({ location, type, max }) =>
    `The maximum ${type} observed in ${location} is ${max}`,
  GetMinOfLocation: ({ location, type, min }) =>
    `The minimum ${type} observed in ${location} is ${min}`,
  GetLastUpdateTime: ({ location, type, sensors }) =>
    `The last update for the ${type} sensor in ${location} is: ${sensors}`,
  GetState: ({ location, type, length, sensors }) =>
    `There are ${length} ${type} sensors in ${location}: ${sensors}`,
  TurnOnOff: ({ location, type, status }) =>
    `Any ${type} sensor in ${location} has been turned ${status}`,
  TurnOnOffByLocation: ({ location, status }) =>
    `Any sensor in ${location} has been turned ${status}`,
  TurnOnOffByType: ({ type, status }) =>
    `Any ${type} sensor has been turned ${status}`,
  GetUpdateInterval: ({ type, location, length, sensors }) =>
    `There are ${length} ${type} sensors in ${location}: ${sensors}`,
  SetUpdateInterval: ({ type, location, interval, humanized }) =>
    `Every ${type} sensor in ${location} now updates every ${humanized} (${interval} ms)`,
  NoValue: ({ location, type }) =>
    `There aren't data about the ${type} sensor in ${location}. I'm sorry 🤷‍`,
  NoValueType: ({ type }) =>
    `There aren't data about the ${type} sensors. I'm sorry 🤷‍`,
  NoValueStatus: ({ status }) => `There are no sensor with status: ${status}`,
  NoResults: () =>
    `Something went wrong 🙀, I can't communicate with the SEPA. Try again later.`
}

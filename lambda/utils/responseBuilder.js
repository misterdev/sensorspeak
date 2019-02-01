module.exports = {
  LaunchRequest: ({ text }) =>
    `Hi, I'm Alexa and I am able to talk with the SEPA. For example, I know that the label of the sensor \"Italy-Site1-Pressure\" is: ${text}`,
  ListLocations: ({ locations, length }) =>
    `There are ${length} locations: ${locations}`,
  ListLocationsError: () =>
    "Sorry, I can't find the list of location at the moment",
    ListDevices: ({devices, length}) =>  `There are ${length} devices: ${devices}`,
  ListDevicesError: () => "Sorry, I can't find this list at the moment",
  ListByLocation: ({location, sensors}) => `The list of sensors in ${location} is: ${sensors}`,
  ListByLocationError: () => 'null'
}

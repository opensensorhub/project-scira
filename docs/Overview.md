# OpenSensorHub SOS overview

The link http://sensiasoft.net:8181/demo.html provides sample requests and responses for accessing observations and information from an OSH SOS. Things like requesting and streaming real-time versus archived data, requesting JSON formatting rather than default XML, using web sockets, getting feature info (e.g. station info) and getting sensor descriptions. This page is not specific to SCIRA.

Right now, OSH is supporting the v2.0 suite of SWE services (SOS, SOS-T, SPS, etc.) but will also support SensorThings API as part of this pilot. However, if you need to get started with this data, I recommend going ahead with making SOS requests and setting the responseFormat to JSON (unless you are already heavily into XML).

# SCIRA SOS access

During this pilot, we will deploy OSH hubs on Android phones (SmartHubs), field laptops, and the cloud. Most of the observations will be pushed in real-time and perhaps stored on our Cloud SensorHub established for this pilot. Our cloud-based OSH SensorHub supporting SOS, SPS, and eventually STA is located at  http://scira.georobotix.io:8181. 

Initially, we have added US stream gage data to the SCIRA OSH Cloud and will continue to add additional sensor systems and processing. 

The UserName = “user” and password = “user@SCIRA”.

# Sample requests
## Stream gage height

A sample of the stream gage height measurements can be accessed as JSON using the GetResult request:

http://scira.georobotix.io:8181/sensorhub/sos?service=SOS&version=2.0&request=GetResult&offering=urn:nys:usgs&observedProperty=http://sensorml.com/ont/swe/property/GageHeight&temporalFilter=phenomenonTime,2019-08-20T00:00:00Z/2019-08-21T12:00:00Z&responseFormat=application/json&featureOfInterest=urn:usgs:water:site:07019185

The JSON data structure and semantics are described by the getResultTemplate request:

http://scira.georobotix.io:8181/sensorhub/sos?service=SOS&version=2.0&request=GetResultTemplate&offering=urn:nys:usgs&observedProperty=http://sensorml.com/ont/swe/property/GageHeight&responseFormat=application/json&featureOfInterest=urn:usgs:water:site:07019185

As an alternative response format one can receive the data as more efficient CSV data by using the default data stream:

http://scira.georobotix.io:8181/sensorhub/sos?service=SOS&version=2.0&request=GetResult&offering=urn:nys:usgs&observedProperty=http://sensorml.com/ont/swe/property/GageHeight&temporalFilter=phenomenonTime,2019-08-20T00:00:00Z/2019-08-21T12:00:00Z&featureOfInterest=urn:usgs:water:site:07019185

which is described using the SWE Common Data standard:

http://scira.georobotix.io:8181/sensorhub/sos?service=SOS&version=2.0&request=GetResultTemplate&offering=urn:nys:usgs&observedProperty=http://sensorml.com/ont/swe/property/GageHeight&featureOfInterest=urn:usgs:water:site:07019185


OSH/SWE can support a large network of sensor stations (100s - 10,000s). These are treated as features and can be accessed in SWE using the GetFeatureOfInterest request (note you can receive one or all or filter by id, by bounding box, etc.):

http://scira.georobotix.io:8181/sensorhub/sos?service=SOS&version=2.0&request=GetFeatureOfInterest&procedure=urn:usgs:water:network

Finally, the GetCapabilities request will keep you up to date on new sensor (or actuator) systems:

http://scira.georobotix.io:8181/sensorhub/sos?service=SOS&version=2.0&request=GetCapabilities

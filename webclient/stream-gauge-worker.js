onmessage = function (e) {
    console.log('Message:' + e + ' received');
    let gaugeList = [];
    // make http req to get latest data
    let req = new XMLHttpRequest();
    let url = 'https://nys.georobotix.com/sensorhub/sos?service=SOS&version=2.0&request=GetResult&' +
        'offering=urn:nys:usgs:live&observedProperty=http://sensorml.com/ont/swe/property/WaterTempCelsius&' +
        'temporalFilter=phenomenonTime,now&responseFormat=application/json';
    req.open("GET", url, false);
    req.withCredentials = true;
    req.onload = () => {
        let streamGauges = JSON.parse(req.responseText);
        // console.log(streamGauges);
        postMessage(streamGauges);
    };
    req.send();

    // getStreamGageFOIs();

};

function getStreamGageFOIs() {
    let req = new XMLHttpRequest();
    let url = 'https://nys.georobotix.com/sensorhub/sos?service=SOS&version=2.0' +
        '&request=GetFeatureOfInterest&procedure=urn:usgs:water:network';
    req.open('GET', url, false);
    req.withCredentials = true;
    req.onload = () => {
        // let fois = JSON.parse(req.responseText);
        let fois = OSH.Utils.jsonix_XML2JSON(req.responseText);
        console.log(fois);
    };
    req.send();
}
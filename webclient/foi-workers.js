let mapView;
let locStyler;

onmessage = (e)=>{
    console.log(e.data);
    postMessage('Data Received From Main');
    if(e.data === 'usgs'){
        getStreamGageFOIs();
    }
};


function getStreamGageFOIs() {
    let req = new XMLHttpRequest();
    let url = 'https://nys.georobotix.com/sensorhub/sos?service=SOS&version=2.0&request=GetFeatureOfInterest' +
        '&procedure=urn:usgs:water:network';
    req.open('GET', url, false);
    req.withCredentials = true;
    req.onload = () => {
        postMessage({usgs:req.responseText});
    };
    req.send();
}

function getNOAAFOIs(cesiumView) {
    let req = new XMLHttpRequest();
    let url = 'https://nys.georobotix.com/sensorhub/sos?service=SOS&version=2.0&request=GetFeatureOfInterest' +
        '&procedure=urn:ioos:network:ndbc:buoy';
    req.open('GET', url, false);
    req.withCredentials = true;
    req.onload = () => {
        let parser = new OSH.SWEXmlParser(req.responseText);
        // console.log(parser.toJson());
        let fois = parser.toJson()['GetFeatureOfInterestResponse'].featureMember;
        let buoys = [];
        for (let i = 0; i < fois.length; i++) {
            // for (let i = 0; i < 5; i++) {
            // console.log(fois[i]);
            let foi = fois[i];
            let staticLocation = {};
            let locSplit = foi.shape.pos.split(' ');
            staticLocation.lat = parseFloat(locSplit[0]);
            staticLocation.lon = parseFloat(locSplit[1]);
            staticLocation.alt = 0.0;
            // console.log(staticLocation);
            let entity = addNOAABuoySensor(foi.identifier.value, foi.name, 'urn:nys:ndbc', cesiumView, {
                foi: foi.identifier.value, location: staticLocation
            });
            entity.sensorType = 'Buoy';
            locStylerToEntities[entity.locStyler.id] = entity;
        }

    };
    req.send();
}


function getAVLFOIs(cesiumView) {
    let req = new XMLHttpRequest();
    let url = 'https://nys.georobotix.com/sensorhub/sos?service=SOS&version=2.0&request=GetFeatureOfInterest' +
        '&procedure=urn:osh:sensor:verizon:dataconnect';
    req.open('GET', url, false);
    req.withCredentials = true;
    req.onload = () => {
        let parser = new OSH.SWEXmlParser(req.responseText);
        // console.log(parser.toJson());
        let fois = parser.toJson()['GetFeatureOfInterestResponse'].featureMember;
        let buoys = [];
        for (let i = 0; i < fois.length; i++) {
            let foi = fois[i];
            let entity = addSnowPlowAVLSensor(foi.identifier.value, foi.id + ' (' + foi.name + ')', 'urn:nys:avl', cesiumView, {
                foi: foi.identifier.value
            });
            entity.sensorType = 'AVL';
            locStylerToEntities[entity.locStyler.id] = entity;
        }

    };
    req.send();
}



function getTrafficCamFOIs(mapView) {
    let req = new XMLHttpRequest();
    let url = 'https://nys.georobotix.com/sensorhub/sos?service=SOS&version=2.0&request=GetFeatureOfInterest' +
        '&procedure=urn:osh:sensor:511ny:trafficcams';
    req.open('GET', url, false);
    req.withCredentials = true;
    req.onload = () => {
        let parser = new OSH.SWEXmlParser(req.responseText);
        // console.log(parser.toJson());
        let fois = parser.toJson()['GetFeatureOfInterestResponse'].featureMember;
        for (let i = 0; i < fois.length; i++) {
            let foi = fois[i];
            let staticLocation = {};
            let lat = foi.latitude;
            let lon = foi.longitude;
            let orientation;
            switch (foi.directionOfTravel) {
                case 'Southbound':
                    orientation = 180.0;
                    break;
                case 'Eastbound':
                    orientation = 90.0;
                    break;
                case 'Westbound':
                    orientation = 270.0;
                    break;
                default:
                    orientation = 0.0;
                    break;
            }
            staticLocation.lat = parseFloat(lat);
            staticLocation.lon = parseFloat(lon);
            staticLocation.alt = 0.0;
            staticLocation.orient = orientation;
            let entity = addTrafficCamSensor(foi.identifier.value, foi.id + ' (' + foi.name + ')', 'urn:nys:trafficcams', cesiumView, {
                foi: foi.identifier.value, location: staticLocation
            });
            entity.sensorType = 'TrafficCam';
            locStylerToEntities[entity.locStyler.id] = entity;
        }

    };
    req.send();
}


function getMesonetFOIs(mapView) {
    let req = new XMLHttpRequest();
    let url = 'https://nys.georobotix.com/sensorhub/sos?service=SOS&version=2.0&request=GetFeatureOfInterest' +
        '&procedure=urn:osh:sensor:nysmesonet';
    req.open('GET', url, false);
    req.withCredentials = true;
    req.onload = () => {
        let parser = new OSH.SWEXmlParser(req.responseText);
        // console.log(parser.toJson());
        let fois = parser.toJson()['GetFeatureOfInterestResponse'].featureMember;
        console.log(fois);
        for (let i = 0; i < fois.length; i++) {
            let foi = fois[i];
            let location = foi.location.pos.split(' ');
            let staticLocation = {};
            staticLocation.lat = parseFloat(location[0]);
            staticLocation.lon = parseFloat(location[1]);
            staticLocation.alt = 0.0;
            // staticLocation.alt = parseFloat(location[2]);
            // console.log(staticLocation);
            let entity = Sensors.addMesonetSensor(foi.identifier.value, foi.id + ' (' + foi.name + ')', 'urn:nys:mesonet', cesiumView, {
                foi: foi.identifier.value, location: staticLocation
            });
            entity.sensorType = 'Mesonet';
            locStylerToEntities[entity.locStyler.id] = entity;
        }

    };
    req.send();
}

// getAVLFOIs();
// getMesonetFOIs();
// getNOAAFOIs();
// getStreamGageFOIs();
// getTrafficCamFOIs();


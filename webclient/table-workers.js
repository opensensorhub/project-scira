let offerings = {
    USGS: 'urn:nys:usgs',
    NOAA: 'urn:nys:ndbc',
    Meso: 'urn:nys:mesonet',
    AVL: 'urn:nys:avl'
};
let observedProperties = {
    USGS: {
        gageheight: 'http://sensorml.com/ont/swe/property/GageHeight',
        temp: "http://sensorml.com/ont/swe/property/WaterTemperature",
        discharge: "http://sensorml.com/ont/swe/property/Discharge",
        getAll() {
            return this.discharge + ',' + this.temp + ',' + this.gageheight;
        }
    },
    NOAA: {
        temp: "http://sensorml.com/ont/swe/property/sea_water_temperature",
        depth: "http://sensorml.com/ont/swe/property/buoy_depth",
        getAll() {
            return this.temp + ',' + this.depth;
        }
    },
    AVL: {
        GPS: 'http://sensorml.com/ont/swe/property/GPSData',
        ODB: 'http://sensorml.com/ont/swe/property/OBDData',
        getAll() {
            return this.GPS + ',' + this.ODB;
        }
    },
    Meso: {
        all: 'http://sensorml.com/ont/swe/property/NysMesonetRecord'
    }
};

function makeURL(offering, observable, startTime, endTime) {
    let url = 'http://scira.georobotix.io:8181/sensorhub/sos?service=SOS&version=2.0&request=GetResult' +
        '&offering=' + offering +
        '&observedProperty=' + observable;
    // '&temporalFilter=phenomenonTime,2019-01-18T17:00:00Z/2019-01-21T17:00:00Z' +
    if (startTime !== 'now') {
        url += '&temporalFilter=phenomenonTime,' + startTime + '/' + endTime;
    } else {
        url += "&temporalFilter=phenomenonTime,now";
    }
    url += '&responseFormat=application/json';
    return url;
}

function registerDatasource() {
}

function getResultsUSGSGageHeight() {
    let url = makeURL(offerings.USGS, observedProperties.USGS.gageheight, oldestRecordTime, latestRecordTime);
    // console.log(url);
    fetch(url, {credentials: 'include'})
        .then((response) => {
                return response.json();
            }
        ).then((resultJson) => {
        // console.log(resultJson);
        postMessage({usgs_gh: resultJson});
    })
}

function getResultsUSGSTemp() {
    let url = makeURL(offerings.USGS, observedProperties.USGS.temp, oldestRecordTime, latestRecordTime);
    // console.log(url);
    fetch(url, {credentials: 'include'})
        .then((response) => {
                return response.json();
            }
        ).then((resultJson) => {
        // console.log(resultJson);
        postMessage({usgs_temp: resultJson});
    })
}

function getResultsUSGSDischarge() {
    let url = makeURL(offerings.USGS, observedProperties.USGS.discharge, oldestRecordTime, latestRecordTime);
    // console.log(url);
    fetch(url, {credentials: 'include'})
        .then((response) => {
                return response.json();
            }
        ).then((resultJson) => {
        // console.log(resultJson);
        postMessage({usgs_dis: resultJson});
    })
}

function getResultsUSGS() {
    let OLDEST_REQUESTED_RECORD = 1 * 1 * 3600 * 1000;      // 1 Hour
    let oldestRecordTime = new Date(Date.now() - OLDEST_REQUESTED_RECORD).toISOString();
    let latestRecordTime = new Date(Date.now()).toISOString();

    let url = makeURL(offerings.USGS, observedProperties.USGS.getAll(), oldestRecordTime, latestRecordTime);
    // console.log(url);
    fetch(url, {credentials: 'include'})
        .then((response) => {
                return response.json();
            }
        ).then((resultJson) => {
        // console.log(resultJson);
        let data = [];
        for (result of resultJson) {
            let newData = {
                name: 'USGS Station ' + result.site,
                wtemp: Number.parseFloat(result.water_temp).toFixed(4),
                dis: Number.parseFloat(result.discharge).toFixed(4),
                gh: Number.parseFloat(result.gage_height).toFixed(4)
            };
            data.push(newData);
        }
        postMessage({usgs: data});
    })
}

function getResultsNOAA() {
    let OLDEST_REQUESTED_RECORD = 1 * 1 * 3600 * 1000;      // 1 hour
    // let NEWEST_REQUESTED_RECORD = 1 * 24 * 3600 * 1000;      // 1/2 day
    let oldestRecordTime = new Date(Date.now() - OLDEST_REQUESTED_RECORD).toISOString();
    let latestRecordTime = new Date(Date.now()).toISOString();

    let url = makeURL(offerings.NOAA, observedProperties.NOAA.getAll(), oldestRecordTime, latestRecordTime);
    fetch(url, {credentials: 'include'})
        .then((response) => {
                return response.json();
            }
        ).then((resultJson) => {
        // console.log(resultJson);
        postMessage({noaa: resultJson});
    })
}

function getResultsMesonet() {
    let OLDEST_REQUESTED_RECORD = 1 * 24 * 60 * 60 * 1000;      // 24 hours

    let oldestRecordTime = new Date(Date.now() - OLDEST_REQUESTED_RECORD).toISOString();
    let latestRecordTime = new Date(Date.now()).toISOString();

    let url = makeURL(offerings.Meso, observedProperties.Meso.all, oldestRecordTime, latestRecordTime);
    // console.log(url);
    fetch(url, {credentials: 'include'})
        .then((response) => {
                return response.json();
            }
        ).then((resultJson) => {
        // console.log(resultJson);
        postMessage({mesonet: resultJson});
    })
}

function getResultsAVLGPS() {
    let url = 'http://scira.georobotix.io:8181/sensorhub/sos?service=SOS&version=2.0&request=GetResult' +
        '&offering=' + offerings.AVL +
        '&observedProperty=' + observedProperties.AVL.GPS +
        '&temporalFilter=phenomenonTime,now&responseFormat=application/json';
    // console.log(url);
    fetch(url, {credentials: 'include'})
        .then(response => {
            return response.json();
        })
        .then(resultJson => {
            // console.log(resultJson);
            let data = [];
            for (result of resultJson) {
                let newData = {
                    id: result.vin,
                    vin: result.vin,
                    avgSpeed: result.avgSpeed,
                    instSpeed: result.instSpeed,
                    maxSpeed: result.maxSpeed,
                    ignition: result.ignition
                };
                data.push(newData)
            }
            postMessage({avl: data});
        })
}

function getResultsAVLODB() {
    let url = 'http://scira.georobotix.io:8181/sensorhub/sos?service=SOS&version=2.0&request=GetResult' +
        '&offering=' + offerings.AVL +
        '&observedProperty=' + observedProperties.AVL.ODB +
        '&temporalFilter=phenomenonTime,now&responseFormat=application/json';
    // console.log(url);
    fetch(url, {credentials: 'include'})
        .then(response => {
            return response.json();
        })
        .then(resultJson => {
            // console.log(resultJson);
            let data = [];
            for (result of resultJson) {
                let newData = {
                    id: result.vin,
                    vin: result.vin,
                    fleetId: result.fleetId,
                    odometer: result.odometer,
                    totalGallons: Number.parseFloat(result.totalGallons).toFixed(2),
                    engineHours: result.engineHours
                };
                data.push(newData)
            }
            postMessage({avl: data});
        })
}

onmessage = function (evt) {
    console.log('Event Data:', evt.data);
    if (evt.data === 'usgs') {
        getResultsUSGS();
        setInterval(getResultsUSGS, 60 * 1000);
    } else if (evt.data === 'noaa') {
        getResultsNOAA();
        setInterval(getResultsNOAA, 60 * 1000);

    } else if (evt.data === 'mesonet') {
        getResultsMesonet();
        setInterval(getResultsMesonet, (15 * 60 * 1000));
    } else if (evt.data === 'avl') {
        getResultsAVLGPS();
        getResultsAVLODB();
        setInterval(getResultsAVLGPS, 60 * 1000);
        setInterval(getResultsAVLODB, 60 * 1000);
    }
};
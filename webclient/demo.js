// TODO: Add back Android Icons
// TODO: Implement Time Slider
// TODO: Capture new video

// Config Wide Parameters
let HOSTNAME = "localhost";
let DEPLOYHOSTNAME = "scira.georobotix.io";
let HOSTNAME_TEST = "192.168.1.134";
let PORTNUM = 8181;
let START_TIME = "now";
let END_TIME = "2100-01-01T20:18:05.451Z";
let SYNC = false;
let TIMEOUT = 4000;
let REPLAY_FACTOR = 999999;
let USEFFMPEGWORKERS = true;
let DS_PROTOCOL = "ws";
let SOS = "SOS";
let HISTORY_DEPTH_MILLIS = 3 * 24 * 3600 * 1000;

let SOS_ENDPOINT = HOSTNAME + ":" + PORTNUM + "/sensorhub/sos";
let SCIRA_SOS_ENDPT = DEPLOYHOSTNAME + ':' + PORTNUM + "/sensorhub/sos";
let TEST_SOS_ENDPOINT = HOSTNAME_TEST + "/sensorhub/sos";

let SPS_ENDPOINT = HOSTNAME + ":" + PORTNUM + "/sensorhub/sps";
let cesiumView;
let treeItems = [];
let menuItems = [];
let treeMenuId = "tree-menu-";
let mapMenuId = "map-menu-";
let menuGroupId = "allmenus";
let dataReceiverController = {};
let contextCircularMenuId = 'menu-' + OSH.Utils.randomUUID();
let stackMenuID = 'menu-' + OSH.Utils.randomUUID();
let circMenuItems = [
    {
        name: "Item 1",
        viewId: 'viewId1',
        css: 'cmenu-test1'
    },
    {
        name: 'Item 2',
        viewId: 'viewId2',
        css: 'cmenu-test1'
    }];
let customLayers = {orthos: {}, boundaries: {}, addressPoints: {}};
let locStylerToEntities = {};

// Table Helpers
let usgsTDialog, noaaTDialog, avlTDialog, mesoTDialog;
let usgsTID, avlTID, noaaTID, mesoTID;
let tableGroup = [];
let mesonetColumnsID2Name = {
    temperature2m: "Temp 2m",
    temperature9m: "Temp 9m",
    relativeHumidity: "Relative Humidity",
    pressure: "Pressure",
    windSpeed: "Wind Speed",
    windDirection: "Wind Direction",
    windSpeedGust: "Wind Gust",
    precipitation6hr: "Precipitation - 6 hr",
    precipitation1day: "Precipitation - 1 day",
    precipitation2day: "Precipitation - 2 day",
    precipitation3day: "Precipitation - 3 day",
    precipitation7day: "Precipitation - 7 day",
    solarRadiation: "Solar Radiation",
    snowDepth: "Snow Depth",
    soilMoisture5cm: "Soil Moisture - 5cm",
    soilMoisture25cm: "Soil Moisture - 25cm",
    soilMoisture50cm: "Soil Moisture - 50cm",
    soilTemp5cm: "Soil Temperature - 5cm",
    soilTemp50cm: "Soil Temperature - 50cm",
};

let zoomOnSelect = false;
let czSelectionChange = new Cesium.Event();

function init() {
    let tableDialog = OSH.UI.DialogView('avl', {
        draggable: true,
        css: "video-dialog",
        name: 'AVL Table',
        show: true,
        dockable: false,
        closeable: true,
        connectionIds: [],
        keepRatio: true
    });

    // Main Data Source Controller
    dataReceiverController = new OSH.DataReceiver.DataReceiverController({
        replayFactor: REPLAY_FACTOR
    });

    window.CESIUM_BASE_URL = 'vendor/';
    window.OSH.BASE_WORKER_URL = "js/workers";


    cesiumView = new OSH.UI.CesiumView("main-container", [], {css: 'map-view-style'});
    cesiumView.first = false;
    cesiumView.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(-90.22, 38.624, 100000.0)
    });
    cesiumView.viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();

    // Selection Change events
    cesiumView.viewer._selectedEntityChanged.addEventListener(CesiumSelectionChgListener);
    console.log(cesiumView.viewer);

    // HACK: Couldn't directly access Cesium.Viewer to set map baselayer
    // TODO: explore reasons why and other options
    let baseLayerChoices = document.getElementsByClassName("cesium-baseLayerPicker-item");
    baseLayerChoices[7].click();

    // TODO: move into function
    // test event handler for context menu
    let sseHandler = new Cesium.ScreenSpaceEventHandler(cesiumView.viewer.scene.canvas);
    sseHandler.setInputAction(function (click) {
        // console.debug('Click!');
        let pickedObjects = cesiumView.viewer.scene.drillPick(click.position);
        console.log(pickedObjects);
        if (pickedObjects.length === 0)
            return;
        console.debug(keyByValue(cesiumView.stylerToObj, pickedObjects[0].id._dsid));
        let stylerId = keyByValue(cesiumView.stylerToObj, pickedObjects[0].id._dsid);
        let styler;
        console.debug(locStylerToEntities[stylerId]);
        // console.debug(click.position);

        let showProperties = {
            // div: newDiv,
            x: click.position.x,
            y: click.position.y,
            offsetX: -60,
            offsetY: 0
        };
        locStylerToEntities[stylerId].contextMenus.circle.manualShow(showProperties);

        if (styler !== undefined || styler !== null) {

        }
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    // console.debug(sseHandler);

    // let offerings = Utilities.getHubOfferings();
    // console.log(offerings);

    // Automation.getTrafficCamFOIs(cesiumView);
    // MarkerLayers.trafficCamHide();
    Automation.getStreamGageFOIs(cesiumView);
    MarkerLayers.usgsHide();
    // Automation.getNOAAFOIs(cesiumView);
    // MarkerLayers.noaaHide();
    // Automation.getAVLFOIs(cesiumView);
    // MarkerLayers.avlHide();
    // Automation.getMesonetFOIs(cesiumView);
    // MarkerLayers.mesonetHide();
    Automation.addAndroidDevices();
    MarkerLayers.androidHide();

    // UAV
    // Sensors.addUAV('Solo-1', 'Solo Drone 1', 'urn:osh:sensor:mavlink:solo:S115A58000000-sos',
    //     'urn:osh:sensor:rtpcam:solo:S115A58000000-sos', cesiumView, {});
    //
    // Sensors.addUAV('Solo (Archive)', 'Solo Drone Archive', 'urn:barnyard1:solo:nav',
    //     'urn:barnyard1:solo:video', cesiumView, {
    //         startTime: '2019-05-28T19:11:30Z',
    //         endTime: '2019-05-28T19:18:00Z',
    //     });

    // LRF
    // Sensors.addLRF('TruPulse-1', "trupulse-1", "urn:lasertech:trupulse360:a0b0515feaa872a4-sos", cesiumView, {});
    //Sensors.addLRF('trupulse-3a', "TruPulse[Pix3a]", "urn:lasertech:trupulse360:e87c474d067254ef-sos", cesiumView, {});

    // customLayers.orthos.idx = 1;
    // customLayers.boundaries.idx = 2;
    // customLayers.addressPoints.idx = 3;

    // customLayers.orthos.layer = cesiumView.addImageryProvider('wms', 'http://www.orthos.dhses.ny.gov/arcgis/services/Latest/MapServer/WmsServer?', '0,1,2,3,4', 'png', {minLOD: 0});
    // customLayers.boundaries.layer = cesiumView.addImageryProvider('wms', 'https://gisservices.its.ny.gov/arcgis/services/NYS_Civil_Boundaries/MapServer/WmsServer?', '0,1,2,3,4,5,6,7,8', 'png', {minLOD: 0});
    // customLayers.addressPoints.layer = cesiumView.addImageryProvider('wms', 'https://gisservices.its.ny.gov/arcgis/services/SAM_Address_Points_Symbolized/MapServer/WmsServer?', '0,1', 'png', {minLOD: 0});
    //TODO: make this happen automatically on add...
    // cesiumView.viewer.imageryLayers._layers[1].show = false;
    // cesiumView.viewer.imageryLayers._layers[2].show = false;
    // cesiumView.viewer.imageryLayers._layers[3].show = false;

    // create tree items and context menus for NYS layers
    // let layersContext = layerTreeContextMenu(cesiumView);
    // treeItems.push({
    //     entityId: OSH.Utils.randomUUID(),
    //     entity: {name: 'NYS Orthos'},
    //     path: 'Layers',
    //     treeIcon: 'vendor/images/tree/blue_key.png',
    //     contextMenuId: layersContext.orthos.id
    // });
    // treeItems.push({
    //     entityId: OSH.Utils.randomUUID(),
    //     entity: {name: 'NYS Boundaries'},
    //     path: 'Layers',
    //     treeIcon: 'vendor/images/tree/blue_key.png',
    //     contextMenuId: layersContext.boundaries.id
    // });
    /*treeItems.push({
        entityId: OSH.Utils.randomUUID(),
        entity: {name: 'NYS Address Points'},
        path: 'Layers',
        treeIcon: 'vendor/images/tree/blue_key.png',
        contextMenuId: layersContext.addrPoints.id
    });*/

    // Table Dialogs and Related
    usgsTDialog = new OSH.UI.DialogView('usgs-chart', {
        draggable: true,
        css: "video-dialog",
        name: 'USGS Table',
        show: false,
        dockable: false,
        closeable: true,
        connectionIds: [],
        keepRatio: false
    });
    usgsTID = '#' + usgsTDialog.popContentDiv.id;
    usgsTDialog.popContentDiv.parentElement.classList.remove('pop-inner');

    mesoTDialog = new OSH.UI.DialogView('avl-chart', {
        draggable: true,
        css: "video-dialog",
        name: 'Mesonet Table',
        show: false,
        dockable: false,
        closeable: true,
        connectionIds: [],
        keepRatio: false
    });
    mesoTID = '#' + mesoTDialog.popContentDiv.id;
    mesoTDialog.popContentDiv.parentElement.classList.remove('pop-inner');

    noaaTDialog = new OSH.UI.DialogView('buoy-chart', {
        draggable: true,
        css: "video-dialog",
        name: 'NOAA Table',
        show: false,
        dockable: false,
        closeable: true,
        connectionIds: [],
        keepRatio: false
    });
    noaaTID = '#' + noaaTDialog.popContentDiv.id;
    noaaTDialog.popContentDiv.parentElement.classList.remove('pop-inner');

    avlTDialog = new OSH.UI.DialogView('avl-chart', {
        draggable: true,
        css: "video-dialog",
        name: 'AVL Table',
        show: false,
        dockable: false,
        closeable: true,
        connectionIds: [],
        keepRatio: false
    });
    avlTID = '#' + avlTDialog.popContentDiv.id;
    avlTDialog.popContentDiv.parentElement.classList.remove('pop-inner');
    console.log(avlTDialog);

    // Create Tree View
    let entityTree = createEntityTree(treeItems);
    // add context to folder child nodes
    // console.debug(entityTree);
    let childNodes = entityTree.view.tree.childNodes;
    for (let node of childNodes) {
        let nodeDiv = document.getElementById(node.id);
        // console.debug(nodeDiv);
        // console.debug(node.text);
        switch (node.text) {
            case 'Traffic Cams':
                // create context menu
                let ctxtMenu = MarkerLayers.trafficCamContext();
                node.contextMenu = ctxtMenu.id;
                break;
            case 'USGS Stream Gages':
                let usgsMenu = MarkerLayers.usgsContext();
                node.contextMenu = usgsMenu.id;
                console.log('USGS CONTEXT MENU',usgsMenu);
                break;
            case 'NOAA Buoys':
                let noaaMenu = MarkerLayers.noaaContext();
                node.contextMenu = noaaMenu.id;
                break;
            case 'AVL Fleet Data':
                let avlMenu = MarkerLayers.avlContext();
                node.contextMenu = avlMenu.id;
                break;
            case 'Android Devices':
                let androidMenu = MarkerLayers.androidContext();
                node.contextMenu = androidMenu.id;
                break;
            case 'Mesonet':
                let mesonetMenu = MarkerLayers.mesonetContext();
                node.contextMenu = mesonetMenu.id;
                break;
            case 'UAV':
                let uavMenu = MarkerLayers.uavContext();
                node.contextMenu = uavMenu.id;
                break;
            default:
                break;
        }
    }

    // Connect DataSources after all other initialization
    dataReceiverController.connectAll();
    // console.log(dataReceiverController);
    // console.log(entityTree);
    // console.log(cesiumView);


    let testListener = OSH.EventManager.observe('selectView', (data) => {
        console.log(data);
        // Short circuit if from a cesium view
        if (data.source === 'cesium') return;
        console.log(cesiumView.viewer.dataSourceDisplay);
        let locStyler = entityTree.view.tree.selectedNode.tag.locStyler.id;
        console.log(locStyler);
        let csID = locStylerToEntities[locStyler];
        if (csID === undefined || csID === null) return;
        cesiumView.selectedEntity = csID.id;
        let viewMarker = cesiumView.stylerToObj[locStyler];
        let entity = cesiumView.markers[viewMarker];
        cesiumView.viewer.selectedEntity = entity;
    });

    // This is the hamburger menu in the bottom left corner
    // cssCircleMenu('.js-menu');

    let usgsTable = Tables.usgsTable(usgsTID, []);
    let buoyTable = Tables.buoyTable(noaaTID, []);
    let mesonetTable = Tables.mesonetTable(mesoTID, []);
    let avlTable = Tables.avlTable(avlTID, []);
    tableGroup = [usgsTable, buoyTable, mesonetTable, avlTable];

    // Remove loading text
    let loadingText = document.getElementById('preload-txt');
    loadingText.parentNode.removeChild(loadingText);
}

/**
 * Creates a Data Source Connection for a Stream Gauge Sensor and returns the entity
 */
function addUSGSStreamGageSensor(entityId, entityName, offeringID, mapView, options) {
    let foi = null;
    if (options.foi !== undefined) {
        foi = options.foi;
    }

    let now = Date.now();
    let dRecOptions = {
        startTime: new Date(now - HISTORY_DEPTH_MILLIS).toISOString(),
        endTime: new Date(now + HISTORY_DEPTH_MILLIS).toISOString(),
        connect: false,
        // replaySpeed: 9999999,
        foi: foi
    };

    let waterTempData = Sensors.createJSONReceiver('Water Temperature Data', offeringID,
        'http://sensorml.com/ont/swe/property/WaterTemperature', dRecOptions);
    let dischargeData = Sensors.createJSONReceiver('Discharge Data', offeringID,
        'http://sensorml.com/ont/swe/property/Discharge', dRecOptions);
    let heightData = Sensors.createJSONReceiver('Stream Gage Height Data', offeringID,
        'http://sensorml.com/ont/swe/property/GageHeight', dRecOptions);

    let entity = {
        id: entityId,
        name: entityName,
        dataSources: [dischargeData, waterTempData, heightData]
    };
    dataReceiverController.addEntity(entity);
    // let ctxtMenuEIds = { waterTemp: tempChartDialog.id,
    //     discharge: dischargeChartDialog.id,
    //     height: streamGageChartDialog.id};
    let ctxtMenuEIds =
        {
            waterTemp: '',
            discharge: '',
            height: ''
        };
    let contextMenus = Context.createStreamGaugeContextMenu(entity, ctxtMenuEIds, {
            temp: waterTempData,
            discharge: dischargeData,
            height: heightData
        }
    );
    entity.contextMenus = contextMenus;

    treeItems.push({
        entity: entity,
        entityId: entity.id,
        path: "USGS Stream Gages",
        treeIcon: "./images/light/2x/streamGauge2x.png",
        contextMenuId: contextMenus.stack.id
    });
    // console.log(options);
    let styler = new OSH.UI.Styler.PointMarker({
        location: {
            x: options.location.lon,
            y: options.location.lat,
            z: options.location.alt
        },
        // icon: "./images/light/SVG/streamGauge.svg",
        icon: "./images/light/2x/streamGauge2x.png",
        label: entityName,
        description: options.description
    });
    entity.locStyler = styler;
    // console.log(contextMenus.circle.id);

    mapView.addViewItem({
        name: entity.name,
        entityId: entity.id,
        styler: styler,
        contextMenuId: contextMenus.circle.id,
    });
    // console.log(mapView);
    return entity;
}


function addNOAABuoySensor(entityID, entityName, offeringID, mapView, options) {
    let foi = null;
    if (options.foi !== undefined) {
        foi = options.foi;
    }
    // console.log(foi);

    let now = Math.round(Date.now() / 1000) * 1000; // round to nearest second
    let recOptions = {
        startTime: new Date(now - HISTORY_DEPTH_MILLIS).toISOString(),
        endTime: new Date(now).toISOString(),
        connect: false,
        replaySpeed: 100000,
        foi: foi
    };
    // console.log("Adding Buoy");
    let waterTempData = Sensors.createJSONReceiver(entityName, offeringID, 'http://sensorml.com/ont/swe/property/sea_water_temperature', recOptions);
    let buoyDepthData = Sensors.createJSONReceiver(entityName, offeringID, 'http://sensorml.com/ont/swe/property/buoy_depth', recOptions);

    let entity = {
        id: entityID,
        name: entityName,
        dataSources: [waterTempData, buoyDepthData]
    };
    dataReceiverController.addEntity(entity);

    let ctxtMenuEtyIds = {
        temp: '',
        depth: ''
    };

    let contextMenus = Context.createNOAAContextMenu(entity, ctxtMenuEtyIds, {
        temp: waterTempData,
        depth: buoyDepthData
    });

    treeItems.push({
        entity: entity,
        entityId: entity.id,
        path: "NOAA Buoys",
        treeIcon: "./images/light/2x/bouy2x.png",
        contextMenuId: contextMenus.stack.id,
    });

    if (options.hasOwnProperty('location')) {
        //console.log(options.location);
        let styler = new OSH.UI.Styler.PointMarker({
            location: {
                x: options.location.lon,
                y: options.location.lat,
                z: options.location.alt
            },
            //icon: "./images/drawhelper/glyphicons_242_google_maps.png",
            // icon: "./images/light/SVG/bouy.svg",
            icon: "./images/light/2x/bouy2x.png",
            label: entityName,
            description: options.description
        });
        entity.locStyler = styler;

        mapView.addViewItem({
            name: entity.name,
            entityId: entity.id,
            styler: styler,
            contextMenuId: contextMenus.circle.id
        });
    }
    entity.contextMenus = contextMenus;
    return entity;
}

function addSnowPlowAVLSensor(entityId, entityName, offeringID, mapView, options) {
    let foi = null;
    if (options.foi !== undefined) {
        foi = options.foi;
    }

    let now = Date.now();
    let dRecOptions = {
        startTime: new Date(now - HISTORY_DEPTH_MILLIS).toISOString(),
        endTime: new Date(now).toISOString(),
        connect: false,
        replaySpeed: 9999999,
        foi: foi
    };

    let realTimeRecOpts = {
        startTime: 'now',
        endTime: '2019-12-31T00:00:00Z',
        connect: false,
        replaySpeed: 1,
        foi: foi
    };
    // console.log(dRecOptions);
    // console.log(locationRecOpts);

    // Data Receivers
    let gpsData = Sensors.createJSONReceiver('GPS Location', offeringID,
        'http://sensorml.com/ont/swe/property/GPSData', dRecOptions);
    let platformLocation = Sensors.createJSONReceiver('Platform Location', offeringID,
        'http://www.opengis.net/def/property/OGC/0/PlatformLocation', realTimeRecOpts);
    let trueHeading = Sensors.createJSONReceiver('Vehicle Heading', offeringID,
        'http://sensorml.com/ont/swe/property/TrueHeading', realTimeRecOpts);
    let instSpeed = Sensors.createJSONReceiver('Current Speed', offeringID,
        'http://sensorml.com/ont/swe/property/Speed', dRecOptions);
    let avgSpeed = Sensors.createJSONReceiver('Average Speed', offeringID,
        'http://sensorml.com/ont/swe/property/AverageSpeed', dRecOptions);
    let maxSpeed = Sensors.createJSONReceiver('Average Speed', offeringID,
        'http://sensorml.com/ont/swe/property/MaximumSpeed', dRecOptions);
    let ignition = Sensors.createJSONReceiver('Ignition Status', offeringID,
        'http://sensorml.com/ont/swe/property/Ignition', dRecOptions); // TODO: Make sure this is correct once the driver is updated
    let odbData = Sensors.createJSONReceiver('ODB Data', offeringID,
        'http://sensorml.com/ont/swe/property/OBDData', dRecOptions);
    let odoReading = Sensors.createJSONReceiver('Odometer Reading', offeringID,
        'http://sensorml.com/ont/swe/property/OdometerDistance', dRecOptions);
    let engineHours = Sensors.createJSONReceiver('Engine Hours', offeringID,
        'http://sensorml.com/ont/swe/property/EngineHours', dRecOptions);
    let totalGallons = Sensors.createJSONReceiver('Total Gallons', offeringID,
        'http://sensorml.com/ont/swe/property/TotalGallons', dRecOptions);

    // Dialogs for charts
    /*let trueHeadingDialog = createAVLDialog([trueHeading.getId()], entityName + ' - True Heading');
    let instSpeedDialog = createAVLDialog([instSpeed.getId()], entityName + ' - Instant Speed');
    let avgSpeedDialog = createAVLDialog([avgSpeed.getId()], entityName + ' - Average Speed');
    let maxSpeedDialog = createAVLDialog([maxSpeed.getId()], entityName + ' - Max Speed');
    // TODO: add odb data start and end times
    let totalGallonsDialog = createAVLDialog([totalGallons.getId()], entityName + ' - Total Gallons');
    let engineHoursDialog = createAVLDialog([engineHours.getId()], entityName + ' - Engine Hours');
*/
    // TODO: Add Charts and get mapview set up after some clutter is cleared out.

    let entity = {
        id: entityId,
        name: entityName,
        dataSources: [gpsData, platformLocation, trueHeading, instSpeed, avgSpeed, maxSpeed, ignition, odbData,
            odoReading, engineHours, totalGallons]
    };
    dataReceiverController.addEntity(entity);
    let ctxtDatasources = {
        instSpeed: instSpeed,
        avgSpeed: avgSpeed,
        maxSpeed: maxSpeed,
        engineHours: engineHours,
        totalGal: totalGallons,
        heading: trueHeading
    };
    /*let ctxtDialogIds = {
        instSpeed: instSpeedDialog.id,
        avgSpeed: avgSpeedDialog.id,
        maxSpeed: maxSpeedDialog.id,
        engineHours: engineHoursDialog.id,
        totalGallons: totalGallonsDialog.id
    };*/
    let ctxtDialogIds = {
        instSpeed: '',
        avgSpeed: '',
        maxSpeed: '',
        engineHours: '',
        totalGallons: ''
    };


    let contextMenus = Context.createAVLContextMenu(platformLocation, ctxtDialogIds, entity, ctxtDatasources);

    // console.log(contextMenus);

    treeItems.push({
        entity: entity,
        entityId: entity.id,
        path: 'AVL Fleet Data',
        treeIcon: 'vendor/images/tree/blue_key.png',
        contextMenuId: contextMenus.stack.id
    });

    let locStyler = new OSH.UI.Styler.PointMarker({
        locationFunc: {
            dataSourceIds: [platformLocation.getId()],
            handler: function (rec) {
                //console.log(rec);
                return {
                    x: rec.location.lon,
                    y: rec.location.lat,
                    z: 0
                };
            }
        },
        orientationFunc: {
            dataSourceIds: [trueHeading.getId()],
            handler: function (rec) {
                //console.log(rec);
                return {heading: -rec.heading};
            }
        },
        //icon: './images/cameralook.png',
        icon: './images/truck.png',
        label: entityName,
        description: options.description
    });
    entity.locStyler = locStyler;

    mapView.addViewItem({
        name: entity.name,
        entityId: entity.id,
        id: entity.id,
        styler: locStyler
    });
    entity.contextMenus = contextMenus;
    return entity;
}

function addTrafficCamSensor(entityId, entityName, offeringID, mapView, options) {
    let foi = null;
    if (options.foi !== undefined) {
        foi = options.foi;
    }

    var videoData = new OSH.DataReceiver.VideoMjpeg("Video", {
        protocol: "wss",
        service: "SOS",
        endpointUrl: SCIRA_SOS_ENDPT,
        offeringID: offeringID,
        foiURN: foi,
        observedProperty: "http://sensorml.com/ont/swe/property/VideoFrame",
        startTime: 'now',
        endTime: '2020-01-01',
        replaySpeed: "1",
        timeShift: 0,
        syncMasterTime: false,
        bufferingTime: 0,
        timeOut: 4000,
        connect: false
    });

    // create entity
    var entity = {
        id: entityId,
        name: entityName,
        dataSources: [videoData]
    };
    dataReceiverController.addEntity(entity);

    let ctxtMenuEIds = {
        video: ''
    };
    let contextMenus = Context.createTrafficCamContextMenu(entity, ctxtMenuEIds, {
            video: videoData
        }
    );
    entity.contextMenus = contextMenus;

    treeItems.push({
        entity: entity,
        entityId: entity.id,
        path: 'Traffic Cams',
        treeIcon: "./images/light/2x/trafficCam2x.png",
        contextMenuId: contextMenus.stack.id
    });

    let styler = new OSH.UI.Styler.PointMarker({
        location: {
            x: options.location.lon,
            y: options.location.lat,
            z: options.location.alt
        },
        orientation: {heading: options.location.orient},
        // icon: './images/light/SVG/trafficCam.svg',
        icon: './images/light/2x/trafficCam2x.png',
        label: entityName,
        description: options.description
    });

    mapView.addViewItem({
        name: entity.name,
        entityId: entity.id,
        styler: styler,
        contextMenuId: contextMenus.circle.id
    });

    entity.locStyler = styler;

    return entity;
}


/**
 * For connecting any standard location data source
 */
function addGenericLocationData(entityID, entityName, offeringID, mapView, options) {
    let locationData = new OSH.DataReceiver.LatLonAlt(entityName, {
        protocol: DS_PROTOCOL,
        service: SOS,
        endpointUrl: SOS_ENDPOINT,
        offeringID: offeringID,
        observedProperty: "http://www.opengis.net/def/property/OGC/0/SensorLocation",
        startTime: START_TIME,
        endTime: END_TIME,
        replaySpeed: "1",
        syncMasterTime: SYNC,
        bufferingTime: 500,
        timeOut: TIMEOUT
    });

    let entity = {
        id: entityID,
        name: entityName,
        dataSources: [locationData]
    };

    dataReceiverController.addEntity(entity);

    treeItems.push({
        entity: entity,
        entityId: entity.id,
        path: "GPS Items",
        treeIcon: "vendor/images/tree/blue_key.png",
        // contextMenuId: treeMenuId + entity.id,
    });

    mapView.addViewItem({
        name: entity.name,
        id: entity.id,
        styler: createPMStyler(entity.name, null, locationData),
        // contextMenuId: mapMenuId + entity.id
    });
    return entity;
}


function addSimWeatherStation(entityID, entityName, offeringID, mapView, options) {
    let weatherData = new OSH.DataReceiver.JSON(entityName + " - Weather", {
        protocol: "wss",
        service: "SOS",
        endpointUrl: SCIRA_SOS_ENDPT,
        offeringID: offeringID,
        observedProperty: "http://sensorml.com/ont/swe/property/Weather",
        startTime: START_TIME,
        endTime: END_TIME,
        replaySpeed: "1",
        syncMasterTime: SYNC,
        bufferingTime: 60000,
        timeOut: 60000,
        authUser: 'user',
        authPass: 'user'
    });

    let locationData = new OSH.DataReceiver.LatLonAlt(entityName + ' - Location', {
        protocol: 'wss',
        service: SOS,
        endpointUrl: SCIRA_SOS_ENDPT,
        offeringID: offeringID,
        observedProperty: "http://www.opengis.net/def/property/OGC/0/SensorLocation",
        startTime: START_TIME,
        endTime: END_TIME,
        replaySpeed: "1",
        syncMasterTime: SYNC,
        bufferingTime: 500,
        timeOut: TIMEOUT
    });

    let entity = {
        id: entityID,
        name: entityName,
        dataSources: [weatherData, locationData]
    };

    dataReceiverController.addEntity(entity);

    // add item to tree
    treeItems.push({
        entity: entity,
        path: "Weather Stations",
        treeIcon: "./images/2x/weather2x.png",
        // contextMenuId: treeMenuId + entity.id
        // contextMenuId: stackMenuID
    });


    mapView.addViewItem({
        name: entity.name,
        id: entity.id,
        styler: createPMStyler(entity.name, null, locationData),
    });

    // pressure chart view
    var pressureChartDialog = new OSH.UI.DialogView("sw-chart", {
        draggable: false,
        css: "video-dialog",
        name: entityName + " - Pressure",
        show: false,
        dockable: true,
        closeable: true,
        canDisconnect: true,
        swapId: "main-container",
        connectionIds: [weatherData.getId()],
    });

    var pressureChartView = new OSH.UI.Nvd3CurveChartView(pressureChartDialog.popContentDiv.id,
        [{
            styler: new OSH.UI.Styler.Curve({
                valuesFunc: {
                    dataSourceIds: [weatherData.getId()],
                    handler: function (rec, timeStamp) {
                        // console.log(rec);
                        return {
                            x: timeStamp,
                            y: rec.pressure
                        };
                    }
                }
            })
        }],
        {
            css: "chart-view",
            cssSelected: "video-selected",
            maxPoints: 50,
            yLabel: 'Pressure (mbar)',
        });

    menuItems.push({
        name: entity.name,
        viewId: pressureChartDialog.id,
        css: "fa fa-line-chart"
    });

    circMenuItems.push({
        name: entity.name,
        viewId: pressureChartDialog.id,
        css: 'fa fa-globe'
    });

    // let chartView = createChartView("SimWeather", weatherData);

    return weatherData;
}


function createEntityTree(treeEntities) {
    let entityTreeDialog = new OSH.UI.DialogView("entity-disp", {
        css: "entity-tree-1",
        name: "Entities",
        show: true,
        draggable: true,
        dockable: false,
        closeable: true
    });

    let entityTreeView = new OSH.UI.EntityTreeView(entityTreeDialog.popContentDiv.id, treeEntities,
        {
            css: "tree-container"
        }
    );
    // let treeDiv = document.getElementById('entity-disp');
    // let treeInner = treeDiv.childNodes;
    // treeInner[0].classList.add('tree-inner');
    // console.log(treeInner[0]);
    return {dialog: entityTreeDialog, view: entityTreeView};
}


function createPMStyler(entityName, targetModel, gpsSource, options) {
    let model = "./images/drawhelper/glyphicons_242_google_maps.png";
    if (targetModel != null) {
        model = targetModel;
    }

    let styler = new OSH.UI.Styler.PointMarker({
        locationFunc: {
            dataSourceIds: [gpsSource.getId()],
            handler: function (rec) {
                console.log(rec);
                return {
                    x: rec.lon,
                    y: rec.lat,
                    z: rec.alt
                };
            }
        },
        icon: model,
        label: entityName
    });

    if (options !== undefined && options !== null) {
        styler.location = {
            x: options.lon,
            y: options.lat,
            z: options.alt
        }
    }

    return styler;
}


function dragElem(elem) {
    let targetX, targetY, initX, initY = 0;
    elem.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        initX = e.clientX;
        initY = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        targetX = initX - e.clientX;
        targetY = initY - e.clientY;
        initX = e.clientX;
        initY = e.clientY;
        elem.style.top = (elem.offsetTop - targetY) + 'px';
        elem.style.left = (elem.offsetLeft - targetX) + 'px';
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function closeDiv(e) {
    let mainElem;
    let parentElem = e.target.parentElement;
    if (e.target.parentElement.className === 'simple-header') {
        console.log('is in a header');
        mainElem = parentElem.parentElement;
        mainElem.style.visibility = 'hidden';
    }
}

/**
 *
 * @param parentDialog - OSH Dialog that we're parenting this view to
 * @param dataSource - DataSource for the y value of the chart (vertical)
 * @param yDataPath - path from rec to get to the data ex: "yDataPathA.yDataPathB" yields rec["yDataPathA"]["yDataPathB"]
 * @param yLabel - label for yValue
 */
function simpleChartViewAndStyler(parentDialog, dataSource, yDataPath, yLabel) {
    console.log(parentDialog);
    // create a new element to hold latest value
    let newElem = document.createElement('div');
    let title = document.createElement('h5');
    title.innerText = yLabel + ': ';
    title.style.display = 'inline-block';
    let result = document.createElement('p');
    result.innerText = 'NO RECENT DATA';
    result.style.display = 'inline-block';
    newElem.appendChild(title);
    newElem.appendChild(result);

    let chartView = new OSH.UI.Nvd3CurveChartView(parentDialog.popContentDiv.id,
        [{
            styler: new OSH.UI.Styler.Curve({
                color: "#FF0000",
                valuesFunc: {
                    dataSourceIds: [dataSource.getId()],
                    handler: function (rec, timeStamp) {
                        // console.log(rec);
                        result.innerText = rec[yDataPath.toString()];
                        return {
                            x: timeStamp,
                            y: rec[yDataPath.toString()]
                        };
                    }
                }
            })
        }],
        {
            dataSourceId: dataSource.getId(),
            yLabel: yLabel,
            xLabel: 'Time',
            xTickFormat: function (d) {
                return d3.time.format.utc('%d/%m %H:%MZ')(new Date(d))
            },
            showLegend: false,
            maxPoints: 50,
            css: "chart-view",
            cssSelected: "video-selected"
        });

    parentDialog.popContentDiv.appendChild(newElem);
    return chartView
}

function layerTreeContextMenu(mapView) {

    let orthosLayer = {
        name: 'Show/Hide',
        viewId: '',
        css: 'fa fa-eye',
        clickOverride: orthosOverride
    };
    let boundariesLayer = {
        name: 'Show/Hide',
        viewId: '',
        css: 'fa fa-eye',
        clickOverride: boundariesOverride
    };

    let apLayer = {
        name: 'Show/Hide',
        viewId: '',
        css: 'fa fa-eye',
        clickOverride: apOverride
    };

    let menuItems = [orthosLayer, boundariesLayer, apLayer];

    let stackMenu = {
        orthos: null,
        boundaries: null,
        addrPoints: null
    };
    let orthosStk = new OSH.UI.ContextMenu.StackMenu({
        id: 'menu-' + OSH.Utils.randomUUID(),
        groupId: '',
        items: [orthosLayer]
    });

    let boundStk = new OSH.UI.ContextMenu.StackMenu({
        id: 'menu-' + OSH.Utils.randomUUID(),
        groupId: '',
        items: [boundariesLayer]
    });

    let addrStk = new OSH.UI.ContextMenu.StackMenu({
        id: 'menu-' + OSH.Utils.randomUUID(),
        groupId: '',
        items: [apLayer]
    });

    stackMenu.orthos = orthosStk;
    stackMenu.boundaries = boundStk;
    stackMenu.addrPoints = addrStk;

    return stackMenu;

    function orthosOverride(event) {
        layerController(customLayers.orthos);
    }

    function boundariesOverride(event) {
        layerController(customLayers.boundaries);
    }

    function apOverride(event) {
        layerController(customLayers.addressPoints);
    }

    function layerController(layer) {
        // console.debug(layer.idx);
        let layers = mapView.viewer.imageryLayers;
        // console.debug(layers);
        // If layer is not visible, show
        if (layers['_layers'][layer.idx].show === true) {
            layers['_layers'][layer.idx].show = false;
        } else {
            layers['_layers'][layer.idx].show = true;
        }
        // else hide layer
    }
}

function keyByValue(object, value) {
    // console.debug('Object:', object);
    // console.log('Value:', value);
    return Object.keys(object).find(key => object[key] === value);
}

/*let sensorGroup = {
    usgsShow: function () {
        for (let ety of locStylerToEntities) {
            if (ety.sensorType === 'StreamGage') {

            }
        }
    },
    toggleNOAABUOYS: function () {

    },
    toggleAVLFLeet: function () {

    }
};*/


let Sensors = {
    createJSONReceiver: function (recName, offeringID, observedProp, options) {
        let dataRecProps = {
            // protocol: 'wss',
            protocol: 'ws',
            service: SOS,
            endpointUrl: SCIRA_SOS_ENDPT,
            offeringID: offeringID,
            observedProperty: observedProp,
            startTime: 'now',
            // replaySpeed: 1,
            syncMasterTime: SYNC,
            bufferingTime: 500,
            timeOut: TIMEOUT
        };

        if (options.hasOwnProperty('startTime')) {
            dataRecProps.startTime = options.startTime;
        }
        if (options.hasOwnProperty('endTime')) {
            dataRecProps.endTime = options.endTime;
        }
        if (options.hasOwnProperty('connect')) {
            dataRecProps.connect = options.connect;
        }
        if (options.hasOwnProperty('foi')) {
            dataRecProps.foiURN = options.foi;
        }
        if (options.hasOwnProperty('replaySpeed')) {
            dataRecProps.replaySpeed = options.replaySpeed;
        }
        // console.log(dataRecProps);
        return new OSH.DataReceiver.JSON(name, dataRecProps);
    },
    addAndroidPhoneSensor(entityId, entityName, offeringID, mapView, options) {
        let now = Date.now();
        let dRecOptions = {
            startTime: new Date(now - HISTORY_DEPTH_MILLIS).toISOString(),
            endTime: new Date(now).toISOString(),
            connect: true,
            replaySpeed: 1
        };

        let locData = new OSH.DataReceiver.JSON('Location', {
            protocol: 'wss',
            service: SOS,
            endpointUrl: SCIRA_SOS_ENDPT,
            offeringID: offeringID,
            observedProperty: 'http://sensorml.com/ont/swe/property/Location',
            startTime: 'now',
            // endTime: new Date(now).toISOString(),
            endTime: '2020-01-01',
            replaySpeed: 1,
            syncMasterTime: SYNC,
            bufferingTime: 100,
            timeOut: 4000,
            connect: false
        });

        let orientation = new OSH.DataReceiver.OrientationQuaternion('Orientation', {
            protocol: 'wss',
            service: SOS,
            endpointUrl: SCIRA_SOS_ENDPT,
            offeringID: offeringID,
            observedProperty: 'http://sensorml.com/ont/swe/property/OrientationQuaternion',
            startTime: 'now',
            endTime: '2020-01-01',
            replaySpeed: 1,
            syncMasterTime: SYNC,
            bufferingTime: 100,
            timeOut: 4000,
            connect: false
        });

        let video = new OSH.DataReceiver.VideoMjpeg("Video", {
            protocol: 'wss',
            service: SOS,
            endpointUrl: SCIRA_SOS_ENDPT,
            offeringID: offeringID,
            observedProperty: "http://sensorml.com/ont/swe/property/VideoFrame",
            startTime: 'now',
            endTime: '2020-01-01',
            replaySpeed: "1",
            timeShift: 0,
            syncMasterTime: SYNC,
            bufferingTime: 0,
            timeOut: 4000,
            connect: false
        });

        let entity = {
            id: entityId,
            name: entityName,
            dataSources: [locData, orientation, video]
        };
        dataReceiverController.addEntity(entity);
        let ctxtDS = {
            locData: locData,
            orientation: orientation,
            video: video
        };
        let contextMenus = Context.createAndroidContextMenu(entity, {}, ctxtDS);
        entity.contextMenus = contextMenus;

        treeItems.push({
            entity: entity,
            entityId: entity.id,
            path: 'Smarthubs',
            treeIcon: './images/light/2x/android2x.png',
            contextMenuId: contextMenus.stack.id
        });

        let styler = new OSH.UI.Styler.PointMarker({
            location:{
                x:0,
                y:0,
                z:0
            },
            locationFunc: {
                dataSourceIds: [locData.getId()],
                handler: function (rec) {
                    return {
                        x: rec.location.lon,
                        y: rec.location.lat,
                        // z: rec.location.alt
                        z: 0
                    };
                }
            },
            orientationFunc: {
                dataSourceIds: [orientation.getId()],
                handler: function (rec) {
                    // console.log('Heading: ', rec.heading);
                    return {heading: -rec.heading + 180};
                }
            },
            icon: './images/light/2x/android2x.png',
            // icon: './images/light/2x/android.png',

            label: entityName
        });
        entity.locStyler = styler;
        console.log(mapView);
        mapView.addViewItem({
            name: entity.name,
            entityId: entity.id,
            styler: styler,
            contextMenuId: contextMenus.circle.id
        });
        entity.sensorType = 'Android';
        // locStylerToEntities[entity.locStyler.id] = entity;
        return entity;
    },
    addUAV(entityID, entityName, offeringID, videoOfferingID, mapView, options) {
        console.log('Adding Drone: ', entityID);

        //MEB adjusted msl height for nys
        let mslToWgs84 = -29 + 7; // Need to set correct mean sea level for AO
        let soloHeadingAdjust = 0.0;
        let soloAltitudeAdjust = -215.0;
        // TODO: Make sure dates are corrected, especially if switching from archive to live data
        let now = Math.round(Date.now() / 1000) * 1000;
        let dRecOptions = {
            // startTime: now,
            // endTime: '2020-01-01',
            // startTime: '2019-04-16T19:10:00Z',
            // endTime: '2019-04-16T19:19:00Z',
            startTime: '2019-05-28T19:10:00Z',
            endTime: '2019-05-28T19:16:00Z',
            connect: false,
            replaySpeed: 1
        };

        // To allow for manual setting live
        if (options.hasOwnProperty('startTime') && options.hasOwnProperty('endTime')) {
            dRecOptions.startTime = options.startTime;
            dRecOptions.endTime = options.endTime;
        }

        // let localSOS = '192.168.1.194:8181/sensorhub/sos';
        let localSOS = SCIRA_SOS_ENDPT;

        let locationData =
            new OSH.DataReceiver.LatLonAlt('Location', {
                protocol: 'wss',
                service: SOS,
                endpointUrl: SCIRA_SOS_ENDPT,
                // endpointUrl: localSOS,
                // endpointUrl: HOSTNAME + ':8181/sensorhub/sos',
                offeringID: offeringID,
                observedProperty: 'http://www.opengis.net/def/property/OGC/0/PlatformLocation',
                startTime: dRecOptions.startTime,
                endTime: dRecOptions.endTime,
                replaySpeed: dRecOptions.replaySpeed,
                syncMasterTime: SYNC,
                bufferingTime: 100,
                timeOut: TIMEOUT,
                connect: dRecOptions.connect
            });

        // let attitudeData = new OSH.DataReceiver.OrientationQuaternion('Orientation', {
        let attitudeData = new OSH.DataReceiver.JSON('Orientation', {
            protocol: 'wss',
            service: SOS,
            endpointUrl: SCIRA_SOS_ENDPT,
            // endpointUrl: localSOS,
            // endpointUrl: HOSTNAME + ':8181/sensorhub/sos',
            offeringID: offeringID,
            observedProperty: 'http://www.opengis.net/def/property/OGC/0/PlatformOrientation',
            startTime: dRecOptions.startTime,
            endTime: dRecOptions.endTime,
            replaySpeed: dRecOptions.replaySpeed,
            syncMasterTime: SYNC,
            bufferingTime: 100,
            timeOut: TIMEOUT,
            connect: dRecOptions.connect
        });
        let videoData = new OSH.DataReceiver.VideoH264('Video', {
            protocol: 'wss',
            service: SOS,
            endpointUrl: SCIRA_SOS_ENDPT,
            // endpointUrl: localSOS,
            // endpointUrl: HOSTNAME + ':8181/sensorhub/sos',
            offeringID: videoOfferingID,
            observedProperty: 'http://sensorml.com/ont/swe/property/VideoFrame',
            startTime: dRecOptions.startTime,
            endTime: dRecOptions.endTime,
            replaySpeed: dRecOptions.replaySpeed,
            syncMasterTime: SYNC,
            bufferingTime: 500,
            timeOut: TIMEOUT,
            connect: dRecOptions.connect
        });
        let gimbalData = new OSH.DataReceiver.EulerOrientation('Orientation', {
            protocol: 'wss',
            service: SOS,
            endpointUrl: SCIRA_SOS_ENDPT,
            // endpointUrl: localSOS,
            // endpointUrl: HOSTNAME + ':8181/sensorhub/sos',
            offeringID: offeringID,
            observedProperty: 'http://sensorml.com/ont/swe/property/OSH/0/GimbalOrientation',
            startTime: dRecOptions.startTime,
            endTime: dRecOptions.endTime,
            replaySpeed: dRecOptions.replaySpeed,
            syncMasterTime: SYNC,
            bufferingTime: 500,
            timeOut: TIMEOUT,
            connect: dRecOptions.connect
        });

        let entity = {
            id: entityID,
            name: entityName,
            dataSources: [locationData, attitudeData, videoData, gimbalData]
        };
        dataReceiverController.addEntity(entity);

        let videoDialog = new OSH.UI.DialogView('android-video', {
            draggable: true,
            css: "video-dialog",
            name: entityName,
            show: false,
            dockable: true,
            closeable: true,
            canDisconnect: false,
            swapId: "main-container",
            connectionIds: [videoData.getId()]
        });

        let videoView = new OSH.UI.FFMPEGView(videoDialog.popContentDiv.id, {
            dataSourceId: videoData.getId(),
            entityId: entity.id,
            css: "video",
            cssSelected: "video-selected",
            useWorker: USEFFMPEGWORKERS,
            width: 1280,
            height: 720,
            canvasClass: 'droneVideo'
        });

        let styler = new OSH.UI.Styler.PointMarker({
            locationFunc: {
                dataSourceIds: [locationData.getId()],
                handler: (rec) => {
                    // console.log(rec);
                    return {
                        x: rec.lon,
                        y: rec.lat,
                        // z: rec.alt + mslToWgs84 - 5   //TODO: Make sure this value is correct
                        z: 0
                    }
                }
            },
            orientationFunc: {
                dataSourceIds: [attitudeData.getId()],
                handler: (rec) => {
                    return {
                        heading: -rec.attitude.yaw + 180
                    };
                }
            },
            label: '3DR Solo',
            icon: './images/light/2x/UAV2x.png'

        });

        let ctxtMenuIds = {
            video: '',
            location: '',
            altitude: ''
        };
        let contextMenus = Context.createDroneContextMenu(entity, ctxtMenuIds, {
                location: locationData,
                altitude: locationData,
                heading: attitudeData,
                video: videoData
            },
            {
                video: {
                    dialog: videoDialog,
                    view: videoView
                }
            });

        treeItems.push({
            entity: entity,
            path: 'UAVs',
            treeIcon: './images/light/2x/UAV2x.png',
            contextMenuId: contextMenus.stack.id
        });

        mapView.addViewItem({
            name: '3DR Solo',
            entityId: entityID,
            styler: styler,
            contextMenuId: contextMenus.circle.id
        });

        let videoCanvas = document.getElementById(videoView.getId()).getElementsByTagName('canvas')[0];
        let drapingStyler = new OSH.UI.Styler.ImageDraping({
            platformLocationFunc: {
                dataSourceIds: [locationData.getId()],
                handler: (rec) => {
                    // console.log(rec);
                    return {
                        x: rec.lon,
                        y: rec.lat,
                        z: rec.alt + mslToWgs84 + soloAltitudeAdjust // TODO: make sure to correct this value
                    };
                }
            },
            platformOrientationFunc: {
                dataSourceIds: [attitudeData.getId()],
                handler: (rec) => {
                    // console.log(rec);
                    return {
                        heading: rec.attitude.yaw + soloHeadingAdjust,
                        pitch: 0,
                        roll: 0
                    };
                }
            },
            gimbalOrientation: {
                heading: 0,
                pitch: -90,
                roll: 0
            },
            gimbalOrientationFunc: {
                dataSourceIds: [gimbalData.getId()],
                handler: (rec) => {
                    // console.log(rec);
                    return {
                        heading: rec.heading,
                        pitch: rec.pitch,
                        roll: 0
                        // heading: 0,
                        // pitch: -90,
                        // roll: 0
                    }
                }
            },
            /*snapshotFunc: () => {
                let enabled = takePicture;
                takePicture = false;    // TODO: double check this usage
                return enabled;
            },*/
            // TODO: Double check camera parameters
            cameraModel: {
                camProj: new Cesium.Matrix3(747.963 / 1280., 0.0, 650.66 / 1280.,
                    0.0, 769.576 / 738., 373.206 / 738.,
                    0.0, 0.0, 1.0),
                camDistR: new Cesium.Cartesian3(-2.644e-01, 8.4e-02, 0.0),
                camDistT: new Cesium.Cartesian2(-8.688e-04, 6.123e-04)
            },
            imageSrc: videoCanvas
        });
        let draper = {
            name: "Draped Imagery",
            entityId: entity.id,
            styler: drapingStyler
        };
        mapView.addViewItem(draper);
        return entity

    },
    addMesonetSensor(entityID, entityName, offeringID, mapView, options) {
        let foi = null;
        if (options.foi !== undefined) {
            foi = options.foi;
        }
        let now = Date.now();
        let receiverOptions = {
            // startTime: new Date(now - HISTORY_DEPTH_MILLIS).toISOString(),
            endTime: new Date(now).toISOString(),
            startTime: '2019-03-22T21:30:00Z',
            // endTime: 'now',
            connect: false,
            replaySpeed: 999999,
            foi: foi
        };

        let compoundData = Sensors.createJSONReceiver('NYSDataRecord', offeringID, '"http://sensorml.com/ont/swe/property/NysMesonetRecord', receiverOptions);
        let locData = Sensors.createJSONReceiver('Location', offeringID, 'http://www.opengis.net/def/property/OGC/0/SensorLocation', receiverOptions);
        let tempData = Sensors.createJSONReceiver('Air Temperature', offeringID, 'http://sensorml.com/ont/swe/property/Temperature', receiverOptions);
        let humidityData = Sensors.createJSONReceiver('Humidity', offeringID, 'http://sensorml.com/ont/swe/property/HumidityValue', receiverOptions);
        let airPressureData = Sensors.createJSONReceiver('Air Pressure', offeringID, 'http://sensorml.com/ont/swe/property/AirPressureValue', receiverOptions);
        let windSpeedData = Sensors.createJSONReceiver('Wind Speed', offeringID, 'http://sensorml.com/ont/swe/property/WindSpeed', receiverOptions);
        let windDirData = Sensors.createJSONReceiver('Wind Direction', offeringID, 'http://sensorml.com/ont/swe/property/WindDirectionAngle', receiverOptions);
        let windGustData = Sensors.createJSONReceiver('Wind Gust', offeringID, 'http://sensorml.com/ont/swe/property/WindGust', receiverOptions);
        let precipData = Sensors.createJSONReceiver('Precipitation', offeringID, 'http://sensorml.com/ont/swe/property/Precipitation', receiverOptions);
        let solarRadData = Sensors.createJSONReceiver('Solar Radiation', offeringID, 'http://sensorml.com/ont/swe/property/SolarRadiation', receiverOptions);
        let snowDepthData = Sensors.createJSONReceiver('Snow Depth', offeringID, 'http://sensorml.com/ont/swe/property/SnowDepth', receiverOptions);
        let soilMoistureData = Sensors.createJSONReceiver('Soil Moisture', offeringID, 'http://sensorml.com/ont/swe/property/SoilMoisture', receiverOptions);
        let soilTempData = Sensors.createJSONReceiver('Soil Temperature', offeringID, 'http://sensorml.com/ont/swe/property/SoilTemperature', receiverOptions);

        let entity = {
            id: entityID,
            name: entityName,
            dataSources: [compoundData, locData, tempData, humidityData, airPressureData, windSpeedData, windDirData, windGustData, windDirData,
                precipData, solarRadData, snowDepthData, soilMoistureData, soilTempData]
        };
        dataReceiverController.addEntity(entity);
        let ctxtMenuEIds = {
            location: '',
            temperature: '',
            humidity: '',
            airPressure: '',
            windSpeed: '',
            windDir: '',
            windGust: '',
            precipitation: '',
            solarRadiation: '',
            snowDepth: '',
            soiMoisture: '',
            soilTemperature: ''
        };
        let ctxtDataSources = {
            location: locData,
            temperature: tempData,
            humidity: humidityData,
            airPressure: airPressureData,
            windSpeed: windSpeedData,
            windDir: windDirData,
            windGust: windGustData,
            precipitation: precipData,
            solarRadiation: solarRadData,
            snowDepth: snowDepthData,
            soilMoisture: soilMoistureData,
            soilTemperature: soilTempData
            /*location: compoundData,
            temperature: compoundData,
            humidity: compoundData,
            airPressure: compoundData,
            windSpeed: compoundData,
            windDir: compoundData,
            windGust: compoundData,
            precipitation: compoundData,
            solarRadiation: compoundData,
            snowDepth: compoundData,
            soilMoisture: compoundData,
            soilTemperature: compoundData*/
        };
        // let contextMenus = Context.createMesonetContextMenu(entity, ctxtMenuEIds, ctxtDataSources);
        // entity.contextMenus = contextMenus;
        treeItems.push({
            entity: entity,
            entityId: entity.id,
            path: 'Mesonet',
            treeIcon: './images/light/2x/weather2x.png',
            // contextMenuId: contextMenus.stack.id
        });
        let styler = new OSH.UI.Styler.PointMarker({
            location: {
                x: options.location.lon,
                y: options.location.lat,
                z: options.location.alt
            },
            // icon: './images/light/SVG/weather.svg',
            icon: './images/light/2x/weather2x.png',
            label: entityName,
            description: options.description
        });
        entity.locStyler = styler;
        mapView.addViewItem({
            name: entity.name,
            entityId: entity.id,
            styler: styler,
            // contextMenuId: contextMenus.circle.id
        });
        return entity;
    },
    addLRF(entityId, entityName, offeringID, mapView, options) {
        let dRecOptions = {
            startTime: Math.round(Date.now() / 1000) * 1000,
            endTime: '2019-03-22T21:30:00Z',
            connect: true,
            replaySpeed: 1
        };

        let locData = new OSH.DataReceiver.JSON('Location', {
            protocol: 'wss',
            service: SOS,
            endpointUrl: SCIRA_SOS_ENDPT,
            // endpointUrl: '192.168.1.194:8181/sensorhub/sos',
            offeringID: offeringID,
            observedProperty: 'http://sensorml.com/ont/swe/property/TargetLocation',
            startTime: 'now',
            // // endTime: new Date(now).toISOString(),
            // endTime: '2020-01-01',
            startTime: '2019-05-28T18:52:00Z',
            endTime: '2019-12-31T00:00:00Z',
            replaySpeed: 1,
            syncMasterTime: SYNC,
            bufferingTime: 100,
            timeOut: 4000,
            connect: true
        });

        let entity = {
            id: entityId,
            name: entityName,
            dataSources: [locData]
        };
        dataReceiverController.addEntity(entity);

        treeItems.push({
            entity: entity,
            path: 'Laser Range Finders',
            treeIcon: 'vendor/images/tree/blue_key.png',
            // contextMenuId: contextMenus.stack.id
        });

        let locStyler = new OSH.UI.Styler.PointMarker({
            locationFunc: {
                dataSourceIds: [locData.getId()],
                handler: function (rec) {
                    console.log(rec);
                    return {
                        x: rec.location.lon,
                        y: rec.location.lat,
                        // z: rec.alt
                        z: 0
                    };
                }
            },
            icon: "vendor/images/tree/blue_key.png",
            label: entity.name
        });

        mapView.addViewItem({
            name: entity.name,
            entityId: entity.id,
            styler: locStyler
        });

        entity.locStyler = locStyler;
        entity.sensorType = 'LRF';
        locStylerToEntities[entity.locStyler.id] = entity;
        return entity;
    },
    addAVLMulti(entityId, entityName, offeringID, gpsData, options) {
        let foi = null;
        if (options.foi !== undefined) {
            foi = options.foi;
        }

        let now = Date.now();
        let dRecOptions = {
            startTime: new Date(now - HISTORY_DEPTH_MILLIS).toISOString(),
            endTime: new Date(now).toISOString(),
            connect: false,
            replaySpeed: 9999999,
            foi: foi
        };

        let realTimeRecOpts = {
            startTime: 'now',
            // startTime: '2019-01-07T00:00:00Z',
            endTime: '2019-12-31T00:00:00Z',
            connect: false,
            replaySpeed: 1000,
            foi: foi
        };

        let platformLocation = Sensors.createJSONReceiver('Platform Location', offeringID,
            'http://www.opengis.net/def/property/OGC/0/PlatformLocation', realTimeRecOpts);
        let trueHeading = Sensors.createJSONReceiver('Vehicle Heading', offeringID,
            'http://sensorml.com/ont/swe/property/TrueHeading', realTimeRecOpts);
        let instSpeed = Sensors.createJSONReceiver('Current Speed', offeringID,
            'http://sensorml.com/ont/swe/property/Speed', realTimeRecOpts);
        let avgSpeed = Sensors.createJSONReceiver('Average Speed', offeringID,
            'http://sensorml.com/ont/swe/property/AverageSpeed', realTimeRecOpts);
        let maxSpeed = Sensors.createJSONReceiver('Average Speed', offeringID,
            'http://sensorml.com/ont/swe/property/MaximumSpeed', realTimeRecOpts);
        let ignition = Sensors.createJSONReceiver('Ignition Status', offeringID,
            'http://sensorml.com/ont/swe/property/Ignition', realTimeRecOpts); // TODO: Make sure this is correct once the driver is updated
        let odbData = Sensors.createJSONReceiver('ODB Data', offeringID,
            'http://sensorml.com/ont/swe/property/OBDData', realTimeRecOpts);
        let odoReading = Sensors.createJSONReceiver('Odometer Reading', offeringID,
            'http://sensorml.com/ont/swe/property/OdometerDistance', realTimeRecOpts);
        let engineHours = Sensors.createJSONReceiver('Engine Hours', offeringID,
            'http://sensorml.com/ont/swe/property/EngineHours', realTimeRecOpts);
        let totalGallons = Sensors.createJSONReceiver('Total Gallons', offeringID,
            'http://sensorml.com/ont/swe/property/TotalGallons', realTimeRecOpts);

        let entity = {
            id: entityId,
            name: entityName,
            dataSources: [platformLocation, trueHeading, instSpeed, avgSpeed, maxSpeed, ignition, odbData,
                odoReading, engineHours, totalGallons],
            hasParent: true,
        };
        // Entity must be connected to DataReceiverController to properly handle the individual components needed for charts
        // dataReceiverController.addEntity(entity);

        let ctxtDatasources = {
            instSpeed: instSpeed,
            avgSpeed: avgSpeed,
            maxSpeed: maxSpeed,
            engineHours: engineHours,
            totalGal: totalGallons,
            heading: trueHeading
        };

        let ctxtDialogIds = {
            instSpeed: '',
            avgSpeed: '',
            maxSpeed: '',
            engineHours: '',
            totalGallons: ''
        };

        let contextMenus = Context.createAVLContextMenu(platformLocation, ctxtDialogIds, entity, ctxtDatasources);
        entity.contextMenus = contextMenus;

        //moved entity add to tree and DRC to FOI method

        return entity;
    }

};

let Automation = {
    // TODO: this needs to be async or parallel, possibly break into workers depending on size of foi list
    getStreamGageFOIs: function (cesiumView) {
        let req = new XMLHttpRequest();
        let url = 'http://' + SCIRA_SOS_ENDPT + '?service=SOS&version=2.0&request=GetFeatureOfInterest' +
            '&procedure=urn:usgs:water:network';
        req.open('GET', url, false);
        req.withCredentials = true;
        req.onload = () => {
            let parser = new OSH.SWEXmlParser(req.responseText);
            // console.log(parser.toJson());
            let fois = parser.toJson()['GetFeatureOfInterestResponse'].featureMember;

            for (let i = 0; i < fois.length; i++) {
                let foi = fois[i];
                let tableHTML = csInfoTableFromFOI(foi);
                let staticLocation = {};
                let locSplit = foi.shape.pos.split(' ');
                staticLocation.lat = parseFloat(locSplit[0]);
                staticLocation.lon = parseFloat(locSplit[1]);
                staticLocation.alt = 0.0;
                let entity = addUSGSStreamGageSensor(foi.id, foi.name, 'urn:nys:usgs', cesiumView, {
                    foi: foi.identifier.value, location: staticLocation, description: tableHTML
                });
                entity.sensorType = 'StreamGage';
                locStylerToEntities[entity.locStyler.id] = entity;
            }

        };
        req.send();
    },
    getNOAAFOIs: function (cesiumView) {
        let req = new XMLHttpRequest();
        let url = 'https://' + SOS_ENDPOINT + '?service=SOS&version=2.0&request=GetFeatureOfInterest' +
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
                let tableHTML = csInfoTableFromFOI(foi);
                let staticLocation = {};
                let locSplit = foi.shape.pos.split(' ');
                staticLocation.lat = parseFloat(locSplit[0]);
                staticLocation.lon = parseFloat(locSplit[1]);
                staticLocation.alt = 0.0;
                // console.log(staticLocation);
                let entity = addNOAABuoySensor(foi.identifier.value, foi.name, 'urn:nys:ndbc', cesiumView, {
                    foi: foi.identifier.value, location: staticLocation, description: tableHTML
                });
                entity.sensorType = 'Buoy';
                locStylerToEntities[entity.locStyler.id] = entity;
            }

        };
        req.send();
    },
    getAVLFOIs: function (cesiumView) {
        let avlVINList = {};
        let vins = [];
        let req = new XMLHttpRequest();
        let url = 'https://' + SOS_ENDPOINT + '?service=SOS&version=2.0&request=GetFeatureOfInterest' +
            '&procedure=urn:osh:sensor:verizon:dataconnect';
        req.open('GET', url, false);
        req.withCredentials = true;
        req.onload = () => {
            let parser = new OSH.SWEXmlParser(req.responseText);
            // console.log(parser.toJson());
            let fois = parser.toJson()['GetFeatureOfInterestResponse'].featureMember;
            for (let i = 0; i < fois.length; i++) {
                let foi = fois[i];
                vins.push(foi.id);
                let tableHTML = csInfoTableFromFOI(foi);
                // let entity = addSnowPlowAVLSensor(foi.identifier.value, foi.id + ' (' + foi.name + ')', 'urn:nys:avl', cesiumView, {
                //     foi: foi.identifier.value
                // });
                let entity = Sensors.addAVLMulti(foi.identifier.value, foi.id + ' (' + foi.name + ')', 'urn:nys:avl', {}, {
                    foi: foi.identifier.value
                });
                entity.sensorType = 'AVL';

                // TODO: make sure the location styler is properly referenced or the Context Menu will not work
                // locStylerToEntities[entity.locStyler.id] = entity;
                // Note: there is not a location styler available at this point, make the connection elsewhere

                avlVINList[foi.id] = {
                    id: foi.id,
                    entity: entity,
                    markerId: undefined,
                    // loc: {
                    //     lat: 0,
                    //     lon: 0,
                    //     alt: 0
                    // },
                    tableDesc: tableHTML,
                    locStylerToEntities: locStylerToEntities,
                };
            }
        };
        // TODO TEST
        req.send();

        // Create data sources for AVL as a whole
        let offeringID = 'urn:nys:avl';
        let now = Date.now();
        let dRecOptions = {
            startTime: new Date(now - HISTORY_DEPTH_MILLIS).toISOString(),
            endTime: new Date(now).toISOString(),
            connect: true,
            replaySpeed: 9999999,
            replaySpeed: 1,
            // foi: foi
        };

        let realTimeRecOpts = {
            startTime: 'now',
            endTime: '2019-12-31T00:00:00Z',
            connect: true,
            replaySpeed: 1,
            // foi: foi
        };
        let dataRecProps = {
            protocol: 'wss',
            service: SOS,
            endpointUrl: SCIRA_SOS_ENDPT,
            offeringID: offeringID,
            observedProperty: 'http://sensorml.com/ont/swe/property/GPSData',
            startTime: 'now',
            // startTime: '2019-01-07T00:00:00Z',
            // startTime: new Date(now - HISTORY_DEPTH_MILLIS).toISOString(),
            // endTime: new Date(now).toISOString(),
            endTime: '2019-12-31T00:00:00Z',
            replaySpeed: 1,
            syncMasterTime: SYNC,
            bufferingTime: 500,
            timeOut: TIMEOUT
        };


        // Data Receivers
        // let gpsData = Sensors.createJSONReceiver('GPS Location', offeringID,
        //     'http://sensorml.com/ont/swe/property/GPSData', dataRecProps);
        let gpsData = new OSH.DataReceiver.JSON('TEST', dataRecProps);
        let platformLocation = Sensors.createJSONReceiver('Platform Location', offeringID,
            'http://www.opengis.net/def/property/OGC/0/PlatformLocation', realTimeRecOpts);
        let trueHeading = Sensors.createJSONReceiver('Vehicle Heading', offeringID,
            'http://sensorml.com/ont/swe/property/TrueHeading', realTimeRecOpts);
        let instSpeed = Sensors.createJSONReceiver('Current Speed', offeringID,
            'http://sensorml.com/ont/swe/property/Speed', dRecOptions);
        let avgSpeed = Sensors.createJSONReceiver('Average Speed', offeringID,
            'http://sensorml.com/ont/swe/property/AverageSpeed', dRecOptions);
        let maxSpeed = Sensors.createJSONReceiver('Average Speed', offeringID,
            'http://sensorml.com/ont/swe/property/MaximumSpeed', dRecOptions);
        let ignition = Sensors.createJSONReceiver('Ignition Status', offeringID,
            'http://sensorml.com/ont/swe/property/Ignition', dRecOptions); // TODO: Make sure this is correct once the driver is updated
        let odbData = Sensors.createJSONReceiver('ODB Data', offeringID,
            'http://sensorml.com/ont/swe/property/OBDData', dRecOptions);
        let odoReading = Sensors.createJSONReceiver('Odometer Reading', offeringID,
            'http://sensorml.com/ont/swe/property/OdometerDistance', dRecOptions);
        let engineHours = Sensors.createJSONReceiver('Engine Hours', offeringID,
            'http://sensorml.com/ont/swe/property/EngineHours', dRecOptions);
        let totalGallons = Sensors.createJSONReceiver('Total Gallons', offeringID,
            'http://sensorml.com/ont/swe/property/TotalGallons', dRecOptions);

        console.log(gpsData);

        // Kick off the request after stylers are created, just to be safe
        // req.send();

        let multiData = new OSH.DataReceiver.JSONMultiMaster('AVLMultiTester', {
            protocol: 'wss',
            service: SOS,
            endpointUrl: SCIRA_SOS_ENDPT,
            offeringID: offeringID,
            observedProperty: 'http://sensorml.com/ont/swe/property/GPSData',
            startTime: 'now',
            endTime: '2019-12-31T00:00:00Z',
            replaySpeed: 1,
            syncMasterTime: SYNC,
            bufferingTime: 500,
            timeOut: TIMEOUT,
            msgKey: 'vin',
            targetList: vins
        });

        dataReceiverController.addEntity({
            id: 'TEST AVL GROUP ENTITY',
            name: 'TEST AVL GROUP ENTITY',
            dataSources: [multiData]
        });
        // gpsData.connect();
        multiData.connect();

        let subDatasources = multiData.subscribers;
        for (vin of vins) {
            let locationDS = subDatasources[vin];
            let entity = avlVINList[vin].entity;
            let description = avlVINList[vin].tableDesc;
            // console.log(locationDS);
            // console.log(entity);
            entity.dataSources.push(locationDS);

            let locationStyler = new OSH.UI.Styler.PointMarker({
                location: {
                    x: 0,
                    y: 0,
                    z: 0
                },
                locationFunc: {
                    dataSourceIds: [locationDS.getId()],
                    handler: function (rec, timestamp, options) {
                        // console.log(rec);
                        return {
                            x: rec.location.lon,
                            y: rec.location.lat,
                            z: 0
                        };
                    }
                },
                orientationFunc: {
                    dataSourceIds: [locationDS.getId()],
                    handler: function (rec) {
                        //console.log(rec);
                        return {heading: rec.heading + 180};
                    }
                },
                icon: './images/light/2x/snowplow2x.png',
               /* iconFunc:{
                    dataSourceIds:[locationDS.getId()],
                    handler: function (rec) {
                        if(rec.location.lon !== undefined && rec.location.lon !== 0){
                            return '';
                        } else{
                            return './images/light/2x/snowplow2x.png';
                        }
                    }
                },*/
                label: entity.name,
                description: description
            });
            entity.locStyler = locationStyler;
            locStylerToEntities[entity.locStyler.id] = entity;

            cesiumView.addViewItem({
                name: entity.name,
                entityId: entity.id,
                styler: locationStyler,
                contextMenuId: entity.contextMenus.circle.id
            });

            dataReceiverController.addEntity(entity);
            treeItems.push({
                entity: entity,
                entityId: entity.id,
                path: 'AVL Fleet Data',
                treeIcon: './images/light/2x/snowplow2x.png',
                contextMenuId: entity.contextMenus.stack.id
            });

            // locationDS.connect();
        }
        // console.log(cesiumView);
    },
    getTrafficCamFOIs: function (mapView) {
        let req = new XMLHttpRequest();
        let url = 'https://' + SOS_ENDPOINT + '?service=SOS&version=2.0&request=GetFeatureOfInterest' +
            '&procedure=urn:osh:sensor:511ny:trafficcams';
        req.open('GET', url, false);
        req.withCredentials = true;
        req.onload = () => {
            let parser = new OSH.SWEXmlParser(req.responseText);
            // console.log(parser.toJson());
            let fois = parser.toJson()['GetFeatureOfInterestResponse'].featureMember;
            for (let i = 0; i < fois.length; i++) {
                let foi = fois[i];
                let tableHTML = csInfoTableFromFOI(foi);
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
                    foi: foi.identifier.value, location: staticLocation, description: tableHTML
                });
                entity.sensorType = 'TrafficCam';
                locStylerToEntities[entity.locStyler.id] = entity;
            }

        };
        req.send();
    },
    getMesonetFOIs: function (mapView) {
        let req = new XMLHttpRequest();
        let url = 'https://' + SOS_ENDPOINT + '?service=SOS&version=2.0&request=GetFeatureOfInterest' +
            '&procedure=urn:osh:sensor:nysmesonet';
        req.open('GET', url, false);
        req.withCredentials = true;
        req.onload = () => {
            let parser = new OSH.SWEXmlParser(req.responseText);
            // console.log(parser.toJson());
            let fois = parser.toJson()['GetFeatureOfInterestResponse'].featureMember;
            // console.log(fois);
            for (let i = 0; i < fois.length; i++) {
                let foi = fois[i];
                let tableHTML = csInfoTableFromFOI(foi);
                let location = foi.location.pos.split(' ');
                let staticLocation = {};
                staticLocation.lat = parseFloat(location[0]);
                staticLocation.lon = parseFloat(location[1]);
                staticLocation.alt = 0.0;
                // staticLocation.alt = parseFloat(location[2]);
                // console.log(staticLocation);
                let entity = Sensors.addMesonetSensor(foi.identifier.value, foi.id + ' (' + foi.name + ')', 'urn:nys:mesonet', cesiumView, {
                    foi: foi.identifier.value, location: staticLocation, description: tableHTML
                });
                entity.sensorType = 'Mesonet';
                locStylerToEntities[entity.locStyler.id] = entity;
            }

        };
        req.send();
    },
    addAndroidDevices: function () {
        let offerings = Utilities.getHubOfferings();
        for (let offering of offerings) {
            if (offering.identifier.includes('android')) {
                console.info('Adding Android Device');
                let entity = Sensors.addAndroidPhoneSensor(offering.name, offering.name, offering.identifier, cesiumView, {});
                locStylerToEntities[entity.locStyler.id] = entity;
            }
        }
    }
};

let UI = {
    createMultiDialog: (containerElemId, dataSources, name, showView) => {
        let multiDialog;
        multiDialog = new OSH.UI.MultiDialogView(containerElemId, {
            draggable: true,
            css: "video-dialog",
            name: name,
            show: showView,
            dockable: false,
            closeable: true,
            connectionIds: dataSources,
            //swapId: "main-container", //TODO: make sure this is the proper elem id
            keepRatio: false
        });
        return multiDialog;
    },

    createUSGSDialog: (dataSources, name) => {
        return UI.createMultiDialog('usgs-chart', dataSources, name, true);
    },

    createNOAABuoyDialog: (dataSources, name) => {
        return UI.createMultiDialog('buoy-chart', dataSources, name, true);
    },

    createAVLDialog: (dataSources, name) => {
        return UI.createMultiDialog('avl-chart', dataSources, name, true);
    }
};

let Context = {
    /**
     *
     * @param parentEntity
     * @param entityIds ID values of the view entities associated with menu choices
     * @param dataSources
     */
    createStreamGaugeContextMenu: function (parentEntity, entityIds, dataSources) {
        let menuItems = [];
        let chartMap = {
            temp: {},
            discharge: {},
            height: {},
        };
        let tempChart = {
            name: 'Water Temp',
            viewId: entityIds.waterTemp,
            css: 'fa fa-line-chart',
            clickOverride: tempChartOCH
        };
        let dischargeChart = {
            name: 'Discharge',
            viewId: entityIds.discharge,
            css: 'fa fa-line-chart',
            clickOverride: dischargeChartOCH
        };
        let heightChart = {
            name: 'Gage Height',
            viewId: entityIds.height,
            css: 'fa fa-line-chart',
            clickOverride: heightChartOCH
        };
        menuItems.push(tempChart, dischargeChart, heightChart);
        let streamGageCircCtxtMenu = new OSH.UI.ContextMenu.CircularMenu({
            id: 'menu-' + OSH.Utils.randomUUID(),
            groupId: '',
            items: menuItems
        });
        let sgStackCtxtMenu = new OSH.UI.ContextMenu.StackMenu({
            id: 'menu-' + OSH.Utils.randomUUID(),
            groupId: '',
            items: menuItems
        });
        // console.log(streamGageCircCtxtMenu);
        // console.log(sgStackCtxtMenu);
        return {
            circle: streamGageCircCtxtMenu,
            stack: sgStackCtxtMenu
        };

        function tempChartOCH(event) {
            console.log(event);
            dialogAndDSController('tempChart', dataSources.temp);
        }

        function dischargeChartOCH(event) {
            console.log(event);
            dialogAndDSController('dischargeChart', dataSources.discharge);
        }

        function heightChartOCH(event) {
            console.log(event);
            dialogAndDSController('heightChart', dataSources.height);
        }

        function dialogAndDSController(callerType, dataSource) {
            console.log(callerType);
            console.log(chartMap);
            let chartDialog;

            if (callerType === 'tempChart') {
                console.log(chartMap.hasOwnProperty('dialog'));
                if (!chartMap.temp.hasOwnProperty('dialog')) {
                    chartDialog = UI.createUSGSDialog([dataSource.getId()], parentEntity.name + ' - Water Temp.');
                    chartMap.temp.dialog = chartDialog;
                    let chartView = simpleChartViewAndStyler(chartDialog, dataSource, 'water_temp', 'Temperature (Celsius)')
                } else {
                    console.log('Temp Chart exists');
                    console.log(chartMap.temp);
                    let dia = document.getElementById(chartMap.temp.dialog.id);
                    dia.style.visibility = 'visible';
                    dia.style.display = 'block';
                }
            } else if (callerType === 'dischargeChart') {
                if (!chartMap.discharge.hasOwnProperty('dialog')) {
                    chartDialog = UI.createUSGSDialog([dataSource.getId()], parentEntity.name + ' - Discharge');
                    chartMap.discharge.dialog = chartDialog;
                    let chartView = simpleChartViewAndStyler(chartDialog, dataSource, 'discharge', 'Discharge (ft³/s)')
                } else {
                    let dia = document.getElementById(chartMap.discharge.dialog.id);
                    dia.style.visibility = 'visible';
                    dia.style.display = 'block';
                }
            } else if (callerType === 'heightChart') {
                if (!chartMap.height.hasOwnProperty('dialog')) {
                    chartDialog = UI.createUSGSDialog([dataSource.getId()], parentEntity.name + ' - Gage Height');
                    chartMap.height.dialog = chartDialog;
                    let chartView = simpleChartViewAndStyler(chartDialog, dataSource, 'gage_height', 'Gage Height (ft)')
                } else {
                    let dia = document.getElementById(chartMap.height.dialog.id);
                    dia.style.visibility = 'visible';
                    dia.style.display = 'block';
                }
            }

            dataSource.connect();
        }
    },
    /**
     *
     * @param entityIds ID values of the view entities associated with menu choices
     */
    createNOAAContextMenu: function (parentEntity, entityIds, dataSources) {
        let menuItems = [];
        let chartMap = {
            temp: {},
            depth: {},
        };
        let tempChart = {
            name: 'Sea Water Temperature',
            viewId: entityIds.seaWaterTemp,
            css: 'fa fa-line-chart',
            clickOverride: tempChartOCH
        };
        let depthChart = {
            name: 'Buoy Depth',
            viewId: entityIds.buoyDepth,
            css: 'fa fa-line-chart',
            clickOverride: depthChartOCH
        };
        menuItems.push(tempChart, depthChart);
        let circContextMenu = new OSH.UI.ContextMenu.CircularMenu({
            id: 'menu-' + OSH.Utils.randomUUID(),
            groupId: '',
            items: menuItems
        });
        let stackCtxtMenu = new OSH.UI.ContextMenu.StackMenu({
            id: 'menu-' + OSH.Utils.randomUUID(),
            groupId: '',
            items: menuItems
        });
        // console.log(stackCtxtMenu);
        return {
            circle: circContextMenu,
            stack: stackCtxtMenu
        };

        function tempChartOCH(event) {
            console.log(event);
            dialogAndDSController('tempChart', dataSources.temp);
        }

        function depthChartOCH(event) {
            console.log(event);
            dialogAndDSController('depthChart', dataSources.depth);
        }

        function dialogAndDSController(callerType, dataSource) {
            // console.log(callerType);
            // console.log(chartMap);
            // console.log(dataSources);
            let chartDialog;

            if (callerType === 'tempChart') {
                if (!chartMap.temp.hasOwnProperty('dialog')) {
                    chartDialog = UI.createNOAABuoyDialog([dataSource.getId()], parentEntity.name + ' - Sea Water Temp.');
                    chartMap.temp.dialog = chartDialog;
                    let chartView = simpleChartViewAndStyler(chartDialog, dataSource, 'sea_water_temperature', 'Water Temp. (°C)')
                } else {
                    console.log(chartMap.temp);
                    let dia = document.getElementById(chartMap.temp.dialog.id);
                    dia.style.visibility = 'visible';
                    dia.style.display = 'block';
                }
            } else if (callerType === 'depthChart') {
                if (!chartMap.depth.hasOwnProperty('dialog')) {
                    chartDialog = UI.createNOAABuoyDialog([dataSource.getId()], parentEntity.name + ' - Buoy Depth');
                    chartMap.depth.dialog = chartDialog;
                    let chartView = simpleChartViewAndStyler(chartDialog, dataSource, 'depth', 'Buoy Depth (m)')
                } else {
                    console.log(chartMap.depth);
                    let dia = document.getElementById(chartMap.depth.dialog.id);
                    dia.style.visibility = 'visible';
                    dia.style.display = 'block';
                }
            }
            dataSource.connect();
        }
    },
    createAVLContextMenu: function (locationDataSource, dialogEntityIds, parentEntity, dataSources) {
        let menuItems = [];
        let chartMap = {
            instSpeed: {},
            avgSpeed: {},
            maxSpeed: {},
            engineHours: {},
            totalGal: {},
        };
        let instSpeedChart = {
            name: 'Instant Speed',
            viewId: dialogEntityIds.instSpeed,
            css: 'fa fa-line-chart',
            clickOverride: instSpeedChartOCH
        };
        let avgSpeedChart = {
            name: 'Average Speed',
            viewId: dialogEntityIds.avgSpeed,
            css: 'fa fa-line-chart',
            clickOverride: avgSpeedChartOCH
        };
        let maxSpeedChart = {
            name: 'Max Speed',
            viewId: dialogEntityIds.maxSpeed,
            css: 'fa fa-line-chart',
            clickOverride: maxSpeedChartOCH
        };
        let engineHoursChart = {
            name: 'Engine Hours',
            viewId: dialogEntityIds.engineHours,
            css: 'fa fa-line-chart',
            clickOverride: engineHoursChartOCH
        };
        let totalGalChart = {
            name: 'Fuel Amount',
            viewId: dialogEntityIds.totalGallons,
            css: 'fa fa-line-chart',
            clickOverride: totalGalChartOCH
        };

        menuItems.push(instSpeedChart, avgSpeedChart, maxSpeedChart, engineHoursChart, totalGalChart);
        let circContextMenu = new OSH.UI.ContextMenu.CircularMenu({
            id: 'menu-' + OSH.Utils.randomUUID(),
            groupId: '',
            items: menuItems
        });
        let stackCtxtMenu = new OSH.UI.ContextMenu.StackMenu({
            id: 'menu-' + OSH.Utils.randomUUID(),
            groupId: '',
            items: menuItems
        });
        // console.log(stackCtxtMenu);
        return {
            circle: circContextMenu,
            stack: stackCtxtMenu
        };

        function pointMarkerConnector(event) {
            console.log('Pointmarker Connector Accessed');
            console.log(locationDataSource.id);
            // console.log(event.target.locationDatasource);
            // console.log(dataReceiverController);
            let locDataSource = dataReceiverController.dataSourcesIdToDataSources[locationDataSource.id];
            let hdgDataSource = dataReceiverController.dataSourcesIdToDataSources[dataSources.heading.id];
            if (locDataSource.connected === false) {
                locDataSource.connect();
                hdgDataSource.connect();
            }

            // HACK to zoom to vehicle entity
            let prevSelected = cesiumView.viewer.selectedEntity;
            let zoomToSelected = function () {
                let selected = cesiumView.viewer.selectedEntity;
                if (typeof (selected) != "undefined" && selected != prevSelected) {
                    cesiumView.viewer.zoomTo(cesiumView.viewer.selectedEntity,
                        new Cesium.HeadingPitchRange(0.0, -90, 3000));
                    //cesiumView.viewer.trackedEntity = selected;
                } else {
                    setTimeout(zoomToSelected, 100);
                }
            };
            setTimeout(zoomToSelected, 100);
        }

        function instSpeedChartOCH(event) {
            dialogAndDSController('instSpeedChart', dataSources.instSpeed);
        }

        function avgSpeedChartOCH(event) {
            dialogAndDSController('avgSpeedChart', dataSources.avgSpeed);
        }

        function maxSpeedChartOCH(event) {
            dialogAndDSController('maxSpeedChart', dataSources.maxSpeed);
        }

        function engineHoursChartOCH(event) {
            dialogAndDSController('engineHoursChart', dataSources.engineHours);
        }

        function totalGalChartOCH(event) {
            dialogAndDSController('totalGalChart', dataSources.totalGal);
        }

        function dialogAndDSController(callerType, dataSource) {
            console.log(callerType);
            console.log(chartMap);
            let chartDialog;

            if (callerType === 'instSpeedChart') {
                console.log(chartMap.hasOwnProperty('dialog'));
                if (!chartMap.instSpeed.hasOwnProperty('dialog')) {
                    chartDialog = UI.createAVLDialog([dataSource.getId()], parentEntity.name + ' - Instant Speed');
                    chartMap.instSpeed.dialog = chartDialog;
                    let chartView = simpleChartViewAndStyler(chartDialog, dataSource, 'instSpeed', 'Speed (mph)')
                } else {
                    console.log(chartMap.instSpeed);
                    let dia = document.getElementById(chartMap.instSpeed.dialog.id);
                    dia.style.visibility = 'visible';
                    dia.style.display = 'block';
                }
            } else if (callerType === 'avgSpeedChart') {
                if (!chartMap.avgSpeed.hasOwnProperty('dialog')) {
                    chartDialog = UI.createAVLDialog([dataSource.getId()], parentEntity.name + ' - Average Speed');
                    chartMap.avgSpeed.dialog = chartDialog;
                    let chartView = simpleChartViewAndStyler(chartDialog, dataSource, 'avgSpeed', 'Speed (mph)')
                } else {
                    let dia = document.getElementById(chartMap.avgSpeed.dialog.id);
                    dia.style.visibility = 'visible';
                    dia.style.display = 'block';
                }
            } else if (callerType === 'maxSpeedChart') {
                if (!chartMap.maxSpeed.hasOwnProperty('dialog')) {
                    chartDialog = UI.createAVLDialog([dataSource.getId()], parentEntity.name + ' - Max Speed');
                    chartMap.maxSpeed.dialog = chartDialog;
                    let chartView = simpleChartViewAndStyler(chartDialog, dataSource, 'maxSpeed', 'Speed (mph)')
                } else {
                    let dia = document.getElementById(chartMap.maxSpeed.dialog.id);
                    dia.style.visibility = 'visible';
                    dia.style.display = 'block';
                }
            } else if (callerType === 'engineHoursChart') {
                if (!chartMap.engineHours.hasOwnProperty('dialog')) {
                    chartDialog = UI.createAVLDialog([dataSource.getId()], parentEntity.name + ' - Engine Hours');
                    chartMap.engineHours.dialog = chartDialog;
                    let chartView = simpleChartViewAndStyler(chartDialog, dataSource, 'engineHours', 'Hours')
                } else {
                    let dia = document.getElementById(chartMap.engineHours.dialog.id);
                    dia.style.visibility = 'visible';
                    dia.style.display = 'block';
                }
            } else if (callerType === 'totalGalChart') {
                if (!chartMap.totalGal.hasOwnProperty('dialog')) {
                    chartDialog = UI.createAVLDialog([dataSource.getId()], parentEntity.name + ' - Total Gallons');
                    chartMap.totalGal.dialog = chartDialog;
                    let chartView = simpleChartViewAndStyler(chartDialog, dataSource, 'totalGallons', 'Gallons')
                } else {
                    let dia = document.getElementById(chartMap.totalGal.dialog.id);
                    dia.style.visibility = 'visible';
                    dia.style.display = 'block';
                }
            }

            dataSource.connect();
        }
    },
    createTrafficCamContextMenu: function (parentEntity, entityIds, dataSources) {
        let menuItems = [];
        let chartMap = {
            video: {},
            marker: {},
        };
        let video = {
            name: 'Video Feed',
            viewId: entityIds.videoData,
            css: 'fa fa-video-camera',
            clickOverride: connectVideo
        };
        /*let marker = {
            name: 'Video Feed',
            viewId: entityIds.location,
            css: 'fa fa-line-chart',
            clickOverride: tempChartOCH
        };*/
        menuItems.push(video);
        let circContextMenu = new OSH.UI.ContextMenu.CircularMenu({
            id: 'menu-' + OSH.Utils.randomUUID(),
            groupId: '',
            items: menuItems
        });
        let stackCtxtMenu = new OSH.UI.ContextMenu.StackMenu({
            id: 'menu-' + OSH.Utils.randomUUID(),
            groupId: '',
            items: menuItems
        });
        // console.log(stackCtxtMenu);
        return {
            circle: circContextMenu,
            stack: stackCtxtMenu
        };

        function connectVideo() {
            dialogAndDSController('video', dataSources.video)
        }

        function dialogAndDSController(callerType, dataSource) {
            // console.log(callerType);
            // console.log(chartMap);
            // console.log(dataSources);tab
            let videoDialog;

            if (callerType === 'video') {
                if (!chartMap.video.hasOwnProperty('dialog')) {
                    videoDialog = UI.createMultiDialog('traffic-cams', [dataSource.getId()], parentEntity.name, true);  // TODO: make sure styling is correct
                    chartMap.video.dialog = videoDialog;
                    let videoView = new OSH.UI.MjpegView(videoDialog.popContentDiv.id, {
                        dataSourceId: [dataSource.getId()],
                        entityId: parentEntity.id,
                        css: "video",
                        cssSelected: "video-selected",
                        /*width: 360,
                        height: 300*/
                    })
                } else {
                    console.log(chartMap.temp);
                    let dia = document.getElementById(chartMap.video.dialog.id);
                    dia.style.visibility = 'visible';
                    dia.style.display = 'block';
                }
            }
            dataSource.connect();
        }
    },
    createAndroidContextMenu(parentEntity, entityIds, dataSources) {
        let menuItems = [];
        let chartMap = {
            video: {},
            marker: {},
        };
        let video = {
            name: 'Video Feed',
            viewId: entityIds.videoData,
            css: 'fa fa-video-camera',
            clickOverride: connectVideo
        };
        let locationIcon = {
            name: 'Show Map Icon',
            css: 'fa fa-map-marker',
            clickOverride: pointMarkerConnector,
            locationDatasource: dataSources.locData
        };
        menuItems.push(video, locationIcon);
        let circContextMenu = new OSH.UI.ContextMenu.CircularMenu({
            id: 'menu-' + OSH.Utils.randomUUID(),
            groupId: '',
            items: menuItems
        });
        let stackCtxtMenu = new OSH.UI.ContextMenu.StackMenu({
            id: 'menu-' + OSH.Utils.randomUUID(),
            groupId: '',
            items: menuItems
        });
        // console.log(stackCtxtMenu);
        return {
            circle: circContextMenu,
            stack: stackCtxtMenu
        };

        function connectVideo() {
            dialogAndDSController('video', dataSources.video);
        }

        function pointMarkerConnector(event) {
            let locDataSource = dataSources.locData;
            let hdgDataSource = dataSources.orientation;
            if (locDataSource.connected === false) {
                locDataSource.connect();
                hdgDataSource.connect();
            }

            // HACK to zoom to vehicle entity
            let prevSelected = cesiumView.viewer.selectedEntity;
            let zoomToSelected = function () {
                let selected = cesiumView.viewer.selectedEntity;
                if (typeof (selected) !== "undefined" && selected !== prevSelected) {
                    cesiumView.viewer.zoomTo(cesiumView.viewer.selectedEntity,
                        new Cesium.HeadingPitchRange(0.0, -90, 3000));
                } else {
                    setTimeout(zoomToSelected, 100);
                }
            };
            setTimeout(zoomToSelected, 100);
        }

        function dialogAndDSController(callerType, dataSource) {
            let videoDialog;

            if (callerType === 'video') {
                if (!chartMap.video.hasOwnProperty('dialog')) {
                    videoDialog = UI.createMultiDialog('android-video', [video], parentEntity.name + ' Video', true);
                    chartMap.video.dialog = videoDialog;
                    let videoView = new OSH.UI.MjpegView(videoDialog.popContentDiv.id, {
                        dataSourceId: [dataSources.video.getId()],
                        entityId: parentEntity.id,
                        css: "video",
                        cssSelected: "video-selected",
                        width: 360,
                        height: 300
                    });
                    chartMap.video.view = videoView;
                }
                let dialogElem = document.getElementById(chartMap.video.dialog.id);
                console.log(dialogElem);
                dialogElem.style.visibility = 'visible';
                dialogElem.style.display = 'block';
            }
            dataSource.connect();
        }
    },
    createDroneContextMenu: function (parentEntity, entityIds, dataSources, views) {
        let menuItems = [];
        let chartMap = {
            altitude: {},
            location: {},
            video: {}
        };
        let location = {
            name: 'Location',
            viewId: entityIds.location,
            css: 'fa fa-map-marker',
            clickOverride: pointMarkerConnector
        };
        menuItems.push(location);
        let altChart = {
            name: 'Drone Altitude',
            viewId: entityIds.altitude,
            css: 'fa fa-line-chart',
            clickOverride: altChartOCH
        };
        menuItems.push(altChart);
        let video = {
            name: 'Drone Video',
            viewId: entityIds.video,
            css: 'fa fa-video-camera',
            clickOverride: videoOCH
        };
        menuItems.push(video);

        let circContextMenu = new OSH.UI.ContextMenu.CircularMenu({
            id: 'menu-' + OSH.Utils.randomUUID(),
            groupId: '',
            items: menuItems
        });
        let stackCtxtMenu = new OSH.UI.ContextMenu.StackMenu({
            id: 'menu-' + OSH.Utils.randomUUID(),
            groupId: '',
            items: menuItems
        });
        return {
            circle: circContextMenu,
            stack: stackCtxtMenu
        };

        function pointMarkerConnector(event) {
            let locDataSource = dataReceiverController.dataSourcesIdToDataSources[dataSources.location.id];
            let hdgDataSource = dataReceiverController.dataSourcesIdToDataSources[dataSources.heading.id];
            if (locDataSource.connected === false) {
                locDataSource.connect();
                hdgDataSource.connect();
            }

            let prevSelected = cesiumView.viewer.selectedEntity;
            let zoomToSelected = function () {
                let selected = cesiumView.viewer.selectedEntity;
                if (typeof (selected) != "undefined" && selected !== prevSelected) {
                    cesiumView.viewer.zoomTo(cesiumView.viewer.selectedEntity,
                        new Cesium.HeadingPitchRange(0.0, -90, 3000));
                    //cesiumView.viewer.trackedEntity = selected;
                } else {
                    setTimeout(zoomToSelected, 100);
                }
            };
            setTimeout(zoomToSelected, 100);
            dataSources.video.connect();
        }

        // TODO: setup to take location altitude
        function altChartOCH() {
            if (!chartMap.altitude.hasOwnProperty('dialog')) {
                let chartDialog = UI.createAVLDialog([dataSources.altitude.getId()], parentEntity.name + ' - Altitude');
                chartMap.altitude.dialog = chartDialog;
                let chartView = simpleChartViewAndStyler(chartDialog, dataSources.altitude, 'alt', 'Altitude (m)')
            } else {
                console.log(chartMap.altitude);
                let dia = document.getElementById(chartMap.altitude.dialog.id);
                dia.style.visibility = 'visible';
                dia.style.display = 'block';
            }
            dataSources.altitude.connect();
        }

        function videoOCH() {
            if (!chartMap.video.hasOwnProperty('dialog')) {
                // let videoDialog = UI.createMultiDialog('android-video', [dataSources.video.getId()], parentEntity.name + ' Video', true);
                let videoDialog = views.video.dialog;
                chartMap.video.dialog = videoDialog;
                let videoView = views.video.view;
                chartMap.video.view = videoView;
            }
            let dialogElem = document.getElementById(chartMap.video.dialog.id);
            dialogElem.style.visibility = 'visible';
            dialogElem.style.display = 'block';

            dataSources.video.connect();
        }

    },
    createMesonetContextMenu(parentEntity, entityIds, dataSources) {
        let menuItems = [];
        let chartMap = {
            location: {},
            temperature: {},
            humidity: {},
            airPressure: {},
            windSpeed: {},
            windDir: {},
            windGust: {},
            precipitation: {},
            solarRadiation: {},
            snowDepth: {},
            soilMoisture: {},
            soilTemperature: {}
        };
        let tempChart = {
            name: 'Air Temp',
            viewId: entityIds.temperature,
            css: 'fa fa-line-chart',
            clickOverride: tempChartOCH
        };
        menuItems.push(tempChart);
        let humidityChart = {
            name: 'Humidity',
            viewId: entityIds.humidity,
            css: 'fa fa-line-chart',
            clickOverride: humChartOCH
        };
        menuItems.push(humidityChart);
        let airPressChart = {
            name: 'Air Pressure',
            viewId: entityIds.airPressure,
            css: 'fa fa-line-chart',
            clickOverride: pressChartOCH
        };
        menuItems.push(airPressChart);
        let windSpeedChart = {
            name: 'Wind Speed',
            viewId: entityIds.windSpeed,
            css: 'fa fa-line-chart',
            clickOverride: windSpeedChartOCH
        };
        menuItems.push(windSpeedChart);
        let windDirChart = {
            name: 'Wind Direction',
            viewId: entityIds.windDir,
            css: 'fa fa-line-chart',
            clickOverride: windDirChartOCH
        };
        menuItems.push(windDirChart);
        let windGustChart = {
            name: 'Wind Gust',
            viewId: entityIds.windGust,
            css: 'fa fa-line-chart',
            clickOverride: windGustChartOCH
        };
        menuItems.push(windGustChart);
        let precipChart = {
            name: 'Precipitation',
            viewId: entityIds.precipitation,
            css: 'fa fa-line-chart',
            clickOverride: precipitationChartOCH
        };
        menuItems.push(precipChart);
        let solarRadChart = {
            name: 'Solar Radiation',
            viewId: entityIds.solarRadiation,
            css: 'fa fa-line-chart',
            clickOverride: solarRadChartOCH
        };
        menuItems.push(solarRadChart);
        let snowDepthChart = {
            name: 'Snow Depth',
            viewId: entityIds.snowDepth,
            css: 'fa fa-line-chart',
            clickOverride: snowDepthChartOCH
        };
        menuItems.push(snowDepthChart);
        let soilMoistureChart = {
            name: 'Soil Moisture',
            viewId: entityIds.soilMoisture,
            css: 'fa fa-line-chart',
            clickOverride: soilMoistureChartOCH
        };
        menuItems.push(soilMoistureChart);
        let soilTempChart = {
            name: 'Soil Temp',
            viewId: entityIds.soilTemperature,
            css: 'fa fa-line-chart',
            clickOverride: soilTempChartOCH
        };
        menuItems.push(soilTempChart);
        let stackMenu = new OSH.UI.ContextMenu.StackMenu({
            id: 'menu-' + OSH.Utils.randomUUID(),
            groupId: '',
            items: menuItems
        });
        let circleMenu = new OSH.UI.ContextMenu.CircularMenu({
            id: 'menu-' + OSH.Utils.randomUUID(),
            groupId: '',
            items: menuItems
        });
        return {
            circle: circleMenu,
            stack: stackMenu
        };

        function tempChartOCH() {
            if (!chartMap.temperature.hasOwnProperty('dialog')) {
                let chartDialog = UI.createAVLDialog([dataSources.temperature.getId()], parentEntity.name + ' - Air Temp');
                chartMap.temperature.dialog = chartDialog;
                let chartView = simpleChartViewAndStyler(chartDialog, dataSources.temperature, 'temperature2m', 'Temp (°F)')
            } else {
                console.log(chartMap.temperature);
                let dia = document.getElementById(chartMap.temperature.dialog.id);
                dia.style.visibility = 'visible';
                dia.style.display = 'block';
            }
            dataSources.temperature.connect();
        }

        function humChartOCH() {
            if (!chartMap.humidity.hasOwnProperty('dialog')) {
                let chartDialog = UI.createAVLDialog([dataSources.humidity.getId()], parentEntity.name + ' - Humidity');
                chartMap.humidity.dialog = chartDialog;
                let chartView = simpleChartViewAndStyler(chartDialog, dataSources.humidity, 'relativeHumidity', 'Humidity (%)')
            } else {
                console.log(chartMap.humidity);
                let dia = document.getElementById(chartMap.humidity.dialog.id);
                dia.style.visibility = 'visible';
                dia.style.display = 'block';
            }
            dataSources.humidity.connect();
        }

        function pressChartOCH() {
            if (!chartMap.airPressure.hasOwnProperty('dialog')) {
                let chartDialog = UI.createAVLDialog([dataSources.airPressure.getId()], parentEntity.name + ' - Air Pressure');
                chartMap.airPressure.dialog = chartDialog;
                let chartView = simpleChartViewAndStyler(chartDialog, dataSources.airPressure, 'pressure', 'Pressure (mbar)')
            } else {
                console.log(chartMap.airPressure);
                let dia = document.getElementById(chartMap.airPressure.dialog.id);
                dia.style.visibility = 'visible';
                dia.style.display = 'block';
            }
            dataSources.airPressure.connect();
        }

        function windSpeedChartOCH() {
            if (!chartMap.windSpeed.hasOwnProperty('dialog')) {
                let chartDialog = UI.createAVLDialog([dataSources.windSpeed.getId()], parentEntity.name + ' - Wind Speed');
                chartMap.windSpeed.dialog = chartDialog;
                let chartView = simpleChartViewAndStyler(chartDialog, dataSources.windSpeed, 'windSpeed', 'Speed (mph)')
            } else {
                console.log(chartMap.windSpeed);
                let dia = document.getElementById(chartMap.windSpeed.dialog.id);
                dia.style.visibility = 'visible';
                dia.style.display = 'block';
            }
            dataSources.windSpeed.connect();
        }

        function windDirChartOCH() {
            if (!chartMap.windDir.hasOwnProperty('dialog')) {
                let chartDialog = UI.createAVLDialog([dataSources.windDir.getId()], parentEntity.name + ' - Wind Direction');
                chartMap.windDir.dialog = chartDialog;
                let chartView = simpleChartViewAndStyler(chartDialog, dataSources.windDir, 'windDirection', 'Direction (degrees)')
            } else {
                console.log(chartMap.windDir);
                let dia = document.getElementById(chartMap.windDir.dialog.id);
                dia.style.visibility = 'visible';
                dia.style.display = 'block';
            }
            dataSources.windDir.connect();
        }

        function windGustChartOCH() {
            if (!chartMap.windGust.hasOwnProperty('dialog')) {
                let chartDialog = UI.createAVLDialog([dataSources.windGust.getId()], parentEntity.name + ' - Wind Gust');
                chartMap.windGust.dialog = chartDialog;
                let chartView = simpleChartViewAndStyler(chartDialog, dataSources.windGust, 'windSpeedGust', 'Gust Speed (mph)')
            } else {
                console.log(chartMap.windGust);
                let dia = document.getElementById(chartMap.windGust.dialog.id);
                dia.style.visibility = 'visible';
                dia.style.display = 'block';
            }
            dataSources.windGust.connect();
        }

        function precipitationChartOCH() {
            if (!chartMap.precipitation.hasOwnProperty('dialog')) {
                let chartDialog = UI.createAVLDialog([dataSources.precipitation.getId()], parentEntity.name + ' - Precipitation');
                chartMap.precipitation.dialog = chartDialog;
                let chartView = simpleChartViewAndStyler(chartDialog, dataSources.precipitation, 'precipitation6hr', 'Precip. 6hr(in.)');
                let chartView1 = simpleChartViewAndStyler(chartDialog, dataSources.precipitation, 'precipitation1day', 'Precip. 1day(in.)');
                let chartView2 = simpleChartViewAndStyler(chartDialog, dataSources.precipitation, 'precipitation2day', 'Precip. 2day(in.)');
                let chartView3 = simpleChartViewAndStyler(chartDialog, dataSources.precipitation, 'precipitation3day', 'Precip. 3day(in.)');
                let chartView4 = simpleChartViewAndStyler(chartDialog, dataSources.precipitation, 'precipitation7day', 'Precip. 7day(in.)');
            } else {
                console.log(chartMap.precipitation);
                let dia = document.getElementById(chartMap.precipitation.dialog.id);
                dia.style.visibility = 'visible';
                dia.style.display = 'block';
            }
            dataSources.precipitation.connect();
        }

        function solarRadChartOCH() {
            if (!chartMap.solarRadiation.hasOwnProperty('dialog')) {
                let chartDialog = UI.createAVLDialog([dataSources.solarRadiation.getId()], parentEntity.name + ' - Solar Radiation');
                chartMap.solarRadiation.dialog = chartDialog;
                let chartView = simpleChartViewAndStyler(chartDialog, dataSources.solarRadiation, 'solarRadiation', 'Solar Rad. (W/m2)')
            } else {
                console.log(chartMap.solarRadiation);
                let dia = document.getElementById(chartMap.solarRadiation.dialog.id);
                dia.style.visibility = 'visible';
                dia.style.display = 'block';
            }
            dataSources.solarRadiation.connect();
        }

        function snowDepthChartOCH() {
            if (!chartMap.snowDepth.hasOwnProperty('dialog')) {
                let chartDialog = UI.createAVLDialog([dataSources.snowDepth.getId()], parentEntity.name + ' - Snow Depth');
                chartMap.snowDepth.dialog = chartDialog;
                let chartView = simpleChartViewAndStyler(chartDialog, dataSources.snowDepth, 'snowDepth', 'Depth (in.)')
            } else {
                console.log(chartMap.snowDepth);
                let dia = document.getElementById(chartMap.snowDepth.dialog.id);
                dia.style.visibility = 'visible';
                dia.style.display = 'block';
            }
            dataSources.snowDepth.connect();
        }

        function soilMoistureChartOCH() {
            if (!chartMap.soilMoisture.hasOwnProperty('dialog')) {
                let chartDialog = UI.createAVLDialog([dataSources.soilMoisture.getId()], parentEntity.name + ' - Soil Moisture');
                chartMap.soilMoisture.dialog = chartDialog;
                let chartView = simpleChartViewAndStyler(chartDialog, dataSources.soilMoisture, 'soilMoisture5cm', 'Moisture (%) @ 5cm');
                let chartView1 = simpleChartViewAndStyler(chartDialog, dataSources.soilMoisture, 'soilMoisture25cm', 'Moisture (%) @ 25cm');
                let chartView2 = simpleChartViewAndStyler(chartDialog, dataSources.soilMoisture, 'soilMoisture50cm', 'Moisture (%) @ 50cm');
            } else {
                console.log(chartMap.soilMoisture);
                let dia = document.getElementById(chartMap.soilMoisture.dialog.id);
                dia.style.visibility = 'visible';
                dia.style.display = 'block';
            }
            dataSources.soilMoisture.connect();
        }

        function soilTempChartOCH() {
            if (!chartMap.soilTemperature.hasOwnProperty('dialog')) {
                let chartDialog = UI.createAVLDialog([dataSources.soilTemperature.getId()], parentEntity.name + ' - Soil Temperature');
                chartMap.soilTemperature.dialog = chartDialog;
                let chartView = simpleChartViewAndStyler(chartDialog, dataSources.soilTemperature, 'soilTemp5cm', 'Temp 5cm (°F)');
                let chartView1 = simpleChartViewAndStyler(chartDialog, dataSources.soilTemperature, 'soilTemp25cm', 'Temp 25cm (°F)');
                let chartView2 = simpleChartViewAndStyler(chartDialog, dataSources.soilTemperature, 'soilTemp50cm', 'Temp 50cm (°F)');
            } else {
                console.log(chartMap.soilTemperature);
                let dia = document.getElementById(chartMap.soilTemperature.dialog.id);
                dia.style.visibility = 'visible';
                dia.style.display = 'block';
            }
            dataSources.soilTemperature.connect();
        }


    }
};

let MarkerLayers = {
    test: function () {
        console.debug('Show/Hide the Icon Set Selected!');
    },
    trafficCamShow() {
        for (let entity in locStylerToEntities) {
            if (locStylerToEntities[entity].sensorType === 'TrafficCam') {
                for (let csEntity of cesiumView.viewer.entities._entities._array) {
                    if (csEntity._dsid === cesiumView.stylerToObj[entity]) {
                        csEntity.show = true;
                        break;
                    }
                }
            }
        }
    },
    trafficCamHide() {
        for (let entity in locStylerToEntities) {
            if (locStylerToEntities[entity].sensorType === 'TrafficCam') {
                for (let csEntity of cesiumView.viewer.entities._entities._array) {
                    if (csEntity._dsid === cesiumView.stylerToObj[entity]) {
                        csEntity.show = false;
                        break;
                    }
                }
            }
        }
    },
    trafficCamContext() {
        let menuItems;
        let show = {
            name: 'Show Icons',
            viewId: '',
            css: 'fa fa-eye',
            clickOverride: MarkerLayers.trafficCamShow
        };
        let hide = {
            name: 'Hide Icons',
            viewId: '',
            css: 'fa fa-eye',
            clickOverride: MarkerLayers.trafficCamHide
        };
        menuItems = [show, hide];
        let stackMenu = new OSH.UI.ContextMenu.StackMenu({
            id: 'menu-' + OSH.Utils.randomUUID(),
            groupId: '',
            items: menuItems
        });
        return stackMenu;
    },
    usgsShow() {
        for (let entity in locStylerToEntities) {
            if (locStylerToEntities[entity].sensorType === 'StreamGage') {
                for (let csEntity of cesiumView.viewer.entities._entities._array) {
                    if (csEntity._dsid === cesiumView.stylerToObj[entity]) {
                        csEntity.show = true;
                        break;
                    }
                }
            }
        }
    },
    usgsHide() {
        for (let entity in locStylerToEntities) {
            if (locStylerToEntities[entity].sensorType === 'StreamGage') {
                for (let csEntity of cesiumView.viewer.entities._entities._array) {
                    if (csEntity._dsid === cesiumView.stylerToObj[entity]) {
                        csEntity.show = false;
                        break;
                    }
                }
            }
        }
    },
    usgsTable() {
        let elem = document.getElementById(usgsTDialog.id);
        elem.style.visibility = 'visible';
        elem.style.display = 'block';
        let worker = Workers.table();
        let usgsTable = tableGroup[0];
        worker.onmessage = (evt) => {
            if (evt.data.hasOwnProperty('usgs')) {
                usgsTable.updateOrAddData(evt.data.usgs);
                usgsTable.redraw(true);
            }
        };
        worker.postMessage('usgs');
    },
    usgsContext() {
        let menuItems;
        let show = {
            name: 'Show Icons',
            viewId: '',
            css: 'fa fa-eye',
            clickOverride: MarkerLayers.usgsShow
        };
        let hide = {
            name: 'Hide Icons',
            viewId: '',
            css: 'fa fa-eye',
            clickOverride: MarkerLayers.usgsHide
        };
        /*let table = {
            name: 'Show Table',
            viewId: '',
            css: 'fa fa-eye',
            clickOverride: MarkerLayers.usgsTable
        };*/
        // menuItems = [show, hide, table];
        menuItems = [show, hide];
        let stackMenu = new OSH.UI.ContextMenu.StackMenu({
            id: 'menu-' + OSH.Utils.randomUUID(),
            groupId: '',
            items: menuItems
        });
        return stackMenu;
    },
    noaaShow() {
        for (let entity in locStylerToEntities) {
            if (locStylerToEntities[entity].sensorType === 'Buoy') {
                for (let csEntity of cesiumView.viewer.entities._entities._array) {
                    if (csEntity._dsid === cesiumView.stylerToObj[entity]) {
                        csEntity.show = true;
                        break;
                    }
                }
            }
        }

    },
    noaaHide() {
        for (let entity in locStylerToEntities) {
            if (locStylerToEntities[entity].sensorType === 'Buoy') {
                for (let csEntity of cesiumView.viewer.entities._entities._array) {
                    if (csEntity._dsid === cesiumView.stylerToObj[entity]) {
                        csEntity.show = false;
                        break;
                    }
                }
            }
        }
    },
    noaaTable() {
        let elem = document.getElementById(noaaTDialog.id);
        elem.style.visibility = 'visible';
        elem.style.display = 'block';
        let worker = Workers.table();
        let buoyTable = tableGroup[1];
        worker.onmessage = (evt) => {
            if (evt.data.hasOwnProperty('noaa')) {
                // console.log(evt.data.noaa);
                for (let result of evt.data.noaa) {
                    // console.log(result);
                    let temp;
                    let depth;

                    let newData = {id: result.station, name: 'NOAA Buoy Station ' + result.station};
                    if (result.depth !== 'NaN' && result.depth !== undefined) {
                        depth = Number.parseFloat(result.depth).toFixed(4);
                        newData.depth = depth;
                    }
                    if (result.sea_water_temperature !== 'NaN' && result.sea_water_temperature !== undefined) {
                        temp = Number.parseFloat(result.sea_water_temperature).toFixed(4);
                        newData.temp = temp;
                    }
                    buoyTable.updateOrAddData([newData]);
                    buoyTable.redraw(true);
                }
            }
        };
        worker.postMessage('noaa');
    },
    noaaContext() {
        let menuItems;
        let show = {
            name: 'Show Icons',
            viewId: '',
            css: 'fa fa-eye',
            clickOverride: MarkerLayers.noaaShow
        };
        let hide = {
            name: 'Hide Icons',
            viewId: '',
            css: 'fa fa-eye',
            clickOverride: MarkerLayers.noaaHide
        };
        let table = {
            name: 'Show Table',
            viewId: '',
            css: 'fa fa-eye',
            clickOverride: MarkerLayers.noaaTable
        };
        menuItems = [show, hide, table];
        let stackMenu = new OSH.UI.ContextMenu.StackMenu({
            id: 'menu-' + OSH.Utils.randomUUID(),
            groupId: '',
            items: menuItems
        });
        return stackMenu;
    },
    avlShow() {
        console.log(locStylerToEntities);
        // console.log(cesiumView.stylerToObj);
        for (let entity in locStylerToEntities) {
            // console.log(entity);
            if (locStylerToEntities[entity].sensorType === 'AVL') {
                for (let csEntity of cesiumView.viewer.entities._entities._array) {
                    if (csEntity._dsid === cesiumView.stylerToObj[entity]) {
                        csEntity.show = true;
                        break;
                    }
                }
            }
        }
    },
    avlHide() {
        console.log("HIDING AVL MARKERS");
        for (let entity in locStylerToEntities) {
            if (locStylerToEntities[entity].sensorType === 'AVL') {
                for (let csEntity of cesiumView.viewer.entities._entities._array) {
                    // console.log('csEntity', csEntity);
                    if (csEntity._dsid === cesiumView.stylerToObj[entity]) {
                        console.log('Found Entity...');
                        console.log(entity);
                        console.log(csEntity);
                        csEntity.show = false;
                        break;
                    }
                }
            }
        }
    },
    avlTable() {
        let elem = document.getElementById(avlTDialog.id);
        elem.style.visibility = 'visible';
        elem.style.display = 'block';
        let worker = Workers.table();
        let avlTable = tableGroup[3];
        worker.onmessage = (evt) => {
            if (evt.data.hasOwnProperty('avl')) {
                avlTable.updateOrAddData(evt.data.avl);
                avlTable.redraw(true);
            }
        };
        worker.postMessage('avl');
    },
    avlContext() {
        let menuItems;
        let show = {
            name: 'Show Icons',
            viewId: '',
            css: 'fa fa-eye',
            clickOverride: MarkerLayers.avlShow
        };
        let hide = {
            name: 'Hide Icons',
            viewId: '',
            css: 'fa fa-eye',
            clickOverride: MarkerLayers.avlHide
        };
        let table = {
            name: 'Show Table',
            viewId: '',
            css: 'fa fa-eye',
            clickOverride: MarkerLayers.avlTable
        };
        menuItems = [show, hide, table];
        let stackMenu = new OSH.UI.ContextMenu.StackMenu({
            id: 'menu-' + OSH.Utils.randomUUID(),
            groupId: '',
            items: menuItems
        });
        return stackMenu;
    },
    androidShow() {
        console.log(locStylerToEntities);
        console.log(cesiumView);
        for (let entity in locStylerToEntities) {
            if (locStylerToEntities[entity].sensorType === 'Android') {
                console.log('Found Android: ', entity);
                console.log(cesiumView.stylerToObj[entity]);
                for (let csEntity of cesiumView.viewer.entities._entities._array) {
                    if (csEntity._dsid === cesiumView.stylerToObj[entity]) {
                        console.log('Showing Android: ', locStylerToEntities[entity]);
                        csEntity.show = true;
                        locStylerToEntities[entity].dataSources[0].connect();
                        locStylerToEntities[entity].dataSources[1].connect();
                        break;
                    }
                }
            }
        }
    },
    androidHide() {
        for (let entity in locStylerToEntities) {
            if (locStylerToEntities[entity].sensorType === 'Android') {
                for (let csEntity of cesiumView.viewer.entities._entities._array) {
                    if (csEntity._dsid === cesiumView.stylerToObj[entity]) {
                        csEntity.show = false;
                        break;
                    }
                }
            }
        }
    },
    androidContext() {
        let menuItems;
        let show = {
            name: 'Show Icons',
            viewId: '',
            css: 'fa fa-eye',
            clickOverride: MarkerLayers.androidShow
        };
        let hide = {
            name: 'Hide Icons',
            viewId: '',
            css: 'fa fa-eye',
            clickOverride: MarkerLayers.androidHide
        };
        menuItems = [show, hide];
        let stackMenu = new OSH.UI.ContextMenu.StackMenu({
            id: 'menu-' + OSH.Utils.randomUUID(),
            groupId: '',
            items: menuItems
        });
        return stackMenu;
    },
    mesonetShow() {
        for (let entity in locStylerToEntities) {
            if (locStylerToEntities[entity].sensorType === 'Mesonet') {
                for (let csEntity of cesiumView.viewer.entities._entities._array) {
                    if (csEntity._dsid === cesiumView.stylerToObj[entity]) {
                        csEntity.show = true;
                        break;
                    }
                }
            }
        }
    },
    mesonetHide() {
        for (let entity in locStylerToEntities) {
            if (locStylerToEntities[entity].sensorType === 'Mesonet') {
                for (let csEntity of cesiumView.viewer.entities._entities._array) {
                    if (csEntity._dsid === cesiumView.stylerToObj[entity]) {
                        csEntity.show = false;
                        break;
                    }
                }
            }
        }
    },
    mesonetTable() {
        let elem = document.getElementById(mesoTDialog.id);
        elem.style.visibility = 'visible';
        elem.style.display = 'block';
        let worker = Workers.table();
        let mesonetTable = tableGroup[2];
        worker.onmessage = (evt) => {
            if (evt.data.hasOwnProperty('mesonet')) {
                console.log(evt.data);
                for (let mnData of evt.data.mesonet) {
                    let newData = {id: mnData.stationId, name: 'Mesonet Station: ' + mnData.stationName};
                    for (let col in mesonetColumnsID2Name) {
                        newData[col] = typeof (mnData[col]) === 'number' ? Number.parseFloat(mnData[col]).toFixed(4) : mnData[col];
                    }
                    mesonetTable.updateOrAddData([newData]);
                }
                mesonetTable.redraw(true);
            }
        };
        worker.postMessage('mesonet');
    },
    mesonetContext() {
        let menuItems;
        let show = {
            name: 'Show Icons',
            viewId: '',
            css: 'fa fa-eye',
            clickOverride: MarkerLayers.mesonetShow
        };
        let hide = {
            name: 'Hide Icons',
            viewId: '',
            css: 'fa fa-eye',
            clickOverride: MarkerLayers.mesonetHide
        };
        let table = {
            name: 'Show Table',
            viewId: '',
            css: 'fa fa-eye',
            clickOverride: MarkerLayers.mesonetTable
        };
        menuItems = [show, hide, table];
        let stackMenu = new OSH.UI.ContextMenu.StackMenu({
            id: 'menu-' + OSH.Utils.randomUUID(),
            groupId: '',
            items: menuItems
        });
        return stackMenu;
    },
    uavShow() {
        for (let entity in locStylerToEntities) {
            if (locStylerToEntities[entity].sensorType === 'UAV') {
                for (let csEntity of cesiumView.viewer.entities._entities._array) {
                    if (csEntity._dsid === cesiumView.stylerToObj[entity]) {
                        csEntity.show = true;
                        break;
                    }
                }
            }
        }
    },
    uavHide() {
        for (let entity in locStylerToEntities) {
            if (locStylerToEntities[entity].sensorType === 'Android') {
                for (let csEntity of cesiumView.viewer.entities._entities._array) {
                    if (csEntity._dsid === cesiumView.stylerToObj[entity]) {
                        csEntity.show = false;
                        break;
                    }
                }
            }
        }
    },
    uavContext() {
        let menuItems;
        let show = {
            name: 'Show Icons',
            viewId: '',
            css: 'fa fa-eye',
            clickOverride: MarkerLayers.uavShow
        };
        let hide = {
            name: 'Hide Icons',
            viewId: '',
            css: 'fa fa-eye',
            clickOverride: MarkerLayers.uavHide
        };
        menuItems = [show, hide];
        let stackMenu = new OSH.UI.ContextMenu.StackMenu({
            id: 'menu-' + OSH.Utils.randomUUID(),
            groupId: '',
            items: menuItems
        });
        return stackMenu;
    },
};

let Utilities = {
    getHubOfferings: () => {
        let xhr = new XMLHttpRequest();
        let url = 'http://' + SCIRA_SOS_ENDPT + '?service=SOS&version=2.0&request=GetCapabilities';
        let offerings;
        xhr.open('GET', url, false);
        xhr.withCredentials = true;
        xhr.onload = () => {
            let parser = new OSH.SWEXmlParser(xhr.responseText);
            let capabilities = parser.toJson();
            offerings = capabilities.Capabilities.contents.offering;
            console.log(offerings);
        };
        xhr.send();
        return offerings;
    }
};

let Tables = {
    usgsTable: (tableID, tableData) => {
        let table = new Tabulator(tableID, {
            height: 215,
            data: tableData,
            layout: "fitDataFill",
            progressiveRender: true,
            // pagination: 'local',
            // paginationSize: 5,
            // paginationAddRow: 'table',
            columns: [ //Define Table Columns
                {title: 'Name', field: 'name'},
                {title: "Water Temp", field: "wtemp", align: 'right'},
                {title: "Discharge", field: "dis", align: 'right'},
                {title: "Gage Height", field: "gh", align: 'right'},
            ],
            rowClick: function (e, row) {
                let name = row.getData().name;
                let id = name.split(' ')[2];
                console.log('USGS ID:',id);
                for (let item of treeItems) {
                    // console.log("Item: ", item);
                    if (item.entityId === id) {
                        console.log('Location Styler is: ', item.entity.locStyler);
                        let locStyler = item.entity.locStyler;
                        let viewMarker = cesiumView.stylerToObj[locStyler.id];
                        let entity = cesiumView.markers[viewMarker];
                        console.log(entity);
                        cesiumView.viewer.selectedEntity = entity;
                        cesiumView.selectedEntity = entity.locStyler.id;
                        break;
                    }
                }
            },
        });
        console.log(table);
        return table;
    },
    buoyTable: (tableID, tableData) => {
        let table = new Tabulator(tableID, {
            height: 215,
            data: tableData,
            layout: "fitDataFill",
            progressiveRender: true,
            // pagination: 'local',
            // paginationSize: 5,
            // paginationAddRow: 'table',
            columns: [ //Define Table Columns
                {title: 'Name', field: 'name'},
                {title: "Water Temp", field: "temp", align: 'right'},
                {title: "Buoy Depth", field: "depth", align: 'right'},
            ],
            rowClick: function (e, row) {
                let name = row.getData().name;
                let id = name.split(' ')[3];
                console.log('Buoy ID:',id);
                for (let item of treeItems) {
                    console.log("Item: ", item);
                    if (item.entityId === id) {
                        console.log('Location Styler is: ', item.entity.locStyler);
                        let locStyler = item.entity.locStyler;
                        let viewMarker = cesiumView.stylerToObj[locStyler.id];
                        let entity = cesiumView.markers[viewMarker];
                        // console.log(entity);
                        cesiumView.viewer.selectedEntity = entity;
                        cesiumView.selectedEntity = entity.locStyler.id;
                        break;
                    }
                }
            },
        });
        console.log(table);
        return table;
    },
    mesonetTable: (tableID, tableData) => {
        let table = new Tabulator(tableID, {
            height: 233,
            data: tableData,
            layout: "fitDataFill",
            progressiveRender: true,
            // pagination: 'local',
            // paginationSize: 5,
            // paginationAddRow: 'table',
            columns: [ //Define Table Columns
                {title: 'Name', field: 'name'},
                {title: "Temp 2m", field: "temperature2m", align: 'right'},
                {title: "Temp 9m", field: "temperature9m", align: 'right'},
                {title: "Relative Humidity", field: "relativeHumidity", align: 'right'},
                {title: "Pressure", field: "pressure", align: 'right'},
                {title: "Wind Speed", field: "windSpeed", align: 'right'},
                {title: "Wind Direction", field: "windDirection", align: 'right'},
                {title: "Wind Gust", field: "windSpeedGust", align: 'right'},
                {title: "Precipitation - 6 hr", field: "precipitation6hr", align: 'right'},
                {title: "Precipitation - 1 day", field: "precipitation1day", align: 'right'},
                {title: "Precipitation - 2 day", field: "precipitation2day", align: 'right'},
                {title: "Precipitation - 3 day", field: "precipitation3day", align: 'right'},
                {title: "Precipitation - 7 day", field: "precipitation7day", align: 'right'},
                {title: "Solar Radiation", field: "solarRadiation", align: 'right'},
                {title: "Snow Depth", field: "snowDepth", align: 'right'},
                {title: "Soil Moisture - 5cm", field: "soilMoisture5cm", align: 'right'},
                {title: "Soil Moisture - 25cm", field: "soilMoisture25cm", align: 'right'},
                {title: "Soil Moisture - 50cm", field: "soilMoisture50cm", align: 'right'},
                {title: "Soil Temperature - 5cm", field: "soilTemp5cm", align: 'right'},
                {title: "Soil Temperature - 50cm", field: "soilTemp50cm", align: 'right'},
            ],
            rowClick: function (e, row) {
                let name = row.getData().name;
                let id = name.split(' ')[2];
                console.log('Mesonet ID:',id);
                for (let item of treeItems) {
                    console.log("Item: ", item);
                    if (item.entity.name.includes('(' + id + ')')) {
                        console.log('Location Styler is: ', item.entity.locStyler);
                        let locStyler = item.entity.locStyler;
                        let viewMarker = cesiumView.stylerToObj[locStyler.id];
                        let entity = cesiumView.markers[viewMarker];
                        // console.log(entity);
                        cesiumView.viewer.selectedEntity = entity;
                        cesiumView.selectedEntity = entity.locStyler.id;
                        break;
                    }
                }
            },
        });
        console.log(table);
        return table;
    },
    avlTable: (tableID, tableData) => {
        let table = new Tabulator(tableID, {
            height: 233,
            // height: 100%,
            data: tableData,
            layout: "fitDataFill",
            // progressiveRender: true,
            // pagination: 'local',
            // paginationSize: 5,
            // paginationAddRow: 'table',
            columns: [ //Define Table Columns
                // {title: 'Name', field: 'name'},
                {title: "VIN", field: "vin", align: 'center'},
                {title: "Ignition", field: "ignition", align: 'center', formatter: 'tickCross'},
                {title: "Fleet ID", field: "fleetId", align: 'center'},
                {title: "Instant Speed", field: "instSpeed", align: 'right'},
                {title: "Average Speed", field: "avgSpeed", align: 'right'},
                {title: "Max Speed", field: "maxSpeed", align: 'right'},
                {title: "Engine Hours", field: "engineHours", align: 'right'},
                {title: "Total Gallons", field: "totalGallons", align: 'right'},
                {title: "Odometer", field: "odometer", align: 'right'},
            ],
            rowClick: function (e, row) { //trigger an alert message when the row is clicked
                let vin = row.getData().vin;
                // Find an entity that matches the vin
                // console.log(locStylerToEntities);
                // console.log(row.getData());
                // console.log(vin);
                // console.log(treeItems);
                for (let item of treeItems) {
                    // console.log("Item: ", item);
                    if (item.entityId === 'urn:vin:' + vin) {
                        console.log('Location Styler is: ', item.entity.locStyler);
                        let locStyler = item.entity.locStyler;
                        let viewMarker = cesiumView.stylerToObj[locStyler.id];
                        let entity = cesiumView.markers[viewMarker];
                        // console.log(entity);
                        cesiumView.viewer.selectedEntity = entity;
                        cesiumView.selectedEntity = entity.locStyler.id;
                        break;
                    }
                }
            },
        });
        console.log(table);
        return table;
    },
    createTableGroup(groupName, tables) {
        return {"groupName": tables};
    }
};

let Workers = {
    table: () => {
        let worker = new Worker('table-workers.js');
        return worker;
    }
};

function openTable(evt, tableName) {
    let i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tableName).style.display = "block";
    evt.currentTarget.className += " active";
    // redraw tables (needs optimization
    for (let table of tableGroup) {
        table.redraw(true);
    }
}

function csInfoTableFromFOI(foi) {
    // console.log(foi);
    let table = document.createElement("table");
    table.style.width = '100%';
    table.style.textAlign = 'left';
    // table.style.border = "1px solid #ccc";
    generateRows(foi, table);
    // console.log(table.outerHTML);

    let tableHTML = (table.outerHTML);
    return '' + tableHTML;

    function generateRows(obj, table, isBase = true) {
        let filterList = ['identifier', 'srsDimension'];

        for (let prop in obj) {
            // console.log(prop);
            if (typeof (obj[prop]) === 'function') {
            } else if (typeof (obj[prop]) === 'object' && !filterList.includes(prop)) {
                let row = document.createElement("tr");
                let heading = document.createElement("th");
                let data = document.createElement("td");
                let innerTable = document.createElement("table");
                heading.style.border = "1px solid #ccc";
                data.style.border = "1px solid #ccc";
                innerTable.style.width = '100%';
                innerTable.style.textAlign = 'left';
                heading.innerText = prop;
                row.appendChild(heading);
                data.appendChild(innerTable);
                row.appendChild(data);
                table.appendChild(row);
                generateRows(obj[prop], innerTable, false);
            } else if (!filterList.includes(prop)) {
                if (isBase || (!isBase && prop !== 'id')) {
                    let row = document.createElement("tr");
                    let heading = document.createElement("th");
                    heading.style.border = "1px solid #ccc";
                    let data = document.createElement("td");
                    heading.innerText = prop;
                    data.innerText = obj[prop];
                    data.style.border = "1px solid #ccc";
                    row.appendChild(heading);
                    row.appendChild(data);
                    table.appendChild(row);
                }
            }
        }
    }
}

OSH.DataReceiver.JSONMultiMaster = OSH.DataReceiver.DataSource.extend({
    initDataSource: function (properties) {

        if (typeof (properties.timeShift) != "undefined") {
            this.timeShift = properties.timeShift;
        }

        if (typeof properties.syncMasterTime != "undefined") {
            this.syncMasterTime = properties.syncMasterTime;
        } else {
            this.syncMasterTime = false;
        }

        if (typeof properties.bufferingTime != "undefined") {
            this.bufferingTime = properties.bufferingTime;
        }

        if (typeof properties.timeOut != "undefined") {
            this.timeOut = properties.timeOut;
        }

        if (typeof (properties.connect) == "undefined") {
            properties.connect = true;
        }

        // New Code to handle the master-subscriber relationship
        if (typeof (properties.msgKey) == "undefined") {
            // need to throw some sort of error...
            console.error('Must define an Identifier for a JSONMulti DataSource');
            this.msgKey = null;
        } else {
            this.msgKey = properties.msgKey;
        }

        if (typeof (properties.targetList) == "undefined") {
            // need to throw some sort of error...
            console.error('Must define a targetList for a JSONMulti DataSource');
            this.targetList = null;
        } else {
            this.targetList = properties.targetList;
            // console.log(this.targetList);
        }

        this.subscribers = {};
        for (let target of this.targetList) {
            // console.log('Creating subscriber:', target);
            this.subscribers[target] = new OSH.DataReceiver.JSONMultiSubscriber(target + '-subbed-ds', properties);
            this.subscribers[target].connect();
        }
        console.log(this.subscribers);

        // checks if type is WebSocket
        if (properties.protocol.startsWith('ws')) {
            this.connector = new OSH.DataConnector.WebSocketDataConnector(this.buildUrl(properties));
            // connects the callback
            this.connector.onMessage = this.onMessage.bind(this);
        } else if (properties.protocol.startsWith('http')) {
            this.connector = new OSH.DataConnector.AjaxConnector(this.buildUrl(properties));
            this.connector.responseType = 'arraybuffer';
            // connects the callback
            this.connector.onMessage = this.onMessage.bind(this);
        }
    },

    parseTimeStamp: function (data) {
        var rec = String.fromCharCode.apply(null, new Uint8Array(data));
        return new Date(JSON.parse(rec)['time']).getTime();
    },

    parseData: function (data) {
        var rec = JSON.parse(String.fromCharCode.apply(null, new Uint8Array(data)));

        var result = {};

        for (var key in rec) {
            if (key !== 'time') {
                result[key] = rec[key];
            }
        }
        //Todo: remove
        // console.log(result);
        return result;
    },

    onMessage: function (data) {
        // console.log('MultiSource onMessage method called');
        // I think this is the point of interception
        let parsedTS = this.parseTimeStamp(data) + this.timeShift;
        let parsedData = this.parseData(data);
        let searchKey = parsedData[this.msgKey];
        if (typeof (this.subscribers[searchKey]) !== 'undefined') {
            // console.log(parsedData);
            // console.log(this.subscribers[searchKey]);
            this.subscribers[searchKey].onMessage(parsedTS, parsedData);
        }
        // Note: On data is overridden when the data receiver is added to a controller... No need to touch
        this.onData({
            timeStamp: parsedTS,
            data: parsedData
        });
    },

    buildUrl: function (properties) {
        var url = "";

        // adds protocol
        url += properties.protocol + "://";

        // adds endpoint url
        url += properties.endpointUrl + "?";

        // adds service
        url += "service=" + properties.service + "&";

        // adds version
        url += "version=2.0&";

        // adds request
        url += "request=GetResult&";

        // adds offering
        url += "offering=" + properties.offeringID + "&";

        // adds feature of interest urn
        if (properties.foiURN !== null && properties.foiURN !== undefined && properties.foiURN !== '') {
            url += 'featureOfInterest=' + properties.foiURN + '&';
        }

        // adds observedProperty
        url += "observedProperty=" + properties.observedProperty + "&";

        // adds temporalFilter
        var startTime = properties.startTime;
        var endTime = properties.endTime;
        if (startTime !== "now" && this.timeShift != 0) {
            // HACK: don't do it for old Android dataset that is indexed differently
            if (properties.offeringID !== "urn:android:device:060693280a28e015-sos") {
                // apply time shift
                startTime = new Date(Date.parse(startTime) - this.timeShift).toISOString();
                endTime = new Date(Date.parse(endTime) - this.timeShift).toISOString();
            }
        }
        if (properties.hasOwnProperty('endTime')) {
            url += "temporalFilter=phenomenonTime," + startTime + "/" + endTime + "&";
        } else {
            url += "temporalFilter=phenomenonTime," + startTime + "&";
        }

        if (properties.replaySpeed) {
            // adds replaySpeed
            url += "replaySpeed=" + properties.replaySpeed;
        }

        // adds responseFormat (mandatory)
        url += "&responseFormat=application/json";

        return url;
    }
});

OSH.DataReceiver.JSONMultiSubscriber = OSH.DataReceiver.DataSource.extend({
    initDataSource: function (properties) {
        if (typeof (properties.timeShift) != "undefined") {
            this.timeShift = properties.timeShift;
        }

        if (typeof properties.syncMasterTime != "undefined") {
            this.syncMasterTime = properties.syncMasterTime;
        } else {
            this.syncMasterTime = false;
        }

        if (typeof properties.bufferingTime != "undefined") {
            this.bufferingTime = properties.bufferingTime;
        }

        if (typeof properties.timeOut != "undefined") {
            this.timeOut = properties.timeOut;
        }

        if (typeof (properties.connect) == "undefined") {
            properties.connect = true;
        }
    },

    onMessage: function (timestamp, data) {
        // console.log('Subscriber received data:', data);
        // Inputs are already parsed from parent
        this.onData({
            timeStamp: timestamp,
            data: data
        });
    },

    onData: function (data) {
        console.log('onData:', data, "\nIf this is reached, then we aren't getting added to the receiver controller");
    },

    connect: function () {
        this.connected = true;
    }

});

function CesiumSelectionChgListener() {
    console.log("Selected Entity Changed");
    // get selected marker position
    let camera = cesiumView.viewer.camera;
    let selectedEntity = cesiumView.viewer.selectedEntity;
    // console.log(selectedEntity);
    if (zoomOnSelect && cesiumView.viewer.selectedEntity !== 'undefined' && selectedEntity._position._value.x !== 6378137) {
        console.log(selectedEntity);
        cesiumView.viewer.zoomTo(selectedEntity, new Cesium.Cartesian3(0, 0, 1000))
    }
}

function ZoomSelectionToggle() {
    let btn = document.getElementById('zoom-toggle-btn');
    if (zoomOnSelect) {
        zoomOnSelect = false;
        btn.className = 'btn-inactive'
    } else {
        zoomOnSelect = true;
        btn.className = 'btn-active'
    }
}
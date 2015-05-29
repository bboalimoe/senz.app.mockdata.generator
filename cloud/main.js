var _ = require('underscore');

var Log = AV.Object.extend('Log');
var Installation = AV.Object.extend('_Installation');

var TEST_INSTALLATION = new Installation({id: "5563f6ace4b032867899bcdf"});

function motionLog() {
    var promise = new AV.Promise();

    var lastTime = new Date().getTime();
    var events = _.times(_.random(50, 70), function () {
        return {
            accuracy: 3,
            sensorName: "acc",
            "timestamp": (lastTime += 160),
            values: [
                0.0098066497594118712,
                0.2059396505355835,
                9.855683326721191
            ]
        };
    });

    var log = new Log();
    log.set('installation', TEST_INSTALLATION);
    log.set('type', 'sensor');
    log.set('source', 'ti.nexus4');
    log.set('timestamp', new Date().getTime());
    log.set('value', {
        events: events
    });

    promise.resolve(log);

    return promise;
}

function locationLog() {
    var promise = new AV.Promise();

    var log = new Log();
    log.set('installation', TEST_INSTALLATION);
    log.set('type', 'location');
    log.set('source', 'baidu.location_sdk');
    log.set('timestamp', new Date().getTime());
    log.set('value', {"address": "北京市海淀区西直门北大街32院-1"});
    log.set('location', new AV.GeoPoint({latitude: 39.95908, longitude: 116.362574}));

    promise.resolve(log);
    return promise;
}

var testAudioFile;
new AV.Query('_File').get('5562cd0ae4b0fa5c84e6f5a2').then(
    function (file) {
        console.log('file,%s', file);
        testAudioFile = file;
    }, function (err) {
        console.error(err);
    }
)
function soundLog() {
    var promise = new AV.Promise();

    var log = new Log();
    log.set('installation', TEST_INSTALLATION);
    log.set('type', 'mic');
    log.set('source', 'internal');
    log.set('timestamp', new Date().getTime());
    log.set('value', {"audioFormat": "m4a", "audioLength": 10});
    log.set('file', testAudioFile);

    promise.resolve(log);
    return promise;
}

function saveLog(result) {
    console.log('saved,%s', JSON.stringify(result));
    return result.save();
}


AV.Cloud.define('generateMockLog', function (request, response) {
    console.log('generate mock log,', request.params.installationId);
    // Generate log simulating human behavior

    var promises = [];
    promises.push(motionLog().then(saveLog));
    promises.push(locationLog().then(saveLog));
    promises.push(soundLog().then(saveLog));
    AV.Promise.all(promises).then(
        function (motion, location, sound) {
            console.log('all saved,%s,%s,%s', motion, location, sound);
        }, function (err) {
            console.error(err);
        })

    response.success('generated');
});



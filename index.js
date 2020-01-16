var appletv = require('node-appletv-x');

var Service, Characteristic;
module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-appletv-onoff-switch", "appletvswitch", AppleTVAccessory);
}

function AppleTVAccessory(log, config) {
    this.log = log;
    this.name = config.name;
    this.credentials = config.credentials;
    this.updateRate = 5000;
    this.powerState = false;

    this.services = [];

    this.atvService = new Service.Television(this.name, 'atvService');
    this.atvService.setCharacteristic(Characteristic.ConfiguredName, this.name);
    this.atvService
        .setCharacteristic(
            Characteristic.SleepDiscoveryMode,
            Characteristic.SleepDiscoveryMode.ALWAYS_DISCOVERABLE
        );
    this.atvService
        .getCharacteristic(Characteristic.Active)
        .on('set', this.setPowerState.bind(this))
        .on('get', this.getPowerState.bind(this));

    this.services.push(this.atvService);

    this.atvConnect();
}

AppleTVAccessory.prototype.getServices = function () {
    this.informationService = new Service.AccessoryInformation();
    this.informationService
        .setCharacteristic(Characteristic.Manufacturer, "Apple")
        .setCharacteristic(Characteristic.Model, "Apple TV")
        .setCharacteristic(Characteristic.SerialNumber, "ST7FZN1NSXG6")
        .setCharacteristic(Characteristic.FirmwareRevision, '13.3');
    this.services.push(this.informationService);
    return this.services;
}

AppleTVAccessory.prototype.atvConnect = function () {
    var that = this;
    var credentials = appletv.parseCredentials(this.credentials);
    appletv.scan(credentials.uniqueIdentifier)
        .then(function (devices) {
            that.device = devices[0];
            that.device.on('error', function (error) {
                that.log("ERROR: " + error.message);
                that.log("ERROR: " + error.stack);
            });
            return that.device.openConnection(credentials);
        })
        .then(function (device) {
            that.log("Connected to AppleTV: " + that.name);
            that.updateStatus();
        })
        .catch(function (error) {
            that.log("ERROR: " + error);
        });
}

AppleTVAccessory.prototype.updateStatus = function () {
    var that = this;
    setTimeout(function () {
        that.checkATVStatus();
        that.updateStatus();
    }, this.updateRate);
}

AppleTVAccessory.prototype.checkATVStatus = function () {
    var that = this;

    that.device.sendIntroduction().then(function (deviceInfo) {
        var currentPowerState = deviceInfo.payload.logicalDeviceCount;

        if (currentPowerState >= 1) {
            that.updatePowerState(true);
        } else {
            that.updatePowerState(false);
        }
    })
    .catch(function (error) {
        that.log("ERROR: " + error);
    });
}

AppleTVAccessory.prototype.getPowerState = function (callback) {
    callback(null, this.powerState);
}

AppleTVAccessory.prototype.updatePowerState = function (state) {
    if (this.powerState != state) {
        this.powerState = state;
        this.atvService.getCharacteristic(Characteristic.Active).updateValue(this.powerState);
    }
}

AppleTVAccessory.prototype.setPowerState = function (state, callback) {
    var that = this;

    if (this.powerState) {
        that.device.sendKeyCommand(appletv.AppleTV.Key.LongTv).then(function () {
            that.device.sendKeyCommand(appletv.AppleTV.Key.Select).then(function () {
                that.log("AppleTV: " + that.name + " is turned off");
                that.getPowerState(callback);
            }).catch(function (error) {
                that.log("ERROR: " + error);
            });
        }).catch(function (error) {
            that.log("ERROR: " + error);
        });
    } else {
        that.device.sendKeyCommand(appletv.AppleTV.Key.Tv).then(function () {
            that.log("AppleTV: " + that.name + " is turned on");
            that.getPowerState(callback);
        }).catch(function (error) {
            that.log("ERROR: " + error);
        });
    }
}
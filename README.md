# homebridge-appletv-onoff-switch
This is a plugin for [homebridge](https://github.com/nfarina/homebridge). 
Simple Homebrdige plugin to turn on and turn off your Apple TV with real On/Off status.

# Disclaimer

The code delivered AS-IS, due to lack of time I am not planning to provide any support, feel free to do with it whatever you want. :)

# Features

* Apple TV will be presented as a TV device in Home.app
* Apple TV will report a real On/Off status. Status is based on logicalDeviceCount, not a bulletproof solution, but currently is the best I've found.

# Installation

1. Install homebridge (if not already installed) using: `npm install -g homebridge`
2. Install this plugin using: `sudo npm install -g homebridge-appletv-onoff-switch --unsafe-perm`
3. Pair your node-appletv-x with your Apple TV using: `/<node_modules_folder>/homebridge-appletv-onoff-switch/node_modules/node-appletv-x/bin/appletv pair` 
* For example: `/usr/lib/node_modules/homebridge-appletv-onoff-switch/node_modules/node-appletv-x/bin/appletv pair`
4. Update your configuration file. See below for a sample.

# Configuration

```
"accessories": [
    {
        "accessory": "appletvswitch",
        "name": "<Your_Apple_TV_Name>",
        "credentials": "<Your_Apple_TV_Pairing_Token>"
    }
],
```
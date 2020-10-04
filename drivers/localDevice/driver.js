'use strict';

const Homey = require('homey');
const awair = require('../index.js');
const { ManagerSettings } = require('homey');

class MyLocalAwairDriver extends Homey.Driver {
	
	onInit() {
		this.log('Local device driver has been inited');
	}

	onPair(socket) {

        // this is called when the user presses save settings button in pair.html
        socket.on('get_devices', (device_data, callback) => {
			this.log("back from the pairing page")
            callback(null, device_data);
        });

        // this happens when user clicks away the pairing windows
        socket.on('disconnect', () => {
            this.log("localDevice - Pairing is finished (done or aborted) ");
        })

    } // end onPair
}

module.exports = MyLocalAwairDriver;
'use strict';

const Homey = require('homey');
const awair = require('../index.js');
const { ManagerSettings } = require('homey');

Date.prototype.timeNow = function(){ 
	return ((this.getHours() < 10)?"0":"") + ((this.getHours()>12)?(this.getHours()-12):this.getHours()) +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() + " " + ((this.getHours()>12)?('PM'):'AM');
};

class MyAwairDriver extends Homey.Driver {
	
	onInit() {
		this.log('MyAwairDriver has been inited');
	}

	onPair( socket ) {
		let devices = []
		let apikey = ManagerSettings.get('apikey')
		this.log("key " + apikey);

		socket.on('list_devices', function( data, callback ) {
			if ( apikey == null ) {
				devices = [];
			    // socket.emit('list_devices', devices );
				callback( new Error('Please provide first the apikey in the app settings!') );
			} else {
				// emit when devices are still being searched
				awair.getDevices(apikey).then(data => {
					console.log("apikey " + apikey);
					let currentdate =new Date().timeNow();
					console.log("refresh now " + currentdate);
			
					console.log("Received data");
					console.log("object "+ JSON.stringify(data));

					for ( var i = 0; i < data.devices.length; i++) {
						let obj = data.devices[i];
						console.log("object: " + obj);
						console.log("device: " + obj.name);
						console.log("deviceUUID: " + obj.deviceUUID);

						var device =  { "name": obj.name,
						                "data": {
															"id": obj.deviceUUID,
															"name": obj.name,
															"apikey": apikey,
															"deviceId": obj.deviceId,
															"deviceType": obj.deviceType
											      }
									        };
						devices.push(device);
						console.log(devices);
					}	
					socket.emit('list_devices', devices );
					callback( null, devices );
				})
				
				.catch(error => {
						this.log(error);
				});
			}
		});
	  }
}

module.exports = MyAwairDriver;
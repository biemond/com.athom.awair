import * as Homey from 'homey';
const awair = require('../index.js');

class MyAwairDriver extends Homey.Driver {
	/**
	 * onInit is called when the driver is initialized.
	 */
	async onInit() {
		this.log('MyAwairDriver has been initialized');
	}

	async onPair(session: Homey.Driver.PairSession) {

		let apikey = this.homey.settings.get('apikey')
		console.log("key " + apikey);

		session.setHandler("list_devices", async function () {
			if (apikey == null) {
				new Error('Please provide first the apikey in the app settings!');
				return [];
			} else {
				// emit when devices are still being searched
				return awair.getDevices(apikey).then((data: { devices: string | any[]; }) => {
					let devices: Object[] = [];
					console.log("apikey " + apikey);

					console.log("Received data");
					console.log("object " + JSON.stringify(data));

					for (var i = 0; i < data.devices.length; i++) {
						let obj = data.devices[i];
						console.log("device: " + obj.name);
						console.log("deviceUUID: " + obj.deviceUUID);

						var device: Object = {
							name: obj.name,
							data: {
								id: obj.deviceUUID,
								name: obj.name,
								apikey: apikey,
								deviceId: obj.deviceId,
								deviceType: obj.deviceType
							}
						};
						devices.push(device);
					}
					console.log(devices);
					return devices;
				});
			}
		});
	}
}

module.exports = MyAwairDriver;

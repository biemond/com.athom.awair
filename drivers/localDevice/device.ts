import Homey from 'homey';
const localAwair = require('../localAwair.js');

const RETRY_INTERVAL = 30 * 1000;
let timer: NodeJS.Timer;

class MyLocalAwairDriver extends Homey.Device {

  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('MyLocalAwairDriver has been initialized');
    let name = this.getData().id;
    this.log("device name id " + name);
    this.log("device name " + this.getName());

    this.pollLocalAwairDevice();

    timer = this.homey.setInterval(() => {
      // poll device state from invertor
      this.pollLocalAwairDevice();
    }, RETRY_INTERVAL);

    let conditionScoreOutput = this.homey.flow.getConditionCard('score_output');
    conditionScoreOutput.registerRunListener((args, state) => {
      let result = (this.conditionScoreOutputToString(this.getCapabilityValue('score')) == args.argument_main)
      return Promise.resolve(result);
    });

  }

  conditionScoreOutputToString(score: number) {
    if (score < 40) {
      return 'verybad';
    } else if (score < 60) {
      return 'bad';
    } else if (score < 80) {
      return 'average';
    } else {
      return 'good';
    }
  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('MyLocalAwairDriver has been added');
  }

  /**
   * onSettings is called when the user updates the device's settings.
   * @param {object} event the onSettings event data
   * @param {object} event.oldSettings The old settings object
   * @param {object} event.newSettings The new settings object
   * @param {string[]} event.changedKeys An array of keys changed since the previous version
   * @returns {Promise<string|void>} return a custom message that will be displayed
   */
  async onSettings({ oldSettings: { }, newSettings: { }, changedKeys: { } }): Promise<string | void> {
    this.log('MyLocalAwairDriver settings where changed');
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name: string) {
    this.log('MyLocalAwairDriver was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('MyLocalAwairDriver has been deleted');
    this.homey.clearInterval(timer);
  }

  pollLocalAwairDevice() {
    this.log('exec pollLocalAwairDevice');

    localAwair.getCurrentData(this.getSettings()).then((data: any) => {

      let result = data;
      if (result != "ERROR") {

        console.log("Received data " + JSON.stringify(result));
        let lux: boolean = false;
        let co2: boolean = false;

        let strUpdateDate = result.timestamp;
        console.log("last date " + strUpdateDate.substring(11, 24));
        if (result.hasOwnProperty('temp')) {
          if (this.hasCapability('measure_temperature'))  {
            this.setCapabilityValue('measure_temperature', result.temp);
          }
        }
        if (result.hasOwnProperty('co2')) {
          if (result.co2 > 0) {
            co2 = true;
            if (this.hasCapability('measure_co2'))  {
              this.setCapabilityValue('measure_co2', result.co2);
            }
          }
        }
        if (result.hasOwnProperty('humid')) {
          if (this.hasCapability('measure_humidity'))  {
            this.setCapabilityValue('measure_humidity', result.humid);
          }
        }
        if (result.hasOwnProperty('pm25')) {
          if (this.hasCapability('measure_pm25'))  {
            this.setCapabilityValue('measure_pm25', result.pm25);
          }
        }
        if (result.hasOwnProperty('voc')) {
          if (this.hasCapability('measure_voc'))  {
            this.setCapabilityValue('measure_voc', result.voc);
          }
        }
        if (result.hasOwnProperty('lux')) {
          lux = true;
          if (this.hasCapability('measure_luminance'))  {
            this.setCapabilityValue('measure_luminance', result.lux);
          }
        }
        this.setCapabilityValue('latest_upload_date', strUpdateDate.substring(11, 24));
        if (co2 == false) {
          console.log('remove co2');
          this.removeCapability('measure_co2');
        }
        if (lux == false) {
          console.log('remove lux');
          this.removeCapability('measure_luminance');
        }
        let score = result.score;
        console.log(this.getName());
        if (score > 0) {
          // if (score != this.getCapabilityValue('score')) {
            let tokens = {
              "score": score,
              "device": this.getName()
            };
            if (this.getCapabilityValue('score') < 80 && score >= 80) {
              this.homey.flow.getTriggerCard('ScoreAbove80').trigger(tokens);
            } else if (this.getCapabilityValue('score') >= 80
              && score >= 60
              && score < 80) {
              this.homey.flow.getTriggerCard('ScoreBetween60-80').trigger(tokens);
            } else if (this.getCapabilityValue('score') >= 60
              && score < 60) {
              this.homey.flow.getTriggerCard('ScoreBelow60').trigger(tokens);
            }
          // }
          this.setCapabilityValue('score', score);
        }
      }
    })
  }
}

module.exports = MyLocalAwairDriver;


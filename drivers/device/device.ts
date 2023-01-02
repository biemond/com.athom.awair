import Homey from 'homey';
const awair = require('../index.js');


const RETRY_INTERVAL = 300 * 1000;
let timer: NodeJS.Timer;

class MyAwairDevice extends Homey.Device {

  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('MyAwairDevice has been initialized');

    let name = this.getData().id;
    this.log("device name id " + name);
    this.log("device name " + this.getName());

    this.pollAwairDevice();

    timer = this.homey.setInterval(() => {
      // poll device state from invertor
      this.pollAwairDevice();
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
    this.log('MyAwairDevice has been added');
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
    this.log('MyAwairDevice settings where changed');
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name: string) {
    this.log('MyAwairDevice was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('MyAwairDevice has been deleted');
    this.homey.clearInterval(timer);
  }

  pollAwairDevice() {
    let settings = this.getData();
    awair.getCurrentData(settings).then((data: any) => {

      this.log("refresh now " + settings);
      if (data != "ERROR" && JSON.stringify(data.data[0]) !== undefined) {
        console.log("object " + JSON.stringify(data.data[0]));
        let strUpdateDate = data.data[0].timestamp;
        console.log("last date " + strUpdateDate.substring(11, 24));
        let lux: boolean = false;
        let co2: boolean = false;
        for (var i = 0; i < data.data[0].indices.length; i++) {
          let obj = data.data[0].indices[i];
          console.log("comp: " + obj.comp);
          console.log("value: " + obj.value);
          if (obj.value >= 0) {
            if (obj.comp == "temp") {
              if (this.hasCapability('condition_temp'))  {
                this.setCapabilityValue('condition_temp', obj.value);
              }
            }
            if (obj.comp == "co2") {
              co2 = true;
              if (this.hasCapability('condition_co2'))  {
                this.setCapabilityValue('condition_co2', obj.value);
              }  
            }
            if (obj.comp == "humid") {
              if (this.hasCapability('condition_humid'))  {
                this.setCapabilityValue('condition_humid', obj.value);
              }  
            }
            if (obj.comp == "pm25") {
              if (this.hasCapability('condition_pm25'))  {
                this.setCapabilityValue('condition_pm25', obj.value);
              }  
            }
            if (obj.comp == "vox") {
              if (this.hasCapability('condition_vox'))  {
                this.setCapabilityValue('condition_vox', obj.value);
              }  
            }
            if (obj.comp == "lux") {
              lux = true;
              if (this.hasCapability('condition_lux'))  {
                this.setCapabilityValue('condition_lux', obj.value);
              }
            }
          }
        }

        for (var i = 0; i < data.data[0].sensors.length; i++) {
          let obj = data.data[0].sensors[i];
          console.log("comp: " + obj.comp);
          console.log("value: " + obj.value);
          if (obj.comp == "temp") {
            if (this.hasCapability('measure_temperature'))  {
              this.setCapabilityValue('measure_temperature', obj.value);
            }
          }
          if (obj.comp == "co2") {
            co2 = true;
            if (this.hasCapability('measure_co2'))  {
              this.setCapabilityValue('measure_co2', obj.value);
            }
          }
          if (obj.comp == "humid") {
            if (this.hasCapability('measure_humidity'))  {
              this.setCapabilityValue('measure_humidity', obj.value);
            }
          }
          if (obj.comp == "pm25") {
            if (this.hasCapability('measure_pm25'))  {
              this.setCapabilityValue('measure_pm25', obj.value);
            }  
          }
          if (obj.comp == "voc") {
            if (this.hasCapability('measure_voc'))  {
              this.setCapabilityValue('measure_voc', obj.value);
            }
          }
          if (obj.comp == "lux") {
            lux = true;
            if (this.hasCapability('measure_luminance'))  {
              this.setCapabilityValue('measure_luminance', obj.value);
            }  
          }
        }
        if (co2 == false) {
          console.log('remove co2');
          this.removeCapability('measure_co2');
          this.removeCapability('condition_co2');
        }
        if (lux == false) {
          console.log('remove lux');
          this.removeCapability('measure_luminance');
          this.removeCapability('condition_lux');
        }

        this.setCapabilityValue('latest_upload_date', strUpdateDate.substring(11, 24));
        let score = data.data[0].score;
        console.log(this.getName() + " score " + score + " old score " + this.getCapabilityValue('score'));
        
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
          this.setCapabilityValue('score', score);
          // }
        }
      }
    })
  }

}

module.exports = MyAwairDevice;

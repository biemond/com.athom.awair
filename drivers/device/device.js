'use strict';

const Homey = require('homey');
const { ManagerSettings } = require('homey');
const awair = require('index.js');

Date.prototype.timeNow = function(){ 
    return ((this.getHours() < 10)?"0":"") + ((this.getHours()>12)?(this.getHours()-12):this.getHours()) +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() + " " + ((this.getHours()>12)?('PM'):'AM');
};

class MyAwairDevice extends Homey.Device {

	onInit() {
		this.log('MyAwairDevice has been inited');

        let settings = this.getData();
        let name = this.getData().id;
        let cronName = this.getData().id.toLowerCase();
		this.log("settings " + settings);

        Homey.ManagerCron.getTask(cronName)
            .then(task => {
                this.log("The task exists: " + cronName);
                task.on('run', settings => this.pollAwairDevice(settings));
            })
            .catch(err => {
                if (err.code == 404) {
                    this.log("The task has not been registered yet, registering task: " + cronName);
                    Homey.ManagerCron.registerTask(cronName, "*/5 * * * *", settings)
                        .then(task => {
                            task.on('run', settings => this.pollAwairDevice(settings));
                        })
                        .catch(err => {
                            this.log('problem with registering cronjob: ${err.message}');
                        });
                } else {
                    this.log('other cron error: ${err.message}');
                }
            });
        this.pollAwairDevice(settings);

        this._flowTriggerScoreAbove80 = new Homey.FlowCardTrigger('ScoreAbove80').register();
        this._flowTriggerScoreBetween6080 = new Homey.FlowCardTrigger('ScoreBetween60-80').register();
        this._flowTriggerScoreBelow60 = new Homey.FlowCardTrigger('ScoreBelow60').register();
        this._conditionScoreOutput = new Homey.FlowCardCondition('score_output').register().registerRunListener((args, state) => {
            let result = (this.conditionScoreOutputToString(this.getCapabilityValue('score')) == args.argument_main) 
            return Promise.resolve(result);
        }); 
	}

    conditionScoreOutputToString(score) {
        if ( score < 40 ) {
            return 'verybad';
        } else if ( score < 60 ) {
            return 'bad';
        } else if ( score < 80 ) {
            return 'average';
        } else {
            return 'good';
        }
    }

    // flow triggers
    flowTriggerScoreAbove80(tokens) {
        this._flowTriggerScoreAbove80
            .trigger(tokens)
            .then(this.log("flowTriggerScoreAbove80"))
            .catch(this.error)
    }

    // flow triggers
    flowTriggerScoreBetween6080(tokens) {
        this._flowTriggerScoreBetween6080
            .trigger(tokens)
            .then(this.log("flowTriggerScoreBetween6080"))
            .catch(this.error)
    }
    // flow triggers
    flowTriggerScoreBelow60(tokens) {
        this._flowTriggerScoreBelow60
            .trigger(tokens)
            .then(this.log("flowTriggerScoreBelow60"))
            .catch(this.error)
    }
    
    onDeleted() {

        let id = this.getData().id;
        let name = this.getData().id;
        let cronName = name.toLowerCase();
        this.log('Unregistering cron:', cronName);
        Homey.ManagerCron.unregisterTask(cronName, function (err, success) {});
        this.log('device deleted:', id);

    } // end onDeleted


	pollAwairDevice(settings) {
		awair.getCurrentData(settings).then(data => {
            let currentdate =new Date().timeNow();
			this.log("refresh now " + currentdate);
			console.log("Received data " + JSON.stringify(data));
            if (data.data != null){
                console.log("object "+ JSON.stringify(data.data[0]));
                let strUpdateDate = data.data[0].timestamp;
                console.log("last date " +  strUpdateDate.substring(11,24));
    
                this.setCapabilityValue('condition_temp', data.data[0].indices[0].value);
                this.setCapabilityValue('condition_co2', data.data[0].indices[2].value);
                this.setCapabilityValue('condition_humid', data.data[0].indices[1].value);
                this.setCapabilityValue('condition_pm25', data.data[0].indices[4].value);
                this.setCapabilityValue('condition_voc', data.data[0].indices[2].value);
                this.setCapabilityValue('sensor_temp', data.data[0].sensors[0].value);
                this.setCapabilityValue('sensor_co2', data.data[0].sensors[2].value);
                this.setCapabilityValue('sensor_humid', data.data[0].sensors[1].value);
                this.setCapabilityValue('sensor_pm25', data.data[0].sensors[4].value);
                this.setCapabilityValue('sensor_voc', data.data[0].sensors[2].value);
                this.setCapabilityValue('latest_upload_date', strUpdateDate.substring(11,24));

                let score = data.data[0].score;
                this.setCapabilityValue('score',score);
                let tokens = {
                    "score": score,
                    "device": settings.name
                };
                if ( this.getCapabilityValue('score') < 80  && score >= 80 ) {
                    this.flowTriggerScoreAbove80(tokens);
                } else if ( this.getCapabilityValue('score') >= 80 
                       && score >= 60 
                       && score < 80 ) {
                    this.flowTriggerScoreBetween6080(tokens);
                } else if ( this.getCapabilityValue('score') >= 60 
                       && score < 60 ) {
                    this.flowTriggerScoreBelow60(tokens);
                }
            }
		})
	}
}

module.exports = MyAwairDevice;
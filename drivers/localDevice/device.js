'use strict';

const Homey = require('homey');
const { ManagerSettings } = require('homey');
const localAwair = require('../localAwair.js');

Date.prototype.timeNow = function(){ 
    return ((this.getHours() < 10)?"0":"") + ((this.getHours()>12)?(this.getHours()-12):this.getHours()) +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() + " " + ((this.getHours()>12)?('PM'):'AM');
};

class MyLocalAwairDriver extends Homey.Device {

	onInit() {
		this.log('MyLocalAwairDriver has been inited');

        let settings = this.getData();

        this.log('create cronjob');
        let name = this.getData().id;
        this.log("name " + name );
        let cronName = this.getData().id.toLowerCase();
        this.log('cronjob: '+cronName);

        Homey.ManagerCron.getTask(cronName)
            .then(task => {
                this.log("The task exists: " + cronName);
                this.log('Unregistering cron:', cronName);
                Homey.ManagerCron.unregisterTask(cronName, function (err, success) {});
                Homey.ManagerCron.registerTask(cronName,  "*/1 * * * *", settings)
                .then(task => {
                    task.on('run', settings => this.pollLocalAwairDevice(settings));
                })
                .catch(err => {
                    this.log('problem with registering cronjob: ${err.message}');
                });            
            })
            .catch(err => {
                if (err.code == 404) {
                    this.log("The task has not been registered yet, registering task: " + cronName);
                    Homey.ManagerCron.registerTask(cronName,  "*/1 * * * *", settings)
                        .then(task => {
                            task.on('run', settings => this.pollLocalAwairDevice(settings));
                        })
                        .catch(err => {
                            this.log('problem with registering cronjob: ${err.message}');
                        });
                } else {
                    this.log('other cron error: ${err.message}');
                }
            });
        this.pollLocalAwairDevice(settings)

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


	pollLocalAwairDevice(settings) {
        this.log('exec pollLocalAwairDevice');
        localAwair.getCurrentData(settings).then(data => {
            let currentdate =new Date().timeNow();
            this.log("refresh now " + currentdate);
            let result = data;
            if (result != "ERROR"){

                console.log("Received data " + JSON.stringify(result));
                

                let strUpdateDate = result.timestamp;
                console.log("last date " +  strUpdateDate.substring(11,24));
                if ( result.hasOwnProperty('temp')) {
                    this.setCapabilityValue('measure_temp', result.temp);
                }
                if ( result.hasOwnProperty('co2')) {
                    this.setCapabilityValue('measure_co2', result.co2);
                }
                if ( result.hasOwnProperty('humid')) {
                    this.setCapabilityValue('measure_humid', result.humid);
                }
                if ( result.hasOwnProperty('pm25')) {
                    this.setCapabilityValue('measure_pm25', result.pm25);
                }
                if ( result.hasOwnProperty('vox')) {
                    this.setCapabilityValue('measure_voc', result.vox);
                }                                                            
                if ( result.hasOwnProperty('lux')) {
                    this.setCapabilityValue('measure_lux', result.lux);
                }  

                this.setCapabilityValue('latest_upload_date', strUpdateDate.substring(11,24));

                let score = result.score;
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

module.exports = MyLocalAwairDriver;
(function () {

    // main settings
    const https = require('https')
    var options = {
        protocol: 'https:',
        hostname: 'developer-apis.awair.is',
        path: '/dummy',
        headers: {}
    };

    var awair = exports;

    // active functions()  -------------------------------------  active functions()  --------------------------------------------

    awair.getDevices = function getDevices(apikey) {
        let url = '/v1/users/self/devices';

        return new Promise((resolve, reject) => {
            getData(url, apikey, (error, jsonobj) => {
                if (jsonobj) {
                    resolve(jsonobj);
                } else {
                    reject(error);
                }
            });
        });
    }

    awair.getCurrentData = function getCurrentData(settings) {
        let url = '/v1/users/self/devices/'+settings.deviceType+'/'+settings.deviceId+'/air-data/latest?fahrenheit=false';

        return new Promise((resolve, reject) => {
            getData(url, settings.apikey, (error, jsonobj) => {
                if (jsonobj) {
                    resolve(jsonobj);
                } else {
                    console.log("problem with request: "+ error);
                    reject(error);
                }
            });
        });
    }

    function getData(url, token, callback) {
        options.path = url;
        options.headers = {
            'User-Agent': 'Node.js http.min',
            'Accept': 'application/json',
            'Authorization': 'Bearer '+ token
        };

        console.log('url ' + url);

        const req = https.request(options, res => {
            console.log('-------------------')    
            console.log(`statusCode: ${res.statusCode}`)

            let body = "";
            let sharedText = "";
            res.on("data", data => {
              body += data;
            });
            res.on("end", () => {                
                if (res.statusCode == 200 ){
                    try {
                        sharedText = JSON.parse(body.toString());
                    }
                    catch(error) {
                        sharedText = "ERROR";
                    }
                } else {
                    sharedText = "ERROR";
                }    
                return callback(null, sharedText); 
            })
        })
          
        req.on('error', error => {
            console.log('error' + error);
            req.abort();
            return callback(null, "ERROR"); 
        })
        req.on('timeout', function () {
            console.log('timeout');
            req.abort();
            return callback(null, "ERROR"); 
          }
        );
        req.setTimeout(3000);
        req.end()
    }

})();


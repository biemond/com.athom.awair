(function () {

    // main settings
    // var http = require('http.min');
    const https = require('http')
    var options = {
        protocol: 'http:',
        path: '/air-data/latest',
        method: 'GET',
        headers: {}
    };

    var localAwair = exports;

    // active functions()  -------------------------------------  active functions()  --------------------------------------------

    localAwair.getCurrentData = function getCurrentData(settings) {

        return new Promise((resolve, reject) => {
            getLocalData(settings.ipkey, (error, jsonobj) => {
                if (jsonobj) {
                    resolve(jsonobj);
                } else {
                    console.log("problem with request: "+ error);
                    reject(error);
                }
            });
        });
    }

    function getLocalData(ipkey, callback) {

        options.hostname = ipkey;
        options.headers = {
            'User-Agent': 'Node.js http.min',
            'Accept': 'application/json',
            'Connection': 'keep-alive'
        };
        console.log(options);

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
                        sharedText = JSON.parse(body);
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
        // req.write(json)
        req.end()
    }

})();

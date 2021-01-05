Awair monitors your air quality for example in your living room and provides back scores about your air quality like total score, temp, CO2, VOC PM2.5 and humidity. With this and flows you can automate and improve the air with air purifiers or open windows

2 Devices
- Device, which uses the Awair cloud data and refreshes every 5 minutes.
- LocalDevice, which uses the Awair device local data and refreshes every minute. It can be you need to enable expirimental devlopement mode on the app

Every awair measuring tool is a device which you can monitor in homey. Tested it on awair 2nd edtion + mint

On the device it will show the following
- Latest retrieval Date
- Score
- condition_temp (only on Device)
- condition_co2 (only on Device)
- condition_humid (only on Device)
- condition_pm25 (only on Device)
- condition_voc (only on Device)
- condition_lux (only on Device)
- measure_temp
- measure_co2
- measure_humid
- measure_pm25
- measure_voc
- measure_lux

Retrieving the required AWAIR bearer token

When you go this page https://developer.getawair.com/onboard/welcome you can login and request an API Access Token with your existing Awair Account. HOBBYIST Tier Access Tokens are automatically approved. (If you don't get redirected, click through to the Access Token page.) Go to the Awair app settings and add the token to the api field.

Flows

triggers
- ScoreAbove80
- ScoreBetween60-80
- ScoreBelow60
- measure_temp
- measure_co2
- measure_humid
- measure_pm25
- measure_voc
- measure_lux

conditions
- score_output
  - good, score above 80
  - average, score between 60 and 80
  - bad, score between 40 and 60
  - very bad, score is below 40
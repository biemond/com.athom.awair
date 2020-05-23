Awair monitors your air quality for example in your living room and provides back scores about your air quality like total score, temp, CO2, VOC PM2.5 and humidity. With this and flows you can automate and improve the air with air purifiers or open windows

Device

Every awair measuring tool is a device which you can monitor in homey. Tested it on awair 2nd edtion + mint
On the device it will show the following
- Latest retrieval Date
- Score
- condition_temp
- condition_co2
- condition_humid
- condition_pm25
- condition_voc
- condition_lux
- measure_temp
- measure_co2
- measure_humid
- measure_pm25
- measure_voc
- measure_lux

Retrieving the required AWAIR bearer token

When you go this page https://developer.getawair.com/onboard/welcome you can ask for a token which you can use in this app (it can take a few days). Go the awair app settings and add the token to the api field.

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
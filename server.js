var express = require('express');
var app = express();
var json = require('request-json');
var constants = require('./constants.js');
var locale = require('locale');

// Listen to the given port on heroku, or 5000 locally

app.set('port', (process.env.PORT || 5000));

// Allow use of files in the public directory

app.use(express.static(__dirname + '/public'));

// Setup the server on the port

app.listen(app.get('port'), function() {
    console.log("Node app is running at localhost:" + app.get('port'));
});

// Routes

app.get('/', root);
app.get('/forecast', forecast);

// Route Functions

function root(req, res)
{
    return res.sendFile(__dirname + "/public/index.html");
}

function forecast(req, res, next)
{
    var latitude = req.query.latitude;
    var longitude = req.query.longitude;

    if (!latitude || !longitude)
    {
        res.status(constants.BAD_REQUEST).send({message: "invalid parameters"});

        return;
    }

    var locales = new locale.Locales(req.headers["accept-language"]);

    var isMetric = locales.length == 0 || locales[0].code != "en-US";

    // Request the forecast

    var client = json.createClient("https://api.darksky.net/");

    var url = 'forecast/' + process.env.DARK_SKY_KEY + "/" + latitude + "," + longitude + "?units=" + (isMetric ? "si" : "us");

    client.get(url, function(err, response, body)
    {
        if (response.statusCode == 200)
        {
            var days = body.daily.data;

            var accumulation = 0;

            // Get data for the next 3 days including today

            for (i = 0; i < 3; i++)
            {
                day = days[i];

                if (day.precipType == "snow")
                {
                    accumulation += day.precipAccumulation;
                }
            }

            accumulation = Math.floor(accumulation);

            var units = isMetric ? (accumulation == 1 ? "centimeter" : "centimeters") : (accumulation == 1 ? "inch" : "inches");

            res.status(response.statusCode).send({accumulation: accumulation, units: units});

            return;
        }
        else
        {
            res.status(response.statusCode).send({message: "something went wrong"});

            return;
        }
    });
}

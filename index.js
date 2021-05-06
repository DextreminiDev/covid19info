const express = require("express");
const ejs = require("ejs");
const https = require("https");

const app = express();

app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

var location_info = [];
var location = [];
var url = "https://api.covid19india.org/state_district_wise.json";

app.get("/", function(req, res){
    res.render("home")
});

app.post("/", function(req, res){
    var state_name = req.body.state;
    var city_name = req.body.city;
    location.push(state_name,city_name);

    https.get(url,(response) => {
        let body = "";
    
        response.on("data", (chunk) => {
            body += chunk;
        });
    
        response.on("end", () => {
            // try {
                let json = JSON.parse(body);
                let current_active = json[state_name]["districtData"][city_name]["active"];
                let allTime_confirmed = json[state_name]["districtData"][city_name]["confirmed"];
                let allTime_deceased = json[state_name]["districtData"][city_name]["deceased"];
                let allTime_recovered = json[state_name]["districtData"][city_name]["recovered"];

                let delta_confirmed = json[state_name]["districtData"][city_name]["delta"]["confirmed"];
                let delta_deceased = json[state_name]["districtData"][city_name]["delta"]["deceased"];
                let delta_recovered = json[state_name]["districtData"][city_name]["delta"]["recovered"];

                location_info.push(current_active,allTime_confirmed,allTime_deceased,allTime_recovered,delta_confirmed,delta_deceased,delta_recovered);
                console.log("https function" + location_info);

                
            // }; 
            res.redirect("/result");
            // catch (error) {
            //     console.error(error.message);
            // };
        });
    
    }).on("error", (error) => {
        console.error(error.message);
    });
});

app.get("/result", function(req, res){
    res.render("response",{
        cityName : location[1],
        Active: location_info[0],
        allTimeConfirmed: location_info[1],
        allTimeDeceased: location_info[2],
        allTimeRecovered: location_info[3],
        casesToday: location_info[4],
        deathsToday: location_info[5],
        recoveredToday: location_info[6],
    });
    location.splice(0, location.length);
    location_info.splice(0,location_info.length);
});

app.listen(3000, function(){
    console.log("Server started on port 3000");
});
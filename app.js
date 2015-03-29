/**
 * Created by a on 3/15/2015.
 */
var fs = require('fs-extra');
var esl = require('modesl');
var replace = require("replace");
var redis = require('redis');
var config = require('config');
var dbmodel = require('./DVP-DBModels');
var request = require('request');
var format = require('stringformat');
var esl = require('modesl');
var jsxml = require("node-jsxml");
//var http = require('http');


var Namespace = jsxml.Namespace,
    QName = jsxml.QName,
    XML = jsxml.XML,
    XMLList = jsxml.XMLList;




/*

    conn = new esl.Connection(config.Freeswitch.ip, config.Freeswitch.port, config.Freeswitch.password, function() {


        console.log("Successfuly connected --->");
    });
*/

var redisClient = redis.createClient(config.Redis.port,config.Redis.ip);
redisClient.on('error',function(err){
    console.log('Error '.red, err);
});

var channelvalue = "CSCOMMAND:"+config.Freeswitch.id+":profile";
var channelactivate = "CSCOMMAND:"+config.Freeswitch.id+":profileactivate";
var downloadfile = "CSCOMMAND:"+config.Freeswitch.id+":downloadfile";

redisClient.subscribe(channelvalue);
redisClient.subscribe(channelactivate);
redisClient.subscribe(downloadfile);




redisClient.on('message', function (channel, message) {


    //var id = int.parse(message);


    if(channel == channelvalue) {

        var profilrService = config.Services.profileService;
        var url = format("{0}/{1}",profilrService,parseInt(message));

        request(url, function(err, response, body){

            if(err){

                console.log("Get profile data false", err);
            }else{

                var nwProfile = JSON.parse( response.body);

                try {
                    if (nwProfile && nwProfile.ProfileName != "DUMMY") {

                        var profile = config.Freeswitch.DummyProfile;
                        var newprofile = config.Freeswitch.profilePath + "/" + nwProfile.ProfileName + ".xml";


                        fs.exists(newprofile, function (exists) {

                            if (!exists) {

                                fs.readFile(profile, "utf-8", function (err, data) {

                                    var xml = new XML(data);


                                    xml.attributes('name').setValue(nwProfile.ProfileName);

                                    var child = xml.child("settings");

                                    //var context = child.child("param");


                                    var descendants = child.descendants('param');

                                    var value = descendants.each(function (obj, index) {

                                        if (obj.attribute('name').toXMLString() == 'sip-ip') {
                                            var val = obj.attribute('value');
                                            obj.attribute('value').setValue(nwProfile.InternalIp);
                                        }

                                        if (obj.attribute('name').toXMLString() == 'rtp-ip') {
                                            var val = obj.attribute('value');
                                            obj.attribute('value').setValue(nwProfile.InternalRtpIp);
                                        }

                                        if (obj.attribute('name').toXMLString() == 'ext-sip-ip') {
                                            var val = obj.attribute('value');
                                            if(nwProfile.ExternalIp) {
                                                obj.attribute('value').setValue(nwProfile.ExternalIp);
                                            }
                                        }

                                        if (obj.attribute('name').toXMLString() == 'ext-rtp-ip') {
                                            var val = obj.attribute('value');
                                            if(nwProfile.ExternalIp) {
                                                obj.attribute('value').setValue(nwProfile.ExternalRtpIp);
                                            }
                                        }

                                        if (obj.attribute('name').toXMLString() == 'sip-port') {
                                            var val = obj.attribute('value');
                                            obj.attribute('value').setValue(nwProfile.port);
                                        }


                                    });

                                    var xmldata = xml.toXMLString();
                                    console.log(xmldata);


                                    fs.outputFile(newprofile, xmldata, function (err) {

                                        if (err) {

                                            console.log(err);


                                        } else {


                                            setTimeout(function () {


                                                var command = format("http://{0}:8080/api/sofia? profile {1} start", config.Freeswitch.ip, nwProfile.ProfileName);
                                                console.log(command);
                                                request(command, function (error, response, body) {
                                                    if (!error && response.statusCode == 200) {
                                                        console.log(body);
                                                    }
                                                    else {

                                                        console.log("reload fail");
                                                    }
                                                })


                                            }, 10 * 1000);

                                        }
                                    });
                                });
                            }
                            else {

                                console.log("Profile is available ---->");
                            }

                        });


                        //////////////////////////////////////////////////////////////////////////////////////////////


                    }

                } catch (exp) {


                    console.log(exp);


                }
            }

        });

    }else if(channelvalue ==  channelactivate){


    }else if(channelvalue == downloadfile){

        if(message) {

            try {

                var fileData = JSON.parse(message);

                var companyLocation = format("{0}_{1}",fileData.tenent, fileData.company);
                var fileLocation = format("{0}/{1}/{2}.{3}",config.Freeswitch.soundFilePath,companyLocation,fileData.filename,fileData.ext)
                var remoteFileLocation = format("{0}/{1}",config.Services.fileService,fileData.filename);

                request(remoteFileLocation).pipe(fs.createWriteStream(fileLocation))

            }
            catch(ex){

                console.log(ex);
            }
        }else{

            console.log("Message is empty");
        }



    }
});
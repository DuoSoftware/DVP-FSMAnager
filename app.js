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
//var http = require('http');





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
                        /*

                         MainIp: DataTypes.STRING,
                         ProfileName: DataTypes.STRING,
                         InternalIp: {type: DataTypes.STRING,unique: "compositeIndex"},
                         InternalRtpIp: DataTypes.STRING,
                         ExternalIp: DataTypes.STRING,
                         ExternalRtpIp: DataTypes.STRING,
                         Port: {type: DataTypes.INTEGER,unique: "compositeIndex"},
                         ObjClass: DataTypes.STRING,
                         ObjType: DataTypes.STRING,
                         ObjCategory: DataTypes.STRING,
                         CompanyId: DataTypes.INTEGER,
                         TenantId: DataTypes.INTEGER

                         */
                        var newprofile = config.Freeswitch.profilePath + "/" + nwProfile.ProfileName + ".xml";

                        fs.exists(newprofile, function (exists) {
                            if (!exists) {
                                fs.copy(config.Freeswitch.DummyProfile, newprofile, function (err) {
                                    if (err) {
                                        console.error(err)
                                    } else {
                                        console.log("success!");


                                        replace({
                                            regex: "profilename",
                                            replacement: nwProfile.ProfileName,
                                            paths: [newprofile],
                                            recursive: true,
                                            silent: false
                                        });

                                        console.log("text!");

                                        replace({
                                            regex: "internalsipip",
                                            replacement: nwProfile.InternalIp,
                                            paths: [newprofile],
                                            recursive: true,
                                            silent: false
                                        });

                                        replace({
                                            regex: "internalrtpip",
                                            replacement: nwProfile.InternalRtpIp,
                                            paths: [newprofile],
                                            recursive: true,
                                            silent: false
                                        });

                                        if(nwProfile.ExternalIp) {
                                            replace({
                                                regex: "externalsipip",
                                                replacement: nwProfile.ExternalIp,
                                                paths: [newprofile],
                                                recursive: true,
                                                silent: false
                                            });
                                        }else{
                                            replace({
                                                regex: "externalsipip",
                                                replacement: "auto-nat",
                                                paths: [newprofile],
                                                recursive: true,
                                                silent: false
                                            });
                                        }

                                        if(nwProfile.ExternalRtpIp) {

                                            replace({
                                                regex: "externalrtpip",
                                                replacement: nwProfile.ExternalRtpIp,
                                                paths: [newprofile],
                                                recursive: true,
                                                silent: false
                                            });
                                        }else{
                                            replace({
                                                regex: "externalrtpip",
                                                replacement: "auto-nat",
                                                paths: [newprofile],
                                                recursive: true,
                                                silent: false
                                            });
                                        }


                                        replace({
                                            regex: "profileport",
                                            replacement: nwProfile.port,
                                            paths: [newprofile],
                                            recursive: true,
                                            silent: false
                                        });


                                        /////////////////grace period before load profile////////////////////////////////////////////////
                                        setTimeout(function() {
                                            /*

                                             var cmd = "sofia profile " + nwProfile.ProfileName + " start";
                                             conn.api(cmd);*/

                                            var command = format("http://{0}:8080/api/sofia? profile {1} start", config.Freeswitch.ip, nwProfile.ProfileName);

                                            console.log(command);

                                            request(command, function (error, response, body) {
                                                if (!error && response.statusCode == 200) {
                                                    console.log(body);
                                                }
                                                else{

                                                    console.log("reload fail");
                                                }
                                            })


                                        }, 10*1000);
                                    }
                                })
                            }
                            else {

                                console.log("Profile is available ---->");
                            }
                        });
                    }

                } catch (exp) {


                    console.log(exp);


                }
            }

        });

/*
        dbmodel.SipNetworkProfile.find({where: [{id: parseInt(message)}]}).complete(function (err, nwProfile) {

            if (!err) {

                try {
                    if (nwProfile && nwProfile.ProfileName != "DUMMY") {

                        var newprofile = config.Freeswitch.profilePath + "/" + nwProfile.ProfileName + ".xml";

                        fs.exists(newprofile, function (exists) {
                            if (!exists) {
                                fs.copy(config.Freeswitch.DummyProfile, newprofile, function (err) {
                                    if (err) {
                                        console.error(err)
                                    } else {
                                        console.log("success!");


                                        replace({
                                            regex: "profilename",
                                            replacement: nwProfile.ProfileName,
                                            paths: [newprofile],
                                            recursive: true,
                                            silent: false
                                        });

                                        console.log("text!");

                                        replace({
                                            regex: "internalsipip",
                                            replacement: nwProfile.InternalIp,
                                            paths: [newprofile],
                                            recursive: true,
                                            silent: false
                                        });

                                        replace({
                                            regex: "internalrtpip",
                                            replacement: nwProfile.InternalRtpIp,
                                            paths: [newprofile],
                                            recursive: true,
                                            silent: false
                                        });

                                        if(nwProfile.ExternalIp) {
                                            replace({
                                                regex: "externalsipip",
                                                replacement: nwProfile.ExternalIp,
                                                paths: [newprofile],
                                                recursive: true,
                                                silent: false
                                            });
                                        }else{
                                            replace({
                                                regex: "externalsipip",
                                                replacement: "auto-nat",
                                                paths: [newprofile],
                                                recursive: true,
                                                silent: false
                                            });
                                        }

                                        if(nwProfile.ExternalRtpIp) {

                                            replace({
                                                regex: "externalrtpip",
                                                replacement: nwProfile.ExternalRtpIp,
                                                paths: [newprofile],
                                                recursive: true,
                                                silent: false
                                            });
                                        }else{
                                            replace({
                                                regex: "externalrtpip",
                                                replacement: "auto-nat",
                                                paths: [newprofile],
                                                recursive: true,
                                                silent: false
                                            });
                                        }


                                        replace({
                                            regex: "profileport",
                                            replacement: nwProfile.port,
                                            paths: [newprofile],
                                            recursive: true,
                                            silent: false
                                        });


                                        /////////////////grace period before load profile////////////////////////////////////////////////
                                        setTimeout(function() {


                                            var command = format("http://{0}:8080/api/sofia? profile {1} start", config.Freeswitch.ip, nwProfile.ProfileName);

                                            console.log(command);

                                            request(command, function (error, response, body) {
                                                if (!error && response.statusCode == 200) {
                                                    console.log(body);
                                                }
                                                else{

                                                    console.log("reload fail");
                                                }
                                            })


                                        }, 10*1000);
                                    }
                                })
                            }
                            else {

                                console.log("Profile is available ---->");
                            }
                        });
                    }

                } catch (exp) {


                    console.log(exp);


                }
            } else {

                console.log("No profile found -> ");
            }
        })*/



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

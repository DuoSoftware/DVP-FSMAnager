/**
 * Created by a on 3/15/2015.
 */
var fs = require('fs-extra');
var esl = require('modesl');
var replace = require("replace");
var redis = require('redis');
var config = require('config');
var dbmodel = require('./DVP-DBModels');

var esl = require('modesl');



    conn = new esl.Connection(config.Freeswitch.ip, config.Freeswitch.port, config.Freeswitch.password, function() {
        /*
        conn.api('status', function(res) {
            //res is an esl.Event instance
            console.log(res.getBody());
        });*/

        console.log("Successfuly connected --->");
    });


var redisClient = redis.createClient(config.Redis.port,config.Redis.ip);
redisClient.on('error',function(err){
    console.log('Error '.red, err);
});

redisClient.subscribe("CSCOMMAND:"+config.Freeswitch.id+":profile");

redisClient.on('message', function (channel, message) {


    //var id = int.parse(message);
    var channelvalue = "CSCOMMAND:"+config.Freeswitch.id+":profile";
    var channelactivate = "CSCOMMAND:"+config.Freeswitch.id+":profileactivate";
    if(channel = channelvalue) {

        dbmodel.SipNetworkProfile.find({where: [{id: parseInt(message)}]}).complete(function (err, nwProfile) {

            if (!err) {

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

                                        replace({
                                            regex: "externalsipip",
                                            replacement: nwProfile.ExternalIp,
                                            paths: [newprofile],
                                            recursive: true,
                                            silent: false
                                        });


                                        replace({
                                            regex: "externalrtpip",
                                            replacement: nwProfile.ExternalRtpIp,
                                            paths: [newprofile],
                                            recursive: true,
                                            silent: false
                                        });


                                        replace({
                                            regex: "profileport",
                                            replacement: nwProfile.port,
                                            paths: [newprofile],
                                            recursive: true,
                                            silent: false
                                        });

                                        var cmd = "sofia profile " + nwProfile.ProfileName + " start";
                                        conn.api(cmd);

                                    }
                                })
                            }
                            else {

                                console.log("Profile is available ---->");
                            }
                        });
                    }

                } catch (exp) {


                }
            } else {

                console.log("No profile found -> ");


            }


        })
    }else if(channelvalue = channelactivate){


    }
});







/*


 fs.readFile(someFile, 'utf8', function (err,data) {
 if (err) {
 return console.log(err);
 }
 var result = data.replace(/string to be replaced/g, 'replacement');

 fs.writeFile(someFile, result, 'utf8', function (err) {
 if (err) return console.log(err);
 });
 });


    conn = new esl.Connection('127.0.0.1', 8021, 'ClueCon', function() {
        conn.api('status', function(res) {
            //res is an esl.Event instance
            console.log(res.getBody());
            process.exit(0);
        });
    });




 replace({
 regex: "foo",
 replacement: "bar",
 paths: ['.'],
 recursive: true,
 silent: true,
 });


 */
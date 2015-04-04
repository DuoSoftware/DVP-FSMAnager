/**
 * Created by a on 3/15/2015.
 */
var fs = require('fs-extra');
var replace = require("replace");
var redis = require('redis');
//var config = require('config');
var request = require('request');
var format = require('stringformat');
var esl = require('modesl');
var jsxml = require("node-jsxml");
//var http = require('http');


var Namespace = jsxml.Namespace,
    QName = jsxml.QName,
    XML = jsxml.XML,
    XMLList = jsxml.XMLList;


var redishost = format("redis.{0}.{1}",process.env.envirnament, process.env.domain);
var profilrService = format("duocloudconfig.{0}.{1}/DVP/API/1.0/CloudConfiguration/Profile",process.env.envirnament, process.env.domain);
var profilepath = format("{0}/{1}", process.env.freeswitchpath, "/conf/sip_profiles/" );
var soundpath = format("{0}/{1}", process.env.freeswitchpath, "/sounds/" );
var fileservice = format("duocloudconfig.{0}.{1}/DVP/API/6.0/FIleService/FileHandler/DownloadFile",process.env.envirnament, process.env.domain);


var redisClient = redis.createClient(redishost);
redisClient.on('error',function(err){
    console.log('Error '.red, err);
});

var channelvalue = "CSCOMMAND:"+process.env.freeswitchid+":profile";
var channelactivate = "CSCOMMAND:"+process.env.freeswitchid+":profileactivate";
var downloadfile = "CSCOMMAND:"+process.env.freeswitchid+":downloadfile";
var rescangateways = "CSCOMMAND:"+process.env.freeswitchid+ "rescangateway";

redisClient.subscribe(channelvalue);
redisClient.subscribe(channelactivate);
redisClient.subscribe(downloadfile);



redisClient.on('message', function (channel, message) {


    //var id = int.parse(message);


    if(channel == channelvalue) {

        //var profilrService = config.Services.profileService;
        var url = format("{0}/{1}",profilrService,parseInt(message));

        request(url, function(err, response, body){

            if(err){

                console.log("Get profile data false", err);
            }else{

                var nwProfile = JSON.parse( response.body);

                try {
                    if (nwProfile && nwProfile.ProfileName != "DUMMY") {

                        var profile = __dirname+'/DUMMY.xml';
                        var newprofile = profilepath + "/" + nwProfile.ProfileName + ".xml";


                        fs.exists(newprofile, function (exists) {

                            if (!exists) {

                                fs.readFile(profile, "utf-8", function (err, data) {

                                    try {

                                        var xml = new XML(data);
                                        xml.attributes('name').setValue(nwProfile.ProfileName);
                                        var child = xml.child("settings");
                                        var descendants = child.descendants('param');
                                        var value = descendants.each(function (obj, index) {

                                            if (obj.attribute('name').toXMLString() == 'sip-ip') {
                                                var val = obj.attribute('value');
                                                if(nwProfile.InternalIp) {
                                                    obj.attribute('value').setValue(nwProfile.InternalIp);
                                                }
                                            }

                                            if (obj.attribute('name').toXMLString() == 'rtp-ip') {
                                                var val = obj.attribute('value');
                                                if(nwProfile.InternalRtpIp) {
                                                    obj.attribute('value').setValue(nwProfile.InternalRtpIp);
                                                }
                                            }

                                            if (obj.attribute('name').toXMLString() == 'ext-sip-ip') {
                                                var val = obj.attribute('value');
                                                if (nwProfile.ExternalIp) {
                                                    obj.attribute('value').setValue(nwProfile.ExternalIp);
                                                }
                                            }

                                            if (obj.attribute('name').toXMLString() == 'ext-rtp-ip') {
                                                var val = obj.attribute('value');
                                                if (nwProfile.ExternalIp) {
                                                    obj.attribute('value').setValue(nwProfile.ExternalRtpIp);
                                                }
                                            }

                                            if (obj.attribute('name').toXMLString() == 'sip-port') {
                                                var val = obj.attribute('value');
                                                if(nwProfile.port) {
                                                    obj.attribute('value').setValue(nwProfile.port);
                                                }
                                            }


                                        });

                                        var xmldata = xml.toXMLString();
                                        console.log(xmldata);

                                        fs.outputFile(newprofile, xmldata, function (err) {

                                            if (err) {
                                                console.log(err);

                                            } else {


                                                setTimeout(function () {

                                                    var command = format("http://{0}:8080/api/sofia? profile {1} start", "localhost", nwProfile.ProfileName);
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
                                    }catch(exx){

                                        console.log(exx);
                                    }
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

    }else if(channel ==  channelactivate){


    }else if(channel == downloadfile){

        if(message) {

            try {

                var fileData = JSON.parse(message);

                var companyLocation = format("{0}_{1}",fileData.tenent, fileData.company);
                var fileLocation = format("{0}{1}",soundpath,companyLocation);
                var filepath = format("{0}/{1}", fileLocation, fileData.filename);
                var remoteFileLocation = format("{0}/{1}",fileservice,fileData.id);

                request(remoteFileLocation).pipe(fs.createWriteStream(filepath)).on('error', function(e){console.log(e)});

            }
            catch(ex){

                console.log(ex);
            }
        }else{

            console.log("Message is empty");
        }



    }else if(channel == rescangateways){

        //sofia profile external rescan reloadxml

        if(message) {

            try {

                var fileData = JSON.parse(message);
                var profilename = fileData.profile;

                var command = format("http://{0}:8080/api/sofia? sofia profile {1} rescan reloadxml", "localhost", profilename);
                console.log(command);
                request(command, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        console.log(body);
                    }
                    else {

                        console.log("reload fail");
                    }
                });



            }
            catch(ex){

                console.log(ex);
            }
        }else{

            console.log("Message is empty");
        }


    }
});

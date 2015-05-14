/**
 * Created by a on 3/15/2015.
 */
var fs = require('fs-extra');
var replace = require("replace");
var redis = require('redis');
var config = require('config');
var request = require('request');
var format = require('stringformat');
var esl = require('modesl');
var jsxml = require("node-jsxml");
var logger = require('DVP-Common/LogHandler/CommonLogHandler.js').logger;


var Namespace = jsxml.Namespace,
    QName = jsxml.QName,
    XML = jsxml.XML,
    XMLList = jsxml.XMLList;

var redishost,profilrService, profilepath, soundpath, fileservice, channelvalue, channelactivate, downloadfile, rescangateways, redisport = 6379;




    redishost = config.Redis.ip;
    redisport = config.Redis.port;
    profilrService = format("{0}/DVP/API/{1}/CloudConfiguration/Profile", config.Services.profileService, config.Services.profileServiceVersion);
    profilepath = format("{0}/{1}", config.Freeswitch.freeswitchpath, "/conf/sip_profiles/");
    soundpath = format("{0}/{1}", config.Freeswitch.freeswitchpath, "/sounds/");
    fileservice = format("{0}/DVP/API/{1}/FIleService/FileHandler/DownloadFile", config.Services.fileService,config.Services.fileServiceVersion);

    channelvalue = "CSCOMMAND:" + config.Freeswitch.id + ":profile";
    channelactivate = "CSCOMMAND:" + config.Freeswitch.id + ":profileactivate";
    downloadfile = "CSCOMMAND:" + config.Freeswitch.id + ":downloadfile";
    rescangateways = "CSCOMMAND:" + config.Freeswitch.id + "rescangateway";




var redisClient = redis.createClient(redisport, redishost);
redisClient.on('error',function(err){
    console.log('Error '.red, err);
});



redisClient.subscribe(channelvalue);
redisClient.subscribe(channelactivate);
redisClient.subscribe(downloadfile);
redisClient.subscribe(rescangateways);



redisClient.on('message', function (channel, message) {


    //var id = int.parse(message);


    logger.debug("DVP-FSManager.redisClient REDIS PUBLISHED %s", message);


    if(channel == channelvalue) {



        //var profilrService = config.Services.profileService;
        var url = format("{0}/{1}",profilrService,parseInt(message));


        logger.debug("DVP-FSManager.redisClient FS Profile Create Request Recived try URL %s ", url);

        request(url, function(err, response, body){

            if(err){

                logger.error("DVP-FSManager.redisClient Request Get Profile failed ", err);
            }else{

                var nwProfile = JSON.parse( response.body);


                logger.debug("DVP-FSManager.redisClient Request Get Profile %j", nwProfile);

                try {
                    if (nwProfile && nwProfile.ProfileName != "DUMMY") {

                        var profile = __dirname+'/DUMMY.xml';
                        var newprofile = profilepath + "/" + nwProfile.ProfileName + ".xml";


                        fs.exists(newprofile, function (exists) {

                            if (!exists) {

                                logger.debug("DVP-FSManager.redisClient %s File not exist", newprofile);

                                fs.readFile(profile, "utf-8", function (err, data) {


                                    if(!err) {
                                        logger.debug("DVP-FSManager.redisClient %s Read File", profile);


                                        try {

                                            var xml = new XML(data);

                                            logger.debug("DVP-FSManager.redisClient CONFIG SetProfileName %s", nwProfile.ProfileName);

                                            xml.attributes('name').setValue(nwProfile.ProfileName);
                                            var child = xml.child("settings");
                                            var descendants = child.descendants('param');
                                            var value = descendants.each(function (obj, index) {

                                                if (obj.attribute('name').toXMLString() == 'sip-ip') {
                                                    var val = obj.attribute('value');
                                                    if (nwProfile.InternalIp) {
                                                        obj.attribute('value').setValue(nwProfile.InternalIp);
                                                        logger.debug("DVP-FSManager.redisClient CONFIG SetSIPIP %s", nwProfile.InternalIp);
                                                    }
                                                }

                                                if (obj.attribute('name').toXMLString() == 'rtp-ip') {
                                                    var val = obj.attribute('value');
                                                    if (nwProfile.InternalRtpIp) {
                                                        obj.attribute('value').setValue(nwProfile.InternalRtpIp);
                                                        logger.debug("DVP-FSManager.redisClient CONFIG SetRTPIP %s", nwProfile.InternalRtpIp);
                                                    }
                                                }

                                                if (obj.attribute('name').toXMLString() == 'ext-sip-ip') {
                                                    var val = obj.attribute('value');
                                                    if (nwProfile.ExternalIp) {
                                                        obj.attribute('value').setValue(nwProfile.ExternalIp);
                                                        logger.debug("DVP-FSManager.redisClient CONFIG SetExternalSIPIP %s", nwProfile.ExternalIp);
                                                    }
                                                }

                                                if (obj.attribute('name').toXMLString() == 'ext-rtp-ip') {
                                                    var val = obj.attribute('value');
                                                    if (nwProfile.ExternalIp) {
                                                        obj.attribute('value').setValue(nwProfile.ExternalRtpIp);

                                                        logger.debug("DVP-FSManager.redisClient CONFIG SetExternalRTPIP %s", nwProfile.ExternalRtpIp);
                                                    }
                                                }

                                                if (obj.attribute('name').toXMLString() == 'sip-port') {
                                                    var val = obj.attribute('value');
                                                    if (nwProfile.Port) {
                                                        obj.attribute('value').setValue(nwProfile.Port);

                                                        logger.debug("DVP-FSManager.redisClient CONFIG SetExternalSIPPORT %s", nwProfile.Port);
                                                    }
                                                }


                                            });

                                            var xmldata = xml.toXMLString();
                                            console.log(xmldata);

                                            fs.outputFile(newprofile, xmldata, function (err) {

                                                if (err) {
                                                    logger.error("DVP-FSManager.redisClient CONFIG Output failed", err);

                                                } else {

                                                    logger.debug("DVP-FSManager.redisClient CONFIG Output worked");

                                                    setTimeout(function () {

                                                        var command = format("http://{0}:8080/api/sofia? profile {1} start", "localhost", nwProfile.ProfileName);
                                                        console.log(command);
                                                        request(command, function (error, response, body) {
                                                            if (!error && response.statusCode == 200) {
                                                                logger.debug("DVP-FSManager.redisClient FS Reload Profile %s", response.body);
                                                            }
                                                            else {

                                                                logger.debug("DVP-FSManager.redisClient FS Reload Profile failed", err);
                                                            }
                                                        })
                                                    }, 10 * 1000);
                                                }
                                            });
                                        } catch (exx) {

                                            console.log(exx);
                                        }
                                    }else{

                                        logger.error("DVP-FSManager.redisClient %s Read File failed", profile, err);


                                    }
                                });
                            }
                            else {

                                logger.error("DVP-FSManager.redisClient Profile is avalable");
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

                logger.debug("DVP-FSManager.redisClient FS FileDownload try URL %s to %s ", remoteFileLocation, filepath);

                request(remoteFileLocation).pipe(fs.createWriteStream(filepath)).on('error', function(e){console.log(e)});

            }
            catch(ex){

                logger.error("DVP-FSManager.redisClient FS FileDownload failed",err);
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

                var command = format("http://{0}:8080/api/sofia? profile {1} rescan reloadxml", "localhost", profilename);
                console.log(command);
                request(command, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        logger.debug("DVP-FSManager.redisClient FS Reload Gateway %s", response.body);
                    }
                    else {

                        logger.error("DVP-FSManager.redisClient FS Reload Gateway failed", error);
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

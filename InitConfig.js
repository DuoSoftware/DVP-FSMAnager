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
//var http = require('http');


var Namespace = jsxml.Namespace,
    QName = jsxml.QName,
    XML = jsxml.XML,
    XMLList = jsxml.XMLList;



    //var id = int.parse(message);

///opt/freeswitch/conf/autoload_configs/switch.conf.xml
///opt/freeswitch/conf/sip_profiles/external.xml:


var internalProfile = format("{0}/{1}", process.env.ConfPath, "/sip_profiles/external.xml" );
var externalProfile = format("{0}/{1}", process.env.ConfPath, "/sip_profiles/internal.xml" );
var switchpath = format("{0}/{1}", process.env.ConfPath, "/autoload_configs/switch.conf.xml" );
<!-- <param name="rtp-start-port" value="16384"/> -->
<!-- <param name="rtp-end-port" value="32768"/> -->













try {


    fs.exists(switchpath, function (exists) {

        if (exists) {

            fs.readFile(switchpath, "utf-8", function (err, data) {

                try {

                    var xml = new XML(data);
                    var child = xml.child("settings");


                    var done = false;



                    if (!done && process.env.StartRTPPort && process.env.EndRTPPort) {


                        var startRTP = format("<param name=\"rtp-start-port\" value=\"{0}\"/>", process.env.StartRTPPort);

                        var endRTP = format("<param name=\"rtp-end-port\" value=\"{0}\"/>", process.env.EndRTPPort);

                        var xmlStartRTP = new XML(startRTP);
                        var xmlEndRTP= new XML(endRTP);


                        child.appendChild(xmlStartRTP);
                        child.appendChild(xmlEndRTP);
                    }


                    var xmldata = xml.toXMLString();
                    console.log(xmldata);

                    fs.outputFile(switchpath, xmldata, function (err) {

                        if (err) {
                            console.log(err);

                        } else {

                            console.log("Successfully saved switch");
                        }
                    });
                } catch (exx) {

                    console.log(exx);
                }
            });
        }
        else {

            console.log("Profile is not available ---->");
        }
    });

    //////////////////////////////////////////////////////////////////////////////////////////////


} catch (exp) {


    console.log(exp);


}



try {


    fs.exists(internalProfile, function (exists) {

        if (exists) {

            fs.readFile(internalProfile, "utf-8", function (err, data) {

                try {

                    var xml = new XML(data);
                    var child = xml.child("settings");


                    var done = false;

                    var descendants = child.descendants('param');
                    var value = descendants.each(function (obj, index) {

                        if (obj.attribute('name').toXMLString() == 'ext-sip-ip') {
                            var val = obj.attribute('value');
                            if (process.env.ExternalIP) {
                                obj.attribute('value').setValue(process.env.ExternalIP);
                                done = true;
                            }
                        }

                        if (obj.attribute('name').toXMLString() == 'ext-rtp-ip') {
                            var val = obj.attribute('value');
                            if (process.env.ExternalIP) {
                                obj.attribute('value').setValue(process.env.ExternalIP);
                                done = true;
                            }
                        }


                        if (obj.attribute('name').toXMLString() == 'force-register-domain') {
                            var val = obj.attribute('value');
                            if (process.env.ExternalIP) {
                                obj.attribute('value').setValue(process.env.ExternalIP);
                                done = true;
                            }
                        }

                        if (obj.attribute('name').toXMLString() == 'force-subscription-domain') {
                            var val = obj.attribute('value');
                            if (process.env.ExternalIP) {
                                obj.attribute('value').setValue(process.env.ExternalIP);
                                done = true;
                            }
                        }

                        if (obj.attribute('name').toXMLString() == 'force-register-db-domain') {
                            var val = obj.attribute('value');
                            if (process.env.ExternalIP) {
                                obj.attribute('value').setValue(process.env.ExternalIP);
                                done = true;
                            }
                        }







                        //force-register-domain
                        //force-subscription-domain
                        //force-register-db-domain
                        //apply-inbound-acl
                        //apply-register-acl






                    });


                    if (!done && process.env.ExternalIP) {


                        var externalsip = format("<param name=\"ext-sip-ip\" value=\"{0}\"/>", process.env.ExternalIP);

                        var externalrtp = format("<param name=\"ext-rtp-ip\" value=\"{0}\"/>", process.env.ExternalIP);

                        var xmlexternalsip = new XML(externalsip);
                        var xmlexternalrtp = new XML(externalrtp);


                        child.appendChild(xmlexternalsip);
                        child.appendChild(xmlexternalrtp);
                    }


                    var xmldata = xml.toXMLString();
                    console.log(xmldata);

                    fs.outputFile(internalProfile, xmldata, function (err) {

                        if (err) {
                            console.log(err);

                        } else {

                            console.log("Successfully saved internal");
                        }
                    });
                } catch (exx) {

                    console.log(exx);
                }
            });
        }
        else {

            console.log("Profile is not available ---->");
        }
    });

    //////////////////////////////////////////////////////////////////////////////////////////////


} catch (exp) {


    console.log(exp);


}



try {



    fs.exists(externalProfile, function (exists) {

        if (exists) {

            fs.readFile(externalProfile, "utf-8", function (err, data) {

                try {

                    var xml = new XML(data);
                    var child = xml.child("settings");




                    var done = false;

                    var descendants = child.descendants('param');
                    var value = descendants.each(function (obj, index) {

                        if (obj.attribute('name').toXMLString() == 'ext-sip-ip') {
                            var val = obj.attribute('value');
                            if (process.env.ExternalIP) {
                                obj.attribute('value').setValue(process.env.ExternalIP);
                                done = true;
                            }
                        }

                        if (obj.attribute('name').toXMLString() == 'ext-rtp-ip') {
                            var val = obj.attribute('value');
                            if (process.env.ExternalIP) {
                                obj.attribute('value').setValue(process.env.ExternalIP);
                                done = true;
                            }
                        }



                        if (obj.attribute('name').toXMLString() == 'force-register-domain') {
                            var val = obj.attribute('value');
                            if (process.env.ExternalIP) {
                                obj.attribute('value').setValue(process.env.ExternalIP);
                                done = true;
                            }
                        }

                        if (obj.attribute('name').toXMLString() == 'force-subscription-domain') {
                            var val = obj.attribute('value');
                            if (process.env.ExternalIP) {
                                obj.attribute('value').setValue(process.env.ExternalIP);
                                done = true;
                            }
                        }

                        if (obj.attribute('name').toXMLString() == 'force-register-db-domain') {
                            var val = obj.attribute('value');
                            if (process.env.ExternalIP) {
                                obj.attribute('value').setValue(process.env.ExternalIP);
                                done = true;
                            }
                        }


                    });



                    if (!done && process.env.ExternalIP) {



                        var externalsip = format("<param name=\"ext-sip-ip\" value=\"{0}\"/>",process.env.ExternalIP);

                        var externalrtp = format("<param name=\"ext-rtp-ip\" value=\"{0}\"/>",process.env.ExternalIP);

                        var xmlexternalsip = new XML(externalsip);
                        var xmlexternalrtp = new XML(externalrtp);


                        child.appendChild(xmlexternalsip);
                        child.appendChild(xmlexternalrtp);
                    }

                    var xmldata = xml.toXMLString();
                    console.log(xmldata);

                    fs.outputFile(externalProfile, xmldata, function (err) {

                        if (err) {
                            console.log(err);

                        } else {

                            console.log("Successfully saved internal");
                        }
                    });
                } catch (exx) {

                    console.log(exx);
                }
            });
        }
        else {

            console.log("Profile is not available ---->");
        }
    });

    //////////////////////////////////////////////////////////////////////////////////////////////


} catch (exp) {


    console.log(exp);


}



var fs = require('fs-extra');
var jsxml = require("node-jsxml");


var Namespace = jsxml.Namespace,
    QName = jsxml.QName,
    XML = jsxml.XML,
    XMLList = jsxml.XMLList;



fs.readFile(__dirname + '/DUMMY.xml',"utf-8", function(err, data) {

    var xml = new XML(data);

    xml.attributes('name').setValue("newname");

    var child = xml.child("settings");

    //var context = child.child("param");


    var descendants = child.descendants('param');

    var value =descendants.each(function(obj, index){

        if(obj.attribute('name').toXMLString() == 'debug')
        {
            var val = obj.attribute('value');
            obj.attribute('value').setValue('1');
        }

        //console.log(obj.attribute('value').toXMLString(), index)

    });

    //var atts = child.attributes();

    var xmldata = xml.toXMLString();
    console.log(xmldata);


    var file = __dirname + '/test.xml';

    fs.outputFile(file, xmldata, function (err){

        if(err){


        }else{


        }


    });


//print the xml string
    //console.log(xml.toXMLString());
});

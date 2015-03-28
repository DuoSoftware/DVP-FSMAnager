/**
 * Created by a on 3/21/2015.
 */
var config = require('config');
var redis = require('redis');



var redisClient = redis.createClient(config.Redis.port,config.Redis.ip);

redisClient.publish("CSCOMMAND:"+config.Freeswitch.id+":profile", '1')

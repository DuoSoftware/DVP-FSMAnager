#!/bin/bash
nodejs /usr/local/src/fsmanager/InitConfig.js
sh /usr/local/src/autoloadconfig.sh
service freeswitch start
nodejs /usr/local/src/fsmanager/app.js
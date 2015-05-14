#!/bin/bash
nodejs /usr/local/src/fsmanager/InitConfig.js
service freeswitch start
nodejs /usr/local/src/fsmanager/app.js
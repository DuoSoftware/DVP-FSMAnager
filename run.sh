
#!/bin/bash
# run commands

echo "run fs and node"

nodejs /usr/local/src/fsmanager/InitConfig.js 

opt/freeswitch/bin/freeswitch

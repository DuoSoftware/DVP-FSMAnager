echo $NODE_CONFIG_DIR;
#<param name="password" value="ClueCon"/>
sed -i 's^param name="listen-ip" value="127.0.0.1"^param name="listen-ip" value="'$FS_HOST'""^g' /usr/local/freeswitch/conf/autoload_configs/event_socket.conf.xml;
sed -i 's^param name="password" value="ClueCon"^param name="password" value="'$FS_PASSWORD'"^g' /usr/local/freeswitch/conf/autoload_configs/event_socket.conf.xml;
sed -i 's^</settings>^<param name="switchname" value="'$FS_ID'"/></settings>^g' /usr/local/freeswitch/conf/autoload_configs/switch.conf.xml;
sed -i 's^<param name="auth-realm" value="freeswitch"/>^<!--<param name="auth-realm" value="freeswitch"/>-->^g' /usr/local/freeswitch/conf/autoload_configs/xml_rpc.conf.xml;
sed -i 's^</bindings>^<binding name="directory"><param name="gateway-url" value="'$SYS_SERVICE_DYN_CON_DIRECTORYPROFILE'" bindings="directory"/></binding> <binding name="callapp"><param name="gateway-url" value="'$SYS_SERVICE_DYN_CON_CALLAPP'" bindings="dialplan" method="get"/></binding></bindings>^g' /usr/local/freeswitch/conf/autoload_configs/xml_curl.conf.xml;
sed -i 's^<domain name="$${domain}">^<domain name="'$FS_EXTERNALIP'">^g'/usr/local/freeswitch/conf/directory/default.xml


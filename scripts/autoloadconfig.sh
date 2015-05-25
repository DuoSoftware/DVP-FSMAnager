echo $NODE_CONFIG_DIR;
#<param name="password" value="ClueCon"/>
sed -i 's^param name="listen-ip" value="127.0.0.1"^param name="listen-ip" value="'$FS_HOST'"^g; s^param name="password" value="ClueCon"^param name="password" value="'$FS_PASSWORD'"^g' /usr/local/src/xml/event_socket.conf.xml;
sed -i 's^<!-- <param name="switchname" value="freeswitch"/> -->^<param name="switchname" value="'$FS_ID'"/>^g; s^<!-- <param name="rtp-start-port" value="16384"/> -->^<param name="rtp-start-port" value="'$FS_RTPSTARTPORT'"/>^g; s^<!-- <param name="rtp-end-port" value="32768"/> -->^<param name="rtp-end-port" value="'$FS_RTPENDPORT'"/>^g' /usr/local/src/xml/switch.conf.xml;
sed -i 's^<param name="auth-realm" value="freeswitch"/>^<!--<param name="auth-realm" value="freeswitch"/>-->^g' /usr/local/src/xml/xml_rpc.conf.xml;
sed -i 's^</bindings>^<binding name="directory"><param name="gateway-url" value="'$SYS_SERVICE_DYN_CON_DIRECTORYPROFILE'" bindings="directory"/></binding> <binding name="callapp"><param name="gateway-url" value="'$SYS_SERVICE_DYN_CON_CALLAPP'" bindings="dialplan" method="get"/></binding></bindings>^g' /usr/local/src/xml/xml_curl.conf.xml;
sed -i 's^<param name="ext-rtp-ip" value="auto-nat"/>^<param name="ext-rtp-ip" value="'$FS_EXTERNALIP'"/>^g; s^<param name="ext-sip-ip" value="auto-nat"/>^<param name="ext-sip-ip" value="'$FS_EXTERNALIP'"/>^g' /usr/local/src/xml/internal.xml;
sed -i 's^<param name="ext-rtp-ip" value="auto-nat"/>^<param name="ext-rtp-ip" value="'$FS_EXTERNALIP'"/>^g; s^<param name="ext-sip-ip" value="auto-nat"/>^<param name="ext-sip-ip" value="'$FS_EXTERNALIP'"/>^g' /usr/local/src/xml/external.xml;
sed -i 's^<domain name="$${domain}">^<domain name="'$FS_EXTERNALIP'">^g' /usr/local/src/xml/default.xml;
rm -f /usr/local/freeswitch/conf/autoload_configs/event_socket.conf.xml;
cp /usr/local/src/xml/event_socket.conf.xml /usr/local/freeswitch/conf/autoload_configs/event_socket.conf.xml;
rm -f /usr/local/freeswitch/conf/autoload_configs/switch.conf.xml;
cp /usr/local/src/xml/switch.conf.xml /usr/local/freeswitch/conf/autoload_configs/switch.conf.xml;
rm -f /usr/local/freeswitch/conf/autoload_configs/xml_rpc.conf.xml;
cp /usr/local/src/xml/xml_rpc.conf.xml /usr/local/freeswitch/conf/autoload_configs/xml_rpc.conf.xml;
rm -f /usr/local/freeswitch/conf/autoload_configs/xml_curl.conf.xml;
cp /usr/local/src/xml/xml_curl.conf.xml /usr/local/freeswitch/conf/autoload_configs/xml_curl.conf.xml;
rm -f /usr/local/freeswitch/conf/directory/default.xml;
cp /usr/local/src/xml/default.xml /usr/local/freeswitch/conf/directory/default.xml;
rm -f /usr/local/freeswitch/conf/sip_profiles/internal.xml;
cp /usr/local/src/xml/internal.xml /usr/local/freeswitch/conf/sip_profiles/internal.xml;
rm -f /usr/local/freeswitch/conf/sip_profiles/external.xml;
cp /usr/local/src/xml/external.xml /usr/local/freeswitch/conf/sip_profiles/external.xml



    


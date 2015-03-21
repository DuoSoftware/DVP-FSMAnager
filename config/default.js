module.exports = {
    Freeswitch : {
        id: 1,
        ip: 'localhost',
        port: 8021,
        password: 'devadmin',
        profilePath: "F:/sukitha/Projects/freeswitch-1.4.0.beta3/freeswitch-1.4.0.beta3/freeswitch-1.4.0/Win32/Debug/conf/sip_profiles",
        DummyProfile: "E://DUMMY.xml"
    },

    Redis : {
        ip: 'localhost',
        port: 6379
    },

    "DB": {
        "Type":"postgres",
        "User":"duo",
        "Password":"DuoS123",
        "Port":5432,
        "Host":"127.0.0.1",
        "Database":"dvpdb"
    }
};
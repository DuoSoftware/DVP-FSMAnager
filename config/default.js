module.exports = {
    Freeswitch : {
        id: 1,
        ip: 'localhost',
        port: 8021,
        password: 'devadmin',
        profilePath: "F:/sukitha/Projects/freeswitch-1.4.0.beta3/freeswitch-1.4.0.beta3/freeswitch-1.4.0/Win32/Debug/conf/sip_profiles",
        DummyProfile: "E://DUMMY.xml",
        soundFilePath: "E://"
    },

    Redis : {
        ip: '192.168.0.68',
        port: 6379
    },

    "DB": {
        "Type":"postgres",
        "User":"duo",
        "Password":"DuoS123",
        "Port":5432,
        "Host":"127.0.0.1",
        "Database":"dvpdb"
    },

    Services : {

        fileService: "http://192.168.0.22:8081/DVP/API/6.0/FIleService/FileHandler/DownloadFile/",
        profileService: "http://localhost:3000/DVP/API/1.0/CloudConfiguration/Profile"

    }
};
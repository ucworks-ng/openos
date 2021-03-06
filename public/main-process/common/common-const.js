module.exports = Object.freeze({
    // Site Config 파일 명
    SITE_CONFIG_FILE: 'site.cfg',

    PLATFORM: {
        MAC: 'darwin',
        LINUX: 'linux',
        WIN: 'win32'
    },

    /** 쪽지 구분 */ 
    MSG_TYPE: {
        ALL: 'ALL',
        SEND:'SEND',   //보낸쪽지
        RECEIVE:'RECV' // 받은쪽지
    },

    /** 쪽지 유형 */
    MSG_DATA_TYPE : {
        COMMON: 'COMMON',  // 일반쪽지
        CONFIRM: 'CONFIRM' // 수신확인용 쪽지
    },

    /** 대화방 유형 */
    CHAT_ROOM_TYPE : {
        SINGLE: 1, // 1:1
        MULTI: 2 // 1:N
    },

    /** 대화 유형 */
    CAHT_TYPE : {
        CHAT: "U",
        EMOTICON: "E",
        FILE: "R",
    },

    /** 날짜포멧 */
    DATE_FORMAT: {
        YYYYMMDDHHmmssSSS: 'YYYYMMDDHHmmssSSS',
        YYYYMMDDHHmmss: 'YYYYMMDDHHmmss',
    },

    // 1->select, 2->insert, 3->update, 4->delete 5->sync select(count), 6-sync select - row갯수 포함한것
    DML_KIND: {
        SELECT: 1,
        INSERT: 2, 
        UPDATE: 3,
        DELETE: 4, 
    }
     
});     
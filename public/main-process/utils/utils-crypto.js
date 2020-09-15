
var crypto = require('crypto');

const CmdConst = require('../net-command/command-const');
const { sendLog } = require('../ipc/ipc-cmd-sender');

/**
 * 지정된 길이의 임의 비밀번호를 발생합니다.
 * @param {Integer} len 
 */
function randomPassword(len) {
    let pwdStr = '';

    let seedChar = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';

    for(let i = 0; i < len; i++) {
        let charInx = Math.floor(Math.random() * (seedChar.length));
        pwdStr += seedChar.charAt(charInx);
    }

    return pwdStr;
}

//#region RC4
/**
 * RC4 알고이즘으로 람호화 합니다.
 * @param {String} key 
 * @param {String} text 
 */
function encryptRC4(key, text) {
    try {
        //var keyHash = crypto.createHash('sha256').update(key).digest();
        var keyHash = Buffer.from(key, global.ENC);
        var cipher = crypto.createCipheriv('rc4', keyHash,'');
        return cipher.update(text, 'utf8', 'hex');
    } catch (err) {
        console.log('encryptRC4 Err! ', key, text, err);
        sendLog('encryptRC4 Ex', err);
    }
    
    return '';
}
/**
 * RC4 암호 문자열을 복호화 합니다.
 * @param {String}} key 
 * @param {String} ciphertext 
 */
function decryptRC4(key, ciphertext) {

    //console.log('[decryptRC4] -----------------  key:' + key + ', ciphertext :' + ciphertext + '')
    //var keyHash = crypto.createHash('sha256').update(key).digest();
    var keyHash = Buffer.from(key, global.ENC);
    var decipher = crypto.createDecipheriv('rc4', keyHash,'' );
    var text = decipher.update( ciphertext, 'hex','utf8');
    return text;
}
//#endregion RC4


//#region AES256
/**
 * AES256 방식으로 Encrypt 합니다.
 * @param {String} key 
 * @param {String} text 
 */
function encryptAES256(key, text) {
    // Key length is dependent on the algorithm. In this case for aes256, it is
    // 32 bytes (256 bits).
    //const keyHash = crypto.scryptSync(key, 'salt', 32);
    //const iv = Buffer.alloc(16, 0);
    const keyHash = Buffer.from(key, global.ENC);
    const iv = Buffer.alloc(16, key, global.ENC);


    var cipher = crypto.createCipheriv('aes-256-cbc', keyHash, iv);
    cipher.setAutoPadding(true)
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
  
    // let buf1 = cipher.update(text)
    // let buf2 = cipher.final()
    //let encBuf = Buffer.concat([buf1, buf2]);
    //let encrypted = encBuf.toString('base64')

    return encrypted;
}

/**
 * AES256 방식으로 Decoding 합니다.
 * @param {String} key 
 * @param {String} ciphertext 
 */
function decryptAES256(key, ciphertext) {
    // Key length is dependent on the algorithm. In this case for aes192, it is
    // 32 bytes (256 bits).
    //const keyHash = crypto.scryptSync(key, 'salt', 32);
    //const iv = Buffer.alloc(16, 0);
    const keyHash = Buffer.from(key, global.ENC);
    const iv = Buffer.alloc(16, key, global.ENC);

    var decipher  = crypto.createDecipheriv('aes-256-cbc', keyHash, iv);
    decipher.setAutoPadding(true)
    
    //ciphertext = Buffer.from(ciphertext, 'base64').toString('utf8');
    let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}
//#endregion AES256
    
/**
 * 메세지 Enc 알고이즘에 따라 암호화 합니다.
 * @param {String} message 
 * @returns {Object} {cipherContent:cipherContent, encKey:encKey}
 */
function encryptMessage(message) {
    
    let tmpPwd = '';
    let cipherPwd = '';
    let cipherContent = '';
    let encKey = '';

    switch(global.ENCRYPT.msgAlgorithm) {
        case CmdConst.ENCODE_TYPE_OTS:
            tmpPwd = randomPassword(4);
            cipherPwd = encryptRC4(CmdConst.SESSION_KEY, tmpPwd);
            
            // Message Content
            cipherContent = encryptRC4(tmpPwd, message);
            // Message Enctypt Info
            encKey = CmdConst.ENCODE_TYPE_OTS + CmdConst.SEP_PIPE + cipherPwd
            break;

        case CmdConst.ENCODE_TYPE_OTS_AES256:
            
            tmpPwd = randomPassword(32);
            cipherPwd = encryptAES256(CmdConst.SESSION_KEY_AES256, tmpPwd);
           
            // Message Content
            cipherContent = encryptAES256(tmpPwd, message)
            // Message Enctypt Info
            encKey = CmdConst.ENCODE_TYPE_OTS_AES256 + CmdConst.SEP_PIPE + cipherPwd
            break;

        case CmdConst.ENCODE_TYPE_NO:
        default:
            cipherContent = message;
            // Message Enctypt Info
            encKey = CmdConst.ENCODE_TYPE_NO + CmdConst.SEP_PIPE;
            break;
    }

    return {cipherContent:cipherContent, encKey:encKey};
}

/**
 * encryptKey 정보로 해당 메세지를 Decrypt 합니다.
 * @param {String} encryptKey 
 * @param {String} cipherContent 
 * @returns {String} decrypt message
 */
function decryptMessage(encryptKey, cipherContent) {

    let encArr = encryptKey.split(CmdConst.SEP_PIPE);
    let encMode = encArr[0];
    let encKey = encArr[1];
    let message = '';

    switch(encMode) {
      case CmdConst.ENCODE_TYPE_OTS:
        encKey = decryptRC4(CmdConst.SESSION_KEY, encKey);
        message = decryptRC4(encKey, cipherContent);
        break;
      case CmdConst.ENCODE_TYPE_OTS_AES256:
        encKey = decryptAES256(CmdConst.SESSION_KEY_AES256, encKey);
        message = decryptAES256(encKey, cipherContent);
        break;

      default:
        message = cipherContent;
        break;
    }

    return 
}


//
// exports
module.exports = {
    randomPassword: randomPassword,
    encryptRC4: encryptRC4,
    decryptRC4: decryptRC4,
    encryptAES256: encryptAES256,
    decryptAES256: decryptAES256,
    encryptMessage: encryptMessage,
    decryptMessage: decryptMessage,
}

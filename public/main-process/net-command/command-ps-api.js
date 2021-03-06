const logger = require('../../logger')

const CommandHeader = require('./command-header');
const CmdCodes = require('./command-code');
const CmdConst = require('./command-const');
const psCore = require('../net-core/network-ps-core');
const { writePsCommandSync } = require('../net-core/network-ps-sync');

/**
 * 서버로 접속요청 합니다.
 */
function reqconnectPS () {
    psCore.connectPS().then(function() {
        logger.info('PS Connect Success!');
    }).catch(function(err){
        logger.err('PS Connect fale!' + JSON.stringify(err));
    })
}

/**
 * 연결을 종료합니다.
 */
function close() {
    psCore.close();
}

/**
 * 사용자의 컨디션 정보를 조회합니다.
 * @param {*} userId 
 */
function reqGetCondition(userId) {

    return new Promise(async function(resolve, reject) {

        if (!global.SERVER_INFO.PS.isConnected) {
            await psCore.connectPS();
        }

        if (!global.SERVER_INFO.PS.isConnected) {
            reject(new Error('PS IS NOT CONNECTED!'));
            return;
        }

        if (!userId) {
            reject(new Error('userId Empty!'));
            return;
        }

        let idData = 'ID' + CmdConst.SEP_PIPE + userId;
        var dataBuf = Buffer.from(idData, global.ENC);

        logger.info('PS_GET_CONDICTION ------  ', idData)
        psCore.writeCommandPS(new CommandHeader(CmdCodes.PS_GET_CONDICTION, 0, function(resData){
            resolve(resData);
        }), dataBuf);
    });
}

/**
 * 조직도 그룹을 요청합니다.
 * @param {String} userPass 
 */
function reqGetOrganization(groupCode) {
    return new Promise(async function(resolve, reject) {

        if (!global.SERVER_INFO.PS.isConnected) {
            await psCore.connectPS();
        }

        if (!global.SERVER_INFO.PS.isConnected) {
            reject(new Error('PS IS NOT CONNECTED!'));
            return;
        }

        var orgGroupCodeBuf = Buffer.alloc(CmdConst.BUF_LEN_ORG_GROUP_CODE);
        var groupCodeBuf = Buffer.alloc(CmdConst.BUF_LEN_GROUP_CODE);
        var classIdBuf = Buffer.alloc(CmdConst.BUF_LEN_INT);
        
        orgGroupCodeBuf.write(groupCode, global.ENC);

        var dataBuf = Buffer.concat([orgGroupCodeBuf, groupCodeBuf, classIdBuf]);
        psCore.writeCommandPS(new CommandHeader(CmdCodes.PS_GET_BASE_CLASS, 0, function(resData){
            resolve(resData);
        }), dataBuf);
    });
}

/**
 * 하위 그룹을 요청합니다.
 */
function reqGetOrgChild(orgGroupCode, groupCode, groupSeq) {
    return new Promise(async function(resolve, reject) {

        if (!global.SERVER_INFO.PS.isConnected) {
            await psCore.connectPS();
        }

        if (!global.SERVER_INFO.PS.isConnected) {
            reject(new Error('PS IS NOT CONNECTED!'));
            return;
        }

        logger.info('reqGetOrgChild ----' , orgGroupCode, groupCode, groupSeq);

        var orgGroupCodeBuf = Buffer.alloc(CmdConst.BUF_LEN_ORG_GROUP_CODE);
        var groupCodeBuf = Buffer.alloc(CmdConst.BUF_LEN_GROUP_CODE);
        var classIdBuf = Buffer.alloc(CmdConst.BUF_LEN_INT);
        
        orgGroupCodeBuf.write(orgGroupCode, global.ENC);
        groupCodeBuf.write(groupCode, global.ENC);
        classIdBuf.writeInt32LE(groupSeq);

        var dataBuf = Buffer.concat([orgGroupCodeBuf, groupCodeBuf, classIdBuf]);
        psCore.writeCommandPS(new CommandHeader(CmdCodes.PS_GET_CHILD_CLASS, 0, function(resData){
            resolve(resData);
        }), dataBuf);
    });
}

/**
 * 사용자 정보를 요청합니다.
 * @param {Array} userIds 
 */
function reqGetUserInfos(userIds) {
    return new Promise(async function(resolve, reject) {

        if (!global.SERVER_INFO.PS.isConnected) {
            await psCore.connectPS();
        }

        if (!global.SERVER_INFO.PS.isConnected) {
            reject(new Error('PS IS NOT CONNECTED!'));
            return;
        }

        if (userIds) {
            let idDatas = '';
            idDatas = userIds.join(CmdConst.SEP_CR);
            logger.info('reqUserInfos ----' , idDatas);

            var dataBuf = Buffer.from(idDatas, global.ENC);
            psCore.writeCommandPS(new CommandHeader(CmdCodes.PS_GET_USERS_INFO, 0, function(resData){
                resolve(resData);
            }), dataBuf);
        } else {
            reject(new Error('UserId Empty!', userIds));
            return;
        }
    });
}

var workingGetUserInfos = false;
/**
 * 사용자 정보를 요청합니다. (Sync)
 * @param {Array} userIds 
 */
function reqGetUserInfosSync(userIds) {
    return new Promise(async function(resolve, reject) {
           
        if (userIds) {
            let idDatas = '';
            idDatas = userIds.join(CmdConst.SEP_CR);
            logger.info('reqGetUserInfosSync ----' , userIds);

            var dataBuf = Buffer.from(idDatas, global.ENC);
            writePsCommandSync(new CommandHeader(CmdCodes.PS_GET_USERS_INFO, 0, function(resData){
                try {
                    let userInfos = resData.data.items.node_item;
                    if (!Array.isArray(userInfos)) {
                        userInfos = [userInfos]
                    }
                    let resUserIds = userInfos.map((v) => v.user_id.value);
                } catch (err) {
                    logger.debug('reqGetUserInfosSync res Error -req:%s ' ,userIds, err);
                }
              
                resolve(resData);
            }), dataBuf);
        } else {
            reject(new Error('UserId Empty!', userIds));
            return;
        }
    });
}


/**
 * 통합 사용자 검색
 * @param {Array} userIds 
 */
function reqSearchUsers(searchMode, searchText) {
    return new Promise(async function(resolve, reject) {

        if (!global.SERVER_INFO.PS.isConnected) {
            await psCore.connectPS();
        }

        if (!global.SERVER_INFO.PS.isConnected) {
            reject(new Error('PS IS NOT CONNECTED!'));
            return;
        }

        let data = searchMode + CmdConst.SEP_PIPE + searchText;
        logger.info('reqSearchUsers ----' , data);
        var dataBuf = Buffer.from(data, global.ENC);
        psCore.writeCommandPS(new CommandHeader(CmdCodes.PS_GET_CONDICTION, 0, function(resData){
            resolve(resData);
        }), dataBuf);
    });
}

/**
 * 조직도 사용자 검색
 * @param {Array} userIds 
 */
function reqSearchOrgUsers(orgGroupCode, searchText) {
    return new Promise(async function(resolve, reject) {

        if (!global.SERVER_INFO.PS.isConnected) {
            await psCore.connectPS();
        }

        if (!global.SERVER_INFO.PS.isConnected) {
            reject(new Error('PS IS NOT CONNECTED!'));
            return;
        }

        let orgGoupCodeBuf = Buffer.alloc(CmdConst.BUF_LEN_ORG_GROUP_CODE);
        orgGoupCodeBuf.write(orgGroupCode, global.ENC);
        let goupCodeBuf = Buffer.alloc(CmdConst.BUF_LEN_GROUP_CODE);
        let classIdBuf = Buffer.alloc(CmdConst.BUF_LEN_INT);
        classIdBuf.writeInt32LE(0);

        let searchTextBuf = Buffer.from(searchText, global.ENC);

        var dataBuf = Buffer.concat([orgGoupCodeBuf, goupCodeBuf, classIdBuf, searchTextBuf]);
        psCore.writeCommandPS(new CommandHeader(CmdCodes.PS_GET_CLASS_USER, 0, function(resData){
            resolve(resData);
        }), dataBuf);
    });
}
module.exports = {
    reqGetCondition: reqGetCondition,
    reqGetOrganization: reqGetOrganization,
    reqGetOrgChild: reqGetOrgChild,
    reqGetUserInfos: reqGetUserInfos,
    reqGetUserInfosSync: reqGetUserInfosSync,
    reqSearchUsers: reqSearchUsers,
    reqSearchOrgUsers: reqSearchOrgUsers,
    close: close
}

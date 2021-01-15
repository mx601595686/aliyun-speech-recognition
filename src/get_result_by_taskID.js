'use strict';

const path = require('path');
const fs = require('fs-extra');
const Client = require('@alicloud/nls-filetrans-2018-08-17');

/**
 * 根据 taskID 索取语音识别结果
 */

/**
 * 识别结果保存路径
 */
const savePath = path.resolve(__dirname, '../', 'recognition_result');

/**
 * 要索取的 taskID 列表
 */
var taskID = [
    '246e612c574711ebb29ec5f9773643ba'
];

/**
 * 创建阿里云鉴权client
 */
const client = new Client({
    accessKeyId: 'asdasd',                        // 您的AccessKey Id
    secretAccessKey: 'asdasd',      // 您的AccessKey Secret
    endpoint: 'http://filetrans.cn-shanghai.aliyuncs.com',  // 地域ID，固定值
    apiVersion: '2018-08-17'
});

/**
 * 提交录音文件识别请求，请求参数组合成JSON格式的字符串作为task的值
 * 请求参数appkey：项目appkey
 * 请求参数file_link：需要识别的录音文件
 */
const task = {
    appkey: 'asdasd',         // 您的appkey
    version: "4.0",                     // 新接入请使用4.0版本，已接入（默认2.0）如需维持现状，请注释掉该参数设置。
    enable_words: true,                 // 设置是否输出词信息，默认值为false，开启时需要设置version为4.0。
    enable_sample_rate_adaptive: true,  // 自适应码率
    file_link: undefined
};

function getResult(taskID) {
    return new Promise((resolve, reject) => {
        const timer = setInterval(async () => {
            try {
                const response = await client.getTaskResult({ TaskId: taskID });
                console.log('识别结果查询响应：' + taskID);

                switch (response.StatusText) {
                    case 'RUNNING':
                    case 'QUEUEING':
                        // console.log(response); // 继续轮询，注意间隔周期。
                        return;

                    case 'SUCCESS':
                    case 'SUCCESS_WITH_NO_VALID_FRAGMENT':
                        console.log('录音文件识别成功：');
                        const filename = path.resolve(savePath, path.basename(fileLink) + '.json');
                        response.Result.fileLink = fileLink;
                        await fs.ensureFile(filename);
                        await fs.writeJSON(filename, response.Result);
                        resolve();
                        break;

                    default:
                        throw new Error('录音文件识别失败!\n' + util.format(response));
                }
            } catch (error) {
                reject(error);
            }

            clearInterval(timer);
        }, 5000);
    });
}

Promise.all(taskID.map(i => getResult(i)));
'use strict';

const path = require('path');
const fs = require('fs-extra');
const util = require('util');
const Client = require('@alicloud/nls-filetrans-2018-08-17');

/**
 * 阿里云语音识别
 */

/**
 * 识别结果保存路径
 */
const savePath = path.resolve(__dirname, '../', 'recognition_result');

/**
 * 要识别的文件列表
 */
var taskList = [
    'http://hostus.program-hub.cn/test.mp3'
];
var taskList = fs.readdirSync(path.resolve(__dirname, '../', 'transcode_result')).map(i => 'http://hostus.program-hub.cn/' + i)

/**
 * 创建阿里云鉴权client
 */
const client = new Client({
    accessKeyId: 'KyodasdasdN',                        // 您的AccessKey Id
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

/**
 * 语音识别
 * @param fileLink 文件对应的网址
 */
async function fileTrans(fileLink) {
    // 提交录音文件识别请求，处理服务端返回的响应。
    const response = await client.submitTask({ Task: JSON.stringify({ ...task, file_link: encodeURI(fileLink) }) }, { method: 'POST' })

    // 服务端响应信息的状态描述StatusText。
    if (response.StatusText != 'SUCCESS') throw new Error('录音文件识别请求响应失败!\n' + util.format(response));
    console.log('录音文件识别请求响应成功!');

    /**
     * 以TaskId为查询参数，提交识别结果查询请求。
     * 以轮询的方式进行识别结果的查询，直到服务端返回的状态描述为"SUCCESS"、SUCCESS_WITH_NO_VALID_FRAGMENT，
     * 或者为错误描述，则结束轮询。
     */
    const taskID = { TaskId: response.TaskId };

    return new Promise((resolve, reject) => {
        const timer = setInterval(async () => {
            try {
                const response = await client.getTaskResult(taskID);
                console.log('识别结果查询响应：');

                switch (response.StatusText) {
                    case 'RUNNING':
                    case 'QUEUEING':
                        console.log(response); // 继续轮询，注意间隔周期。
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

(async () => {
    for (let index = 0; index < taskList.length; index++) {
        console.log(`开始识别 [${index} / ${taskList.length}]：${taskList[index]}`);
        await fileTrans(taskList[index]);
    }
})().catch(console.error);
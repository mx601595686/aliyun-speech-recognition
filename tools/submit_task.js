const path = require('path');
const util = require('util');
const fs = require('fs-extra');
const Client = require('@alicloud/nls-filetrans-2018-08-17');
const appConfig = require('../app_config');

/**
 * 提交语音识别任务
 */

/**
 * 记录正在处理中的任务
 */
const processing_tasks_file_path = path.resolve(appConfig.recognitionResultsPath, 'processing_tasks.json');
const processing_tasks = fs.readJsonSync(processing_tasks_file_path, { throws: false }) || {};

/**
 * 要识别的文件列表
 */
const taskList = fs.readdirSync(appConfig.transcodeAudiosPath)
    .filter(i => path.extname(i) == '.mp3' && !(i in processing_tasks));

/**
 * 创建阿里云鉴权client
 */
const client = new Client({
    accessKeyId: appConfig.accessKeyId,
    secretAccessKey: appConfig.secretAccessKey,
    endpoint: 'http://filetrans.cn-shanghai.aliyuncs.com',  // 地域ID，固定值
    apiVersion: '2018-08-17'
});

/**
 * 提交录音文件识别请求模板，请求参数组合成JSON格式的字符串作为task的值
 */
const task = {
    appkey: appConfig.appkey,           // 您的项目appkey
    version: "4.0",                     // 新接入请使用4.0版本，已接入（默认2.0）如需维持现状，请注释掉该参数设置。
    enable_words: true,                 // 设置是否输出词信息，默认值为false，开启时需要设置version为4.0。
    enable_sample_rate_adaptive: true   // 自适应码率
};

/**
 * 提交语音识别任务
 * @returns TaskId
 */
async function submitTask(filename) {
    const file_link = encodeURI(path.resolve(appConfig.fileServerRoot, filename));

    // 提交录音文件识别请求，处理服务端返回的响应。
    const response = await client.submitTask({ Task: JSON.stringify({ ...task, file_link }) }, { method: 'POST' });

    // 服务端响应信息的状态描述StatusText
    if (response.StatusText != 'SUCCESS')
        throw new Error('录音文件识别请求响应失败!\n' + util.format(response));

    return response.TaskId;
}

(async () => {
    try {
        for (let index = 0; index < taskList.length; index++) {
            const filename = taskList[index];
            console.log(`开始提交 [${index} / ${taskList.length}]：${filename}`);
            const taskID = await submitTask(filename);
            processing_tasks[filename] = taskID;
        }
    } catch (error) {
        console.error(error);
    }

    fs.ensureFileSync(processing_tasks_file_path);
    fs.writeJsonSync(processing_tasks_file_path, processing_tasks);
})();

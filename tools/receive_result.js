const path = require('path');
const util = require('util');
const fs = require('fs-extra');
const Client = require('@alicloud/nls-filetrans-2018-08-17');
const appConfig = require('../app_config');

/**
 * 根据 taskID 索取语音识别结果
 */

/**
 * 记录正在处理中的任务
 */
const processing_tasks_file_path = path.resolve(appConfig.recognitionResultsPath, 'processing_tasks.json');
const processing_tasks = fs.readJsonSync(processing_tasks_file_path, { throws: false });
if (processing_tasks == null) throw '没有正在执行的任务';

/**
 * 创建阿里云鉴权client
 */
const client = new Client({
    accessKeyId: appConfig.accessKeyId,
    secretAccessKey: appConfig.secretAccessKey,
    endpoint: 'http://filetrans.cn-shanghai.aliyuncs.com',  // 地域ID，固定值
    apiVersion: '2018-08-17'
});

function getResult(filename, taskID) {
    return new Promise((resolve, reject) => {
        const timer = setInterval(async () => {
            try {
                const response = await client.getTaskResult({ TaskId: taskID });
                console.log('识别结果查询响应：' + taskID);

                switch (response.StatusText) {
                    case 'RUNNING':
                    case 'QUEUEING':
                        console.log(response); // 继续轮询，注意间隔周期。
                        return;

                    case 'SUCCESS':
                    case 'SUCCESS_WITH_NO_VALID_FRAGMENT':
                        console.log('录音文件识别成功：' + taskID);

                        delete processing_tasks[filename];
                        await fs.writeJSON(processing_tasks_file_path, processing_tasks);

                        const savePath = path.resolve(appConfig.recognitionResultsPath, filename + '.json');
                        await fs.ensureFile(savePath);
                        await fs.writeJSON(savePath, response.Result);
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

Promise.all(Object.keys(processing_tasks).map(i => getResult(i, processing_tasks[i])));
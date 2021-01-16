# aliyun-speech-recognition

阿里云语音识别工具包

> 注意事项：
>
> 1. 阿里云对于字词 `Words` 的开始和结束时间划分的并不准确。句子 `Sentences` 的开始和结束时间划分比较准确。

## 程序配置

在项目根目录下创建一个 `app_config.js` 文件，将一下内容填入

```js
const path = require('path');

module.exports = {
    accessKeyId: 'Kyo3asd90lVU7ttN', // 您的AccessKey Id
    secretAccessKey: 'B2asdVJTaBwyUQ6ANxxe3BwnrRfoqg', // 您的AccessKey Secret
    appkey: 'z67UTmyasdC8byNK', // 您的appkey
    recognitionResultsPath: path.resolve(__dirname, 'recognition_results'), // 语音识别结果保存位置
    transcodeAudiosPath: path.resolve(__dirname, 'transcode_audios'), // 音频转码保存位置
    fileServerRoot: 'http://program-hub.cn/index', // 文件服务器根路径
};
```

## npm run transcode

将媒体文件转换成阿里云要求的格式与编码 _`(单声道 16k采样率 MP3)`_，结果保存在 `transcodeAudiosPath` 中

## npm run submit_task

向阿里云提交语音识别任务。要进行识别的文件需放到 `transcodeAudiosPath` 中，而且需要用一台带域名的的服务器，反向代理该目录来让阿里云访问，具体的方法可参考[《使用 nginx + xshell5 实现内网穿透 （反向隧道）》](https://zhuanlan.zhihu.com/p/89247288)

提交完成后不要立即关闭反向代理，因为阿里云之后可能还会再次访问，如果无法访问可能会导致识别失败

## npm run receive_result

检查识别进度，将识别结果保存到 `recognitionResultsPath`。

`recognitionResultsPath` 目录下的 `processing_tasks.json` 记录的是还没有收到结果或者识别失败的任务。

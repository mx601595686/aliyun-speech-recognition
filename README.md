# aliyun-speech-recognition
阿里云语音识别工具包


```js
const path = require('path');

module.exports = {
    accessKeyId: 'Kyo3WFzasdVU7ttN',                        // 您的AccessKey Id
    secretAccessKey: 'B2bWwVasdBwyUQ6ANxxe3BwnrRfoqg',      // 您的AccessKey Secret
    appkey: 'z67Uasdn0aC8byNK',                             // 您的appkey
    recognition_results: path.resolve(__dirname, 'recognition_results'),    // 语音识别结果保存位置
    transcode_audios: path.resolve(__dirname, 'transcode_audios'),          // 音频转码保存位置
};
```
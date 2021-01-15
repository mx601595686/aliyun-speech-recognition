const fs = require('fs-extra');
const path = require('path');
const child_process = require('child_process');

/**
 * 将音频转换成合适的格式与编码
 * 单声道 16k采样率 MP3 文件
 */

/**
 * 输入音频文件夹路径
 */
const inputPath = 'E:\\SoftwareDevelopment\\Spectrogram2Waveform\\training_data\\audio';

/**
 * 输出音频文件夹路径
 */
const outputPath = path.resolve(__dirname, '../transcode_result');
fs.ensureDirSync(outputPath);

const files = fs.readdirSync(inputPath)
    .map(i => path.join(inputPath, i))
    .filter(i => fs.statSync(i).isFile())

for (let index = 0; index < files.length; index++) {
    const meta = path.parse(files[index]);
    console.log(`\n开始转换 [${index} / ${files.length}]：${meta.base}\n`);

    meta.ext = '.mp3';
    meta.dir = outputPath;
    delete meta.base;
    delete meta.root;

    child_process.execFileSync('ffmpeg', [
        '-i', files[index],
        '-ar', '16000', '-ac', '1',
        path.format(meta)
    ], { stdio: 'inherit' });
}
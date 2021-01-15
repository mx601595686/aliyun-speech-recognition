const path = require('path');
const fs = require('fs-extra');
const readline = require('readline');
const child_process = require('child_process');

/**
 * 将媒体文件转换成阿里云要求的格式与编码
 * 单声道 16k采样率 MP3 文件
 */

const outputPath = require('../app_config').transcodeAudiosPath;
fs.ensureDirSync(outputPath);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question('将媒体文件转换成阿里云要求的格式与编码\n\n' + '请输入媒体文件所在的目录地址：', answer => {
    const inputPath = answer.trim();
    if (inputPath == '') process.exit();

    const files = fs.readdirSync(inputPath)
        .filter(i => /.(wav|mpeg|mp3|mp4|webm|aac|aacp|ogg|flac|rm|rmvb|3gp|avi|mpg|mov|mkv)$/i.test(path.extname(i)))
        .map(i => path.resolve(inputPath, i))
        .filter(i => fs.statSync(i).isFile());

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

    process.exit();
});
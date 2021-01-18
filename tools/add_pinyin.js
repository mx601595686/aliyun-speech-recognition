const path = require('path');
const _ = require('lodash');
const fs = require('fs-extra');
const pinyin = require('pinyin');
const appConfig = require('../app_config');

const files = fs.readdirSync(appConfig.recognitionResultsPath)
    .filter(i => path.extname(i) == '.json')
    .map(i => path.resolve(appConfig.recognitionResultsPath, i))
    .map(i => [i, fs.readJsonSync(i)])
    .filter(i => 'Sentences' in i[1]);

for (let index = 0; index < files.length; index++) {
    const [filePath, data] = files[index];

    console.log(`开始处理 [${index + 1} / ${files.length}]：${path.basename(filePath)}`);

    for (const item of data.Sentences) {
        item.Pinyin = _.flatten(pinyin(item.Text, appConfig.pinyinOption));
    }

    if ('Words' in data) {
        let start = 0, end = 0;

        for (let index = 0; index < data.Sentences.length; index++) {
            const sentence = data.Sentences[index];
            const sentence_next = data.Sentences[index + 1];
            start = _.findIndex(data.Words, { BeginTime: sentence.BeginTime }, end);
            end = sentence_next ? _.findIndex(data.Words, { BeginTime: sentence_next.BeginTime }, start) : data.Words.length;

            if (/[a-z]+/i.test(sentence.Text)) { // 如果句子中有英文，就直接使用 pinyin 去推断字音，这种方式会不太准确
                for (let i = start; i < end; i++) {
                    const word = data.Words[i];
                    word.Pinyin = pinyin(word.Word, appConfig.pinyinOption);
                }
            } else {
                for (let i = start; i < end; i++) {
                    const word = data.Words[i];
                    const offset = sentence.Text.indexOf(word.Word);
                    word.Pinyin = sentence.Pinyin.slice(offset, offset + word.Word.length);
                }
            }
        }
    }

    fs.writeJSONSync(filePath, data);
}
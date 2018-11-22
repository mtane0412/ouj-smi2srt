'use strict'
const fs = require('fs');
const jschardet = require('jschardet');
const iconv = require('iconv-lite');

const msToTime = (match, duration) => {
  const hour = Math.floor(duration / 3600000);
  const minute = Math.floor((duration - 3600000 * hour) / 60000);

  const hh = ('00' + hour).slice(-2);
  const mm = ('00' + minute).slice(-2);
  const ms = ('00000' + (duration % 60000)).slice(-5);
  const time = `${hh}:${mm}:${ms.slice(0,2)},${ms.slice(2,5)}`;

  return time + '::';
}

const convert = (filePath) => {
  const buffer = fs.readFileSync(filePath);
  const encoding = jschardet.detect(buffer).encoding;
  let smi = iconv.decode(buffer, encoding);

  smi = smi
    .replace(/<SAMI>[\s\S\r]*<Body>(\r\n|\r|\n)|<\/Body><\/SAMI>|<\/?SPAN.*?>|<\/?P.*?>|<RUBY>\.<RT>\.<\/RT><\/RUBY>|\.|<\/?RUBY>|<\/Sync>/g, "")
    .replace(/<RT>/g, "(")
    .replace(/<\/RT>/g, ")")
    .replace(/&#65374;/g, "〜")
    .replace(/<br\/>/g, ':return:')
    .replace(/.*?Start="(\d*?)".*?\/>/g, msToTime)
    .replace(/.*?Start="(\d*?)".*?>/g, msToTime)
    .replace(/(\r\n|\r|\n){2,}/g, '\n')
    .replace(/.*?ENCC[\s\S\r\n]*/g, '');

  const blocks = smi.split('\n');
  let srt = new String;
  blocks.reduce((previous, current, index) => {
    let [startTime, preSub] = previous.split('::');
    let endTime = current.split('::')[0];
    if (endTime) {
      srt += `${index}\n${startTime} --> ${endTime}\n${preSub.replace(/:return:/g, '\n')}\n`;
    }
    return current;
  })

  return srt;
}

module.exports = convert;
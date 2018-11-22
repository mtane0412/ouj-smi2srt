#!/usr/bin/env node

'use strict'

const fs = require('fs');
const path = require('path');
const program = require('commander');
const convert = require('./convert');

program
    .version('0.0.1')
    .option('-i, --input <path>', 'input .smi file path', String)
    .option('-o, --output <path>', 'output .srt file path', String)
    .parse(process.argv)

const input = program.input || program.args[0];
const output = program.output || program.args[1];

if (input) {
    const srt = convert(input);
    const filePath = output ? path.parse(output).name + '.srt' : path.parse(input).name + '.srt';
    fs.writeFile(filePath, srt, error => {
        if (error) throw error;
        console.log(`Converted: ${input} --> ${filePath}`);
    });
    return;
} else {
    program.help();
    return;
}
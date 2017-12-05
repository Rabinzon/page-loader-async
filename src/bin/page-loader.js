#!/usr/bin/env node
import program from 'commander';
import process from 'process';
import pageLoader from '..';

program
  .version('0.0.1')
  .arguments('<url>')
  .description('Utility for download of files from the web.')
  .option('-o, --output [path]', 'Output path')
  .action((url, options) => {
    if (!url) {
      program.help();
    }
    pageLoader(url, options.output);
  })
  .parse(process.argv);

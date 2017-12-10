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
    pageLoader(url, options.ouatput)
      .then((fileName) => {
        console.log(`Page was downloaded as '${fileName}'`);
        process.exit(0);
      })
      .catch((err) => {
        console.error('ERROR:', err);
        process.exit(1);
      });
  })
  .parse(process.argv);

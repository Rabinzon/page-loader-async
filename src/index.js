import axios from 'axios';
import fs from 'mz/fs';
import path from 'path';
import 'babel-polyfill';

const getPage = url =>
  axios.get(url).then(({ data }) => data);

const getFileName = (url) => {
  const fileName = url.replace(/^.+:\/\//, '').replace(/\W/gi, '-');
  return `${fileName}.html`;
};

const loadPage = ({ url, outputPath }) => {
  const fileName = getFileName(url);
  const currentDir = path.resolve('./', fileName);
  const outputDir = outputPath ? path.resolve(outputPath, fileName) : currentDir;
  return getPage(url)
    .then((page) => {
      console.log(`✔ ${url}\n`);
      return fs.writeFile(outputDir, page);
    })
    .then(() => console.log(`Page was downloaded as '${fileName}'`));
};

export default (url, outputPath) =>
  fs.exists(outputPath).then((exists) => {
    if (outputPath && !exists) {
      return Promise.reject(new Error(`${outputPath} directory does not exist`));
    }
    return { url, outputPath };
  })
    .then(loadPage);

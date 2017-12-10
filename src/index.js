import axios from 'axios';
import fs from 'mz/fs';
import debug from 'debug';
import path from 'path';
import process from 'process';
import Url from 'url';
import cheerio from 'cheerio';

const debugFetch = debug('page-loader:fetch');
const debugWriteFile = debug('page-loader:writeFile');

const getFileName = (src) => {
  const { host, pathname } = Url.parse(src);
  const fileName = `${host || ''}${pathname}`.replace(/\.[a-z]+$/g, '').replace(/\W/gi, '-');
  const ext = path.extname(pathname);
  return ext ? `${fileName}${ext}` : fileName;
};

const fetch = (url, params = {}) =>
  axios.get(url, params)
    .then(({ data, status }) => {
      debugFetch('GET', url, status);
      return data;
    })
    .catch(error => Promise.reject(new Error(`GET ${url} ${error.message}`)));

const loadResources = (html) => {
  const $ = cheerio.load(html);
  const resourceTags = ['link', 'script', 'img'];
  const htmlTags = [...$(resourceTags.map(tag => `${tag}[src]`).toString())];

  const fetchResource = src =>
    fetch(src, { responseType: 'arraybuffer' })
      .then(file => ({ src, file, newName: getFileName(src) }));

  return Promise.all(htmlTags
    .map(tag => fetchResource(tag.attribs.src)))
    .then(files => ({ html, files }));
};

const writeToFile = ({ html, files }, url, outputPath) => {
  const $ = cheerio.load(html);
  const pageFileName = getFileName(url);
  const outputDir = path.resolve(outputPath, `${pageFileName}.html`);
  const filesDir = path.resolve(outputPath, `${pageFileName}_files`);

  files.forEach(({ src, newName }) =>
    $(`[src='${src}']`).attr('src', `${pageFileName}_files/${newName}`));

  debugWriteFile('output path:', outputDir);

  return fs.exists(filesDir)
    .then(exists => (exists ? filesDir : fs.mkdir(filesDir)))
    .then(() => fs.writeFile(outputDir, $.html()))
    .then(() =>
      Promise.all(files.map(({ file, newName }) => {
        debugWriteFile('writing files to:', filesDir);
        return fs.writeFile(path.resolve(filesDir, newName), file, 'binary');
      })))
    .then(() => `${pageFileName}.html`)
    .catch(err => Promise.reject(new Error(err.message)));
};

export default (url, outputPath = process.pwd()) =>
  fs.exists(outputPath).then((exists) => {
    if (!exists) {
      return Promise.reject(new Error(`${outputPath} directory does not exist`));
    }
    return fetch(url)
      .then(loadResources)
      .then(page => writeToFile(page, url, outputPath));
  });

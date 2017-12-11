import axios from 'axios';
import fs from 'mz/fs';
import debug from 'debug';
import path from 'path';
import process from 'process';
import Listr from 'listr';
import Url from 'url';
import cheerio from 'cheerio';

const debugFetch = debug('page-loader:fetch');
const debugWriteFile = debug('page-loader:writeFile');

const getFileName = (src) => {
  const { host, pathname } = Url.parse(src);
  const fileName = `${host || ''}${pathname}`.replace(/\.[a-z]+$/g, '').replace(/\W/gi, '-');
  const ext = path.extname(pathname);
  const newName = ext ? `${fileName}${ext}` : fileName;
  return newName.replace(/(^-|-$)/, '');
};

const fetch = (url, params = {}) =>
  axios.get(url, params)
    .then(({ data, status }) => {
      debugFetch('GET', url, status);
      return data;
    })
    .catch(error => Promise.reject(new Error(`GET ${url} ${error.message}`)));

const loadResources = (url, outputPath) => (html) => {
  const $ = cheerio.load(html);
  const htmlTags = [...$('link[href], script[src], img[src]')];
  const filesDirName = `${getFileName(url)}_files`;
  const filesDirPath = path.resolve(outputPath, filesDirName);

  const fetchResource = src =>
    fetch(src, { responseType: 'arraybuffer' })
      .then(file => ({ src, file, newName: getFileName(src) }));

  return fs.exists(filesDirPath)
    .then(exists => (exists ? filesDirPath : fs.mkdir(filesDirPath)))
    .then(() => new Listr(htmlTags
      .map(({ attribs }) => {
        const src = attribs.src || attribs.href;
        return { title: (src),
          task: () => fetchResource(src)
            .then(({ newName, file }) => fs.writeFile(path.resolve(filesDirPath, newName), file, 'binary'))
            .then(() => {
              debugWriteFile('recourse saved:', getFileName(src));
              $(`[src='${src}']`).attr('src', `${filesDirName}/${getFileName(src)}`);
              $(`[href='${src}']`).attr('href', `${filesDirName}/${getFileName(src)}`);
            }),
        };
      }), { concurrent: true }).run())
    .then(() => $.html())
    .catch(err => Promise.reject(new Error(err.message)));
};

export default (url, outputPath = process.cwd()) =>
  fs.exists(outputPath).then((exists) => {
    if (!exists) {
      return Promise.reject(new Error(`${outputPath} directory does not exist`));
    }
    const fileName = `${getFileName(url)}.html`;
    const outputDir = path.resolve(outputPath, fileName);
    return fetch(url)
      .then(loadResources(url, outputPath))
      .then(html => fs.writeFile(outputDir, html))
      .then(() => fileName);
  });

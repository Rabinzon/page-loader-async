import axios from 'axios';
import fs from 'mz/fs';
import debug from 'debug';
import createPageType from './types/Page';
import createResourceType from './types/Resource';

const debugLoader = debug('page-loader:loader');
const debugFetch = debug('page-loader:fetch');
const debugWriteFile = debug('page-loader:writeFile');

const fetch = (url, params = {}) => {
  debugFetch('GET', url, params);
  return axios.get(url, params)
    .then(({ data, status }) => {
      debugFetch('STATUS', url, status);
      return data;
    }).catch(error =>
      Promise.reject(`GET ${url} ${error.message}`));
}
  ;

const loadResources = (Page) => {
  const promises = Page.resources
    .map(({ attribs: { src } }) =>
      fetch(src, { responseType: 'arraybuffer' })
        .then(file => createResourceType(src, file)));

  return Promise.all(promises)
    .then(files => Page.setResources(files));
};

const writeToFile = (Page) => {
  const { outputDir, filesDir, html } = Page;
  debugWriteFile('output path:', outputDir);
  debugWriteFile('writing files to:', filesDir);
  return fs.exists(filesDir)
    .then(exists => (exists ? filesDir : fs.mkdir(filesDir)))
    .catch(err => Promise.reject(err.message))
    .then(() =>
      Promise.all([
        fs.writeFile(outputDir, html)
          .catch(err => Promise.reject(err.message)),
        ...Page.resources.map(resource => resource.writeToFile(filesDir)),
      ]))

    .then(() => Page);
};

const loadPage = ({ url, outputPath = false }) => {
  debugLoader('loading page from', url);
  return fetch(url)
    .then(html => createPageType(html, url, outputPath))
    .then(loadResources)
    .then(Page => Page.replaceSrcAttribute())
    .then(writeToFile);
};

export default (url, outputPath = false) => {
  if (!outputPath) {
    return loadPage({ url });
  }

  return fs.exists(outputPath).then((exists) => {
    if (outputPath && !exists) {
      return Promise.reject(new Error(`${outputPath} directory does not exist`));
    }
    return { url, outputPath };
  })
    .then(loadPage);
};

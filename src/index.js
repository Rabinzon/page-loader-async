import axios from 'axios';
import fs from 'mz/fs';
import createPageType from './types/Page';
import createResourceType from './types/Resource';

const fetch = (url, params) =>
  axios.get(url, params).then(({ data }) => data);

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

  return fs.exists(filesDir)
    .then(exists => (exists ? filesDir : fs.mkdir(filesDir)))
    .then(() =>
      Promise.all([
        fs.writeFile(outputDir, html),
        ...Page.resources.map(resource => resource.writeToFile(filesDir)),
      ]))
    .then(() => Page);
};

const loadPage = ({ url, outputPath = false }) => fetch(url)
  .then(html => createPageType(html, url, outputPath))
  .then(loadResources)
  .then(Page => Page.replaceSrcAttribute())
  .then(writeToFile);

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

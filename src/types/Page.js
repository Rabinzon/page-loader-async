import path from 'path';
import cheerio from 'cheerio';
import getFileName from '../helpers/getFileName';

const resourceTags = ['link', 'script', 'img'];
const getOutputDirPath = (outputPath, pageUrl) =>
  (outputPath ? path.resolve(outputPath, getFileName(pageUrl, 'html')) : path.resolve('./', getFileName(pageUrl, 'html')));

const getFilesDirPath = (outputPath, pageUrl) =>
  (outputPath ? `${outputPath}/${getFileName(pageUrl)}_files` : `${getFileName(pageUrl)}_files`);

const getPageResources = (html) => {
  const $ = cheerio.load(html);
  return [...$(resourceTags.map(tag => `${tag}[src]`).toString())];
};

const createPageType = (html, pageUrl, outputPath) => ({
  html,
  pageUrl,
  resources: getPageResources(html),
  fileName: getFileName(pageUrl, 'html'),
  outputDir: getOutputDirPath(outputPath, pageUrl),
  filesDir: getFilesDirPath(outputPath, pageUrl),
  setResources(resources) {
    this.resources = resources;
    return this;
  },
  replaceSrcAttribute() {
    if (!this.resources.length) return this;
    const $ = cheerio.load(this.html);
    this.resources.forEach(({ src, name }) => $(`[src='${src}']`).attr('src', `${getFileName(pageUrl)}_files/${name}`));
    this.html = $.html();
    return this;
  },
});

export default createPageType;

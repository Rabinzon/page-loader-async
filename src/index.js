import axios from 'axios';
import fs from 'mz/fs';
import path from 'path';
import 'babel-polyfill';

const getPage = async (url) => {
  const { data } = await axios.get(url);
  return data;
};

const getFileName = (url) => {
  const fileName = url.replace(/^.+:\/\//, '').replace(/\W/gi, '-');
  return `${fileName}.html`;
};

export default async (url, outputPath) => {
  if (outputPath && !await fs.exists(outputPath)) {
    throw new Error(`${outputPath} directory does not exist`);
  }

  const fileName = getFileName(url);
  const currentDir = path.resolve('./', fileName);
  const outputDir = outputPath ? path.resolve(outputPath, fileName) : currentDir;
  const page = await getPage(url);
  console.log(`✔ ${url}\n`);
  await fs.writeFile(outputDir, page);
  console.log(`Page was downloaded as '${fileName}'`);
};

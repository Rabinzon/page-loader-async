import fs from 'mz/fs';
import path from 'path';
import getFileName from '../helpers/getFileName';
import getFileExtension from '../helpers/getFileExtention';

const createResource = (src, file) => ({
  src,
  file,
  name: getFileName(src, getFileExtension(src, file)),
  writeToFile(dir) {
    const { name } = this;
    const outputDir = path.resolve(dir, name);
    return fs.writeFile(outputDir, file, 'binary').then(() => this);
  },
});

export default createResource;

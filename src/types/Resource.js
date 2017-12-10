import fs from 'mz/fs';
import path from 'path';
import debug from 'debug';
import getFileName from '../helpers/getFileName';
import getFileExtension from '../helpers/getFileExtention';

const degugWriteResourceFile = debug('page-loader:WriteResourceFile');

const createResource = (src, file) => ({
  src,
  file,
  name: getFileName(src, getFileExtension(src, file)),
  writeToFile(dir) {
    const { name } = this;
    const outputDir = path.resolve(dir, name);
    return fs.writeFile(outputDir, file, 'binary')
      .then(() => {
        degugWriteResourceFile('file written:', name);
        return this;
      })
      .catch(err => Promise.reject(err.message));
  },
});

export default createResource;

import isSvg from 'is-svg';
import getFileType from 'file-type';

export default (src, file) => {
  let extention = (/[.]/.exec(src)) ? /[^.]+$/.exec(src)[0] : '';

  if (!/(css|js|png|jpg|gif|svg)$/.test(extention)) {
    const fileType = getFileType(Buffer.from(file, 'utf-8'));
    extention = fileType && fileType.ext;
  }

  if (isSvg(file)) {
    extention = 'svg';
  }

  return extention;
};

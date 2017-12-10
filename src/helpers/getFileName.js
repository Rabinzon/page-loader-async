export default (url, extention = false) => {
  const fileName = url.replace(/\.[a-z]+$/g, '').replace(/^.+:\/\//, '').replace(/\W/gi, '-');
  return extention ? `${fileName}.${extention}` : fileName;
};

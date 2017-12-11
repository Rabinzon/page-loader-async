import fs from 'fs';
import os from 'os';
import nock from 'nock';
import axios from 'axios';
import path from 'path';
import rimraf from 'rimraf';
import httpAdapter from 'axios/lib/adapters/http';
import pageLoader from '../src/';

let tmpDir;
let fixturesDir;
let img;
let script;
let htmlWithResources;

beforeAll(() => {
  fixturesDir = '__tests__/__fixtures__/';
  img = fs.readFileSync(path.resolve(fixturesDir, 'img.jpg'));
  script = fs.readFileSync(path.resolve(fixturesDir, 'script.txt'));
  htmlWithResources = fs.readFileSync(path.resolve(fixturesDir, 'html2.html'));
  const host = 'http://localhost';
  axios.defaults.adapter = httpAdapter;

  nock(host)
    .get('example.com/test')
    .reply(200, '<h1> example page </h1>')
    .get('example.com/404')
    .reply(404)
    .get('example.com/502')
    .reply(502)
    .get('example.io/img.jpg')
    .reply(200, img)
    .get('example.io/script.js')
    .reply(200, script)
    .get('example.io/resources/img')
    .reply(200, htmlWithResources);
});

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'page-loader'));
});

afterEach(() => rimraf.sync(tmpDir));

test('#PageLoader should write to file', () =>
  pageLoader('example.com/test', tmpDir).then(() =>
    fs.readFileSync(`${tmpDir}/example-com-test.html`).toString())
    .then(file => expect(file).toMatchSnapshot()));


test('#PageLoader should throw \'not exist folder\' error ', () => {
  expect.assertions(1);
  return pageLoader('example.com/test', '/nw/r3/42').catch(e =>
    expect(e.toString()).toEqual('Error: /nw/r3/42 directory does not exist'));
});

test('#PageLoader should throw request error', () =>
  pageLoader('example.com/404', tmpDir).catch(e =>
    expect(e.toString()).toEqual('Error: GET example.com/404 Request failed with status code 404')));

test('#PageLoader should load page with resources', () => {
  expect.assertions(3);
  return pageLoader('example.io/resources/img', tmpDir).then(() => {
    const html = fs.readFileSync(`${tmpDir}/example-io-resources-img.html`).toString();
    const jpg = fs.readFileSync(`${tmpDir}/example-io-resources-img_files/example-io-img.jpg`);
    const js = fs.readFileSync(`${tmpDir}/example-io-resources-img_files/example-io-script.js`);
    expect(html).toMatchSnapshot();
    expect(jpg.toString()).toEqual(img.toString());
    expect(js.toString()).toEqual(js.toString());
  });
});

/* eslint-disable no-undef */

import fs from 'fs';
import os from 'os';
import nock from 'nock';
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import pageLoader from '../src/';

const tmpDir = os.tmpdir();

beforeEach(() => {
  const host = 'http://localhost';
  axios.defaults.adapter = httpAdapter;
  nock(host)
    .get('example.com/test')
    .reply(200, '<h1> example page </h1>');

  nock(host)
    .get('example.com/error')
    .reply(404, '<h1> example page </h1>');

  fs.mkdtempSync(tmpDir);
});

test('#PageLoader should write to file', () =>
  pageLoader('example.com/test', tmpDir).then(() =>
    fs.readFileSync(`${tmpDir}/example-com-test.html`).toString())
    .then(file => expect(file).toMatchSnapshot()));


test('#PageLoader should throw \'not exist folder\' error ', () => {
  expect.assertions(1);
  return pageLoader('example.com/test', '/nw/r3/42').catch(e =>
    expect(e.toString()).toEqual('Error: /nw/r3/42 directory does not exist'));
});

test('#PageLoader should throw request error', async () => {
  expect.assertions(1);
  return pageLoader('example.com/error', tmpDir).catch(e =>
    expect(e.toString()).toEqual('Error: Request failed with status code 404'));
});

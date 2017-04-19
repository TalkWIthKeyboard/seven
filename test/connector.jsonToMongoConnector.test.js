/**
 * Created by CoderSong on 17/4/16.
 */

let mocha = require('mocha');
let expect = require('chai').expect;
let classFileFinder = require('./../parser/jsonParser').classFileFinder;

describe('classFileFinder接口的测试', () => {
  it('class下的全体文件遍历功能测试', () => {
    classFileFinder((results) => {
      expect(results).to.not.be.null;
    }, (err) => {
      expect(err).to.not.be.undefined;
    });
  });
});

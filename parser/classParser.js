/**
 * Created by CoderSong on 17/4/12.
 * 类解析器（与用户接触的第一层）
 */

let pub = {};
let path = require('path');
let promise = require('promise');
let fs = require('fs');
let _ = require('underscore');
let Builder = require('./../factory/builderFactory');

/**
 * 到class文件夹下去遍历所有class文件
 * @param scb 成功回调
 * @param fcb 失败回调
 */
pub.classFileFinder = (scb, fcb) => {
  let classPath = path.join(__dirname, '..', 'class');
  let fileList;
  try {
    fileList = fs.readdirSync(classPath);
  } catch (err) {
    fcb(Builder.errorBuilder('文件路径不存在', err));
  }

  if (fileList) {
    let promiseList = [];
    _.each(fileList, (file) => {
      let fileParserPromise;
      if (file.split('.')[1] === 'json') {
        fileParserPromise = new promise((resolve, reject) => {
          // TODO 扩展时这边更换解析器即可
          pub.jsonParser(file, (err, data) => {
            err ? reject(err) : resolve(data);
          });
        });
        promiseList.push(fileParserPromise);
      }
    });

    promise.all(promiseList).then((results) => {
      scb(results);
    }).catch((err) => {
      fcb(Builder.errorBuilder('json文件解析过程中出现异常', err));
    });
  }
};

/**
 * 解析json文件
 * @param filename 文件名
 * @param cb 回调函数
 * @返回一个类对象
 */
pub.jsonParser = (filename, cb) => {
  let filePath = path.join(__dirname, '..', 'class', filename);
  fs.readFile(filePath, (err, data) => {
    if (err) cb(err);
    let dataJson;
    try {
      dataJson = JSON.parse(data.toString());
    } catch (err) {
      cb(Builder.errorBuilder('json文件的格式存在问题'));
    }

    let keyList = _.keys(dataJson);
    let valueList = _.values(dataJson);
    // 现在默认第一个为对象原型，第二个为扩展方法
    if (keyList.length > 2) cb(Builder.errorBuilder('json的第一层key个数大于2'));
    if (keyList[0] === 'rules') cb(Builder.errorBuilder('json的第一层第二个才是扩展方法定义'));
    // 先解析类对象
    let className = keyList[0];
    let classObj = valueList[0];
    let rulesObj = null;
    if (keyList.length > 1) rulesObj = valueList[1];

    cb(null, Builder.classBuilder(className, classObj, rulesObj));
  });
};

pub.classFileFinder((results) => {
  console.log(results);
}, (err) => {
  console.log(err);
});

module.exports = pub;

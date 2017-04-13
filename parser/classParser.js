/**
 * Created by CoderSong on 17/4/12.
 * 类解析器（与用户接触的第一层）
 */

let pub = {};
let path = require('path');
let Promise = require('promise');
let fs = require('fs');
let _ = require('underscore');
let Builder = require('./../factory/builderFactory');
let Conf = require('./../factory/confFactory');

/**
 * 广度遍历json，检测合法性
 * @param obj 传入的对象
 * @param scb 成功回调
 * @param fcb 失败回调
 */
let bfsTraversal = (obj, scb, fcb) => {
  let queue = [];
  let head = - 1;
  let foot = 0;
  // 判断对象是否合法
  let judge = (obj) => {
    let errInfo = '属性中有不合法的声明';
    // 不符合基本数据类型
    if (
      _.indexOf(Conf.dataBaseConf.mongoStringAtr, obj) === - 1
      && ! _.isObject(obj)
      && ! _.isArray(obj)
    )
      return fcb(errInfo);

    // 数组中的首位声明非法，数组长度超过2
    if (
      _.isArray(obj)
      && ((obj.length > 0 && _.indexOf(Conf.dataBaseConf.mongoArrayAtr, obj[0]) === - 1) || (obj.length > 2))
    )
      return fcb(errInfo);

    // 数组中的第二位数据类型与首位不对应
    if (
      _.isArray(obj)
      && obj.length > 1
      && _.indexOf(Conf.dataBaseConf.mongoArrayAtr, obj[0]) !== - 1
      && (! Conf.dataBaseConf.mongoArrayRule[obj[0]](obj[1]))
    )
      return fcb(errInfo);
  };

  // 开始遍历
  while (head <= foot) {
    let valueList = head === - 1 ? obj : _.values(queue[head]);
    _.each(valueList, (value) => {
      judge(value);
      _.isObject(value) && ! _.isArray(value) ? queue.push(value) : null;
      foot += _.isObject(value) && ! _.isArray(value) ? 1 : 0;
    });
    head ++;
  }
  scb();
};

/**
 * 解析json文件
 * @param filename 文件名
 * @param cb 回调函数
 * @返回一个类对象
 */
let jsonParser = (filename, cb) => {
  let filePath = path.join(__dirname, '..', 'class', filename);
  fs.readFile(filePath, (err, data) => {
    if (err) return cb(err);
    let dataJson;
    try {
      dataJson = JSON.parse(data.toString());
    } catch (err) {
      return cb(Builder.errorBuilder('json文件的格式异常'));
    }
    let keyList = _.keys(dataJson);
    let valueList = _.values(dataJson);

    // 对json文件的合法性进行判定
    // 现在默认第一个为对象原型，第二个为扩展方法
    if (keyList.length > 2)
      return cb(Builder.errorBuilder('json的第一层key个数大于2'));
    if (keyList[0] === 'rules')
      return cb(Builder.errorBuilder('json的第一层第二个才是扩展方法定义'));
    // 先解析类对象
    let className = keyList[0];
    let classObj = valueList[0];
    // 对象的属性声明是否完全符合要求
    bfsTraversal(classObj, () => {
      let rulesObj = null;
      if (keyList.length > 1) rulesObj = valueList[1];
      return cb(null, Builder.classBuilder(className, classObj, rulesObj));
    }, (err) => {
      return cb(Builder.errorBuilder('对象声明异常', err));
    }
    );
  });
};

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
  // 每个文件构造一个处理promise
  if (fileList) {
    let promiseList = [];
    _.each(fileList, (file) => {
      if (file.split('.')[1] === 'json') {
        let fileParserPromise = new Promise((resolve, reject) => {
          // TODO 扩展时这边更换解析器即可
          jsonParser(file, (err, data) => {
            err ? reject(Builder.errorBuilder(file + ' 解析中出现异常', err)) : resolve(data);
          });
        });
        promiseList.push(fileParserPromise);
      }
    });
    // 统一处理promise
    Promise.all(promiseList).then((results) => {
      scb(results);
    }).catch((err) => {
      fcb(Builder.errorBuilder('json文件解析过程中出现异常', err));
    });
  }
};


pub.classFileFinder((results) => {
  console.log(results);
}, (err) => {
  console.log(err);
});

module.exports = pub;

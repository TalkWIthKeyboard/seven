/**
 * Created by CoderSong on 17/4/17.
 * 增删查改的通用方法
 */

let pub = {};
let promiseBuilder = require('./factory/builderFactory').promiseBuilder;
let Promise = require('promise');
let _ = require('underscore');

/**
 * 对body参数进行检查（有三种检查方式，一种是传入model，一种是传入keyList，一种是两种混合）
 * @param body
 * @param model
 * @param keyList
 * @param scb
 * @param fcb
 */
let checkBody = (body, model, keyList, scb, fcb) => {
  let attr = {};
  if (!body || (!model && !keyList)) return fcb();
  // 构造所有待检查的属性
  if (model) {
    let modelObj = model.schema.obj;
    delete modelObj.meta;
    _.each(_.keys(modelObj), (value) => {
      attr[value] = false;
    })
  }
  if (keyList) {
    _.each(keyList, (value) => {
      attr[value] = false;
    })
  }
  // 开始进行检查
  let flag = true;
  _.each(_.keys(body), (key) => {
    attr[key] = true;
  });
  _.each(_.values(attr), (value) => {
    flag &= value;
  });

  flag ? scb(body) : fcb();
};

/**
 * 对url中的参数进行检查
 * @param params
 * @param keyList
 * @param scb
 * @param fcb
 */
let checkParams = (params, keyList, scb, fcb) => {
  let attr = {};
  if ((!params && !query) || !keyList) return fcb();
  let flag = true;
  _.each(keyList, (value) => {
    attr[value] = false;
  });
  if (params) {
    _.mapObject(params, (value, key) => {
      attr[key] = true;
    })
  }
  flag ? scb(params) : fcb();
};


// 构造两个promise对象
let checkBodyPromise = (body, model, keyList) => {
  return new Promise((resolve, reject) => {
    checkBody(body, model, keyList, (body) => {
      resolve(body);
    }, () => {
      reject();
    })
  })
};

let checkParamsPromise = (params, keyList) => {
  return new Promise((resolve, reject) => {
    checkParams(params, keyList, (params) => {
      resolve(params)
    }, () => {
      reject();
    })
  })
};


/**
 * 保存对象
 * @param body 对象数据
 * @param model
 * @param next
 */
let saveObj = (body, model, next) => {

  let data = {};
  let modelObj = model.schema.obj;
  delete modelObj.meta;

  // 过滤掉其它不在类中的属性
  _.each(body, (value, key) => {
    if (_.indexOf(modelObj, key)) {
      data[key] = value;
    }
  });

  let _model = new model(data);
  _model.save((err) => {
    if (err) return next(err);
    // TODO 传递成功值
  })
};


/**
 * 通用的创建API（默认只含有body参数）
 * @param req
 * @param res
 * @param model
 * @param keyList 可以定制检查的
 * @param key
 * @param next
 */
pub.create = (req, res, model, keyList, key, next) => {
  checkBodyPromise(req.body, model, keyList).then((body) => {
    if (key) {
      promiseBuilder.checkIsExistPromise(model, key, body[key]).then((obj) => {
        obj
          ? next()
          : saveObj(body, model, next)
      }, (err) => {
        return next(err);
      })
    } else {
      saveObj(body, model, next);
    }
  }).catch(() => {
    // TODO 传递错误值
  })
};


/**
 * 通用的删除API
 * @param req
 * @param res
 * @param model
 * @param paramsList
 * @param next
 */
pub.delete = (req, res, model, paramsList = ['id'], next) => {
  checkParamsPromise(req.params, paramsList)
    .catch(() => {
      // TODO 传递错误值
    })
    .then(promiseBuilder.deleteByIdPromise(model, req.params.id))
    .catch(() => {
      // TODO 传递错误值
    })
};


/**
 * 通用的获取API
 * @param req
 * @param res
 * @param model
 * @param paramsList
 * @param next
 */
pub.get = (req, res, model, paramsList = ['id'], next) => {
  checkParamsPromise(req.params, paramsList)
    .catch(() => {
      // TODO 传递错误值
    })
    .then(promiseBuilder.findByIdPromise(model, req.params.id))
    .catch(() => {
      // TODO 传递错误值
    })
};


/**
 * 通用的更新API（默认paramsList是中只包含id）
 * @param req
 * @param res
 * @param model
 * @param paramsList
 * @param bodyList
 * @param next
 */
pub.update = (req, res, model, paramsList = ['id'], bodyList, next) => {
  let promiseList = [
    checkParamsPromise(req.params, paramsList),
    checkBodyPromise(req.body, model, bodyList)
  ];

  Promise.all(promiseList).then((results) => {
    let params = results[0];
    let body = results[1];
    promiseBuilder.findByIdPromise(model, params.id).then((err, data) => {
      if (err) return next(err);
      _.mapObject(body, (value, key) => {
        data[key] = value;
      });
      data.save((err) => {
        if (err) return next(err);
        // TODO 传递成功值
      })
    })
  }).catch(() => {
    // TODO 传递错误值
  })
};


/**
 * 通用的分页查找API
 * @param req
 * @param res
 * @param model
 * @param paramsList
 * @param next
 */
pub.pagination = (req, res, model, paramsList = ['page'], next) => {
  checkParamsPromise(req.params, paramsList)
    .catch(() => {
      // TODO 传递错误值
    })
    .then((params) => {
      let promiseList = [
        promiseBuilder.findAllByPagePromise(model, params.page),
        promiseBuilder.findAllCountPromise(model)
      ];
      Promise.all(promiseList).then((results) => {
        let data = results[0];
        let pageCount = results[1];
        scb(params.page, pageCount, data);
      }).catch(() => {
        // TODO 传递错误值
      })
    })
    .catch(() => {
      // TODO 传递错误值
    })
};

module.exports = pub;

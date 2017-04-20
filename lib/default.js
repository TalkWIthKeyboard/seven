/**
 * Created by CoderSong on 17/4/17.
 * 增删查改的通用方法
 */

let pub = {};
let Promise = require('promise');
let _ = require('underscore');
let responseBuilder = require('./factory/builderFactory').responseBuilder;
let promiseBuilder = require('./factory/builderFactory').promiseBuilder;

let pageSize = 10;

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
  if (keyList) {
    _.each(keyList, (value) => {
      attr[value] = false;
    })
  } else if (model) {
    let modelObj = model.schema.obj;
    delete modelObj.meta;
    _.each(_.keys(modelObj), (value) => {
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

  flag ? scb(body) : fcb('Body check err!');
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
  if (!params || !keyList) return fcb();
  let flag = true;
  _.each(keyList, (value) => {
    attr[value] = false;
  });
  if (params) {
    _.mapObject(params, (value, key) => {
      attr[key] = true;
    })
  }
  _.each(_.values(attr), (value) => {
    flag &= value;
  });

  flag ? scb(params) : fcb('Params check err!');
};


// 构造两个promise对象
let checkBodyPromise = (body, model, keyList) => {
  return new Promise((resolve, reject) => {
    checkBody(body, model, keyList, (body) => {
      resolve(body);
    }, (err) => {
      reject(err);
    })
  })
};

let checkParamsPromise = (params, keyList) => {
  return new Promise((resolve, reject) => {
    checkParams(params, keyList, (params) => {
      resolve(params)
    }, (err) => {
      reject(err);
    })
  })
};


/**
 * 保存对象
 * @param res
 * @param body 对象数据
 * @param model
 * @param next
 */
let saveObj = (res, body, model, next) => {

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
    responseBuilder.resSuccessBuilder(res, _model);
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
  checkBodyPromise(req.body, model, keyList)
    .then((body) => {
      if (key && body[key]) {
        promiseBuilder.checkIsExistPromise(model, key, body[key]).then((obj) => {
          obj
            ? next({status: 400, msg: 'The value of key is exist!'})
            : saveObj(res, body, model, next)
        }, (err) => {
          return next({status: 400, msg: err});
        })
      } else {
        saveObj(res, body, model, next);
      }
    })
    .catch((err) => {
      next({status: 400, msg: err});
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
  checkParams(req.params, paramsList, (params) => {
    promiseBuilder.deleteByIdPromise(model, params.id)
      .then(() => {
        responseBuilder.resSuccessBuilder(res, {id: params.id});
      })
      .catch((err) => {
        next({status: 400, msg: err})
      })
  }, (err) => {
    next({status: 400, msg: err})
  });
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
  checkParams(req.params, paramsList, (params) => {
    promiseBuilder.findByConditionPromise(model, '_id', params.id)
      .then((data) => {
        responseBuilder.resSuccessBuilder(res, data);
      })
      .catch((err) => {
        next({status: 400, msg: err})
      })
  }, (err) => {
    next({status: 400, msg: err})
  });
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
    promiseBuilder.findByConditionPromise(model, '_id', params.id).then((data) => {
      _.mapObject(body, (value, key) => {
        data[key] = value;
      });
      data.save((err) => {
        if (err) return next(err);
        responseBuilder.resSuccessBuilder(res, data);
      })
    })
  }).catch((err) => {
    next({status: 400, msg: err})
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
    .then((params) => {
      let promiseList = [
        promiseBuilder.findAllByPagePromise(model, params.page),
        promiseBuilder.findAllCountPromise(model)
      ];
      Promise.all(promiseList).then((results) => {
        let data = results[0];
        let pageCount = Math.floor((results[1] - 1) / pageSize) + 1;
        responseBuilder.resSuccessBuilder(res, {
          page: params.page,
          pageCount: pageCount,
          data: data,
        });
      }).catch((err) => {
        next({status: 400, msg: err})
      })
    })
    .catch((err) => {
      next({status: 400, msg: err})
    })
};

/**
 * 用户登录
 * @param req
 * @param res
 * @param model
 * @param next
 */
pub.login = (req, res, model, next) => {
  checkBody(req.body, null, ['username', 'password'], (body) => {
    promiseBuilder.findByConditionPromise(model, 'username', body.username)
      .then((data) => {
        if (data.password === body.password) {
          req.session.role = data.role;
          responseBuilder.resSuccessBuilder(res, data);
        } else
          next({status: 400, msg: 'Username or password error!'})
      })
      .catch((err) => {
        next({status: 400, msg: err})
      })
  })
};

pub.pageSize = pageSize;


module.exports = pub;

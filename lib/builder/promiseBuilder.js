/**
 * Created by CoderSong on 17/4/17.
 */

let pub = {};

pub.findAllByPagePromise = (model, thisPage) => {
  return new Promise((resolve, reject) => {
    model.findAllByPage(thisPage, (err, res) => {
      err ? reject(err) : resolve(res);
    });
  });
};

pub.findAllCountPromise = (model) => {
  return new Promise((resolve, reject) => {
    model.findAllCount((err, res) => {
      err ? reject(err) : resolve(res);
    });
  });
};


pub.checkIsExistPromise = (model, key, value) => {
  return new Promise((resolve, reject) => {
    model.checkIsExist(key, value, (err, res) => {
      err ? reject(err) : resolve(res);
    });
  });
};


pub.findByConditionPromise = (model, key, value) => {
  return new Promise((resolve, reject) => {
    model.findByCondition(key, value, (err, res) => {
      err ? reject(err) : resolve(res);
    });
  });
};

pub.deleteByIdPromise = (model, id) => {
  return new Promise((resolve, reject) => {
    model.deleteById(id, (err, res) => {
      err ? reject(err) : resolve(res);
    });
  });
};

module.exports = pub;

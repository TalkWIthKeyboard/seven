/**
 * Created by CoderSong on 17/4/18.
 */

let pub = {};

/**
 * 成功返回
 * @param res
 * @param data
 * @returns {*}
 */
pub.resSuccessBuilder = (res, data) => {
  res.status(200);
  return res.json({'data': data});
};

/**
 * 失败返回
 * @param res
 * @param err
 * @returns {*}
 */
pub.resErrorBuilder = (res, err) => {
  res.status(err.status || 500);
  return res.json({'err': err.message});
};

module.exports = pub;

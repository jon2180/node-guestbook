
/**
 * 配置过滤器
 * @param {object} param0 配置
 */
function filter({
  whiteList = ["/register", "/login"],
  failureRedirect = "/login",
}) {

  return (req, res, next) => {
    if (/\w+.\w+$/.test(req.url)) {
      next()
      return;
    }

    if (!whiteList.includes(req.url) && !req.session.user) {
      // 跳转至登录
      res.redirect(failureRedirect);
      return;
    }
    next();
  };
}

module.exports = filter;

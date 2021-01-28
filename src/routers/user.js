const { Router } = require("express");
const { myQuery } = require("../models/mysql");
const { uuid36, encrypt, decrypt } = require("../models/crypto");
const router = Router();

/**
 * GET /user 用户中心
 */
router.get("/", (req, res) => {
  myQuery("select * from user where username=?", [req.session.user])
    .then((data) => {
      return res.render("admin/usercenter", {
        list: data,
      });
    })
    .catch((e) => {
      res.send("<script>alert('服务器内部错误');history.back()</script>");
    });
});

/**
 * POST /user 修改用户信息
 */
router.post("/edit", (req, res) => {
  const { username, email, sex, id } = req.body;
  myQuery("update user set username=?, email=?, sex=? where id=?", [
    username,
    email,
    sex || 0,
    id,
  ])
    .then((data) => {
      req.session.user = username;
      res.redirect("/users");
      return;
    })
    .catch((err) => {
      console.error(err);
      res.send("<script>alert('服务器内部错误');history.back()</script>");
      return;
    });
});

// 修改密码
router.get("/changepassword", (req, res) => {
  return res.render("admin/changepassword");
});

// 修改密码
router.post("/cha_pas", (req, res) => {
  let errors = [];
  if (!(req.body.pas_1 && req.body.pas_2)) {
    errors.push({
      type: "warning",
      message: "请输入密码",
    });
  }
  if (req.body.pas_1 != req.body.pas_2) {
    errors.push({
      type: "warning",
      message: "两次密码不一致",
    });
  }
  if (errors.length) {
    req.session.alert = errors;
    return res.redirect("/changepassword");
  }
  myQuery("UPDATE `user` SET password = ? where id = ?", [
    encrypt(req.body.pas_2),
    req.session.userid,
  ])
    .then((data) => {
      let success = [];
      success.push({
        type: "success",
        message: "更改成功",
      });
      req.session.alert = success;
      return res.redirect("/users");
    })
    .catch((error) => {
      console.error(error);
      return res.redirect("/users");
    });
});

module.exports = router;

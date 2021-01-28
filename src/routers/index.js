const { Router } = require("express");
const { myQuery } = require("../models/mysql");
const { uuid36, encrypt, decrypt } = require("../models/crypto");
const router = Router();

// 视图渲染登录页面
router.get("/", async (req, res) => {
  try {
    const posts = await myQuery("select * from `post` where status=0 and userid=? order by createtime desc", [
      req.session.userid,
    ]);
    // rander渲染视图
    res.render("admin/index", {
      list: posts,
    }); 
  } catch (errror) {
    console.error(error);
  };
});

// 视图渲染登录页面
router.get("/login", (req, res) => {
  res.render("login", {
    title: "用户登录",
    layout: false,
  });
});

/**
 * 渲染注册页面
 */
router.get("/register", (req, res) => {
  res.render("register", {
    title: "用户注册",
    layout: false,
  });
});


// 登录动作
router.post("/login", (req, res) => {
  myQuery("select * from `user` where username=?", [req.body.username]).then((data) => {
    // 解密判断密码是否一致
    if (decrypt(data[0].password) === req.body.password) {
      // 返回登录成功
      // session 存储用户信息
      console.log(data);
      req.session.user = null;
      req.session.user = data[0].username;
      req.session.userid = null;
      req.session.userid = data[0].id;

      return res.send("<script>alert('登录成功');location.href='/';</script>");
      //return res.redirect(303, '/admin')
    } else {
      return res.send("<script>alert('登录失败， 密码错误');history.back()</script>");
    }
  }).catch((err) => {
    return res.send("<script>alert('登录失败， 用户不存在');history.back()</script>");
  });

  // select * from user where username=req.body.username
  // 明文密码 select * from user where username=req.body.username and password=req.body.password
  // 密文密码 获取数据库的密文密码
  // 解密数据库里面的密码
  // 比对两个密码是或否一致

  // select * from user where username=req.body.username
  // 数据库里里面的password和用户传过来的password比较
  // rows.password === req.body.password
  // 很大的BUG存在

  // return res.redirect(301, '/index')
});

/**
 * 注册动作
 */
router.post("/register", (req, res) => {
  console.log("后台接收到的注册数据", req.body);
  let { username, password, repassword, sex, email } = req.body;

  // 数据校验
  // 用户名不能为空；密码不能为空；两次密码一致；邮箱格式验证
  if (!username) {
    //let
    // 提示用户名不能为空
    return res.send("<script>alert('用户名不能为空');history.back()</script>");
    // return ;
  }
  if (!password || !repassword) {
    // 提示用户两次密码不能为空
    return res.send("<script>alert('密码不能为空');history.back()</script>");
  }
  if (password !== repassword) {
    // 两次密码不一致
    return res.send("<script>alert('两次密码不一致');history.back()</script>");
  }
  let VALID_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!email.match(VALID_EMAIL_REGEX)) {
    // 邮箱格式不正确
    return res.send("<script>alert('邮箱格式不正确');history.back()</script>");
  }

  myQuery("select * from `user` where email=?", [email]).then((data) => {
    if (!data.length) {
      // 没有查出结果
      myQuery(
        "insert into `user` (`id`, `username`, `password`, `email`, `sex`) values(?,?,?,?,?)",
        [uuid36(), username, encrypt(password), email, sex]
      ).then((data2) => {
        return res.send("注册成功");
      }).catch((error) => {
        // 数据库错误处理，注册失败
        return res.send("注册失败");
      });
    } else {
      // 反馈用户，邮箱已经存在
      return res.send("邮箱已存在");
    }
  }).catch((error) => {
    // 数据库错误处理
    console.error(error);
    return res.send(
      "<script>alert('服务器内部错误');history.back()</script>"
    );
  });
});

router.get("/out", (req, res) => {
  req.session.destroy();
  return res.redirect("/login");
});

module.exports = router;

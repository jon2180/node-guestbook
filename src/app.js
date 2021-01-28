const Express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const expSession = require("express-session");
const config = require("./config");

const app = Express();

// 设置静态目录
app.use(Express.static(path.join(__dirname, "../public/")));
app.set("views", path.join(__dirname, "views"));

// app.engine('handlebars', exphbs());
app.engine("hbs", exphbs.create({
  // 布局目录是相对于 setting views 目录的 layouts 目录 （默认）
  layoutsDir: "",
  // 配置布局主文件
  defaultLayout: "main",
  // 修改模板文件后缀名；后缀名修改之后，对应的engine名称也要跟着改变
  extname: ".hbs",
  // 配置部分模板目录 相对于 setting views 目录的 partials 目录 （默认）
  partialsDir: "",
  // 段落使用
  helpers: {
    section(name, options) {
      if (!this._sections) this._sections = {};
      this._sections[name] = options.fn(this);
      return null;
    },
  },
}).engine);

app.set("view engine", "hbs");
// 解析网络请求参数 parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// application/json
app.use(bodyParser.json());
// 配置cookie和session
app.use(cookieParser());
app.use(expSession({
  key: config.cookie.key, // 设置cookie中保存sessionId的字段名
  secret: config.cookie.secret, // 通过secret值计算hash值
  resave: config.cookie.resave, // 强制更新session值
  saveUninitialized: config.cookie.saveUninitialized, // 初始化cookie值
  cookie: {
    maxAge: config.cookie.maxAge,
  },
}));

app.use(function (req, res, next) {
  //all
  if (!req.session.alert) {
    next();
  } else {
    res.locals.flash = req.session.alert;
    req.session.alert = null;
    next();
  }
});

// 白名单，过滤请求链接 - url不在白名单的请求且没有session，重定向到登录界面
const filter = require("./middlewares/auth");
app.use(filter({
  whiteList: ["/register", "/login"],
  failureRedirect: "/login",
}));

const homeRouter = require('./routers/index');
const postRouter = require('./routers/post');
const userRouter = require('./routers/user');

app.use('/', homeRouter);
app.use('/posts', postRouter);
app.use('/users', userRouter);

// 404页面
app.use((req, res, next) => {
  res.type("text/plain").status(404).send("404-Not Found");
  next();
});

// 500
app.use((error, req, res, next) => {
  console.log("服务器报错", error);
  return res.status(500).send("500 - Server Error");
});

module.exports = app;

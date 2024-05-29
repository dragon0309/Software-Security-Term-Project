var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { newEnforcer } = require('casbin');
const passport = require('passport');
require('./strategies/local');
const session = require('express-session');
const MongoStore = require('connect-mongo');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var mongodbRouter = require('./routes/mongodb');
var imgurRouter = require('./routes/imgur');
var cryptoRouter = require('./routes/crypto');

const GoogleUser = require('./database/schemas/GoogleUser');
const GitHubUser = require('./database/schemas/GitHubUser');

require('./database');

// method轉action
const methodToAction = {
  GET: 'read',
  PUT: 'write',
  POST: 'update',
  DELETE: 'delete'
}

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: 'mongodb://127.0.0.1:27017/undergraduateProject',
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

// 忽略 favicon.ico 的請求
app.use('/favicon.ico', (req, res) => res.status(204).end());

// casbin enforcer
async function initializeEnforcer() {
  const enforcer = await newEnforcer(path.join(__dirname, 'casbin/model.conf'), path.join(__dirname, 'casbin/policy.csv'));
  return enforcer;
}
// casbin middleware
app.use(async (req, res, next) => {
  const enforcer = await initializeEnforcer();

  let UserRole = 'guest';
  if (req.user) {
    const { provider, displayName, username, role } = req.user;

    switch (provider) {
      case 'google':
        const googleUser = await GoogleUser.findOne({ name: displayName });
        UserRole = googleUser.role;
        break;
      case 'github':
        const gitHubUser = await GitHubUser.findOne({ name: username });
        UserRole = gitHubUser.role;
        break;
      default:
        UserRole = role;
    }
  }

  const { path: obj } = req;
  const act = methodToAction[req.method];
  console.log({ UserRole, obj, act });

  if (!UserRole || !obj || !act) {
    return res.status(400).send('Missing parameters: sub, obj, act');
  }

  const allowed = await enforcer.enforce(UserRole, obj, act);

  if (allowed) {
    console.log("allowed!");
    next();
  } else {
    // 在伺服器端重定向到登錄頁面
    res.redirect('/notAllowed.html');
  }
});

// 處理靜態文件的請求要放在casbin後面
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/db', mongodbRouter);
app.use('/imgur', imgurRouter);
app.use('/crypto', cryptoRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

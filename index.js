const passport = require('./auth');
const session = require('express-session');
const flash = require('connect-flash');
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const mustacheExpress = require('mustache-express');
const User = require('./models').Users;
const class_scraper = require(__dirname + "/class_scraper/index.js");

app.set('port', (process.env.PORT || 3000));

// ミドルウェア
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(flash());
app.use(session({
    secret: 'YOUR-SECRET-STRING',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json())

app.engine('mst', mustacheExpress());
app.set('view engine', 'mst');
app.set('views', __dirname + '/views');

const authMiddleware = (req, res, next) => {
    if (req.isAuthenticated()) { // ログインしてるかチェック

        next();

    } else {

        res.redirect(302, '/login');

    }
};

app.use(express.static(path.join(__dirname, 'public')));


app.post('/execute', authMiddleware, async function (req, res) {
    let user = req.user;
    let info = await req.body.INFO;
    let schedule = await req.body.REQUEST;
    res.send("ok");

    //dbを更新する
    await club_info_update(user, info);
    //puppeteerの処理
    await class_scraper.class_register(info, schedule, user);
})


app.get('/fetch_log', (req, res) => {
    let log = fs.readFileSync(__dirname + `/execute_log/log_${req.query.id}.txt`, 'utf8');
    res.send(log);
});

//クラブ情報更新
async function club_info_update(user, info_data) {
    await User.update({
        club_name: info_data.CLUB_NAME,
        st_name: info_data.REPRESENT_NAME,
        st_num: info_data.STUDENT_NUMBER,
        email: info_data.MAIL,
        tell: info_data.TEL
    }, {
        where: {
            club_id: user.club_id
        }
    })
}

// ログ
app.get('/log_display', authMiddleware, (req, res) => {
    res.render('log_display/index', { id: req.user.id });
});

app.get('/', function (request, response) {
    response.redirect('/home');
});

// ログインフォーム
app.get('/login', (req, res) => {
    const errorMessage = req.flash('error').join('<br>');
    res.render('login/form', {
        errorMessage: errorMessage
    });
});

// ログイン実行
app.post('/login',
    passport.authenticate('local', {
        successRedirect: '/home',
        failureRedirect: '/login',
        failureFlash: true,
        badRequestMessage: '「団体番号」と「パスワード」は必須入力です。'
    })
);

//ログアウト実行
app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
});

// ログイン成功後のページ
app.get('/home', authMiddleware, (req, res) => {
    let user = req.user;
    res.render('home/index', { user: user });
});

app.listen(app.get('port'), function () {
    console.log("Node app is running at localhost:" + app.get('port'))
});

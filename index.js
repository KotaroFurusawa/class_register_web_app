const passport = require('./auth');
const session = require('express-session');
const flash = require('connect-flash');
const puppeteer = require('puppeteer');
const express = require('express');
const path = require('path');
const app = express();
const mustacheExpress = require('mustache-express');
const urls = ['https://www.google.com/', 'https://twitter.com/', 'https://5ch.net/']

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


app.get('/execute', authMiddleware, function (request, response) {
    (async () => {
        const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.goto(urls[Math.floor(Math.random() * 3)]);

        await page.screenshot({ path: 'public/img/sample.png' });

        await browser.close();

        await response.redirect('/home');
    })();
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
    res.render('home/index');
});

app.listen(app.get('port'), function () {
    console.log("Node app is running at localhost:" + app.get('port'))
});

//サニタイズ化忘れずに！！！
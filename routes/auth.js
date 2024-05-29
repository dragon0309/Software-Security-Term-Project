const { Router } = require('express');
const passport = require('passport');
const User = require('../database/schemas/User');
const GoogleUser = require('../database/schemas/GoogleUser');
const GitHubUser = require('../database/schemas/GitHubUser');
const { hashPassword } = require('../utils/helpers');
const Brute = require('express-brute');
require('../strategies/github')
require('../strategies/google')
const router = Router();
const crypto = require('crypto');

function generateStateParameter() {
    return crypto.randomBytes(16).toString('hex');
}

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// ----------------google-------------------
async function registerWithGoogle(oauthUser) {
    const isUserExists = await GoogleUser.findOne({
        name: oauthUser.displayName
    });
    if (isUserExists) {
        const failure = {
            message: 'User already Registered.',
        };
        return { failure };
    }

    const googelUser = new GoogleUser({
        accountId: oauthUser.id,
        name: oauthUser.displayName,
        provider: oauthUser.provider,
        role: "user",
    });
    await googelUser.save();
    const success = {
        message: 'User Registered.',
    };
    return { success };
}

router.get('/google', (req, res, next) => {
    const state = generateStateParameter();
    req.session.oauthState = state;
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        state: state
    })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
    const state = req.query.state;
    if (state !== req.session.oauthState) {
        return res.status(401).send('Invalid state parameter');
    }
    delete req.session.oauthState;
    passport.authenticate('google', { failureRedirect: '/error' })(req, res, next);
}, async (req, res) => {
    const { failure, success } = await registerWithGoogle(req.user);
    if (failure) {
        console.log('Google user already exist in DB..');
    } else {
        console.log('Registering new Google user..');
    }
    res.redirect('/homePage.html');
});

// ----------------github-------------------
const isLoggedIn = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.status(401).send('Not Logged In');
    }
}

router.get('/', isLoggedIn, (req, res) => {
    res.send(`Hello world ${req.user.username}`)
})
router.get('/error', (req, res) => res.send('Unknown Error'))

async function registerWithGitHub(oauthUser) {
    const isUserExists = await GitHubUser.findOne({
        name: oauthUser.username
    });
    if (isUserExists) {
        const failure = {
            message: 'User already Registered.',
        };
        return { failure };
    }

    const gitHubUser = new GitHubUser({
        name: oauthUser.username,
        provider: oauthUser.provider,
        role: "user",
    });
    await gitHubUser.save();
    const success = {
        message: 'User Registered.',
    };
    return { success };
}

router.get('/github', (req, res, next) => {
    const state = generateStateParameter();
    req.session.oauthState = state;
    passport.authenticate('github', {
        scope: ['user:email'],
        state: state
    })(req, res, next);
});

router.get('/github/callback', (req, res, next) => {
    const state = req.query.state;
    if (state !== req.session.oauthState) {
        return res.status(401).send('Invalid state parameter');
    }
    delete req.session.oauthState; // 清除狀態參數
    passport.authenticate('github', { failureRedirect: '/error' })(req, res, next);
}, async (req, res) => {
    const { failure, success } = await registerWithGitHub(req.user);
    if (failure) {
        console.log('GitHub user already exist in DB..');
    } else {
        console.log('Registering new GitHub user..');
    }
    res.redirect('/homePage.html');
});

// ----------------local-------------------
const store = new Brute.MemoryStore();
const bruteforce = new Brute(store, {
    freeRetries: 3,
    minWait: 30 * 60 * 1000,
    maxWait: 60 * 60 * 1000,
    lifetime: 24 * 60 * 60,
});

router.post('/login', bruteforce.prevent, passport.authenticate('local'), (req, res) => {
    console.log('Logged In');
    res.sendStatus(200);
});

router.post("/logout", (request, response) => {
    if (!request.user) return response.sendStatus(401);
    request.logout((err) => {
        if (err) return response.sendStatus(400);
        response.send(200);
    });
});

router.post('/register', async (request, response) => {
    const { email } = request.body;
    const userDB = await User.findOne({ email });
    if (userDB) {
        response.status(400);
        response.send({ msg: 'User already exists!' });
    } else {
        const password = hashPassword(request.body.password);
        const name = request.body.name;
        const phoneNumber = request.body.phoneNumber;
        const role = request.body.role;
        await User.create({ password, email, name, phoneNumber, role });
        response.send(201);
    }
});

module.exports = router;
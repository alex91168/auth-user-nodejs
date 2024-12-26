const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

mongoose.connect(
    'SUA_CHAVE_CLUSTER',
     {
    useNewUrlParser: true,
    useUnifiedTopology: true, }).then(() => {
    console.log('Conectado ao MongoDB');
}).catch(err => console.error('Erro ao conectar ao MongoDB', err));

const userSchema = new mongoose.Schema({
    userID: String,
    user: String,
    email: String,
    password: String
});

const userSave = mongoose.model('User', userSchema);

const hashUserPassword = (password, callback) => {
    const hashLevel = 15;

    bcrypt.hash(password, hashLevel, (err, hash) => {
        if (err) {
            callback(err);
        }
        callback(null, hash);
    })
};

const app = express();
app.use(cookieParser());
app.use(express.json());
const port = 5000;

app.post('/create-account', async (req, res) => {
    let user = req.body.user;
    let password = req.body.password;

    const verifyUserDetails = await userAuth(user);
    if (verifyUserDetails){
        return res.json('Usuario já existente!');
    } else {
        hashUserPassword(password, (err, hash) => {
            if (err) {
                return res.json(err);
            }
            const randomize = () => Math.floor(Math.random() * 1000000);
            let userID = `${randomize()}`;
            const saveUser = new userSave({
                userID: userID,
                user: req.body.user,
                email: req.body.email,
                password: hash
            }); 
            saveUser.save();
        });
        return res.json('Usuario criado!');
    }
});

app.post('/compare-users', async (req, res) => {
    const user = req.body.user;
    const userExist = await userAuth(user);
    return res.json({userExists: userExist});
})

const userAuth = async (user) => {
    const userDB = await userSave.find();
    const userFind = userDB.find(x => x.user === user);
    if (userFind) {
        return true;
    }
    return false;
}

app.post('/login-auth', async (req, res) => {
    const user = req.body.user;
    const verifyUser = await loginAuth(user);
    if (!req.body.password || !req.body.user){
        console.log('Preencha todos os campos');
        return res.json('Preencha todos os campos');
    }
    if (!verifyUser){
        return res.json('Usuario nao existente!');
    } else {
        bcrypt.compare(req.body.password, verifyUser.password, (err, result) => {
            try {
                if (result) {
                    const payload = {
                        userID: verifyUser.userID,
                        user: verifyUser.user                    
                    }
                    const secretKey = 'auth_key';

                    const token = jwt.sign(payload, secretKey, {expiresIn: '5m'});
                    res.cookie('acess_token', token, {
                        httpOnly: true,
                        secure: false,
                        sameSite: 'strict',
                        maxAge: 1000 * 60 * 5
                    })
                    return res.json({sucess: true, token});
                } else {
                    return res.json({sucess: false});
                }
            } catch {
                console.log('Erro ao comparar senhas', err);
            }
        }) 
    }
});

const loginAuth = async (user) => {
    const userDB = await userSave.find();
    const userFind = userDB.find(x => x.user === user);
    return userFind;
}

app.get('/check-user', async (req, res) => {
    const token = req.cookies.acess_token; 

    if(!token){
        return res.status(401).send('Usuário não autenticado.');
    }

    jwt.verify(token, 'auth_key', (err, decoded) => {
        if (err) {
            return res.status(401).send('Usuário nao autenticado.');
        }
        res.json(decoded);
    })
}) 

app.get('/logout', (req, res) => {
    res.clearCookie('acess_token');
    return res.json({sucess: true});
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
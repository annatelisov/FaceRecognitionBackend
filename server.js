const express = require('express');
const bodeyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt-nodejs');
const knex = require('knex');
const image = require('./imageAPI');


const db = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: 'A311016o',
        database: 'my-app'
    }
});

/*db.select('*').from('users').then(data => {
    console.log(data);
});*/

const app = express();

app.use(bodeyParser.json());
app.use(cors());


app.get('/', (req,res) => {
    res.send(db.users);
})

app.post('/signin', (req,res) => {
    const {email, password} = req.body;
    if(!email || !password){
        return res.status(400).json("Something is empty");
    }
    db.select('email', 'hash').from('login')
    .where('email', '=', email)
    .then(data => {
        const isValid = bcrypt.compareSync(password, data[0].hash);
        if (isValid){
            return db.select('*').from('users')
            .where('email', '=', email)
            .then(user => {
                res.json(user[0]);
            })
            .catch(err => res.status(400).json('unable to sign in'))
        }else {
            res.status(400).json('wrong parameters')
        }
    })
    .catch(err => res.status(400).json('wrong parameters'))
})

app.post('/register', (req,res) => {
    const {email, name, password} = req.body;
    if(!email || !name || !password){
        return res.status(400).json("Something is empty");
    }
    const hash = bcrypt.hashSync(password);
    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
            return trx('users').returning('*').insert({
                name: name,
                email: email,
                joined: new Date()
            }).then(user => {
                res.json(user[0]);
            })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => res.status(400).json('unable to register'))
})

app.get('/profile/:id', (req,res) => {
    const { id } = req.params;
    db.select('*').from('users').where({id}).then(user => {
        if(user.length){
            res.json(user[0])
        } else {
            res.status(400).json('not found')
        }
    })
    .catch(err => res.status(400).json('err getting user'))
})

app.put('/image', (req,res) => {
    const { id } = req.body;
    db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
        res.json(entries[0]);
    })
    .catch(err => res.status(400).json('unable to get entries'));
})

app.post('/imageurl', (req, res) => { 
    image.handleApiCall(req, res)
});

app.listen(3000, ()=> {
    console.log('app is running on port 3000');
})
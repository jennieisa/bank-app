import express from 'express';
import session from 'express-session';
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';

const port = 3000;
const app = express();
const saltRounds = 10;

const client = new MongoClient('mongodb://127.0.0.1:27017');
await client.connect();
const db = client.db('bank');
const accountsCollection = db.collection('accounts');
const usersCollection = db.collection('users');

app.use(express.json());
app.use(express.static('public'));

app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: 'shhhh, very secret', 
    cookie: {
        maxAge: 5 * 60 * 1000 //5 minuter 
    }
}))

/*ROUTES FÖR USERS (VG)*/

const restrict = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.status(401).send({ error: 'Unauthorized' });
    }
}

//Route för att logga in
app.post('/api/login', async (req, res) => {

    const user = await usersCollection.findOne({ user: req.body.user });
    const passMatches = await bcrypt.compare(req.body.pass, user.pass);

    if (user && passMatches) {

        req.session.user = user.user;

        res.json({
            user: user.user
        })

    } else {

        console.log(req.body.user, req.body.pass)
        res.status(401).json({ error: 'Unauthorized' });

    }

})

//Route för att kontrollera om personen är inloggad 
app.get('/api/loggedin', (req, res) => {

    if (req.session.user) {
        res.json({
            user: req.session.user
        });
    } else {
        res.status(401).json({ error: 'Unauthorized '});
    }

})

//Route för att logga ut 
app.post('/api/loggedout', async (req, res) => {
    req.session.destroy(() => {
        res.json({
            logedin: false
        });
    });
})

//Route för att skapa ny användare
app.post('/api/register', async (req, res) => {

    const hash = await bcrypt.hash(req.body.pass, saltRounds);

    await usersCollection.insertOne({
        user: req.body.user,
        pass: hash
    })

    res.json({
        success: true,
        user: req.body.user
    })
})

/*ROUTES FÖR KONTON */

//Route för att hämta alla konton 
app.get('/api/accounts', async (req, res) => {

    let accounts = await accountsCollection.find({}).toArray();

    res.json(accounts);

})

//Route för att hämta ett specifikt konto 
app.get('/api/accounts/account/:id', async (req, res) => {

    let account = await accountsCollection.findOne({ _id: ObjectId(req.params.id)});

    res.json(account);
})

//Route för att lägga till ett nytt konto 
app.post('/api/createnewaccount', async (req, res) => {

    const account = {
        ...req.body
    };

    await accountsCollection.insertOne(account);

    res.json({
        success: true,
        account
    });
})

//Route för att lägga till mer pengar på konto eller ta ut 
app.post('/api/accounts/account/:id/changebalance', async (req, res) => {

    const account = await accountsCollection.updateOne({ _id: ObjectId(req.params.id)}, { $set: { balance: req.body.balance} });

    res.json(account);

})

//Route för att ta bort kontot helt
app.delete('/api/accounts/account/:id/deleteaccount', async (req, res) => {

    const account = await accountsCollection.deleteOne({ _id: ObjectId(req.params.id) });

    res.json(account);

})

app.listen(port, () => {

    console.log(`listening on port ${port}`);

})

import express from 'express';
import session from 'express-session';
import { MongoClient, ObjectId } from 'mongodb';

const port = 3000;
const app = express();

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

const client = new MongoClient('mongodb://127.0.0.1:27017');
await client.connect();
const db = client.db('bank');
const accountsCollection = db.collection('accounts');

/*ROUTES FÖR KONTON */

//Route för att hämta alla konton 
app.get('/api/accounts', async (req, res) => {

    let accounts = await accountsCollection.find({}).toArray();

    res.json(accounts);

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

    console.log(req.body.balance)

    const account = await accountsCollection.updateOne({ _id: ObjectId(req.params.id)}, { $set: { balance: req.body.balance} });

    res.json(account);

})

//Route för att ta bort kontot helt
app.delete('/api/accounts/account/:id/deleteaccount', async (req, res) => {

    const account = await accountsCollection.deleteOne({ _id: ObjectId(req.params.id) });

    res.json(account);

})

/*ROUTES FÖR USERS (VG)*/

//Route för att skapa ny användare

//Route för att logga in

//Route för att kontrollera om personen är inloggad 

app.listen(port, () => {

    console.log(`listening on port ${port}`);

})

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

app.listen(port, () => {

    console.log(`listening on port ${port}`);

})

const express = require('express')
const { MongoClient } = require('mongodb');
const app = express();
const cors = require('cors');
const admin = require("firebase-admin");
require('dotenv').config()

const port = process.env.PORT || 5000;


const serviceAccount = {
    "type": "service_account",
    "project_id": "doctor-portal-007",
    "private_key_id": "377b7816f99f11352cd6cfba2407f03d2ae02fa9",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCm43YKpawMM1IP\nHnhecUgjzcW5MVNiAJ6vOeFLVMrlPgG9BaZskuZZhwhOdr2/oCCUdyIfePa3hTC9\n3KtLyk2irSDpwylYXh1pwPR6X+MXj/dAhKll8C71JS2dshpYlcLmavmaKVPWjJnC\ne0IDjfrSsJrjYBCENVlaE6fbUnx8y5DwCioFesgq+yhI/ADDm/s1+g+PtwAN4vVc\ndngMEDtOwminL2HKt31jDlRB29/IZMxZxVtaJtwd4mlwQqowYNM1AENa8eBCxVpE\nkQ4OBNpG6Jk1W08FHut4KE1qqRfllvs8nqaHozmjoqavypjbuvgMSLn+hu3LCOaE\nVSfVwfPtAgMBAAECggEAAM8kBJ+ygpmiGXgqmbyfXqsR/Rif4J8DpfJYJQsbc7qV\n/BJhsO+SZdc5g1XgjCQM3GNqezAVNCUVbCo8e2DW+QWxXejIE8lbB6b7mHdMDNJy\nHrI19wxP0fj07GmPZqQNPpxAqw5tvWHPogmCc611zJ02Fwmhct6mWQE05GOVPm6l\nOwJpY1L1im0Fe9fqtxhFcsGtGBXvibquONgIseP8UtIcA7rxUuNXmNsrlGvT48yK\nSY+bKDfrpHVjfhr3uuHfW/h5eD05TB73ZMi83cIU0WPwoA8GyLBjnl88rk2mvmsC\nqUFLCp7PQZ31pKxc9TJvY2p7TL95L4ZooXAsQTsWCQKBgQDW3SBfZ3ZYahEXtTDQ\nlPfA16ltvVOzRAk7ubiIGnP4kLjwF1jF1XaUm1V4xVI1Gfee7gBRSKRu5Die41Yn\n+O2hLUzYzpv+tAEwO3NzlnAxnF6Xy0YwXJgV0wRrU2nCdekQ3DSn7Sf0mJ1TjXn1\n+sHGJazPmDNPTUe8FP4E8m1ddQKBgQDG1vpj6A9sBPFjd+B9t9Eb7qFRpg1loZez\nK7M7IgGaHI4ir7JPjmXHyiAIu0C0ct0YZGc0gdZT8buOIWZL9H9JhVEsVwF1UiEB\nWV/zF/NDYGldD1KtsQxTuP7HrDqpxhVhMyHZnNEsIGX/CVWQ54FIlFWmItVieHET\n/+oDvwCVmQKBgQDMOnDr3fbSQTcv9qyIhiAcL6E+yueFDJVOLNCmpaY3zK/MnhRm\nLulAhYkvezcRfDYu3YB1wntxYAIlnGanJegQ/HL/3RrPdZ9vjgLGCmdn8H7E/5Ue\noNR6YhHgRe/Pw62dtgFi4HvK9UkNQvt7ADcxNVxWEhArP4SA1N9CKoAjhQKBgQCS\nwURYzIPlY9iNY4LLBwpNJVjnHDmzEwsV8GD+eeDYz86QB0EBusWgKaxvBVWCWWyZ\nfjE17cY0eqvFAR2xXak8qCr7INQwtQcrKb3Je5nN1rCtQIvzKkNA378bvCAoAczx\nyn1nUXiIqvjcvRTsOBGRcfms/vSjEuXSrwUW8rgJsQKBgFfhsOce05NpG3ciEUz6\nr92A4C1k6FV/quqlUYM5z/TWg0LgMz+0B1eDKv2EHPlvcTHfEsr2YdmXYH4HdDXj\nzwW1HDV5ZOoSSBGQWvjEU0ojCMqq/jLiTRwwSWZl9bHMnFu2Lu4QrJjVmi40cQa7\nSNkLgYk1xVsJuywCmBqfu0yv\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-xi3da@doctor-portal-007.iam.gserviceaccount.com",
    "client_id": "106670393101225283248",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xi3da%40doctor-portal-007.iam.gserviceaccount.com"
};

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3uvbd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function verifyToken(req, res, next) {
    if (req.headers?.authorization?.startsWith('Bearer ')) {
        const token = req.headers.authorization.split(' ')[1];

        try {
            const decodedUser = await admin.auth().verifyIdToken(token);
            req.decodedEmail = decodedUser.email;
        }
        catch {

        }
    }
    next();
}

async function run() {
    try {
        await client.connect();
        const database = client.db("doctors_portal");
        const appointmentsCollection = database.collection("appointments");
        const usersCollection = database.collection('users');
        // Get appointment
        app.get('/appointments', verifyToken, async (req, res) => {
            const email = req.query.email;
            const date = req.query.date;
            const query = { email: email, date: date }
            const cursor = appointmentsCollection.find(query)
            const result = await cursor.toArray();
            res.send(result)
        });

        // Post appointment
        app.post('/appointments', async (req, res) => {
            const appointment = req.body;
            const result = await appointmentsCollection.insertOne(appointment)
            res.json(result)
        });
        // admin check 
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
        })
        // users add POST
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(user)
        });
        // google user PUT
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user
            };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result)
        });
        // Admin role 
        app.put('/users/admin', verifyToken, async (req, res) => {
            const user = req.body;
            // console.log("put", req.headers.authorization)
            console.log("decode", req.decodedEmail);
            const requester = req.decodedEmail;
            if (requester) {
                const requesterAccount = await usersCollection.findOne({ email: requester });
                if (requesterAccount.role === 'admin') {
                    const filter = { email: user.email }
                    const updateDoc = { $set: { role: 'admin' } };
                    const result = await usersCollection.updateOne(filter, updateDoc);
                    res.json(result);
                }
            }
            else {
                res.status(403).json({ message: 'you do not have Access to give Admin' })
            }

        })
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello Doctor portal')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

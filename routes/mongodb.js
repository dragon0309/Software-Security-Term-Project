const express = require('express');
var router = express.Router();
const Grocery = require('../database/schemas/Grocery');
const myGrocery = require('../database/schemas/myGrocery');
const User = require('../database/schemas/User');
const mongoose = require('mongoose');
const { generateFakeData } = require('../utils/generateFakeData');
const Brute = require('express-brute');

router.use(express.json());

const store = new Brute.MemoryStore();
const bruteforce = new Brute(store, {
    freeRetries: 5,
    minWait: 5 * 60 * 1000,
    maxWait: 60 * 60 * 1000,
    lifetime: 24 * 60 * 60,
});

router.post('/items', bruteforce.prevent, async (req, res) => {
    try {
        console.log(req.body);
        const newGrocery = await Grocery.create(req.body);
        res.status(201).json(newGrocery);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/items', async (req, res) => {
    try {
        const grocery = await Grocery.find();
        res.json(grocery);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/userItem/:price/:name/:address', async (req, res) => {
    try {
        const grocery = await Grocery.find({
            discountedPrice: req.params.price,
            groceryName: req.params.name,
            storeAddress: req.params.address
        });
        res.json(grocery);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//商家的資料(網站右邊)
router.get('/items/:name', async (req, res) => {
    try {
        const regex = new RegExp(req.params.name, 'i'); // 'i' 表示不區分大小寫
        const grocery = await myGrocery.find({ storeName: regex });
        if (!grocery || grocery.length === 0) {
            return res.status(404).json({ message: 'Grocery not found' });
        }
        res.json(grocery);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/items', async (req, res) => {
    try {
        const grocery = await myGrocery.deleteMany({ expirationDate: { $lt: new Date().toISOString().substring(0, 10) } });
        res.json(grocery);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/append', async (req, res) => {
    try {
        const otherConnection = await mongoose.createConnection('mongodb://127.0.0.1:27017/mockStore');
        const OtherDatabaseModel = otherConnection.model('Grocery', myGrocery.schema);
        const discountedItems = await OtherDatabaseModel.find({ discount: true });

        for (let i = 0; i < discountedItems.length; i++) {
            const itemData = discountedItems[i];

            const cleanedGrocery = {
                groceryName: itemData.groceryName,
                price: itemData.price,
                discount: itemData.discount,
                discountedPrice: itemData.discountedPrice,
                expirationDate: itemData.expirationDate,
                storeName: itemData.storeName
            };
            await myGrocery.create(cleanedGrocery);
        }

        await otherConnection.close();

        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/generateItems', async (req, res) => {
    try {
        let fakeData = generateFakeData();
        const otherConnection = await mongoose.createConnection('mongodb://127.0.0.1:27017/mockStore');
        const OtherDatabaseModel = otherConnection.model('Grocery', myGrocery.schema);
        for (let i = 0; i < fakeData.length; i++) {
            await OtherDatabaseModel.create(fakeData[i]);
        }
        await otherConnection.close();
        res.sendStatus(201);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/role', async (request, response) => {
    const { email } = request.body;
    const userDB = await User.findOne({ email });
    if (userDB) {
        response.json(userDB.role);
    } else {
        response.send(400);
    }
});

module.exports = router;
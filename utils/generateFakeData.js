const faker = require('faker');

const foodNames = [
    "便當",
    "漢堡",
    "飯糰",
    "三明治",
    "麵包",
];
const storeNames = [
    "7-11富陽",
    "7-11台大",
    "7-11長興",
    "7-11台科",
    "7-11復忠",
    "7-11福亭",
    "7-11鳳翔",
];

let fakeData = [];
function generateFakeData() {
    for (let i = 0; i < 1000; i++) {
        let groceryName = faker.random.arrayElement(foodNames);
        let price = Math.floor((Math.random() * (200 - 10)) + 10);
        let discount = faker.datatype.boolean();
        let discountedPrice = discount ? price * 0.8 : price;
        let expirationDate = faker.date.future().toISOString().substring(0, 10);
        let storeName = faker.random.arrayElement(storeNames);
        fakeData.push({
            groceryName,
            price,
            discount,
            discountedPrice,
            expirationDate,
            storeName,
        });
    }
    return fakeData;
}

module.exports = {
    generateFakeData,
};

const mongoose = require('mongoose');

const GrocerySchema = new mongoose.Schema({
    groceryName: {
        type: mongoose.SchemaTypes.String
    },
    originalPrice: {
        type: mongoose.SchemaTypes.String
    },
    discount: {
        type: mongoose.SchemaTypes.String
    },
    discountedPrice: {
        type: mongoose.SchemaTypes.String
    },
    expirationDate: {
        type: mongoose.SchemaTypes.String
    },
    storeName: {
        type: mongoose.SchemaTypes.String
    },
    storeAddress: {
        type: mongoose.SchemaTypes.String
    },
    imageUrl: {
        type: mongoose.SchemaTypes.String
    },
    addedBy: {
        type: mongoose.SchemaTypes.String
    },
    createdAt: {
        type: mongoose.SchemaTypes.Date,
        required: true,
        default: new Date(),
    },
});

module.exports = mongoose.model('grocery', GrocerySchema);

import mongoose from "mongoose";
const transactionSchema = new mongoose.Schema({
    product_title: String,
    description: String,
    price: Number,
    dateOfSale: Date,
    sold_status: Boolean,
    category: String
}, { collection: 'Transaction' }); // Explicitly set the collection name

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
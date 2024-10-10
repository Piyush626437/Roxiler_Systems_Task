import express from 'express'
import mongoose from "mongoose";
import { dbConnection } from "./database/dbConnection.js";
import axios from "axios";
import Transaction from "./models/Transaction.js"
import { config } from "dotenv";
import transactionsRoute from "./routes/transactions.js"
import cors from 'cors';


const app = express();
config({ path: "./config/.env" });
dbConnection();

// Use CORS middleware
app.use(cors());

const seedDatabase = async() => {
    try {
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        const data = response.data;

        // Clear existing data
        await Transaction.deleteMany();

        // Insert new data, ensuring dateOfSale is a Date object
        const formattedData = data.map(item => ({
            ...item,
            dateOfSale: new Date(item.dateOfSale)
        }));

        await Transaction.insertMany(formattedData);
        console.log('Database seeded successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
    }
};
seedDatabase();
// Endpoint to seed the database manually
app.get('/initialize', async(req, res) => {
    await seedDatabase();
    res.send('Database initialized with seed data');
});

// Use the transactions route
app.use('/transactions', transactionsRoute);

app.listen(process.env.PORT, () => {
    console.log(`Server running at port ${process.env.PORT}`);
});
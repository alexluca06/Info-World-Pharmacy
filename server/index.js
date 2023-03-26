const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const bodyParser = require('body-parser');
const usersRouter = require('./routes/users.js');
const productsRouter = require('./routes/products.js');
const ordersRouter = require('./routes/orders.js');

// Enable JSON packages
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Resolve CORS politics
app.use(cors());

// Routes:
app.use('/users', usersRouter);
app.use('/products', productsRouter);
app.use('/orders', ordersRouter);

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
    console.log(`Server is working on PORT ${PORT}!`);
});
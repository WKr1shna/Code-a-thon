// Express Server Entry point
const express = require('express');
const app = express();
app.use(express.json());
app.listen(5000, () => console.log('Backend running on port 5000'));

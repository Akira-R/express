const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/cat', (req, res) => {
    res.send('We are doing the cat page')
})

app.listen(port, () => {
    console.log(`My Example app listening on port ${port}`)
})
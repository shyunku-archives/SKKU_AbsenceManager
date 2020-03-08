const express = require('express');
const app = express();
const ejs = require('ejs');
const path = require('path');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));
app.use(express.static(path.join(__dirname, 'static')));


app.get('/', (req, res) => {
    res.render('index');
});

app.listen(2700, () => {
    console.log('Server opened in localhost:2700');
});
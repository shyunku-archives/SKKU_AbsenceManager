const express = require('express');
const app = express();
const ejs = require('ejs');
const path = require('path');
const crawl = require('./util/crawling');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));
app.use(express.static(path.join(__dirname, 'static')));

let everytimeInfo = null;

app.get('/', async(req, res) => {
    everytimeInfo = await crawl.get_data();

    res.render('index', {
        tableData: JSON.stringify(everytimeInfo),
    });
});

app.listen(2700, () => {
    console.log('Server opened in localhost:2700');
});
const express = require('express');
const app = express();
const ejs = require('ejs');
const path = require('path');
const crawl = require('./util/crawling');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));
app.use(express.static(path.join(__dirname, 'static')));

app.get('/', async(req, res) => {
    let everytimeInfo = await crawl.get_data();

    res.render('index', {
        tableData: JSON.stringify(everytimeInfo.classInfo),
        semesterData: JSON.stringify(everytimeInfo.semesterInfo),
        tableID: everytimeInfo.tableID,
    });
});

app.get('/account', (req, res) => {
    res.render('account');
});

app.listen(2700, () => {
    console.log('Server opened in localhost:2700');
});
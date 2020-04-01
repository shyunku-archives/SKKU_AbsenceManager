const express = require('express');
const app = express();
const ejs = require('ejs');
const path = require('path');
const crawl = require('./util/crawling');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

/* -------------------- GET -------------------- */

app.get('/', async(req, res) => {
    let everytimeInfo = await crawl.get_everytime_data();

    res.render('index', {
        tableData: JSON.stringify(everytimeInfo.classInfo),
        semesterData: JSON.stringify(everytimeInfo.semesterInfo),
        tableID: everytimeInfo.tableID,
    });
});

app.get('/account', (req, res) => {
    res.render('account');
});

/* -------------------- POST -------------------- */

app.post('/authen', async(req, res) => {
    let everytime_id = req.body.ID;
    let everytime_pw = req.body.PW;
    let tableData = await crawl.get_timetable_list_data(everytime_id, everytime_pw);

    res.send(tableData);
});

app.post('/save-userinfo', async(req, res) => {
    console.log(req.body);
});

app.listen(2700, () => {
    console.log('Server opened in localhost:2700');
});
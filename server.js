const express = require('express');
const app = express();
const ejs = require('ejs');
const path = require('path');
const crawl = require('./util/crawling');
const fm = require('./util/file_manage');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

/* -------------------- GET -------------------- */

app.get('/', async(req, res) => {
    fm.fetch_local_table_info((dat)=>{
        res.render('index', {
            tableData: JSON.stringify(dat),
        });
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
    const saveData = req.body;
    
    let accountData = {
        id: saveData.everytimeAccount.id,
        pw: saveData.everytimeAccount.pw,
        timetable_id: saveData.timetableInfo.id
    };

    fm.save_account_info(accountData);
    fm.save_timetable_info(saveData.timetableInfo);

    res.send({code: 1000});
});

app.listen(2700, () => {
    console.log('Server opened in localhost:2700');
});
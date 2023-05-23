const express = require("express");
const app = express();
const cors = require('cors');
const port = process.env.PORT || 4000;

const pgp = require('pg-promise')(/*.options.*/)
const db = pgp('postgres://dt468postgres_user:TmKoQPjaTaRel0Vi91HsYpkZW42ghLjB@dpg-chibmg3hp8u7g2fdu7q0-a.singapore-postgres.render.com/dt468postgres?ssl=true')
const top3Course = [{code:"DT160" ,cname:"C programming", description: "Dummy text"},
{code:"DT161" ,cname:"C++ programming", description: "Dummy text"},
{code:"DT261" ,cname:"Data Structures", description: "Dummy text"}]

const courseList = [{code:"DT160" ,cname:"C programming", description: "Dummy text"},
{code:"DT161" ,cname:"C++ programming", description: "Dummy text"},
{code:"DT162" ,cname:"OOP programming", description: "Dummy text"},
{code:"DT163" ,cname:"OOP programming Lab", description: "Dummy text"},
{code:"DT468" ,cname:"Special Topics", description: "Dummy text"},
{code:"DT261" ,cname:"Data Structures", description: "Dummy text"}]

const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    }))
app.use(cors({
    origin: '*'
}))

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.post('/', (req, res) => {
    res.send('Post Request Hello World!')
})

app.get('/cat', (req, res) => {
    const {color, region} = req.query;
    res.send('We are doing the cat page for color = '+ color +' and region = ' + region)
})

app.get('/cat/:subPath', (req, res) => {
    const { subPath } = req.params;
    res.send(`Accept Cat ${subPath} Sub Request.`)
})

app.get('/cat/:subPath/:nextSubPath', (req, res) => {
    const { subPath, nextSubPath } = req.params;
    res.send(`Accept Cat ${subPath} Sub Request. and ${nextSubPath}`)
})

app.get('/top3', (req, res) => {
    res.json({ result: top3Course })
})

app.get('/courseList', (req, res) => {
    res.json({ result: courseList })
})

app.get('/users', (req, res) => {
    db.any('select * from public.user_account')
    .then((data)=>{
        console.log('all users: ', data)
        res.json(data)
    })
    .catch((error)=> {
        console.log('ERROR:', error)
        res.send("ERROR: can't get data")
    })
})

app.get('/users/:name', (req, res) => {
    const {name} = req.params;
    db.any('select * from public.user_account where "name" = $1', name)
    .then((data)=>{
        console.log('all student: ', data)
        res.json(data)
    })
    .catch((error)=> {
        console.log('ERROR:', error)
        res.send("ERROR: can't get data")
    })
})

app.post('/users', (req, res) => {
    console.log('Got body:', req.body);
    const {name} = req.body;
    db.any('select * from public.user_account where "name" = $1', name)
    .then((data)=>{
        console.log('DATA:', data)
        res.json(data)
    })
    .catch((error)=> {
        console.log('ERROR:', error)
        res.send("ERROR: can't get data")
    })
})

app.get('/c*', (req, res) => {
    res.send('get in path c*')
})

app.get('*', (req, res) => {
    res.send('do this for all unknown')
})

app.listen(port, () => {
    console.log(`My Example app listening on port ${port}`)
})
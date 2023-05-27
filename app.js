const express = require("express");
const app = express();
const cors = require('cors');
const port = process.env.PORT || 4000;
const jwt = require('jsonwebtoken')

const SECRET = "mysecretword"

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

const user = {email:"mail1@xxx.com", password:"pass1"}

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

// app.get('/top3', (req, res) => {

//     res.json({result: top3Course})
// })

// app.get('/courseList', (req, res) => {

//     res.json({ result: courseList })
// })

app.get('/courseList', (req, res) => {
    db.any(`select * from public.course order by name ASC`)
    .then((data)=>{
        res.json({result:data})
    })
    .catch((error)=> {
        res.send("ERROR: can't get data")
    })
})

const generateToken = (usr) => {
    const token =jwt.sign({email:usr.email} , SECRET, {expiresIn:"30m", algorithm:"HS256"})
    return token;
}

app.post('/login', (req, res) => {
    const {user} = req.body

    db.any("select email, password from public.user_account where email = $1 and password = $2", [user.email, user.password])
    .then((data)=>{
        if(data.length === 0){
            return res.status(401).send("Login Fail." + user.email + " " + user.password)
        }
        const access_token = generateToken(user)
        res.json({token:access_token})
    })
    .catch((error)=> {
        return res.status(401).send("Login error." + error.message)
    })
})

app.post('/testsubmit', (req, res) => {
    const {user} = req.body

    db.any(`select * from public.user_account where email = $1`, [user.email])
    .then((userdata)=>{
        db.any(`INSERT INTO test_choice(choice_a, choice_b, choice_c,choice_d) VALUES ($1, $2, $3, $4)`, [user.choice1,user.choice2,user.choice3,user.choice4])
        db.any("select * from test_choice order by id desc limit 1")
        .then((data)=>{
            const vresult = ((user.choice1 + user.choice2 + user.choice3 + user.choice4) % 4)
            let presult;
            if(vresult == 0){
                presult = 'A'
            }else if(vresult == 1){
                presult = 'B'
            }else if(vresult == 2){
                presult = 'C'
            }else if(vresult == 3){
                presult = 'D'
            }

            db.any(`INSERT INTO test_report(username, presult, cid) VALUES ($1, $2, $3)`, [userdata[0].name, presult, data[0].id])
            .then (()=> {
                return res.json(presult)
            })
            .catch((error)=> {
                return res.json(error.message)
            })
        })
        .catch((error)=> {
            return res.json(error.message)
        })
    })
    .catch((error)=> {
        return res.json(error.message)
    })
})

const validateToken = (req,res,next) => {
    if(!req.headers["authorization"]) return res.status(401).send("Not Login")
    const token = req.headers["authorization"].replace("Bearer ","")
    jwt.verify(token,SECRET, (err, email)=>{
        if(err){
            return res.status(401).send("Not Login")
        }else{
            req.email = email
            next()
        }
    })
}

app.post('/profile', validateToken,(req,res) => {
    const {email} = req.body;
    // console.log("email",email)
    const queryString = `select ua.name as username, ua.email, tr.presult, co.id, co.name as cname, co.description from public.user_account ua 
    left join test_report tr on ua.name = tr.username
    full join user_course uc on ua.name = uc.username
    left join course co on uc.cid = co.id
    where ua.email = $1`
    db.any(queryString,email)
    .then((data)=>{
        res.json({result:data})
    })
    .catch((error)=> {
        res.send(error.message)
    })
})

app.post('/recommend', (req, res) => {
    const {email} = req.body
    // const {ptype} = req.query;
    db.any(`select ua.name as username, ua.email, tr.presult from public.user_account ua 
    left join test_report tr on ua.name = tr.username
    where ua.email = $1`, email)
    .then((pdata)=>{
        let type
        if(pdata[0].presult == null){
            type = 'F'
        }else{
            type = pdata[0].presult
        }
        db.any(`select * from public.course where ptype = $1 order by id ASC`, type)
        .then((data)=>{
            res.json({result:data})
        })
        .catch((error)=> {
            res.send(error)
        })
    })
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
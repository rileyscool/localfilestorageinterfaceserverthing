const express = require("express")
const app = express()

app.set("view engine", "ejs")

const fs = require('fs')
const config = require("./config.json")

if(!fs.existsSync('./users/')) {
    fs.mkdirSync('./users/')
}

app.get("/", (req, res) =>{
res.render('index')
})

res.get("/login", (req, res) =>{
    res.render('login')
})

res.get("/register", (req, res) =>{
    res.render('register')
})

res.get("/dashboard", (req, res) =>{
    res.render('dashboard')
})


app.post("/accountFiles", (req, res) =>{ // this makes more sense to be a get but too bad
    desiredAccount = req.cookie.get("username") || null
    if(!desiredAccount){
        // you have no account but you are sending a request? interesting.
        return res.status(500).send("fuck off")
    }
    userFiles = fs.readdirSync(`./users/${desiredAccount}`, { withFileTypes: true, recursive: true }) // idk if this includes folders or not so, we will see.

    res.send({files: userFiles}) // seems wrong, we will see later

})

app.post('/account', (req, res) =>{
    // dont judge me because i cant be bothered adding like encryption or some shit for this because its local
    let stuff = req.body.stuff
    let username = req.body.username
    let password = req.body.password
    let action = req.body.action

    if(action === "register"){
        // also im gonna be stupid and store userdata in a json file 💀💀
        if(!fs.existsSync("./users/users.json")){
            // wow the first user to sign up!! we should give them an award
            // dont need to check if somebody is already using that username anymore
            let dataToWrite = {}
            dataToWrite[username] = {pass: password}
            fs.writeFileSync("./users/users.json", JSON.stringify(dataToWrite))
            res.redirect(`/login`) // make them login again because i can
            return fs.mkdirSync(`./users/${username}`) // make a folder for the users files
        }
        let allData = JSON.parse(fs.readFileSync("./users/users.json")) // ew ikr
        if(allData[username]){
            res.status(418).send({"Error": "Username is taken"}) // im a teapot heehe
            // the AI completion thing is so ass, it suggested i send allData ( AI is not taking over the world any time soon )
        }else{
            // im not gonna check password validity because im lazy asf and i might do it on clientside if i even add it!
            allData[username] = {pass: password}
            fs.writeFileSync("./users/users.json", JSON.stringify(allData))
            // i hope multiple people dont sign up at the same time
            res.redirect(`/login`)
            fs.mkdirSync(`./users/${username}`) // make a folder for the users files
        }
    }else{
        // they are attempting to login
        let allData = JSON.parse(fs.readFileSync("./users/users.json")) // ew again
        if(allData[username]){
            // res.status(418).send({"Error": "Username is taken"})
            // ^^ ai suggestion 💀 stupid shit
            if(allData[username] === password){
                res.cookie("username", allData[username]) // cbf doing auth so this is good enough authentication for me hahaha
                res.redirect("/dashboard")
            }{
                res.status(418).send({"Error": "Username or password is incorrect"}) // its the username
            }
        }else{
            res.status(418).send({"Error": "Username or password is incorrect"}) // its the username
        }

    }
})

app.listen(config.port || 1234)
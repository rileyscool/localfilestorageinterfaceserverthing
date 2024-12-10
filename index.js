const express = require("express")
const app = express()

const fs = require('fs')
const config = require("./config.json")


app.get("/", (req, res) =>{

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
        }
        let allData = JSON.parse(fs.readFileSync("./users/users.json")) // ew ikr
        if(allData[username]){
            res.status(418).send({"Error": "Username is taken"}) // im a teapot heehe
        }
    }else{

    }
})

app.listen(config.port || 1234)
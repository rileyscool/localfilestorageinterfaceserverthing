const express = require("express");
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(cookieParser()); // oh my god i should have just read the docs instead of this shit
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const config = require("./config.json");

if (!fs.existsSync('./users/')) {
    fs.mkdirSync('./users/');
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const user = req.cookies.username;
        const userDir = path.join(__dirname, 'users', user);
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir);
        }
        cb(null, userDir);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

// stupid multer

app.get("/", (req, res) => {
    res.redirect(`/register`);
});

// why were these all res instead of app 💀
app.get("/login", (req, res) => {
    res.render('login');
});

app.get("/register", (req, res) => {
    res.render('register');
});

app.get("/dashboard", (req, res) => {
    res.render('dashboard');
});

app.get("/files/*", (req, res) => {
    const baseUrl = req.url;
    const user = baseUrl.split("/")[2];
    const filename = baseUrl.split("/")[3];
    const fileLocation = path.join(__dirname, 'users', user, filename);
    if (fs.existsSync(fileLocation)) {
        res.download(fileLocation);
    } else {
        res.status(404).send("No such file g");
    }
});

app.post("/accountFiles", (req, res) => { // this makes more sense to be a get but too bad
    const desiredAccount = req.cookies.username || null;
    console.log(desiredAccount);
    if (!desiredAccount) {
        // you have no account but you are sending a request? interesting.
        return res.status(500).send("fuck off");
    }
    const userFiles = fs.readdirSync(path.join(__dirname, 'users', desiredAccount))
        .map(file => ({ name: file, path: path.join('/files', desiredAccount, file) }));

    res.send({ files: userFiles }); // seems wrong, we will see later
    // not wrong, good enough!
});

app.post('/account', (req, res) => {
    // dont judge me because i cant be bothered adding like encryption or some shit for this because its local
    const { username, password, action } = req.body.stuff;

    if (!fs.existsSync("./users/users.json")) {
        // wow the first user to sign up/login!! we should give them an award
        fs.writeFileSync("./users/users.json", JSON.stringify({}));
    }

    const allData = JSON.parse(fs.readFileSync("./users/users.json"));
    console.log(action);
    console.log(req.body);
    if (action === "register") {
        // also im gonna be stupid and store userdata in a json file 💀💀
        if (allData[username]) {
            res.status(418).send({ "Error": "Username is taken" }); // im a teapot heehe
            // the AI completion thing is so ass, it suggested i send allData ( AI is not taking over the world any time soon )
        } else {
            // im not gonna check password validity because im lazy asf and i might do it on clientside if i even add it!
            allData[username] = { pass: password };
            fs.writeFileSync("./users/users.json", JSON.stringify(allData));
            // i hope multiple people dont sign up at the same time
            res.status(200).send("wow");
            // res.redirect(`/login`);
            fs.mkdirSync(`./users/${username}`); // make a folder for the users files
        }
    } else {
        // they are attempting to login
        if (allData[username] && allData[username].pass.toString() === password.toString()) {
            console.log("wow its right!");
            res.cookie("username", username); // cbf doing auth so this is good enough authentication for me hahaha
            res.status(200).send(200);
        } else {
            console.log(allData[username].pass.toString() === password.toString());
            res.status(418).send({ "Error": "Username or password is incorrect" }); // its the password
            console.log("wrong apss");
            console.log(password, allData[username].pass);
        }
    }
});

app.post('/upload', upload.array('files'), (req, res) => {
    if(!req.cookies.username){
        return res.status(418).send("fuck off")
    }
    if(!req.files || req.files.length == 0){
        return res.status(418).send("oh my god fuck off")
    }
    res.status(200).send("perfect perfect perfect")
});

app.delete('/delete', (req, res) => {
    const filename = req.query.filename;
    const user = req.cookies.username;
    const fileLocation = path.join(__dirname, 'users', user, filename);
    if (!filename || !user) {
        return res.status(400).send("Bad Request: Missing filename or user.");
    }
    if (fs.existsSync(fileLocation)) {
        fs.unlinkSync(fileLocation);
        res.status(200).send("File deleted successfully!");
    } else {
        res.status(404).send("File not found.");
    }
})

app.listen(config.port || 1234, () => {
    console.log(`Page open at http://localhost:${config.port || 1234}/`);
});

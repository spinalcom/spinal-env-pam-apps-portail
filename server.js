const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const { checkTokenValidity } = require("./serverUtils");
const https = require("https");
const fs = require("fs");
const { default: axios } = require('axios');


dotenv.config({ path: path.resolve(__dirname, ".env") });
const port = process.env.PORT || 1234;
const vue_dir = path.resolve(__dirname, './dist');
const app = express();

let spinal_api_url = process.env.SPINAL_API_URL.replace(/\/$/, ""); // Ensure no trailing slash

app.use(cors("*"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(vue_dir));
app.use(cookieParser());


app.get("/", (req, res) => {
    const queries = req.query;
    if (queries.ref) {
        return res.redirect("/login?ref=" + queries.ref);
    }
});

app.get("/login", async (req, res) => {

    let token = req.cookies.token;
    if (!token && req.query.ref) token = await getTokentoKenByRef(req.query.ref);


    if (!token) {
        return res.redirect(spinal_api_url + "/login");
    }


    // Check if the token is valid
    const { error } = await checkTokenValidity(spinal_api_url, token);
    if (error) return res.redirect(spinal_api_url + "/login");


    res.cookie("token", token);
    return res.sendFile(path.resolve(vue_dir, 'index.html'));
});

app.use("/*", (req, res) => {
    res.sendFile(path.resolve(vue_dir, 'index.html'))
});


if (process.env.PROTOCOL === "http") {
    app.listen(port, () => console.log(`app listening at http://localhost:${port} ....`));
    return;
} else if (process.env.PROTOCOL === "https") {
    const sslOptions = {
        key: fs.readFileSync(process.env.SSL_KEY),
        cert: fs.readFileSync(process.env.SSL_CERT)
    };

    https.createServer(sslOptions, app).listen(port, () => console.log(`app listening at https://localhost:${port} ....`));
}




function getTokentoKenByRef(ref) {
    return axios.get(`${spinal_api_url}/getTokenByRef/${ref}`).then((result) => {
        if (result.status != 200) return null;
        return result.data.token;
    }).catch(err => {
        return null;
    });
}
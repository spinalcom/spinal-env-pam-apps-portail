
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


dotenv.config({ path: path.resolve(__dirname, ".env"), override: true });
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

    let token = null;

    if (req.query.ref) token = await getTokentoKenByRef(req.query.ref);

    if (!token) token = getToken(req);

    if (!token) {
        return res.redirect(spinal_api_url + "/login");
    }

    // Check if the token is valid
    const { error } = await checkTokenValidity(spinal_api_url, token);
    if (error) return res.redirect(spinal_api_url + "/login");


    res.cookie("token", token, { sameSite: "Lax", maxAge: 24 * 60 * 60 * 1000, path: '/' });
    return res.sendFile(path.resolve(vue_dir, 'index.html'));
});

app.use("*", (req, res) => {
    res.sendFile(path.resolve(vue_dir, 'index.html'))
});


const protocol = process.env.PROTOCOL;


if (protocol === "http") {
    app.listen(port, () => console.log(`app listening at http://localhost:${port} ....`));
    return;
} else if (protocol === "https") {
    const sslOptions = {
        key: fs.readFileSync(process.env.SSL_KEY),
        cert: fs.readFileSync(process.env.SSL_CERT)
    };

    https.createServer(sslOptions, app).listen(port, () => console.log(`app listening at https://localhost:${port} ....`));
} else {
    console.error("Error: PROTOCOL environment variable must be either 'http' or 'https'.");
    process.exit(1);
}


function getTokentoKenByRef(ref) {
    return axios.get(`${spinal_api_url}/getTokenByRef/${ref}`).then((result) => {
        if (result.status != 200) return null;
        return result.data.token;
    }).catch(err => {
        return null;
    });
}


function getToken(req) {
    let token = req.cookies.token

    if (token) return token;

    const header = req.headers.authorization || req.headers.Authorization;
    if (header) {
        const [, t] = header.split(" ");
        if (t) return t;
    }

    token = req.body.token || req.query.token || req.headers["x-access-token"]
    if (token) return token;

    const refUrl = req.get("referer")
    if (refUrl) {
        token = new URL(refUrl).searchParams.get("token");
        return token;
    }
}

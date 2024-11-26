const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const { checkTokenValidity } = require("./serverUtils");
const https = require("https");
const fs = require("fs");


dotenv.config({ path: path.resolve(__dirname, ".env") });
const port = process.env.PORT || 1234;
const vue_dir = path.resolve(__dirname, './dist');
const app = express();

app.use(cors("*"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());


app.use(express.static(vue_dir));

app.use("/login", async (req, res) => {
    console.log("cookies on login request", req.cookies);
    const token = req.cookies.token;
    let spinal_api_url = process.env.SPINAL_API_URL;

    if (token) {
        const { error } = await checkTokenValidity(token);
        if (!error) return res.redirect("/home");
    }

    if (!spinal_api_url.endsWith("/")) spinal_api_url += "/";
    return res.redirect(spinal_api_url + "login");
});

app.use("/*", (req, res) => {
    res.sendFile(path.resolve(vue_dir, 'index.html'))
});

const sslOptions = {
    key: fs.readFileSync(process.env.SSL_KEY),
    cert: fs.readFileSync(process.env.SSL_CERT)
};



https.createServer(sslOptions, app).listen(port, () => console.log(`app listening at https://localhost:${port} ....`));
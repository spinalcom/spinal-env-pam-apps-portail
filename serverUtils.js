const axios = require("axios");


function checkTokenValidity(apiUrl, token) {
    if (!apiUrl.endsWith("/")) apiUrl += "/";

    return axios.post(apiUrl + `getTokenData`, { token }).then((result) => {
        return { error: false, data: result.data };
    }).catch((err) => {
        return { error: true, data: err }
    });
}


module.exports = { checkTokenValidity }
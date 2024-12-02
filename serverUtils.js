const axios = require("axios");


function checkTokenValidity(apiUrl, token) {
    if (!apiUrl.endsWith("/")) apiUrl += "/";

    return axios.post(apiUrl + `api/v1/pam/getTokenData`, { token }).then((result) => {
        return { error: false, data: result.data };
    }).catch((err) => {
        return { error: true, data: err }
    });
}


module.exports = { checkTokenValidity }
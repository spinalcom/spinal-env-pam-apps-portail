require('dotenv').config();
const port = process.env.PORT;
const protocol = process.env.PROTOCOL || 'http';
const ssl_cert = process.env.SSL_CERT || '';
const ssl_key = process.env.SSL_KEY || '';
const args = `dist/ -p ${port} `;
if(protocol ==='https'){
  args+= `--ssl --cert ${ssl_cert} --key ${ssl_key}`;
}
module.exports = {
  apps: [
    {
      name: `portail-applicatif-pam-${port}`,
      script: "node_modules/.bin/http-server",
      cwd: ".",
      args: args
    },
  ],
};



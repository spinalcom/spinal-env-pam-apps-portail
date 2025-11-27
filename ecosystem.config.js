require('dotenv').config();
const port = process.env.PORT;

module.exports = {
  apps: [
    {
      name: `portail-applicatif-pam-${port}-sso`,
      script: 'server.js',
      cwd: '.',
    },
  ],
};
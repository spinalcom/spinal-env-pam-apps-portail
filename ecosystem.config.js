const port = 9070;
const ssl_cert = "/home/spinalcom/Desktop/test_sso/cert/cert.pem";
const ssl_key = "/home/spinalcom/Desktop/test_sso/cert/key.pem";

module.exports = {
  apps: [
    {
      name: `portail-applicatif-pam-${port}`,
      script: "node_modules/.bin/http-server",
      cwd: ".",
      // args: `serve -p ${port} index.html micro-apps/*/index.html --dist-dir dist/`, // parcel
      // args: `dist/ -p ${port} --proxy http://localhost:${port}?`, // http-server
      args: `dist/ -p ${port} -S true -C ${ssl_cert} -K ${ssl_key}`, // http-server with https
    },
  ],
};

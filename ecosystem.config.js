const port = 9070;

module.exports = {
  apps: [
    {
      name: `portail-applicatif-pam-${port}`,
      script: "node_modules/.bin/http-server",
      cwd: ".",
      // args: `serve -p ${port} index.html micro-apps/*/index.html --dist-dir dist/`, // parcel
      args: `dist/ -p ${port} --proxy http://localhost:${port}?`, // http-server
    },
  ],
};

// https guide https://dev.to/nakib/using-https-on-next-js-local-development-server-bcd
// yarn node server

const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const port = 5000;
const dev = true;
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
    key: fs.readFileSync('./https_cert/localhost-key.pem'),
    cert: fs.readFileSync('./https_cert/localhost.pem')
};

app.prepare().then(() => {
    createServer(httpsOptions, (req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    }).listen(port, (err) => {
        if (err) throw err;
        console.log('ready - started server on url: https://192.168.254.101:' + port);
    });
});
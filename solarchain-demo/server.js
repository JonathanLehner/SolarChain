var http = require('http');
var fs = require('fs');
var path = require('path');
var querystring = require('querystring');
const express = require('express')
const app = express()
const port = 8080
require('dotenv').config();

const options = {
  key: fs.readFileSync(__dirname + '/privkey.pem', 'utf8'),
  cert: fs.readFileSync(__dirname + '/cert.pem', 'utf8'),
  ca: fs.readFileSync(__dirname + '/chain.pem', 'utf8')
};

http.createServer(options, function (request, response) {})

app.get('/createPVLimitContract', (req, response) => {
  console.log(req.url)
  var optionsQuerystring = req.url.split('?').pop();

  var options = querystring.parse(optionsQuerystring);

  require('./static/js/limitorder')();
  console.log(options)

  createPVLimitContract(options['account'], options['price'])
    .then((data) => {
      response.write(JSON.stringify({
        "contractAddress": data
      }));
      response.statusCode = 200;
      response.end();
    })
    .catch((e) => {
      console.log(e);
      response.writeHead(e.status);
      response.write(JSON.stringify({
        "error": e
      }));
      response.end();
    });
})

app.get('/executePVLimitContract', (req, response) => {
  console.log("executePVLimitContract")
  console.log(req.url)
  var optionsQuerystring = req.url.split('?').pop();

  var options = querystring.parse(optionsQuerystring);
  console.log(options)

  require('./static/js/limitorder')();

  executePVLimitContract(options['address'], options['price'])
    .then((data) => {
      response.write(JSON.stringify({
        "txId": data
      }));
      response.statusCode = 200;
      response.end();
    })
    .catch((e) => {
      console.log(e);
      response.writeHead(e.status);
      response.write(JSON.stringify({
        "error": e
      }));
      response.end();
    });
})

app.get('/createSplitContract', (req, response) => {
  var optionsQuerystring = req.url.split('?').pop();

  var options = querystring.parse(optionsQuerystring);

  require('./static/js/split')();

  createSplitContract(options['sender'], options['recipient1'], options['ratio1'], 
    options['recipient2'], options['ratio2'])
    .then((data) => {
      response.write(JSON.stringify({
        "contractAddress": data
      }));
      response.statusCode = 200;
      response.end();
    })
    .catch((e) => {
      console.log(e);
      response.writeHead(e.status);
      response.write(JSON.stringify({
        "error": e
      }));
      response.end();
    });
});

app.get('/executeSplitContract', (req, response) => {
  var optionsQuerystring = req.url.split('?').pop();

  var options = querystring.parse(optionsQuerystring);

  require('./static/js/split')();

  executeSplitContract(options['address'], options['amount'])
    .then((data) => {
      response.write(JSON.stringify({
        "txId": data
      }));
      response.statusCode = 200;
      response.end();
    })
    .catch((e) => {
      console.log(e);
      response.writeHead(e.status);
      response.write(JSON.stringify({
        "error": e
      }));
      response.end();
    });
});

app.get('*', function(req, response) {
  var filePath = '.' + req.url;
  console.log(filePath)
  if (filePath == './')
    filePath = './index.html';

  var extname = path.extname(filePath);
  var contentType = 'text/html';
  switch (extname) {
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    case '.json':
      contentType = 'application/json';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    case '.jpg':
      contentType = 'image/jpg';
      break;
    case '.svg':
      contentType = 'image/svg+xml';
      break;
    case '.wav':
      contentType = 'audio/wav';
      break;
  }

  console.log(`serving ${filePath}...`);

  fs.readFile(filePath, function (error, content) {
    if (error) {
      if (error.code == 'ENOENT') {
        fs.readFile('./404.html', function (error, content) {
          response.writeHead(200, {
            'Content-Type': contentType
          });
          response.end(content, 'utf-8');
        });
      } else {
        response.writeHead(500);
        response.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
        response.end();
      }
    } else {
      response.writeHead(200, {
        'Content-Type': contentType
      });
      response.end(content, 'utf-8');
    }
  });
});

// for SSL
app.use(express.static(__dirname, { dotfiles: 'allow' } ));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
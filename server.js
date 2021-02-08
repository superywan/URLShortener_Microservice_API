require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const urlParser = require('url');
const mongoose = require('mongoose');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const urlSchema = new mongoose.Schema({ url: 'String' });
const Url = mongoose.model('Url', urlSchema);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.get('/api/shorturl/:urlInput', (req, res) => {
  const urlInput = req.params.urlInput;
  Url.findById(urlInput, (err, data) => {
    if (!data)
      res.json({ error: 'invalid url' });
    res.redirect(data.url);
  });
});

let resObject = {};
app.post('/api/shorturl/new', (req, res) => {
  const input = req.body.url;
  dns.lookup(urlParser.parse(input).hostname, (err, address) => {
    if (!address) {
      res.json({ error: 'invalid url' });
    }
    const validUrl = new Url({ url: input });
    validUrl.save((err, data) => {
      resObject["original_url"] = data.url;
      resObject["short_url"] = data.id;
      res.json(resObject);
    });
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

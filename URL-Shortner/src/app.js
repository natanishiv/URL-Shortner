const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const connectDB = require('./db/conn');
const path = require('path');

const app=express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

connectDB();

app.use(express.static(path.join(__dirname, 'public')));

const Url = require('./model/url');


app.use((req, res, next) => {
  req.baseUrl = `${req.protocol}://${req.get('host')}`;
  next();
});

app.get('/:shortenedURL', (req, res) => {
  const { shortenedURL } = req.params;

  // Find the corresponding URL document in the database
  Url.findOne({ shortenedUrl: shortenedURL })
    .then(url => {
      if (url) {
        // Redirect to the original URL
        res.redirect(url.originalUrl);
      } else {
        res.status(404).send('URL not found');
      }
    })
    .catch(error => {
      console.error('Error fetching URL:', error);
      res.status(500).send('Internal Server Error');
    });
});

app.post("/submit", (req, res) => {
  const { originalURL, note } = req.body;

  const shortenedURL = crypto.randomBytes(4).toString('hex');
  // Create a new instance of the Url model
  const url = new Url({
    originalUrl: originalURL,
    note: note,
    shortenedUrl: shortenedURL
  });
  
  url.save()
    .then(savedUrl => {
      console.log('Form data saved:', savedUrl);

     
      const fullShortenedURL = `${req.protocol}://${req.get('host')}/${shortenedURL}`;

      
      res.send(`
        <html>
          <head>
            <style>
              .shortened-url {
                font-size: 18px;
                font-weight: bold;
                background-color: #f1f1f1;
                padding: 10px;
                margin-bottom: 20px;
              }
            </style>
          </head>
          <body>
            <h1>Shortened URL</h1>
            <div class="shortened-url">${fullShortenedURL}</div>
          </body>
        </html>
      `);
    })
    .catch(error => {
      console.error('Error saving form data:', error);
      res.redirect('/');
    });
});



app.get('/search', async (req, res) => {
  const { searchQuery } = req.query;

  try {
    const urls = await Url.find({
      note: { $regex: searchQuery, $options: 'i' }
    });

    res.json({ urls });
  } catch (error) {
    console.error('Error searching URLs:', error);
    res.status(500).send('Internal Server Error');
  }
});



app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});


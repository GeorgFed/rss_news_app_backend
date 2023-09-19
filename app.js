const express = require('express');
const bodyParser = require('body-parser');
const Parser = require('rss-parser');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const parser = new Parser();
const newsItems = [];

app.post('/news', async (req, res) => {
  const { url } = req.body;

  try {
    const feed = await parser.parseURL(url);

    if (!feed.items || feed.items.length === 0) {
      return res.status(404).json({ error: 'No items found in the RSS feed' });
    }

    // Save all articles from the feed to the newsItems array
    feed.items.forEach((item) => {
      newsItems.push(item);
    });

    res.status(201).json({ message: 'News articles added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/news', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = newsItems.slice(startIndex, endIndex);

  res.status(200).json({ articles: paginatedItems, total: newsItems.length });
});

app.delete('/news', (req, res) => {
  newsItems.length = 0;
  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

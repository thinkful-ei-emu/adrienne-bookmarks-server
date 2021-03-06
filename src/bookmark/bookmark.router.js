const express = require('express');
const uuid = require('uuid/v4');

const logger = require('../logger');
const bookmarks = require('../store');

const bookmarkRouter = express.Router();
const bodyParser = express.json();

bookmarkRouter
  .route('/')
  .get((req, res) => {
    res.json(bookmarks);
  })
  .post(bodyParser, (req, res) => {
    const { title, url, rating, description } = req.body;
    const numRating = Number(rating);
    if(!title) {
      logger.error('Title is required');
      return res.status(400).send('Invalid data');
    }

    if(!url) {
      logger.error('URL is required');
      return res.status(400).send('Invalid data');
    }

    if(url && !(url.includes('http://') || url.includes('https://'))) {
      logger.error('Valid URL is required');
      return res.status(400).send('Please submit a vaild URL');
    }

    if(!Number.isInteger(numRating) || numRating < 0 || numRating > 5) {
      logger.error(`Invalid rading '${rating}' supplied`);
      return res.status(400).send('"rating" must be a number between 0 and 5');
    }

    const id = uuid();
    const bookmark = {id, title, url, rating, description};

    bookmarks.push(bookmark);
    logger.info(`Bookmark with ${id} was created`);
    return res.status(201).location(`http://localhost:8000/bookmark/${id}`).json(bookmark);
  });

bookmarkRouter
  .route('/:id')
  .get((req, res) => {
    const { id } = req.params;
    const bookmark = bookmarks.find(b => b.id == id);
    if(!bookmark) {
      logger.error(`Bookmark with id ${id} not found.`);
      return res.status(404).send('Card Not Found');
    }
    res.json(bookmark);
  })
  .delete((req, res) => {
    const { id } = req.params;
    const bookmarkIndex = bookmarks.findIndex(b => b.id == id);
    if(bookmarkIndex === -1) {
      logger.error(`Card with id ${id} not found.`);
      return res.status(404).send('Not Found');
    }
    bookmarks.splice(bookmarkIndex, 1);
    logger.info(`Card with id ${id} deleted.`);
    res.status(204).end();
  });

module.exports = bookmarkRouter;
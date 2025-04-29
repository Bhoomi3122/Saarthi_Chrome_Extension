const express = require('express');
const router = express.Router();
const {
    createLink,
    getLinks,
    updateLink,
    deleteLink
} = require('../Controllers/linksController');
const authenticate = require('../Middleware/authMiddleware'); // Auth middleware to verify token

router.post('/', authenticate, createLink);
router.get('/', authenticate, getLinks);
router.put('/:id', authenticate, updateLink);
router.delete('/:id', authenticate, deleteLink);

module.exports = router;

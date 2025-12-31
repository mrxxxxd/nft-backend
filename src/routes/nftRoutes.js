const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const nftController = require('../controllers/nftController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

// @route   GET api/nfts
// @desc    Get all NFTs
// @access  Public
router.get('/', nftController.getAllNFTs);

// @route   GET api/nfts/:id
// @desc    Get single NFT
// @access  Public
router.get('/:id', nftController.getNFT);

// @route   POST api/nfts
// @desc    Create a new NFT
// @access  Private (Admin)
router.post(
    '/',
    [
        auth, // First check login
        admin, // Then check role
        check('name', 'Name is required').not().isEmpty(),
        check('price', 'Price must be a number').isNumeric(),
        check('image_url', 'Image URL is required').not().isEmpty()
    ],
    nftController.createNFT
);

// @route   PUT api/nfts/:id
// @desc    Update NFT
// @access  Private (Admin)
router.put('/:id', [auth, admin], nftController.updateNFT);

// @route   DELETE api/nfts/:id
// @desc    Delete NFT
// @access  Private (Admin)
router.delete('/:id', [auth, admin], nftController.deleteNFT);

module.exports = router;

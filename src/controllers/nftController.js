const pool = require('../config/database');
const { validationResult } = require('express-validator');

// Get all NFTs (Public)
exports.getAllNFTs = async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT nfts.*, users.username as creator_name 
      FROM nfts 
      LEFT JOIN users ON nfts.creator_id = users.id 
      WHERE nfts.is_listed = true
      ORDER BY nfts.created_at DESC
    `);

        // Format for frontend
        const formattedNFTs = result.rows.map(nft => ({
            id: nft.id,
            name: nft.name,
            price: parseFloat(nft.price),
            image: nft.image_url,
            description: nft.description,
            category: nft.category,
            creator: nft.creator_name,
            creator_id: nft.creator_id
        }));

        res.json(formattedNFTs);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Failed to fetch NFTs' });
    }
};

// Get Single NFT by ID (Public)
exports.getNFT = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT nfts.*, users.username as creator_name 
            FROM nfts 
            LEFT JOIN users ON nfts.creator_id = users.id 
            WHERE nfts.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'NFT not found' });
        }

        const nft = result.rows[0];
        const formattedNFT = {
            id: nft.id,
            name: nft.name,
            price: parseFloat(nft.price),
            image: nft.image_url,
            description: nft.description,
            category: nft.category,
            creator: nft.creator_name,
            creator_id: nft.creator_id,
            is_listed: nft.is_listed // crucial for admin editing
        };

        res.json(formattedNFT);
    } catch (error) {
        console.error('Get NFT error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create NFT (Admin Only)
exports.createNFT = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const image_url = req.file ? req.file.path : req.body.image_url;
    if (!image_url) {
        return res.status(400).json({ message: 'Image file is required' });
    }

    const { name, price, description, category } = req.body;
    const creator_id = req.user.id; // Admin is creating usage

    try {
        const newNFT = await pool.query(
            `INSERT INTO nfts (name, price, image_url, description, category, creator_id, owner_id, is_listed) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, true) 
       RETURNING *`,
            [name, price, image_url, description, category, creator_id, creator_id]
        );

        res.status(201).json(newNFT.rows[0]);
    } catch (error) {
        console.error('Create NFT error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update NFT (Admin Only)
exports.updateNFT = async (req, res) => {
    const { id } = req.params;
    const { name, price, description, is_listed } = req.body;

    try {
        // Check if exists
        const check = await pool.query('SELECT * FROM nfts WHERE id = $1', [id]);
        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'NFT not found' });
        }

        // Build update query dynamically or strictly
        // For simplicity, updating core fields
        const updatedNFT = await pool.query(
            `UPDATE nfts 
       SET name = COALESCE($1, name), 
           price = COALESCE($2, price), 
           description = COALESCE($3, description),
           is_listed = COALESCE($4, is_listed)
       WHERE id = $5 
       RETURNING *`,
            [name, price, description, is_listed, id]
        );

        res.json(updatedNFT.rows[0]);
    } catch (error) {
        console.error('Update NFT error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete NFT (Admin Only)
exports.deleteNFT = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM nfts WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'NFT not found' });
        }

        res.json({ message: 'NFT deleted successfully' });
    } catch (error) {
        console.error('Delete NFT error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const express = require("express");
const router = express.Router();

// Controllers

router.get('/', [], async (req, res) => {
    return res.send({
        ok: true,
        status: 'SUCCESS'
    });
});

module.exports = router;
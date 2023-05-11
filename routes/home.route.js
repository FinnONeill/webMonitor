const express = require("express");
const router = express.Router();

// Controllers
const { monitorDNS } = require('../controllers/monitorDNS');

router.get('/', [], async (req, res) => {
    const monitorRes = await monitorDNS();
    return res.send(monitorRes);
});

module.exports = router;
const path = require("path");
const express = require("express");
const router = express.Router();

function returnIndexPage(req, res) {
    res.sendFile(path.join(__dirname + "/public/index.html"));
}

router.get("/", returnIndexPage);
router.get("/models", returnIndexPage);
router.get("/documentation", returnIndexPage);
router.get("/quick-postman", returnIndexPage);

module.exports = router;

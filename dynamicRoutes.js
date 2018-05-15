const path = require("path");
const express = require("express");
const db = require("./dbhandler");
const router = express.Router();

router.get("/:path/all", function(req, res) {
    try {
        var queryResult = db.findRows(req.cookies.token, req.params.path, {});
        queryResult.forEach(function(item) {
            item._id = item["_id_" + req.cookies.token];
            delete item["_id_" + req.cookies.token];
        });
        res.status(200).json({ res: "get all", data: queryResult });
    } catch (e) {
        console.log("get all error");
        console.log("error: ", e);
        res
            .status(500)
            .json({ res: "get all", error: "Internal server error." });
    }
});

router.get("/:path/:_id", function(req, res) {
    try {
        var queryResult = db.findRow(
            req.cookies.token,
            req.params.path,
            req.params._id
        );
        res.status(200).json({ res: "get", data: queryResult });
    } catch (e) {
        console.log("get _id error");
        console.log("error: ", e);
        res.status(500).json({ res: "get", error: "Internal server error." });
    }
});

router.post("/:path", function(req, res) {
    try {
        console.log(req.body);
        if (Array.isArray(req.body)) {
            db.insertRows(
                req.cookies.token,
                req.params.path,
                req.body,
                function(result) {
                    res.status(result.status).json(result.json);
                }
            );
        } else if (typeof req.body === "object" && req.body !== null) {
            db.insertRow(req.cookies.token, req.params.path, req.body, function(
                result
            ) {
                res.status(result.status).json(result.json);
            });
        } else {
            res.status(400).json({ res: "post", error: "Bad request data." });
        }
    } catch (e) {
        console.log("error: ", e);
        res.status(500).json({ res: "post", error: "Internal server error." });
    }
});

router.patch("/:path/:_id", function(req, res) {
    try {
        //update item in json file
        db.updateRow(
            req.cookies.token,
            req.params.path,
            req.params._id,
            req.body,
            function(result) {
                res.status(result.status).json(result.json);
            }
        );
    } catch (e) {
        console.log("patch _id error");
        console.log("error: ", e);
        res.status(500).json({ res: "patch", error: "Internal server error." });
    }
});

router.delete("/:path/:_id", function(req, res) {
    try {
        var result = db.removeRow(
            req.cookies.token,
            req.params.path,
            req.params._id
        );
        if (result) {
            res.status(200).json({ res: "delete" });
        } else {
            res.status(400).json({ res: "delete", error: "Bad request." });
        }
    } catch (e) {
        console.log("delete _id error");
        console.log("error: ", e);
        res
            .status(500)
            .json({ res: "delete", error: "Internal server error." });
    }
});

module.exports = router;

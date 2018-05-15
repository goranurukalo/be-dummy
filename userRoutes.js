const path = require("path");
const express = require("express");
const crypto = require("crypto");
const prefix = require("./prefix");

const db = require("./dbhandler");

const router = express.Router();

router.get("/token", function(req, res) {
    if (req.cookies.token === undefined || req.cookies.token === null) {
        crypto.randomBytes(16, function(err, buffer) {
            if (err === null) {
                var token = buffer.toString("hex");
                res.status(200).json({ token: token });
            } else {
                res.status(500).json({ error: "Can't generate token." });
            }
        });
    } else {
        res.status(400).json({ error: "You already have token." });
    }
});

router.post("/has-api", function(req, res) {
    if (req.cookies.token !== undefined && req.cookies.token !== null) {
        if (
            req.body.models !== undefined &&
            req.body.models !== null &&
            req.body.models.length > 0
        ) {
            //call function that handles model/models
            db.checkModel(req.cookies.token, req.body.models, function(
                result,
                error
            ) {
                if (error === null) {
                    //console.log("output from function : ", result);
                    res.status(200).json({
                        res: "ok",
                        apiTitle: "Ready to use models.",
                        apiState: 2
                    });
                } else {
                    console.log("error: ", error);
                    res.status(500).json({
                        res: "error",
                        apiTitle: "Internal server error.",
                        apiState: 0
                    });
                }
            });

            //res.status(200).json({ res: "ok" });
        } else {
            res.status(200).json({
                res: "ok",
                apiTitle: "Waiting for models.",
                apiState: 0
            });
        }
    } else {
        res.status(400).json({
            error: "User don't have token.",
            apiTitle: "Refresh page.",
            apiState: 0
        });
    }
});

router.post("/create-model", function(req, res) {
    // - check if model exist
    //      if not create model with random data
    //      else recreate model for file token

    if (req.cookies.token !== undefined && req.cookies.token !== null) {
        if (req.body.models !== undefined) {
            //call function that handles model
            //add / update model

            db.createModel(req.cookies.token, req.body.models, function(
                data,
                err
            ) {
                if (err == null) {
                    res.status(200).json({
                        res: "ok",
                        apiTitle: "Model created.",
                        apiState: 2
                    });
                } else {
                    console.log(err);

                    res.status(500).json({
                        res: "error",
                        apiTitle: "Internal server error.",
                        apiState: 0
                    });
                }
            });
        } else {
            res.status(200).json({
                res: "ok",
                apiTitle: "Waiting for models.",
                apiState: 0
            });
        }
    } else {
        res.status(400).json({
            error: "User don't have token.",
            apiTitle: "Refresh page.",
            apiState: 0
        });
    }
});

router.patch("/update-model", function(req, res) {
    if (req.cookies.token !== undefined && req.cookies.token !== null) {
        if (req.body.model !== undefined) {
            db.updateCreatedModel(req.cookies.token, req.body.model, function(
                data,
                err
            ) {
                if (err == null) {
                    res.status(200).json({
                        res: "ok",
                        apiTitle: "Model updated.",
                        apiState: 2
                    });
                } else {
                    console.log(err);
                    res.status(500).json({
                        res: "error",
                        apiTitle: "Internal server error.",
                        apiState: 0
                    });
                }
            });
        } else {
            res.status(200).json({
                res: "ok",
                apiTitle: "Waiting for models.",
                apiState: 0
            });
        }
    } else {
        res.status(400).json({
            error: "User don't have token.",
            apiTitle: "Refresh page.",
            apiState: 0
        });
    }
});

router.post("/recreate-model", function(req, res) {
    if (req.cookies.token !== undefined && req.cookies.token !== null) {
        if (req.body.models !== undefined) {
            //call function that handles model
            //add / update model

            db.recreateModels(req.cookies.token, req.body.models, function(
                data,
                err
            ) {
                if (err == null) {
                    res.status(200).json({
                        res: "ok",
                        apiTitle: "Model created.",
                        apiState: 2
                    });
                } else {
                    console.log(err);

                    res.status(500).json({
                        res: "error",
                        apiTitle: "Internal server error.",
                        apiState: 0
                    });
                }
            });
        } else {
            res.status(200).json({
                res: "ok",
                apiTitle: "Waiting for models.",
                apiState: 0
            });
        }
    } else {
        res.status(400).json({
            error: "User don't have token.",
            apiTitle: "Refresh page.",
            apiState: 0
        });
    }
});

router.delete("/delete-model/:modelRoutePath", function(req, res) {
    var routePath = req.params.modelRoutePath;
    if (req.cookies.token !== undefined && req.cookies.token !== null) {
        if (routePath !== undefined && routePath !== null) {
            db.deleteModel(req.cookies.token, routePath, function(data, err) {
                if (err == null) {
                    res.status(200).json({
                        res: "ok",
                        apiTitle: "Model removed.",
                        apiState: 2
                    });
                } else {
                    console.log(err);

                    res.status(500).json({
                        res: "error",
                        apiTitle: "Internal server error.",
                        apiState: 0
                    });
                }
            });
        } else {
            res.status(200).json({
                res: "ok",
                apiTitle: "Waiting for models.",
                apiState: 0
            });
        }
    } else {
        res.status(400).json({
            error: "User don't have token.",
            apiTitle: "Refresh page.",
            apiState: 0
        });
    }
});

module.exports = router;

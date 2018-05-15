const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const defaultRoutes = require("./defaultroutes");
const dynamicRoutes = require("./dynamicroutes");
const userRoutes = require("./userroutes");
const app = express();

app.use(bodyParser.json());
app.use(cookieParser());

app.use("/", defaultRoutes);
app.use("/api", dynamicRoutes);
app.use("/user", userRoutes);

app.use("/assets", express.static("public"));

app.set("port", process.env.PORT || 443);
app.listen(app.get("port"), function() {
    console.log(
        new Date().toLocaleString() +
            " Server started on port: " +
            app.get("port")
    );
});

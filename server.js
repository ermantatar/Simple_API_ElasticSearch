const express = require("express"); // call express
const app = express();
const ContactRouter = express.Router();
const route = require("./routes/route");
const bodyParser = require("body-parser");
const port = process.env.PORT || 8080;

//const OK = 200;
//const CREATED = 201;
//const NO_CONTENT = 204;
//const MOVED_PERMANENTLY = 301;
//const FOUND = 302;
//const SEE_OTHER = 303;
//const NOT_MODIFIED = 303;
//const BAD_REQUEST = 400;
//const NOT_FOUND = 404;
//const CONFLICT = 409;
//const SERVER_ERROR = 500;

module.exports = {
  serve: serve
};

function serve(port) {
  const app = express();
  app.locals.port = port;
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use("/", route);
  app.listen(port);
  console.log("Starting AddressBook server on port " + port);
  app.listen(port, function() {
    console.log(`listening on port ${port}`);
  });
}

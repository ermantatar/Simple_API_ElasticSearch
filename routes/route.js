const elasticsearch = require("elasticsearch");
const express = require("express");
const ContactRouter = express.Router();
bodyParser = require("body-parser");
const indexName = "contactindex";
const client = new elasticsearch.Client({
  host: "localhost:9200"
});

ContactRouter.get("/", function(req, res) {
  return client.indices.putMapping(
    {
      // initialize the mapping of JSON fields
      index: indexName,
      type: "contact",
      body: {
        properties: {
          name: { type: "text" },
          lastname: { type: "text" },
          phone: { type: "text" },
          email: { type: "text" },
          address: { type: "text" }
        }
      }
    },
    function(err, response) {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      } else {
        res.status(200).send({ message: "Address Book API" });
      }
    }
  );
});

//Description. GET details of a contact with the name
ContactRouter.route("/contact/:name").get(function(req, res) {
  var input = req.params.name;

  client
    .search({
      //searching the elasticsearch index
      index: indexName,
      type: "contact",
      body: {
        query: {
          query_string: {
            query: input // the query string is the name of the contact
          }
        }
      }
    })
    .then(function(resp) {
      var results = resp.hits.hits.map(function(hit) {
        return hit._source;
      });
      console.log("GET results", results); //returns the list of the search
      console.log(resp);
      res.status(200).send(results);
    });
});

//Description. GET list of all contacts
ContactRouter.route("/contact").get(function(req, res) {
  var pageNum = parseInt(req.query.page); //parse parameters from the req param
  var perPage = parseInt(req.query.pageSize);
  var userQuery = parseInt(req.query.query);
  var searchParams = {
    index: indexName,
    from: (pageNum - 1) * perPage,
    size: perPage,
    body: {
      query: {
        match_all: {} // elasticsearch query to return all records
      }
    }
  };
  console.log("search parameters", searchParams);
  client.search(searchParams, function(err, resp) {
    if (err) {
      throw err;
    }
    console.log("search_results", {
      results: resp.hits.hits,
      page: pageNum,
      pages: Math.ceil(resp.hits.total / perPage)
    });
    var results = resp.hits.hits.map(function(hit) {
      return hit._source.name + " " + hit._source.lastname;
    });
    console.log(results);
    res.status(200).send(results);
  });
});

//Description. POST query for inserting a new contact
ContactRouter.route("/contact").post(function(req, res) {
  var input = req.body;
  client.index(
    {
      index: indexName,
      type: "contact",
      body: {
        name: input.name,
        lastname: input.lastname,
        email: input.email,
        phone: parseInt(input.phone),
        address: input.address
      }
    },
    function(error, response) {
      if (error) return console.log("ERROR", error);
      else {
        console.log(response);
        res.sendStatus(200);
      }
    }
  );
});

//Description. PUT method to update contact
ContactRouter.route("/contact/:name").put(function(req, res) {
  input = req.body;

  client.updateByQuery(
    {
      index: indexName,
      type: "contact",
      body: {
        query: { match: { name: input.oldname } },
        script: "ctx._source.name =  " + "'" + input.newname + " ' " + ";"
      }
    },
    function(err, response) {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      }
      console.log(response);
      res.status(200).send(response);
    }
  );
});

//Description. DELETE method to deleted contact
ContactRouter.route("/contact/:name").delete(function(req, res) {
  input = req.params.name;
  client.deleteByQuery(
    {
      index: indexName,
      type: "contact",
      body: {
        query: {
          match: { name: input }
        }
      }
    },
    function(error, response) {
      if (error) {
        console.log(error);
        res.sendStatus(500);
      } else {
        res.status(200).send(response);
      }
    }
  );
});

module.exports = ContactRouter;

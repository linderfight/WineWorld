var express = require('express');
var url = require('url');
var mysql = require('mysql');
var app = express();

//Create a connection object with the user details and the name of the database
var connectionPool = mysql.createPool({
    connectionLimit: 1,
    host: "localhost",
    user: "root",
    password: "",
    database: "winedata",
    debug: false
});

//handle GET requests sent to the user path
app.get('/search_all', handleGetRequest);
app.get('/get_all', handleGetRequest);
app.use(express.static('public'));


app.listen(8080);
console.log("The server is now running...");

function handleGetRequest(request, response){
    var urlObj = url.parse(request.url, true);
    var queries = urlObj.query;
    var numItems = queries['num_items'];
    var offset = queries['offset'];
    var searchString = queries['searchString'];
    var pathArray = urlObj.pathname.split("/");

    var pathFront = pathArray[pathArray.length - 1];

    if(pathFront === 'get_all'){
        getTotalWineBottlesCount(response, numItems, offset);
        return;
    } else if (pathFront === "search_all"){
        getFilteredWineBottlesCount(response, numItems, offset, searchString);
        return;
    }

    response.status(HTTP_STATUS.NOT_FOUND);
    response.send("{error: 'Path not recognized', url: " + request.url + "}");
}

/** Retrieves the number of bottles that match a certain string */
function getFilteredWineBottlesCount(response, numItems, offset, searchString){
    var sql = "SELECT COUNT(*) FROM bottles " +
        "WHERE bottles.wine_title LIKE '% " + searchString + " %' "+
        "OR bottles.wine_title LIKE '" + searchString + " %' " +
        "OR bottles.wine_title LIKE '% " + searchString + "' " +
        "OR bottles.wine_title LIKE '" + searchString + "'";

    //Execute the query and call the anonymous callback function.
    connectionPool.query(sql, function (err, result) {


        if (err){
            response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR);
            response.json({'error': true, 'message': + err});
            return;
        }
        var totNumItems = result[0]['COUNT(*)'];
        getFilteredWineBottles(response, totNumItems, numItems, offset, searchString);
    });
}

/** Retrieves bottles that match a certain string */
function getFilteredWineBottles(response, totNumItems, numItems, offset, searchString){
    var sql = "SELECT bottles.bottle_id, bottles.wine_title, bottles.bottle_price, bottles.alcohol_percentage, bottles.wine_description, bottles.year_bottled, " +
        "grapes.grape_1, grapes.grape_2, grapes.grape_3, origins.area_name, origins.country_name, urls.image_url, urls.product_url, urls.sold_by " +
        "FROM bottles " +
        "INNER JOIN grapes ON bottles.grape_blend_id=grapes.grape_blend_id " +
        "INNER JOIN origins ON bottles.origin_id=origins.origin_id " +
        "INNER JOIN urls ON bottles.url_id=urls.url_id " +
        "WHERE bottles.wine_title LIKE '% " + searchString + " %' "+
        "OR bottles.wine_title LIKE '" + searchString + " %' " +
        "OR bottles.wine_title LIKE '% " + searchString + "' " +
        "OR bottles.wine_title LIKE '" + searchString + "' ";

    if(numItems !== undefined && offset !== undefined ){
        sql += "ORDER BY bottles.bottle_id LIMIT " + numItems + " OFFSET " + offset;
    }

    connectionPool.query(sql, function (err, result) {
        if (err){
            response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR);
            response.json({'error': true, 'message': + err});
            return;
        }

        var returnObj = {totNumItems: totNumItems};
        returnObj.wines = result;

        response.json(returnObj);
    });
}

/** Retrieving all wines  */
function getTotalWineBottlesCount(response, numItems, offset){
    var sql = "SELECT COUNT(*) FROM bottles";

    connectionPool.query(sql, function (err, result) {

        //Check for errors
        if (err){
            response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR);
            response.json({'error': true, 'message': + err});
            return;
        }

        var totNumItems = result[0]['COUNT(*)'];

        getAllWineBottles(response, totNumItems, numItems, offset);
    });
}

/** Returns all of the wines with a limit on the total number of items returned and the offset to
 * enable pagination
 */
function getAllWineBottles(response, totNumItems, numItems, offset){
    var sql = "SELECT bottles.bottle_id, bottles.wine_title, bottles.bottle_price, bottles.alcohol_percentage, bottles.wine_description, bottles.year_bottled, " +
        "grapes.grape_1, grapes.grape_2, grapes.grape_3, origins.area_name, origins.country_name, urls.image_url, urls.product_url, urls.sold_by " +
        "FROM bottles " +
        "INNER JOIN grapes ON bottles.grape_blend_id=grapes.grape_blend_id " +
        "INNER JOIN origins ON bottles.origin_id=origins.origin_id " +
        "INNER JOIN urls ON bottles.url_id=urls.url_id ";

    if(numItems !== undefined && offset !== undefined ){
        sql += "ORDER BY bottles.bottle_id LIMIT " + numItems + " OFFSET " + offset;
    }

    connectionPool.query(sql, function (err, result) {

        if (err){

            response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR);
            response.json({'error': true, 'message': + err});
            return;
        }

        var returnObj = {totNumItems: totNumItems};
        returnObj.wines = result;

        response.json(returnObj);
    });
}



var searchString = "";

// saves the search input of the user in session storage so that it can be
// retrieved when making RESTFUL requests
// this method is executed when users are in the index.html page
function getStringInitialString(){
    searchString = document.getElementById("searchBar1").value;
    sessionStorage.setItem("searchString", searchString);
    window.location.replace("displayResults.html");

}

// saves the search input of the user in session storage so that it can be
// retrieved when making RESTFUL requests
// this method is executed when users are in the displayResults.html
function getSecondaryString(){
    searchString = document.getElementById("searchBar2").value;
    sessionStorage.setItem("searchString", searchString);
}











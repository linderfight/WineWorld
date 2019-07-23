var app = new Vue({

    el: '#app',

    data: {
        wines: [],
        searchString: "",
        resultsDescription: "",
        numOfPages: 0,
        numItemsPerPage: 12,
        pageNumber: 0
    },

    methods: {
        //check if user has provided a criteria for search and execute the appropriate method
        checkRequest: function () {
            var localApp = this;
            localApp.searchString = sessionStorage.getItem("searchString");
            if (localApp.searchString === "") {
                this.loadAllWines();
            } else {
                this.loadFilteredWines();
            }

        },

        // loads all wines
        loadAllWines: function () {
            var localApp = this;

            var offset = this.pageNumber * this.numItemsPerPage;

            var itemsPerPage = this.numItemsPerPage;

            var url = '/get_all?offset=' + offset + '&num_items=' + itemsPerPage;

            if (localApp.pageNumber === 0) {
                document.getElementById("prevButton").style.visibility = "hidden";
                document.getElementById("firstButton").style.visibility = "hidden";
            }

            axios.get(url) //Send GET request to wines path
                .then(function (response) { //Request successful
                    //Point wines in data to returned array of wines
                    localApp.wines = response.data.wines;
                    localApp.numOfPages = response.data.totNumItems / itemsPerPage;
                    localApp.numOfPages = Math.ceil(localApp.numOfPages);
                })
                .catch(function (error) {
                    //Handle error
                    console.log(error);
                });
        },

        // loads all wines that match a given string by the user
        loadFilteredWines: function () {
            var localApp = this;

            var offset = this.pageNumber * this.numItemsPerPage;

            var itemsPerPage = this.numItemsPerPage;

            var url = '/search_all?offset=' + offset + '&num_items=' + itemsPerPage + '&searchString=' + localApp.searchString;

            if (localApp.pageNumber === 0) {
                document.getElementById("prevButton").style.visibility = "hidden";
                document.getElementById("firstButton").style.visibility = "hidden";
            }

            axios.get(url) //Send GET request to wines path
                .then(function (response) { //Request successful
                    //Point wines in data to returned array of wines
                    localApp.wines = response.data.wines;
                    localApp.numOfPages = response.data.totNumItems / itemsPerPage;
                    localApp.numOfPages = Math.ceil(localApp.numOfPages);
                    if (localApp.wines.length === 0) {
                        alert(' NO wines containing the word "' + localApp.searchString + '" have been found!');
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });
        },

        // The following 4 methods move between pages
        nextPage: function () {
            this.pageNumber++;
            this.checkRequest();
            this.refreshPagination();
        },
        prevPage: function () {
            this.pageNumber--;
            this.checkRequest();
            this.refreshPagination();
        },
        lastPage: function () {
            this.pageNumber = this.numOfPages - 1;
            this.checkRequest();
            this.refreshPagination();
        },
        firstPage: function () {
            this.pageNumber = 0;
            this.checkRequest();
            this.refreshPagination();
        },

        // shows and hides buttons depending
        // on the current page:
        // if the current page is the last one, the next page and last page buttons will be hidden
        // if the current page is the first one, the previous page and first page buttons will be hidden
        // otherwise all the buttons will be shown
        refreshPagination: function () {
            if (this.pageNumber === this.numOfPages - 1) { // if you are at the last page
                document.getElementById("nextButton").style.visibility = "hidden";
                document.getElementById("lastButton").style.visibility = "hidden";
                document.getElementById("firstButton").style.visibility = "visible";
                document.getElementById("prevButton").style.visibility = "visible";
            } else if (this.pageNumber === 0) { // if you are at the first one
                document.getElementById("prevButton").style.visibility = "hidden";
                document.getElementById("firstButton").style.visibility = "hidden";
                document.getElementById("nextButton").style.visibility = "visible";
                document.getElementById("lastButton").style.visibility = "visible";
            } else { // if you are in the middle page
                document.getElementById("prevButton").style.visibility = "visible";
                document.getElementById("firstButton").style.visibility = "visible";
                document.getElementById("nextButton").style.visibility = "visible";
                document.getElementById("lastButton").style.visibility = "visible";

            }
        }
    },

    created: function () {
        // check what kind of request is the client requesting
        this.checkRequest();
    }
});

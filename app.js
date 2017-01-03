$(document).ready(function(){
    var MAX_TEXT_LENGTH = 400,

        $searchField = $(".search-field"),
        $searchSubmit = $(".search-submit"),
        $searchResultsContainer = $(".search-results");

    $searchSubmit.on("click", function(){
        var searchText = $searchField.val();
        if(searchText){
            SparqlSearchService.search(searchText).
                then(renderSearchResults);
        }
    })

    function renderSearchResults(response, status){
        $searchResultsContainer.empty();

        var variables = response.head.vars;

        response.results.bindings.forEach(function(item){
            var $searchResultsItem = $("<div/>", {
                class: "list-group-item "
            });

            variables.forEach(function(variable){
                if(item[variable]){
                    if(item[variable].type == "uri"){
                        $("<a/>",{
                            class: "list-group-item-text",
                            href: item[variable].value,
                            text: item[variable].value
                        }).appendTo($searchResultsItem);
                    } else {
                        $("<div/>",{
                            class: "list-group-item-text text",
                            html: trimText(item[variable].value)
                        }).appendTo($searchResultsItem);
                    }
                }
            })

            $searchResultsItem.appendTo($searchResultsContainer);

        });
    };

    function trimText(text){
        if(text.length > MAX_TEXT_LENGTH){
            return text.slice(0, MAX_TEXT_LENGTH) + "...";
        } else {
            return text;
        }
    };

});

var SparqlSearchService = {

    SEARCH_LIMIT_PER_REPO: 10,

    search: function(searchText){

        return $.ajax("http://data.open.ac.uk/sparql", {
            dataType: "json",
            crossDomain: true,
            data: "query=SELECT ?x ?url (GROUP_CONCAT(?type) as ?types) ?description "
                 + " WHERE {"
                 + " ?x <http://purl.org/dc/terms/description> ?description."
                 + " ?x a ?type."
                 + " OPTIONAL {?x <http://dbpedia.org/property/url> ?url}."
                 + " FILTER REGEX(?description, '" + searchText + "')."
                 + "}"
                 + " group by ?x ?description ?url limit " + SparqlSearchService.SEARCH_LIMIT_PER_REPO,
            processData: false,
            error: function(jqXHR, status, error){
                debugger;
            }
        })

    }
}
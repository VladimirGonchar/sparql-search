$(document).ready(function(){
    var $searchField = $(".search-field"),
        $searchSubmit = $(".search-submit"),
        $searchResultsContainer = $(".search-results");

    $searchSubmit.on("click", function(){
        var searchText = $searchField.val();
        if(searchText){
            SparqlSearchService.search(searchText);
        }
    })
});

var SparqlSearchService = {

    SEARCH_LIMIT_PER_REPO: 5,

    search: function(searchText){

        return $.ajax("http://data.open.ac.uk/sparql", {
            dataType: "json",
            crossDomain: true,
            data: "query=SELECT ?x ?description (GROUP_CONCAT(?type) as ?types) ?url"
                 + " WHERE {"
                 + " ?x <http://purl.org/dc/terms/description> ?description."
                 + " ?x a ?type."
                 + " OPTIONAL {?x <http://dbpedia.org/property/url> ?url}."
                 + " FILTER REGEX(?description, '" + searchText + "')."
                 + "}"
                 + " group by ?x ?description ?url limit " + SparqlSearchService.SEARCH_LIMIT_PER_REPO,
            processData: false,
            success: function(response, status){
                var variables = response.head.vars;

                response.results.bindings.forEach(function(item){
                    var $item = $("div").addClass("search-results-item");

                    variables.foreach(function(variable){
                        if(item[variable]){
                            $("a",{
                                class: "node-path",
                                href: ""
                            }).addClass("node-path").attr("href", )
                        }
                    })

                    $("a",{
                        class: "node-path",
                        href: ""
                    }).addClass("node-path").attr("href", )

                });

                debugger;
            },
            error: function(jqXHR, status, error){
                debugger;
            }
        })

    }
}
$(document).ready(function(){
    var MAX_TEXT_LENGTH = 400,

        $searchField = $(".search-field"),
        $searchSubmit = $(".search-submit"),
        $searchResultsContainer = $(".search-results"),
        $facetsContainer = $(".fasets")
        $spinner = $(".spinner");

    $searchSubmit.on("click", function(){
        var searchText = $searchField.val();
        if(searchText){
            $spinner.show();
            $.when(
                SparqlSearchService.search(searchText).
                    then(renderSearchResults),
                SparqlSearchService.searchFacets(searchText).
                    then(renderFacets))
            .always(function(){
                $spinner.hide();
            })
        }
    });

    $facetsContainer.on("click", ".facet", function(e){
        e.preventDefault();

        var facetIri = $(e.target).attr("href");
        var searchText = $searchField.val();

        $spinner.show();
        $.when(
            SparqlSearchService.search(searchText, facetIri).
                then(renderSearchResults),
            SparqlSearchService.searchFacets(searchText, facetIri).
                then(renderFacets))
        .always(function(){
            $spinner.hide();
        })
    });

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

    function renderFacets(response){
        $facetsContainer.empty();

        response.results.bindings.forEach(function(item){
            $("<a/>", {
                class: "facet",
                href: item.type.value,
                text: item.type.value
            }).appendTo($facetsContainer);
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

    search: function(searchText, facet){

        var facetTriplet = "";
        if(facet){
            facetTriplet = " ?x a <" + facet + ">."
        }
        return $.ajax("https://data.open.ac.uk/sparql", {
            dataType: "json",
            crossDomain: true,
            data: "query=SELECT ?x ?url (GROUP_CONCAT(?type) as ?types) ?description "
                 + " WHERE {"
                 + " ?x <http://purl.org/dc/terms/description> ?description."
                 + facetTriplet
                 + " ?x a ?type."
                 + " OPTIONAL {?x <http://dbpedia.org/property/url> ?url}."
                 + " FILTER REGEX(?description, '" + searchText + "')."
                 + "}"
                 + " group by ?x ?description ?url limit " + SparqlSearchService.SEARCH_LIMIT_PER_REPO,
            processData: false,
            error: function(jqXHR, status, error){
                console.error(error);
            }
        })

    },

    searchFacets: function(searchText, facet){
        var facetTriplet = "";
        if(facet){
            facetTriplet = " ?x a <" + facet + ">."
        }
        return $.ajax("https://data.open.ac.uk/sparql", {
            dataType: "json",
            crossDomain: true,
            data: "query=SELECT ?type (COUNT(?x) as ?amount) "
                 + " WHERE {"
                 + " ?x <http://purl.org/dc/terms/description> ?description."
                 + " ?x a ?type."
                 + facetTriplet
                 + " FILTER REGEX(?description, '" + searchText + "')."
                 + "}"
                 + " GROUP BY ?type "
                 + " ORDER BY DESC(?amount)"
,
            processData: false,
            error: function(jqXHR, status, error){
                console.error(error);
            }
        })
    }
}
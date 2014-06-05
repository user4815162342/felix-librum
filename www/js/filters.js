'use strict';

/* Filters */

angular.module('myApp.filters', []).
    filter('titleMatch', function() {
        return function(libraryItems,queryText) {
            queryText = queryText && queryText.toLowerCase();
            if (!queryText) {
                // A blank search should return no results.
                return [];
            }
            var result = [];
            var item;
            for (var i = 0; i < libraryItems.length; i++) {
                item = libraryItems[i];
                if ((item.title.toLowerCase().indexOf(queryText) > -1) ||
                    (item.subtitle.toLowerCase().indexOf(queryText) > -1) ||
                    (item.series.toLowerCase().indexOf(queryText) > -1)) {
                        result.push(item);
                }
            }
            return result;            
        }
    }).
    filter('authorMatch',function() {
        return function(libraryItems,queryText) {
            queryText = queryText && queryText.toLowerCase();
            if (!queryText) {
                // A blank search should return no results.
                return [];
            }
            var result = [];
            var item;
            for (var i = 0; i < libraryItems.length; i++) {
                item = libraryItems[i];
                for (var j = 0; j < item.people.length; j++) {
                    if (item.people[j].name.toLowerCase().indexOf(queryText) > -1) {
                        result.push(item);
                        break;
                    }
                }
            }
            return result;            
        }
    }).
    filter('subjectMatch',function() {
        return function(libraryItems,queryText) {
            queryText = queryText && queryText.toLowerCase();
            if (!queryText) {
                // A blank search should return no results.
                return [];
            }
            var result = [];
            var item;
            for (var i = 0; i < libraryItems.length; i++) {
                item = libraryItems[i];
                for (var j = 0; j < item.subjects.length; j++) {
                    if (item.subjects[j].toLowerCase().indexOf(queryText) > -1) {
                        result.push(item);
                        break;
                    }
                }
            }
            return result;            
        }
    }).
    filter('allMatch',function() {
        var normalFieldsToSearch =  [
            "title",
            "subtitle",
            "series",
            "volume",
            "copyNumber",
            "callNumber",
            "unknown1",
            "unknown2",
            "unknown3",
            "unknown4",
            "arQuizNumber",
            "arInterestLevel",
            "arGradeLevel",
            "arPoints",
            "status",
            "location"
        ];
        return function(libraryItems,queryText) {
            queryText = queryText && queryText.toLowerCase();
            if (!queryText) {
                // A blank search should return no results.
                return [];
            }
            var result = [];
            var item;
            arraySearch: 
            for (var i = 0; i < libraryItems.length; i++) {
                item = libraryItems[i];
                authorSearch: 
                for (var j = 0; j < item.people.length; j++) {
                    if (item.people[j].name.toLowerCase().indexOf(queryText) > -1) {
                        result.push(item);
                        continue arraySearch;
                    }
                }
                subjectSearch: 
                for (var j = 0; j < item.subjects.length; j++) {
                    if (item.subjects[j].toLowerCase().indexOf(queryText) > -1) {
                        result.push(item);
                        continue arraySearch;
                    }
                }
                normalFieldSearch:
                for (var j = 0; j < normalFieldsToSearch.length; j++) {
                    if (item[normalFieldsToSearch[j]].toLowerCase().indexOf(queryText) > -1) {
                        result.push(item);
                        continue arraySearch;
                    }
                }
            }
            return result;            
        }
    }).
    filter('libraryQuery',['titleMatchFilter','authorMatchFilter','subjectMatchFilter','allMatchFilter', 'filterFilter',
            function(titleMatch,authorMatch,subjectMatch,allMatch,filter) {
                var result = function(libraryItems,queryType,queryText) {
                    switch (queryType) {
                        case "title":
                            return titleMatch(libraryItems,queryText);
                        case "author":
                            return authorMatch(libraryItems,queryText);
                        case "subject":
                            return subjectMatch(libraryItems,queryText);
                        case "all":
                            return allMatch(libraryItems,queryText);
                        case "everything":
                            // This is the only way to get everything returned.
                            return libraryItems.slice(0);
                        default:
                            queryText = queryText && queryText.toLowerCase();
                            if (!queryText) {
                                // A blank search should return no results.
                                return [];
                            }
                            var options = {};
                            options[queryType] = queryText;
                            return filter(libraryItems,options);
                    }
                }
                // NOTE: Only 'everything' isn't returned here,
                // since I don't want it to show in the User interface
                // except as a special link.
                result.queryTypes = [
                    {
                        type: "title",
                        label: "Search by title, subtitle, and series"
                    },
                    {
                        type: "author",
                        label: "Search by author"
                    },
                    {
                        type: "subject", 
                        label: "Search by subject"
                    },
                    {
                        type: "location",
                        label: "Search by location"
                    },
                    {
                        type: "callNumber",
                        label: "Search by call number"
                    },
                    {
                        type: "arInterestLevel",
                        label: "Search by AR interest level"
                    },
                    {
                        type: "arGradeLevel",
                        label: "Search by AR grade level"
                    },
                    {
                        type: "all",
                        label: "Search all fields"
                    }
                ]
                return result;
            }
    ]);

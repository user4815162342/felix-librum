'use strict';

/* Filters */

angular.module('myApp.filters', []).
    filter('titleMatch', function() {
        return function(item,queryText) {
            if (!queryText) {
                return true;
            }
            queryText = queryText && queryText.toLowerCase();
            return !!((item.title.toLowerCase().indexOf(queryText) > -1) ||
                (item.subtitle.toLowerCase().indexOf(queryText) > -1) ||
                (item.series.toLowerCase().indexOf(queryText) > -1));
        }
    }).
    filter('authorMatch',function() {
        return function(item,queryText) {
            if (!queryText) {
                return true;
            }
            queryText = queryText && queryText.toLowerCase();
            for (var j = 0; j < item.people.length; j++) {
                if (item.people[j].name.toLowerCase().indexOf(queryText) > -1) {
                    return true;
                }
            }
            return false;            
        }
    }).
    filter('subjectMatch',function() {
        return function(item,queryText) {
            if (!queryText) {
                return true
            }
            queryText = queryText && queryText.toLowerCase();
            for (var j = 0; j < item.subjects.length; j++) {
                if (item.subjects[j].toLowerCase().indexOf(queryText) > -1) {
                    return true;
                }
            }
            return false;
        }
    }).
    filter('allMatch',['authorMatchFilter','subjectMatchFilter',function(authorMatch,subjectMatch) {
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
        var specialFilters = [
            authorMatch,
            subjectMatch
        ];
        // title doesn't need a special filter, since all it does is search in
        // multiple fields.
        return function(item,queryText) {
            if (!queryText) {
                return true;
            }
            queryText = queryText && queryText.toLowerCase();
            for (var j = 0; j < specialFilters.length; j++) {
                if (specialFilters[j](item,queryText)) {
                    return true;
                }
            }
            for (var j = 0; j < normalFieldsToSearch.length; j++) {
                if (item[normalFieldsToSearch[j]].toLowerCase().indexOf(queryText) > -1) {
                    return true;
                }
            }
            return false;            
        }
    }]).
    filter('libraryQuery',['titleMatchFilter','authorMatchFilter','subjectMatchFilter','allMatchFilter', 'filterFilter',
            function(titleMatch,authorMatch,subjectMatch,allMatch,filter) {
                var result = function(libraryItems,queryType,queryText) {
                    if (!queryType) {
                        return libraryItems.slice(0);
                    }
                    var options;
                    switch (queryType) {
                        case "title":
                            options = function(item) {
                                return titleMatch(item,queryText);
                            }
                            break;
                        case "author":
                            options = function(item) {
                                return authorMatch(item,queryText);
                            }
                            break;
                        case "subject":
                            options = function(item) {
                                return subjectMatch(item,queryText);
                            }
                            break;
                        case "all":
                            options = function(item) {
                                return allMatch(item,queryText);
                            }
                            break;
                        default:
                            queryText = queryText && queryText.toLowerCase();
                            options = {};
                            options[queryType] = queryText;
                            break;
                    }
                    return filter(libraryItems,options);
                }
                // NOTE: Only 'everything' isn't returned here,
                // since I don't want it to show in the User interface
                // except as a special link.
                result.fields = [
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

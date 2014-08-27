'use strict';

/* jasmine specs for filters go here */

describe('filter', function() {
  beforeEach(module('felixLibrum.filters'));
  beforeEach(module('felixLibrum.mock.data'));

  describe('titleMatch', function() {
      var test = [
        {
            title: "Foo",
            subtitle: "",
            series: ""
        },
        {
            title: "Bar",
            subtitle: "Foo",
            series: ""
        },
        {
            title: "Fubar",
            subtitle: "",
            series: "Bar"
        }
      ];
      
      it('should match title fields',inject(function(titleMatchFilter) {
          expect(titleMatchFilter(test[0],"Foo")).toEqual(true);
          expect(titleMatchFilter(test[1],"Foo")).toEqual(true);
          expect(titleMatchFilter(test[2],"Foo")).toEqual(false);
          expect(titleMatchFilter(test[0],"Bar")).toEqual(false);
          expect(titleMatchFilter(test[1],"Bar")).toEqual(true);
          expect(titleMatchFilter(test[2],"Bar")).toEqual(true);
          expect(titleMatchFilter(test[0],"f")).toEqual(true);
          expect(titleMatchFilter(test[1],"f")).toEqual(true);
          expect(titleMatchFilter(test[2],"f")).toEqual(true);
          expect(titleMatchFilter(test[0],"eee")).toEqual(false);
          expect(titleMatchFilter(test[1],"eee")).toEqual(false);
          expect(titleMatchFilter(test[2],"eee")).toEqual(false);
      }));
  });
  
  describe('authorMatch',function() {
      var test = [
      {
          authors: [
              { name: "Twain, Charles"},
              { name: "Dickens, Edgar"},
              { name: "Poe, Samuel"}
          ]
      },
      {
          authors: [
                { name: "Melville, China"},
                { name: "Mieville, Herman"}
          ],
          illustrators: [
                { name: "Lioni, Dr."},
                { name: "Suess, Leo"}
          ]
      },
      {
          editors: [
                { name: "Trudgeon, Steodore"}
          ]
      }
      ]

      it('should match author fields',inject(function(authorMatchFilter) {
          expect(authorMatchFilter(test[0],"Twain")).toEqual(true);
          expect(authorMatchFilter(test[1],"Melville")).toEqual(true);
          expect(authorMatchFilter(test[2],"eodore")).toEqual(true);
          expect(authorMatchFilter(test[0],"Shakespeare")).toEqual(false);
          expect(authorMatchFilter(test[1],"Faulkner")).toEqual(false);
          expect(authorMatchFilter(test[2],"itzger")).toEqual(false);
      }));

  });
  
  describe('subjectMatch',function() {
      
      var test = {
          subjects: [
            "planes",
            "trains",
            "cars"
          ]
      }
      
      it('should match subject field',inject(function(subjectMatchFilter) {
          expect(subjectMatchFilter(test,"planes")).toEqual(true);
          expect(subjectMatchFilter(test,"ain")).toEqual(true);
          expect(subjectMatchFilter(test,"Shakespeare")).toEqual(false);
      }));
  });
  
  describe('allMatch',function() {
      it('should match various fields',inject(function(allMatchFilter,mockItems) {
          expect(allMatchFilter(mockItems[9],"Spock")).toEqual(true);
          expect(allMatchFilter(mockItems[10],"Spock")).toEqual(false);
          expect(allMatchFilter(mockItems[10],"juvenile")).toEqual(true);
          expect(allMatchFilter(mockItems[10],"6.6")).toEqual(true);
          expect(allMatchFilter(mockItems[10],"Mentioner")).toEqual(true);
          expect(allMatchFilter(mockItems[0],"view")).toEqual(true);
      }));
  });
  
  describe('libraryQuery',function() {
      it('should contain a list of fields for the UI.',inject(function(libraryQueryFilter) {
          expect(libraryQueryFilter.fields).toBeDefined();
      }));
      it('should filter on several different fields',inject(function(libraryQueryFilter,mockItems) {
          // title
          expect(libraryQueryFilter(mockItems,"title","philosophical").length).toEqual(5);
          // author
          expect(libraryQueryFilter(mockItems,"author","megadodo").length).toEqual(2);
          // subject
          expect(libraryQueryFilter(mockItems,"subject","animal").length).toEqual(1);
          // all
          expect(libraryQueryFilter(mockItems,"subject","de").length).toEqual(1);
          // specific field
          expect(libraryQueryFilter(mockItems,"volume","2").length).toEqual(1);
      }));
  });
  

});



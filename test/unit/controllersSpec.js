'use strict';

/* jasmine specs for controllers go here */

// TODO: Write controller tests.

describe('controllers', function(){
    // Need to load dependencies as well...  
  beforeEach(module('myApp'));
  beforeEach(module('myApp.filters'));
  beforeEach(module('myApp.services'));
  beforeEach(module('myApp.controllers'));
  beforeEach(module('myApp.mock.data'));
  beforeEach(module('myApp.mock.tools'));
  
  
  // need some base scope to work with...
  var rootScope;
  var httpBackend;
  beforeEach(angular.mock.inject(function ($rootScope, $controller, $httpBackend, mockItems, mockItem20) {
    rootScope = $rootScope;
    httpBackend = $httpBackend;
    
    
    httpBackend.whenGET(/data\/items.json(\?\d*)?/).respond(mockItems);
    httpBackend.whenGET(/data\/20.json(\?\d*)?/).respond(mockItem20);

  }));
  
  beforeEach(inject(function(queryParams) {
    // initialize the queryParams.
    queryParams.filter.field("author");
    queryParams.filter.text("Oolon");
    queryParams.sort("+callNumber");
    queryParams.page.length(3);
    queryParams.page.index(2);
      
  }));
  
  afterEach(inject(function(queryParams,$location) {
    // reset the query Params
    queryParams.filter.field('title');
    queryParams.filter.text(null);
    queryParams.sort(null);
    queryParams.page.length(10);
    queryParams.page.index(1);
    $location.path("/list");
  }));


  it('should control the query panel', inject(function($controller,queryParams) {
      
    //spec body
    var scope = rootScope.$new();
    var query = $controller('queryController', { $scope: scope });
    expect(query).toBeDefined();
    expect(scope.fields).toBeDefined();
    // these should be picked up from the queryParams we initialized before.
    expect(scope.filter.field).toEqual('author');
    expect(scope.filter.text).toEqual('Oolon');
    expect(scope.currentFilter.label).toEqual('Search by author');
    expect(scope.currentFilter.type).toEqual('author');
    
    // setting the text should update the query params.
    scope.setText('Beeblebrox');
    expect(queryParams.filter.text()).toEqual('Beeblebrox');
    
    // setting the field should also update the query params and the current filter.
    scope.setField('all');
    expect(queryParams.filter.field()).toEqual('all');
    expect(scope.currentFilter.label).toEqual('Search all fields');
    expect(scope.currentFilter.type).toEqual('all');
    
    // in theory, if we update the queryParams, it should update the controller
    // as well.
    queryParams.filter.text("Oolon");
    scope.$digest();
    expect(scope.filter.text).toEqual("Oolon");
    
    queryParams.filter.field('callNumber');
    scope.$digest();
    expect(scope.filter.field).toEqual("callNumber");
    expect(scope.currentFilter.label).toEqual('Search by call number');
    expect(scope.currentFilter.type).toEqual('callNumber');
    
  }));

  it('should control the items grid', inject(function($controller,pageLengths,queryParams) {
    //spec body
    var scope = rootScope.$new();
    var items = $controller('itemsController', { $scope: scope });
    expect(items).toBeDefined();
    // This one needs data to start with, so...
    // TODO: Test "Loading" information before the data has been
    // retrieved.
    expect(scope.loading).toEqual(true);
    expect(scope.loadingStatus).toBeDefined();
    expect(scope.pageLengths).toEqual(pageLengths);
    expect(scope.urlParams).toEqual(queryParams.urlParams);
    
    httpBackend.flush();
    // These things should have values based on what was provided
    // to query Params.
    expect(scope.sort).toEqual("+callNumber");
    expect(scope.pageLength).toEqual(3);
    expect(scope.pageIndex).toEqual(2);
    expect(scope.filterField).toEqual("author");
    expect(scope.filterText).toEqual("Oolon");
    expect(scope.filteredTotal).toEqual(7);
    // page length was set to 3, so we should only have 3 items 
    // passing through the filter.
    expect(scope.filteredItems.length).toEqual(3);
    expect(scope.loading).toEqual(false);
    
    // Test the watch on urlParams.
    queryParams.filter.text("Megadodo");
    scope.$digest();
    expect(scope.filterText).toEqual("Megadodo");
    expect(scope.filteredTotal).toEqual(2);
    
    // Test the sort change.
    scope.setSort('title');
    scope.$digest();
    // initial sort should be ascending.
    expect(scope.sort).toEqual("+title");
    
    scope.setSort('title');
    scope.$digest();
    // second click should make it descending.
    expect(scope.sort).toEqual("-title");
    
    scope.setSort('title');
    scope.$digest();
    // third click should remove sort.
    expect(scope.sort).not.toBeDefined();
    
    // change the filter back in order to test page changes.
    queryParams.filter.text("Oolon");
    scope.$digest();
    expect(scope.filterText).toEqual("Oolon");
    
    // page length should be 3, page Index is 2, and there
    // are seven total items in the list. Therefore, the last page
    // should only have one.
    expect(scope.filteredItems.length).toEqual(3);
    scope.setPage(3);
    scope.$digest();
    expect(scope.filteredItems.length).toEqual(1);
    
    // but, if we change page length to 5... and since we're still
    // on page 3, we should have a filteredItems length of 0 now.
    // NOTE: In production, the paginator in the items template
    // would cause an ng-change that would reset the page index
    // to 1.
    scope.setPageLength(5);
    scope.$digest();
    expect(scope.pageIndex).toEqual(3);
    expect(scope.filteredItems.length).toEqual(0);


  }));

  it('should control the items detail page', inject(function($controller,$location,queryParams) {
    $location.path("/detail/20");
    var scope = rootScope.$new();
    var detail = $controller('itemDetailController', { $scope: scope, $routeParams: { itemKey: "20" } });
    expect(detail).toBeDefined();

    expect(scope.itemKey).toEqual('20');
    expect(scope.urlParams).toEqual(queryParams.urlParams);
    // there shouldn't be anything on the item yet.
    expect(scope.item.title).not.toBeDefined();
    httpBackend.flush();
    // but now, there should be data.
    expect(scope.item.title).toBeDefined();
    
    // test the watch on queryParams filter, which causes a redirect
    // back to the list.
    // (but only after the initial check).
    expect($location.path()).toEqual("http://127.0.0.1/index.html#/detail/20");
    queryParams.filter.field("title");
    scope.$digest();
    expect($location.path()).toEqual("http://127.0.0.1/index.html#/list");
    
    
  }));

});

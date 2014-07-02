'use strict';

/* jasmine specs for directives go here */

describe('directives', function() {
  beforeEach(module('myApp'));
  beforeEach(module('myApp.directives'));
  describe('app-version', function() {
    it('should print current version', function() {
      module(function($provide) {
        $provide.value('version', 'TEST_VER');
      });
      inject(function($compile, $rootScope) {
        var element = $compile('<span app-version></span>')($rootScope);
        expect(element.text()).toEqual('TEST_VER');
      });
    });
  });
  
  describe ('app-name', function() {
      it('should print current application name', function() {
          module(function($provide) {
              $provide.value('name','TEST_NAME');
          });
          inject(function($compile, $rootScope) {
              var element = $compile('<span app-name></span>')($rootScope);
              expect(element.text()).toEqual('TEST_NAME');
          });
      });
  });
  
  describe('sortable-column', function() {
      var element, scope;
        
        beforeEach(function () {


            // TODO: Provide any mocks needed
            module(function ($provide) {
              //$provide.value('Name', new MockName());
            });

            module('partials/sortable-column.html');
            
            // Inject in angular constructs otherwise,
            //  you would need to inject these into each test
            inject(function ($rootScope, $compile, $httpBackend, $templateCache) {
              // Since I'm using a query param to ensure that the browser
              // doesn't use an old version of the template taken from the
              // cache, I also need to do this:
                  $httpBackend.whenGET(/partials\/sortable-column\.html?\d*/).respond($templateCache.get('partials/sortable-column.html'));
                  scope = $rootScope.$new();
                  
                  // initialize the scope.
                  scope.inSorted = false;
                  scope.inSortDir = '+';
                  
                  
                  element = $compile('<th sortable-column sorted="inSorted" sort-dir="inSortDir">Test</th>')(scope);
                  // Now, we need to flush the httpBackend to get it to 
                  // send the response, (I think that's what's going on.
                  // Can't really figure out what else it might be doing,
                  // but a similar stackoverflow question made this
                  // suggestion, and suddenly it works where it wasn't
                  // compiling before).
                  $httpBackend.flush();
            });
        });

        it ('should replace the content with the template',function() {
            // a minimal test to make sure it's different than what we put in.
            expect(element.attr('class')).toContain('sortable');
        });
        
        it('should change state when the column is marked as sorted', function() {
            expect(element.attr('class').split(' ')).not.toContain('active');
            // now, change the sorted value...
            scope.$apply(function() {
                scope.inSorted = true;
            });
            // and it should have the 'active' class.
            expect(element.attr('class').split(' ')).toContain('active');
            
        });
        
        it('should change icon image when the sorted in different ways', function() {
            var glyph;
            // jqLite does not support anything but name selectors,
            // so I can't go 'span.glyphicon'
            var spans = element.find('span');
            for (var i = 0; i < spans.length; i++) {
                if (spans.eq(i).hasClass('glyphicon')) {
                    glyph = spans.eq(i);
                    break;
                }
            }
            
            
            expect(glyph).toBeDefined();
            expect(glyph.attr('class').split(' ')).not.toContain('glyphicon-sort-by-alphabet');
            expect(glyph.attr('class').split(' ')).not.toContain('glyphicon-sort-by-alphabet-alt');
            expect(glyph.attr('class').split(' ')).toContain('glyphicon-sort');
            
            // Simulate a sort direction change in another column.
            scope.$apply(function() {
                scope.inSortDir = '-';
                
            });
            // shouldn't change anything...
            expect(glyph.attr('class').split(' ')).not.toContain('glyphicon-sort-by-alphabet');
            expect(glyph.attr('class').split(' ')).not.toContain('glyphicon-sort-by-alphabet-alt');
            expect(glyph.attr('class').split(' ')).toContain('glyphicon-sort');
            
            // Simulate a sort change in this column.
            scope.$apply(function() {
                scope.inSorted = true;
                scope.inSortDir = '+';
            });
            expect(glyph.attr('class').split(' ')).toContain('glyphicon-sort-by-alphabet');
            expect(glyph.attr('class').split(' ')).not.toContain('glyphicon-sort-by-alphabet-alt');
            expect(glyph.attr('class').split(' ')).not.toContain('glyphicon-sort');
            
            // Simulate a sort direction change in this column.
            scope.$apply(function() {
                scope.inSorted = true;
                scope.inSortDir = '-';
            });
            expect(glyph.attr('class').split(' ')).not.toContain('glyphicon-sort-by-alphabet');
            expect(glyph.attr('class').split(' ')).toContain('glyphicon-sort-by-alphabet-alt');
            expect(glyph.attr('class').split(' ')).not.toContain('glyphicon-sort');
            
            // Simulate a removal of sort from this column.
            scope.$apply(function() {
                scope.inSorted = false;
            });
            expect(glyph.attr('class').split(' ')).not.toContain('glyphicon-sort-by-alphabet');
            expect(glyph.attr('class').split(' ')).not.toContain('glyphicon-sort-by-alphabet-alt');
            expect(glyph.attr('class').split(' ')).toContain('glyphicon-sort');
            
        });
  });
  
  
  
});

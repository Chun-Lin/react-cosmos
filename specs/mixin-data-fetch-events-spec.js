describe("Components implementing the DataFetch mixin", function() {

  var _ = require('lodash'),
      jsdom = require('jsdom');

  // jsdom creates a fresh new window object for every test case and React needs
  // to be required *after* the window and document globals are available. The
  // var references however must be declared globally in order to be accessible
  // in test cases as well.
  var React,
      utils,
      Cosmos,
      $;

  beforeEach(function() {
    global.window = jsdom.jsdom().createWindow('<html><body></body></html>');
    global.document = global.window.document;
    global.navigator = global.window.navigator;

    React = require('react/addons');
    utils = React.addons.TestUtils;
    Cosmos = require('../build/cosmos.js');
    $ = require('jquery');

    // Mock the $.ajax call so we can control the requests ourselves.
    spyOn($, 'ajax');
  });

  // In order to avoid any sort of state between tests, even the component class
  // generated for every test case
  var generateComponentClass = function(attributes) {
    return React.createClass(_.extend({}, {
      mixins: [Cosmos.mixins.DataFetch],
      render: function() {
        return React.DOM.span();
      }
    }, attributes));
  };

  var ComponentClass,
      componentInstance;

  it("should mark the start of a data fetch", function() {
    ComponentClass = generateComponentClass();
    componentInstance = utils.renderIntoDocument(ComponentClass({
      dataUrl: 'http://happiness.com'
    }));
    expect(componentInstance.state.fetchingData).toBe(true);
  });

  it("should mark the end of a data fetch", function() {
    $.ajax.and.callFake(function(options) {
      options.success({foo: "bar"});
    });
    ComponentClass = generateComponentClass();
    componentInstance = utils.renderIntoDocument(ComponentClass({
      dataUrl: 'http://happiness.com'
    }));

    expect(componentInstance.state.fetchingData).toBe(false);
  });

  it("should mark the end of data fetch if the request errors", function() {
    $.ajax.and.callFake(function(options) {
      options.error(null, 503, "foobar");
    });

    ComponentClass = generateComponentClass();
    componentInstance = utils.renderIntoDocument(ComponentClass({
      dataUrl: 'http://happiness.com'
    }));

    expect(componentInstance.state.fetchingData).toBe(false);
  });
});


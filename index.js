var apiKey = "qs9s5dj9w6z4bj2gws282k8r"

var Hapi = require('hapi');
var walmart = require('walmart')(apiKey);

// Create a server with a host and port
var server = new Hapi.Server();
server.connection({ 
    host: 'localhost', 
    port: 8000 
});

// Add the route
server.route({
    method: 'GET',
    path:'/hello', 
    handler: function (request, reply) {
        reply('hello world');
    }
});

server.route({
    method: 'GET',
    path: '/walmart',
    handler: function (request, reply) {
      walmart.search(request.query.search, {'facet': 'on', 'facet.range': 'price:[150 TO 1200]'}).then(function(item) {
          walmart.recommendations(item.items[0].itemId).then(function(recommendation) {
            reply({items: item.items, recommendations: recommendation});
          });
      });

    }
});

// Start the server
server.start(function () {
    console.log('Server running at:', server.info.uri);
});


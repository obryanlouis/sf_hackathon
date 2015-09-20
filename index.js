var apiKey = "qs9s5dj9w6z4bj2gws282k8r"

var Hapi = require('hapi');
var resource = require('hapi-resource');
var walmart = require('walmart')(apiKey);
var watson = require('watson-developer-cloud');
var askedShoesQuestion = false;

// Create a server with a host and port
var server = new Hapi.Server();
server.connection({ 
    host: '0.0.0.0',
    port: (process.env.PORT || 5000)
});


dialog_id = 'b3f68f26-3342-403b-b51c-757a5c5e022e';
shoes_dialog_id = 'ae5a4606-975d-4d0d-971e-bbf5102383cc';

var dialog = watson.dialog({
    username: '4fdb7fb8-908b-47a2-9ced-bf3871a8c9d2',
    password: '5zkEVK4ZyH18',
  url: 'https://gateway.watsonplatform.net/dialog/api',
    version: 'v1'
});


// var params = {
//   // URL of the resource you wish to access
// };

// dialog.getDialogs(params, function (err, dialogs) {
//   if (err)
//     console.log('error:', err);
//   else
//     console.log(JSON.stringify(dialogs, null, 2));
// });


// emplate6test: cb68055c-6f00-4b16-a6ef-7f7938a612fd

var ConversationsController = {

  index: function(request, reply) {
  },

  show: function(request, reply) {
  },

  create: function(request, reply) {
    dialog.conversation({ dialog_id: dialog_id}, function (err, dialogs) {
      if (err)
        reply({error: err});
      else
        reply(dialogs);
    });
  },  

  update: function(request, reply) {
    var input = request.payload.input;
    if (input.indexOf("shoes") != -1) {
        if (askedShoesQuestion) {
            // Change the dialog so that our system 'learns' the right answer to the shoes question
            dialog_id = shoes_dialog_id;
        }
        askedShoesQuestion = true;
    }
    dialog.conversation({client_id: request.payload.client_id,
        dialog_id: dialog_id,
        conversation_id: request.params.id,
        input: request.payload.input
    }, function (err, dialogs) {
      if (err)
        reply({error: err});
      else
        reply(dialogs);
    });
  },

  destroy: function(request, reply) {
  }
}

server.route(
  resource({
      name: 'conversation',
      controller: ConversationsController,
  })
);

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      reply('hello');

    }
});

server.route({
    method: 'GET',
    path: '/walmart/search',
    handler: function (request, reply) {
      min = request.query.min || 0
      max = request.query.max || 5000
      walmart.search(request.query.q, {'facet': 'on', 'facet.range': 'price:[' + min + ' TO ' + max + ']'}).then(function(item) {
          walmart.recommendations(item.items[0].itemId).then(function(recommendation) {
            reply({items: item.items, recommendations: recommendation});
          });
      });

    }
});
server.route({
    method: 'GET',
    path: '/walmart/recommendations',
    handler: function (request, reply) {
      walmart.recommendations(request.query.q).then(function(item) {
        reply({recommendations: recommendation});
      });

    }
});

// Start the server
server.start(function () {
    console.log('Server running at:', server.info.uri);
});


'use strict';

require('../utils/polyfill');

var http = require("http");
var url = require("url");
var express = require('express');
var DockerImageRegistry = require('../services/DockerImageRegistry');
var router = express.Router();
var view = require('../utils/view');



var privateRegistry = DockerImageRegistry.privateRegistry;


/* GET home page. */
router.get('/', function(req, res) {
    res.redirect('/private_registry');
});


/* GET home page. */
router.get('/private_registry', function(req, res) {
    var params = url.parse(req.url, true).query;
    view.render(req, res, 'home', { params: params});
});


/* GET image details from private registry. */
router.get('/private_registry/images/:id', function(req, res) {
    privateRegistry.retrieveImageDetails(req.params.id).then(function(image) {
        var params = url.parse(req.url, true).query;
        view.render(req, res, 'image', {
            image: image,
            params: params
        });
    });
});


/* GET docker hub page. */
router.get('/docker_hub', function(req, res) {
    var params = url.parse(req.url, true).query;
    view.render(req, res, 'docker_hub', { params: params});
});


var getRepoName = function(req) {
    return (req.params.namespace)? req.params.namespace + '/' + req.params.repoId: req.params.repoId;
};

var handleRetrieveRepoInfo = function(req, res) {
    var repoName = getRepoName(req);
    view.render(req, res, 'docker_hub_repositories', {
        repoName: repoName
    });
};

/* GET image details from private registry. */
router.get('/docker_hub/repositories/:repoId', handleRetrieveRepoInfo);
router.get('/docker_hub/repositories/:namespace/:repoId', handleRetrieveRepoInfo);


module.exports = router;

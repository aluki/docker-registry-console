'use strict';

var config = require('../../utils/config');
var DockerImageRegistry = require('../../services/DockerImageRegistry');
var dockerHub = require('../../services/DockerHub');
var dockerService = require('../../services/DockerService');
var express = require('express');
var url = require("url");
var view = require('../../utils/view');

module.exports = function(publicRegistry) {

    var router = express.Router();

    var registry = (publicRegistry)? dockerHub : DockerImageRegistry.privateRegistry;

    var getRepoName = function(req) {
        return (req.params.namespace)? req.params.namespace + '/' + req.params.repoId: req.params.repoId;
    };

    var handleSearchRepos = function(req, res) {
        var params = url.parse(req.url, true).query;
        view.renderJSONPromise(res, registry.searchRepositories(params.q));
    };

    router.get('/', handleSearchRepos);


    var handleListRepoTags = function(req, res) {
        view.renderJSONPromise(res, registry.listRepoTags(getRepoName(req)));
    };

    router.get('/:repoId/tags', handleListRepoTags);
    router.get('/:namespace/:repoId/tags', handleListRepoTags);

    var handleRetrieveRepoInfo = function(req, res) {
        view.renderJSONPromise(res, registry.retrieveRepoWithImages(getRepoName(req)));
    };

    router.get('/:repoId/info', handleRetrieveRepoInfo);
    router.get('/:namespace/:repoId/info', handleRetrieveRepoInfo);


    var handleListRepoImages = function(req, res) {
        view.renderJSONPromise(res, registry.listRepoImagesWithTag(getRepoName(req)));
    };

    router.get('/:repoId/images', handleListRepoImages);
    router.get('/:namespace/:repoId/images', handleListRepoImages);

    if (!publicRegistry) { //Private Registry Only.
        var handleRetrieveImageFromDockerHub = function(req, res) {
            view.renderJSONPromise(res, registry.retrieveImageFromDockerHub(getRepoName(req), req.params.imageId));
        };

        router.get('/:repoId/images/:imageId', handleRetrieveImageFromDockerHub);
        router.get('/:namespace/:repoId/images/:imageId', handleRetrieveImageFromDockerHub);

    }

    var handleRetrieveRepoTagsInfo = function(req, res) {
        view.renderJSONPromise(res, registry.retrieveRepositoryDetails(getRepoName(req)));
    };

    router.get('/:repoId/details', handleRetrieveRepoTagsInfo);
    router.get('/:namespace/:repoId/details', handleRetrieveRepoTagsInfo);

    if (!publicRegistry) {
        var handleCreateRepoTags = function(req, res) {
            dockerService.syncImage(getRepoName(req), req.params.tag, registry.registryHost);
            res.json(true);
        };

        router.post('/:repoId/tags/:tag', handleCreateRepoTags);
        router.post('/:namespace/:repoId/tags/:tag', handleCreateRepoTags);
    }
    return router;
};

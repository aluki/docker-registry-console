'use strict';

var config = require('../utils/config');
var Docker = require('dockerode');

var DockerService = function() {
    this.client = new Docker(config.docker);
};

DockerService.prototype.pull = function(repo, tag) {
    var imageTag = repo + ":" + tag;
    console.log('pull image: ' + imageTag);
    var that = this;
    return new Promise(function (resolve, reject) {
        that.client.pull(imageTag, function (error, stream) {
            if (error) {
                console.log('Failed to pull image: %s', imageTag);
                console.log(error);
                reject(error);
            } else {
                stream.on('data', that.noop);
                stream.on('error', reject);
                stream.on('end', function () {
                    console.log('Pull image %s completely!', imageTag);
                    resolve(imageTag);
                });
            }
        });
    });
};

DockerService.prototype.tag = function(repo, tag, registryHost) {
    var imageTag = repo + ":" + tag;
    console.log('tag image: ' + imageTag);
    var params = {
        repo: registryHost + '/' + repo
    };
    if (tag) {
        params.tag = tag;
    }
    var that = this;
    return new Promise(function (resolve, reject) {
        that.client.getImage(imageTag).tag(params, function(error, data) {
            if (error) {
                console.log('Failed to tag image: %s', imageTag);
                console.log(error);
                reject(error);
            } else {
                resolve(true);
            }
        });
    });
};

DockerService.prototype.noop = function(chunk) {
    if (chunk) {
        var json = JSON.parse(chunk);
        var id = json.id;
        var status = json.status;
        var line = (id) ? id + ": " + status : status;
        console.log(line);
    }
};

DockerService.prototype.push = function(repo, tag) {
    var imageTag = (tag)? repo + ":" + tag : repo;
    console.log('push image: ' + imageTag);
    var that = this;
    return new Promise(function (resolve, reject) {

        var params = {};
        if (tag) {
            params.tag = tag;
        }
        that.client.getImage(repo).push(params, function (error, stream) {
            if (error) {
                console.log('Failed to push image: %s', imageTag);
                console.log(error);
                reject(error);
            } else {
                stream.on('data', that.noop);
                stream.on('error', reject);
                stream.on('end', function () {
                    console.log('Push image %s completely!', imageTag);
                    resolve(imageTag);
                });
            }
        });
    });
};

DockerService.prototype.syncImage = function(repo, tag, registryHost) {
    var that = this;
    return this.pull(repo, tag).then(function(){
        that.tag(repo, tag, registryHost)
    }).then(function(){
        that.push(registryHost + "/" + repo, tag);
    });
};

module.exports = new DockerService();


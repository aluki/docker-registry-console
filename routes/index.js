require('../utils/polyfill');

var config = require('../utils/config');

var http = require("http");
var url = require("url");
var express = require('express');
var DockerImageRegistry = require('../models/DockerImageRegistry');
var router = express.Router();

var privateRegistry = new DockerImageRegistry(config.registry);

//var dockerHub = new DockerImageRegistry(config.dockerHub);
//
//dockerHub.searchRepositories('centos').then(function(images){
//    console.log(images);
//});


function isEmptyObject(obj) {
    return obj == null || !Object.keys(obj).length;
}

/* GET home page. */
router.get('/', function(req, res) {
    var params = url.parse(req.url, true).query;
    res.render('home', { params: params});
});

router.get('/images/:id', function(req, res) {
    privateRegistry.retrieveImageDetails(req.params.id).then(function(image) {
        privateRegistry.retrieveImageAncestry(req.params.id).then(function (layers) {
            var layerInfoList = [];
            layers.forEach(function(layer){
                var displayName = null;
                var images = privateRegistry.cachedData.imageTagIndex[layer];
                if (images) {
                    displayName = '';
                    for (var i = 0; i < images.length; i++) {
                        if (i > 0) {
                            displayName += ', '
                        }
                        displayName += images[i].displayName + ':' + images[i].tag;
                    }

                }
                layerInfoList.push({id: layer, displayName: displayName})
            });
            res.render('image', {
                image: image,
                layers: layerInfoList
            });
        })
    })
});


module.exports = router;

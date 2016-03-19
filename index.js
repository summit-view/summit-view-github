var Q = require('q');
var request = require('request');
var id = 'summit-view-github';
var config, settings, summit, commits = [], users = {};

var getAvatarUrl = function(username) {
    if( users[username] ) {
        ret = users[username].avatar_url;
    }
    else {
        var deferred = Q.defer();

        request({ url: 'https://api.github.com/users/' + username, headers: { 'User-Agent': id } }, function(err, res, body) {
            if (!err && res.statusCode == 200) {
                var user = JSON.parse(body);
                users[username] = user;
                deferred.resolve(user.avatar_url);
            }
            else {
                deferred.reject(new Error(err));
            }
        });

        ret = deferred.promise;
    }

    return Q.when(ret);
};

module.exports = function(s) {
    summit = s;
    config = config || {};

    // setup webhook listener
    summit.router.post('/payload', function(req, res) {
        res.status(200).send(); // answer back to github instantly

        var data = req.body;

        Q.resolve()
            .then(function() {
                var newCommits = data.commits.map(function(c) {
                    return Q.resolve()
                        .then(function() {
                            return getAvatarUrl(c.committer.username);
                        })
                        .then(function(avatar_url) {
                            return {
                                repository: data.repository.full_name,
                                message: c.message,
                                timestamp: c.timestamp,
                                committer: c.committer,
                                avatar_url: avatar_url,
                            };
                        })
                });

                return Q.all(newCommits);
            })
            .then(function(cs) {
                var cacheLength = config.cacheLength || 15;

                for (var i = 0; i < cs.length; i++) {
                    if( commits.length >= cacheLength ) {
                        commits.shift();
                    }
                    commits.push(cs[i]);

                    // emit the commit
                    summit.io.emit('commit', cs[i]);
                }

                if( commits.length ) {
                    summit.io.emit('loaded');
                }
            });
    });

    // emit cached commits on new connection
    summit.io.on('connection', function(socket) {
        socket.emit('commits', commits);

        if( commits.length ) {
            socket.emit('loaded');
        }
        else {
            socket.emit('loading', 'Waiting for first commit...');
        }
    });


    return summit.settings()
        .then(function(s) {
            settings = s || {};

            return {
                id: id,
                branding: {
                    icon: {
                        fa: 'github',
                    },
                    color: {
                        background: 'github-4',
                        text: 'clouds',
                        icon: 'clouds',
                    }
                },
            };
        });

};

module.exports.id = id;

module.exports.client = __dirname + '/lib/client.js';

module.exports.style = __dirname + '/public/style.css';

module.exports.onSettings = function(s) {
    settings = s;
};

module.exports.init = function(cfg) {
    config = cfg;
    return module.exports;
};

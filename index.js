var id = 'summit-view-github';
var config, settings, summit, commits = [];

module.exports = function(s) {
    summit = s;
    config = config || {};

    // emit the profiles on new connection
    summit.io.on('connection', function() {
        summit.io.emit('commits', commits);
    });


    return summit.settings()
        .then(function(s) {
            settings = s || {};

            return {
                id: id,
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

define([], function() {

    var cx = function(arg) {
        var keep = [];

        for( var key in arg ) {
            if( arg[key] ) {
                keep.push(key);
            }
        }

        return keep.join(' ');
    };

    var render = function(commit, panel) {
        var html = '<div class="media"><div class="img"><img src="' + commit.avatar_url + '" /></div><div class="bd"><div class="summit-view-github-commit-message">' + commit.message + '</div><div class="">' + commit.committer.username + ' committed to ' + commit.repository + ' at ' + commit.timestamp + '</div></div></div>';
        panel.insertAdjacentHTML('afterbegin', html);
    };

    var init = function(panel, socket) {
        socket.once('commits', function(commits) {
            for (var i = 0; i < commits.length; i++) {
                render(commits[i], panel);
            }
        });

        socket.on('commit', function(commit) {
            render(commit, panel);
        });
    };

    return init;
});

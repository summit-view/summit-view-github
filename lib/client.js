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

    var init = function(panel, socket) {
        socket.on('commits', function(recent) {
            var html = '';
            panel.innerHTML = html;
        });
    };

    return init;
});

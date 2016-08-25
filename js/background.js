// Media Grabber Class //
// code execution is on line 115 
function MediaGrabber() {
    this.linkshash = {};
    this.type = [];
    this.activetabid = undefined;
    this.returndata = function() {
        return this.linkhash[this.activetabid];
    };
    this.listener = function(details) {
        if (this.filter(details.responseHeaders)) {
            if (this.linkshash[this.activetabid].indexOf(details.url) < 0)
                this.linkshash[this.activetabid].push(details.url);
        }
    };
}

MediaGrabber.prototype.setfilter = function(arr) {
    this.type = arr;
};
MediaGrabber.prototype.filter = function(headers) {
    var contenttype = headers.find(function(dict) {
        return (dict.name === 'Content-Type' || dict.name === 'content-type'); //sometimes returns undefined;
    }.bind(this));
    for (var i = 0; i < this.type.length; i++) {
        /* bad error code to suppress undefined error; definitely should fix at somepoint.*/
        try {
            if (this.type[i] == contenttype.value)
                return true;
        } catch (err) {
              console.log('Content-Type not found');
	} 
    }
    return false;
};
MediaGrabber.prototype.evaliconstate = function() {
    if (this.linkshash[this.activetabid].length !== 0) {
        chrome.browserAction.setIcon({
            path: 'icons/play.png'
        });
    } else {
        chrome.browserAction.setIcon({
            path: 'icons/notplay.png'
        });
    }

};
MediaGrabber.prototype.startlistener = function() {
    chrome.webRequest.onHeadersReceived.addListener(this.listener.bind(this), {
        urls: ["<all_urls>"]
    }, ["responseHeaders"]);
};
MediaGrabber.prototype.startgrabber = function(items) {
	/* Init */
    chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
    }, function(tabs) {
        var tabid = tabs[0].id;
        this.activetabid = tabid;
        this.linkshash[tabid] = [];
        this.startlistener();
    }.bind(this));
        /*OnActivted*/ 
    chrome.tabs.onActivated.addListener(function(info) {
        chrome.webRequest.onHeadersReceived.removeListener(this.listener);
        if (this.linkshash[info.tabId] === undefined) {
            this.linkshash[info.tabId] = [];
        }
        this.activetabid = info.tabId;
        this.startlistener();
        this.evaliconstate();
	    /*OnUpdated*/
        chrome.tabs.onUpdated.addListener(function(tabid, info) {
            if (info.url !== undefined)
                this.linkshash[this.activetabid] = [];
            this.evaliconstate();
        }.bind(this));
    }.bind(this));
        /*OnClicked*/ 
    chrome.browserAction.onClicked.addListener(function() {
        chrome.tabs.get(this.activetabid, function(tab) {
            // temporary workaround for youtube for players with youtube-dl
	    // TODO 
	    // *setup options page with a whitelist for youtube download site workarounds
            if (/.*youtube.*/.test(tab.url) ||/.*twitch.*/.test(tab.url) || /.*dailymotion.*/.test(tab.url)) {
                Link = tab.url;

            } else {
                Link = (this.linkshash[this.activetabid])[0];
            }
            if (Link === undefined) {
                console.log("no link");
                return;
            }
            chrome.runtime.sendNativeMessage("com.awlnx.video_connector", {
                player: items.Player,
                link: Link
            });
        }.bind(this));
    }.bind(this));
};
MediaGrabber.prototype.links = function() {
    return this.linkshash[this.activetabid];
};

//**start**//
var player = {};
MediaEngine = new MediaGrabber();
MediaEngine.setfilter(['video/mp4', 'video/x-flv', 'video/webm']);

chrome.storage.local.get({
	Player: null
	}, function(items) {
		//console.log(items.Player);
		if (items.Player === null) {
			chrome.tabs.create({ 'url': 'chrome://extensions/?options=' + chrome.runtime.id });
		}
		else {
			console.log(typeof items);
		    player = items;
                    MediaEngine.startgrabber(player);
		}

	});

chrome.storage.onChanged.addListener(function(changes,areaname) {
	chrome.storage.local.get({
		Player:null
	}, function(items) {
		player.Player = items.Player ;
	});
});


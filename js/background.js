// Media Grabber Class //
// code execution is on line 115 

/******************************
 PRESETUP
*********************************/
//add binary search to array prototype
//
Array.prototype.binIndexOf = function (comparison) {
    var min = 0;
    var max = this.length -1;
    var index;

    while(min <= max) {
        index = Math.floor( (max + min)/2 );
	if (this[index] == comparison) {
		return index;
	}
	if (this[index] < comparison) {
		min = index +1;
	}
	if (this[index] > comparison) {
		 max = index -1;
	}

    }

    return -1; 


};

/****************************************

****************************************/
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
    this.type.sort();
};
MediaGrabber.prototype.filter = function(headers) {
    var contenttype = headers.find(function(dict) {
        return (dict.name === 'Content-Type' || dict.name === 'content-type'); //sometimes returns undefined;
    }.bind(this));
    if (contenttype === undefined) {
	    return false;
    }
    if (this.type.binIndexOf(contenttype.value) != -1){
	    return true;
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
		var pass = false;
		var domains = items.Domains;
		// O(N) speed
		for (var i = 0; i < domains.length ; i++){
                      var match= new RegExp('.*' + domains[i] + '.*');
			if (match.test(tab.url)) { 
				//domains[i].match( )) ) {

					pass=true;
					break;
			}
		}


            //if (/.*youtube.*/.test(tab.url) ||/.*twitch.*/.test(tab.url) || /.*dailymotion.*/.test(tab.url)) {
	     if (pass) {
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
	Player: null,
	Domains:null
	}, function(items) {
		if (items.Player === null || items.Domains === null) {
			chrome.runtime.openOptionsPage();
		}
		else {
			player = items;
                    MediaEngine.startgrabber(player);
		}

	});

chrome.storage.onChanged.addListener(function(changes,areaname) {
	chrome.storage.local.get({
		Player:null,
		Domains:null
	}, function(items) {
		player.Player = items.Player ;
		player.Domains = items.Domains;
	});
});


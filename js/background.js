// Media Grabber namespace//
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
    this.linksHash = {};
    this.type = [];
    this.activeTabId = undefined;
    /*this.returndata = function() {
        return this.linkhash[this.activeTabId];
    };*/
    this.listener = function(details) {
        if (this.filter(details.responseHeaders)) {
            if (this.linksHash[this.activeTabId].indexOf(details.url) < 0){
                this.linksHash[this.activeTabId].push(details.url);
		this.evalIconState();
	    }

        }
    };


var player = {};
this.setFilter(['video/mp4', 'video/x-flv', 'video/webm']);

chrome.storage.local.get({
	Player: null,
	Domains:null
	}, function(items) {
		if (items.Player === null || items.Domains === null) {
			chrome.runtime.openOptionsPage();
		}
		else {
			player = items;
                    this.startGrabber(player);
		}

	}.bind(this));

chrome.storage.onChanged.addListener(function(changes,areaname) {
	chrome.storage.local.get({
		Player:null,
		Domains:null
	}, function(items) {
		player.Player = items.Player ;
		player.Domains = items.Domains;
	});
});










}



MediaGrabber.prototype.setFilter = function(arr) {
    this.type = arr;
    this.type.sort();
};
MediaGrabber.prototype.filter = function(headers) {
    var contentType = headers.find(function(dict) {
        return (dict.name === 'Content-Type' || dict.name === 'content-type'); //sometimes returns undefined;
    }.bind(this));
    if (contentType === undefined) {
	    return false;
    }
    if (this.type.binIndexOf(contentType.value) != -1){
	    return true;
    }
    return false;
    };
MediaGrabber.prototype.evalIconState = function() {
    if (this.linksHash[this.activeTabId].length !== 0) {
        chrome.browserAction.setIcon({
            path: 'icons/play.png'
        });
    } else {
        chrome.browserAction.setIcon({
            path: 'icons/notplay.png'
        });
    }

};
MediaGrabber.prototype.startListener = function() {
    chrome.webRequest.onHeadersReceived.addListener(this.listener.bind(this), {
        urls: ["<all_urls>"]
    }, ["responseHeaders"]);
};
MediaGrabber.prototype.startGrabber = function(items) {

	/* Init */
	//get first tab, clear data and start listening to GET requests
    chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
    }, function(tabs) {
        var tabId = tabs[0].id;
        this.activeTabId = tabId;
        this.linksHash[tabId] = [];
        this.startListener();
    }.bind(this));


        /*OnActivted*/ 
     chrome.tabs.onActivated.addListener(function(info) {
        //chrome.webRequest.onHeadersReceived.removeListener(this.listener);
        if (this.linksHash[info.tabId] === undefined) {
            this.linksHash[info.tabId] = [];
        }
        this.activeTabId = info.tabId;
        this.startListener();
        this.evalIconState();
     }.bind(this));
	    
     
     
        /*OnUpdated*/
        chrome.tabs.onUpdated.addListener(function(tabid, info) {
            if (info.url !== undefined)
                this.linksHash[this.activeTabId] = [];
        }.bind(this));

        
	/*OnClicked*/ 
    chrome.browserAction.onClicked.addListener(function() {

        chrome.tabs.get(this.activeTabId, function(tab) {
		var pass = false;
		var domains = items.Domains; // passed into fuction from storage data
		var match;
                var l = domains.length; // speed hack for loop 
		for (var i = 0; i < l ; i++){
                        match = new RegExp('.*' + domains[i] + '.*');
			if (match.test(tab.url)) { 
					pass=true;
					break;
			}
		}
	     if (pass) {
                Link = tab.url;

            } else {
                Link = (this.linksHash[this.activeTabId])[0];
            }
            
	     chrome.runtime.sendNativeMessage("com.awlnx.video_connector", {
                player: items.Player,
                link: Link
            });

        }.bind(this));

    }.bind(this));


};
MediaGrabber.prototype.links = function() {
    return this.linksHash[this.activeTabId];
};

//**start**//
//
MediaEngine = new MediaGrabber();

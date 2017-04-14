// Media Grabber namespace//

function MediaGrabber() {
    this.linksHash = {};
    this.type = [];
    this.activeTabId = undefined;
    this.activeStorage= {};
    this.listener = function(details) {
        if (this.filter(details.responseHeaders)) {
            if (this.linksHash[this.activeTabId].indexOf(details.url) < 0){
                this.linksHash[this.activeTabId].push(details.url);
		this.evalIconState();
	    }

        }
    };
chrome.storage.local.get({
	Player: null,
	Domains:null,
	FileTypes:[],
	}, function(items) {
		if (items.Player === null || items.Domains === null) {
			chrome.runtime.openOptionsPage();
		}
		else {
			this.activeStorage = items;
			this.setFilter(items.FileTypes);
                    this.startGrabber();
		}

	}.bind(this));

chrome.storage.onChanged.addListener(function(changes,areaname) {
	chrome.storage.local.get({
		Player:null,
		Domains:null,
		FileTypes:[]
	}, function(items) {
		this.activeStorage = items;
		this.setFilter(items.FileTypes);
		console.log(this);
	});
});










}



MediaGrabber.prototype.setFilter = function(arr) {
    this.type = arr;
    this.type.sort();
};
MediaGrabber.prototype.filter = function(headers) {
	var binIndex = function(arr,comparison) {

            var min = 0;
            var max = arr.length -1;
            var index;
        
            while(min <= max) {
                index = Math.floor( (max + min)/2 );
        	if (arr[index] == comparison) {
        		return index;
        	}
        	if (arr[index] < comparison) {
        		min = index +1;
        	}
        	if (arr[index] > comparison) {
        		 max = index -1;
        	}
        
            }
        
            return -1; 
        
        
	};
    var contentType = headers.find(function(dict) {
        return (dict.name === 'Content-Type' || dict.name === 'content-type'); //sometimes returns undefined;
    }.bind(this));
    if (contentType === undefined) {
	    return false;
    }
    if (binIndex(this.type,contentType.value) != -1){
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
MediaGrabber.prototype.startGrabber = function() {

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
		console.log(this.activeStorage);
		var domains = this.activeStorage.Domains; // passed into fuction from storage data
		console.log(domains);
		var match;
                var l = domains.length; 
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
                player: this.activeStorage.Player,
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
//MediaEngine.setFilter(['video/mp4', 'video/x-flv', 'video/webm']);

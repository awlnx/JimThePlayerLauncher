//taken from default optionsv2 chrome page
//https://developer.chrome.com/extensions/optionsV2

 //options namespace object
var options = function () {
    this.passThroughDomains= [];
};

options.prototype.saveOptions = function () {
    var playerPath= document.getElementById('player_path').value;
    var updateStatus =  function() {
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '';
        }, 750);
        };
    chrome.storage.local.set({
    Player: playerPath,
    });
    chrome.storage.local.set({
    Domains: this.passThroughDomains
    }); 
    updateStatus();
};


options.prototype.restoreOptions = function ()  {
    chrome.storage.local.get({
    Player: 'mpv'
    }, function(items) {
            document.getElementById('player_path').value = items.Player;
    });

    chrome.storage.local.get({
    Domains: null 
    },function(items) {
          if (items.Domains=== null) {
              items.Domains = ['youtube','twitch','dailymotion'];
     }
     this.passThroughDomains = items.Domains;

     this.renderBipass();
    }.bind(this));
};

options.prototype.removeDocElement = function (elm){
    row = elm.parentNode;
    while(row.firstChild) {
    	row.removeChild(row.firstChild);
    }
    this.removeDomainFromArray(row.id);
};



options.prototype.removeDomainFromArray = function (elmId) {
	var n = parseInt(elmId.match(/\d/).join(),10 );
	this.passThroughDomains.splice(n,1);
	this.renderBipass();
};


options.prototype.addBipass = function (){
//bipass-textbox
    var bipass = document.getElementById('bipass');
    if (/\S/.test(bipass.value) && bipass.value.length !== 0) {
    	this.passThroughDomains.push(bipass.value);
    	bipass.value = '';
    	this.renderBipass();
    }
};

options.prototype.renderBipass = function()  {
    //clean house
    var domainTable = document.getElementById('bipassTable');
    while (domainTable.firstChild) {
        domainTable.removeChild(domainTable.firstChild);
    }
    this.passThroughDomains.sort();
    
    //render
    
    for(var i=0; i < this.passThroughDomains.length;i++) {
    var row = document.createElement('div');
    row.setAttribute('id','bipassrow' + i );
    row.setAttribute('class','row');
    var cell = document.createElement('div');
    cell.setAttribute('id','bipassCell' + i);
    cell.setAttribute('class','cell');
    
    var button = document.createElement('div');
    button.setAttribute('id', 'buttoncell' + i);
    button.setAttribute('class','cell');
    var me = this;
    button.addEventListener('click', function() {
    	
    	me.removeDocElement(this);
    
    
    
    });
    button.appendChild(document.createElement('button'));
    button.firstChild.appendChild(document.createTextNode("x"));
    button.firstChild.setAttribute('class','btn');
    
    cell.appendChild(document.createTextNode(this.passThroughDomains[i]));
        row.appendChild(cell);
        row.appendChild(button);	
    domainTable.appendChild(row);
    
    
    }
    
    
    
};
var opts = new  options();


    document.addEventListener('DOMContentLoaded',opts.restoreOptions.bind(opts));
    document.getElementById('save').addEventListener('click',opts.saveOptions.bind(opts));
    document.getElementById('add-bipass').addEventListener('click',opts.addBipass.bind(opts));

















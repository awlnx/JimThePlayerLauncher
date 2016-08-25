//taken from default optionsv2 chrome page
//https://developer.chrome.com/extensions/optionsV2

// Saves options to chrome.storage.sync.

var options = function () {
    this.list= [];






    this.save_options = function () {

      var updatestatus =  function() {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
          status.textContent = '';
        }, 750);
      };

      var path= document.getElementById('player_path').value;
      chrome.storage.local.set({
        Player: path,
      });
        chrome.storage.local.set({
	Domains: this.list
	}); 
	updatestatus();

   }.bind(this);


    // Restores select box and checkbox state using the preferences
    // stored in chrome.storage.
    this.restore_options = function ()  {
      // Use default value color = 'red' and likesColor = true.
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
         //force pass by ref
	 this.list = items.Domains;
         this.render_bipass();
        }.bind(this));
    }.bind(this);

    
    this.removeDocElement = function (elm){
    	row = elm.parentNode;
    	while(row.firstChild) {
    		row.removeChild(row.firstChild);
    	}
	this.removeDomainFromArray(row.id);
	}.bind(this);


		
	this.removeDomainFromArray = function (elmId) {
		var n = parseInt( elmId.match(/\d/).join(),10 );
		this.list.splice(n,1);
		this.render_bipass();
	
	
	
    };



    this.add_bipass = function (){
    	//bipass-textbox
    	var bipass = document.getElementById('bipass');
    	if (/\S/.test(bipass.value) && bipass.value.length !== 0) {
                this.list.push(bipass.value);
                bipass.value = '';
                this.render_bipass();
    	}
    }.bind(this);




    this.render_bipass = function()  {
        //clean house
        var domainTable = document.getElementById('bipassTable');
        while (domainTable.firstChild) {
    	    domainTable.removeChild(domainTable.firstChild);
        }
	this.list.sort();
        //render
        
        for(var i=0; i < this.list.length;i++) {
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
    
    	cell.appendChild(document.createTextNode(this.list[i]));
            row.appendChild(cell);
            row.appendChild(button);	
    	domainTable.appendChild(row);
    
    
        }
    
    
    
    }.bind(this);


};


var opts = new  options();


    document.addEventListener('DOMContentLoaded',opts.restore_options);
    document.getElementById('save').addEventListener('click',opts.save_options);
    document.getElementById('add-bipass').addEventListener('click',opts.add_bipass);

















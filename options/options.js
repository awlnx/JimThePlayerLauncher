var options = {
    passThroughDomains: [],
    filetypes: [],
    PlayerPath: document.getElementById('player_path'),
    save: function () {
        var domains = this.passThroughDomains;
        var fileTypes = this.filetypes;
        var updatestatus = function () {
            var statusArea = document.getElementById('status');
            statusArea.textContent = 'Options saved.';
            setTimeout(function () {
                status.textContent = '';
            }, 750);
        };
        chrome.storage.local.set({
            Player: this.PlayerPath.value,
            Domains: domains,
            FileTypes: fileTypes,
        });
        updatestatus();
    },
    restore: function () {
        chrome.storage.local.get({
            Player: 'mpv',
            Domains: ['youtube', 'twitch', 'dailymotion'],
            FileTypes: [],
        }, function (items) {
            this.PlayerPath.value = items.Player;
            this.passThroughDomains = items.Domains;
            this.filetypes = items.FileTypes;
            var domains = new options.filterTable('bipass', 'addBipass', 'bipassTable', this.passThroughDomains);
            var fileTypes = new options.filterTable('files', 'addFileTypes', 'filetypeTable', this.filetypes);

            document.getElementById('addBipass').addEventListener('click', function () {
                this.passThroughDomains = domains.getFilters();
            }.bind(this));
        }.bind(this));


    },
    filterTable: function (textboxStr, buttonStr, divStr, defaultValues) {
        this.textbox = document.getElementById(textboxStr);
        this.button = document.getElementById(buttonStr);
        this.div = document.getElementById(divStr);
        this.filters = defaultValues;
        this.getFilters = function () {
            return this.filters;
        };
        this.makeTable = function () {
            this.filters.forEach(function (element) {
                var row = document.createElement('div');
                var text = document.createElement('div');
                var buttonDiv = document.createElement('div');
                row.setAttribute('class', 'row');
                text.setAttribute('class', 'cell');
                buttonDiv.setAttribute('class', 'cell');
                buttonDiv.className = 'filterTable';
                buttonDiv.appendChild(document.createElement('button'));
                var button = buttonDiv.firstChild;
                button.className = 'filterTable';
                buttonDiv.firstChild.appendChild(document.createTextNode("x"));
                text.appendChild(document.createTextNode(element));
                button.addEventListener('click', function () {
                    var parentofRow = button.parentNode.parentNode;
                    var row = button.parentNode;
                    this.filters.splice(this.filters.indexOf(row.firstChild), 1);
                    parentofRow.removeChild(row);
                }.bind(this));

                row.appendChild(text);
                row.appendChild(button);
                this.div.appendChild(row);
            }, this);
        };
        if (this.filters.length !== 0) {
            this.makeTable();
        }
        this.button.addEventListener('click', function () {
            if (/\S/.test(this.textbox.value) && this.textbox.value.length !== 0) {
                this.filters.push(this.textbox.value);
                this.textbox.value = '';
                this.filters.sort();
                while (this.div.firstChild) {
                    this.div.removeChild(this.div.firstChild);
                }
                this.makeTable();

            }
        }.bind(this));

    },


};
// event attach
document.addEventListener('DOMContentLoaded', options.restore());
document.getElementById('save').addEventListener('click', function () {
    options.save();
});

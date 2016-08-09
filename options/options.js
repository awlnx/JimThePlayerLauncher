
//taken from default optionsv2 chrome page
//https://developer.chrome.com/extensions/optionsV2

// Saves options to chrome.storage.sync.
function save_options() {
  var path= document.getElementById('player_path').value;
  chrome.storage.local.set({
    Player: path,
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.local.get({
    Player: 'mpv'
  }, function(items) {
    document.getElementById('player_path').value = items.Player;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);


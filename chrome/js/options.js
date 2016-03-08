chrome.storage.sync.get(["credentials_user", "credentials_pass"], function(items){

  // LOGIN
  var github = new Github({
    "username": items.credentials_user,
    "password": items.credentials_pass,
    "auth": "basic"
  });

  // Store the user
  var user = github.getUser();

  // Get the user's repos.
  user.repos(function(err, repos){
    for(var i in repos){
      var repo = repos[i];
      $("#issue_repository").append(new Option(repo.full_name,repo.full_name, false, false));
    }
    restore_options();
  });

  // Set Repo if available
  // setTimeout(function(){restore_options();}, 2000);
});

function save_options() {
  var repo = document.getElementById('issue_repository').value;
  chrome.storage.sync.set({
    currentRepo: repo,
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

function restore_options() {
  chrome.storage.sync.get({
    currentRepo: '',
  }, function(items) {
    var option_html = $('#issue_repository')
    option_html.val(items.currentRepo);
  });
}

// document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);

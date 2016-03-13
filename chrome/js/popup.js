$(function(){
  document.querySelector('#go-to-options').addEventListener('click', function() {
    if (chrome.runtime.openOptionsPage) {
      // New way to open options pages, if supported (Chrome 42+).
      chrome.runtime.openOptionsPage();
    } else {
      // Reasonable fallback.
      window.open(chrome.runtime.getURL('options.html'));
    }
  });

  chrome.storage.local.get(["credentials_user", "credentials_pass", "currentRepo"], function(items){
    if(items.hasOwnProperty("credentials_user") &&
    items.hasOwnProperty("credentials_pass")){
      $("#login_form").addClass("hide");
      $("#issue_form").removeClass("hide");

      if (items.hasOwnProperty("currentRepo")) {
        $("#extension_title").text("Submit to "+items.currentRepo);
      } else {
        // PROMPT TO SELECT
      }

      $("#issue_body").markdown({fullscreen: {enable:false},
        onShow: function(e){
          chrome.tabs.query({'active': true, 'currentWindow': true}, function (tabs) {
            var tab = tabs[0];
            e.setContent("Source: " + "["+tab.title+"]"+"("+tab.url+")");
          });
        }
      });

      var github = new Github({
        "username": items.credentials_user,
        "password": items.credentials_pass,
        "auth": "basic"
      });
      var user = github.getUser();
      // user.repos(function(err, repos){
      //   for(var i in repos){
      //     var repo = repos[i];
      //     $("#issue_repository").append(new Option(repo.full_name,
      //       repo.full_name, false, false));
      //     }
      //   });
        // $("#issue_repository").change(function(e){
        //   $("#issue_repository option:selected").each(function () {
      var repo_name = items.currentRepo;
      if(repo_name !== "-"){
        var repo = github.getRepo(repo_name.split("/", 2)[0],
        repo_name.split("/", 2)[1]);

        repo.contributors(function(err, assignees){
          var assi = [];
          for(var i in assignees){
            assi.push(assignees[i].author.login);
          }
          $('#issue_assignee').typeahead({source:assi});
        });
        // repo.listMilestones(function(err, milestones){
        //   for(var i in milestones){
        //     var mile = milestones[i];
        //     $("#issue_milestone").append(new Option(mile.title,
        //       mile.number, false, false));
        //     }
        //   });
      }
          //   });
          // });

      $("#issue_create").click(function(event){
        // var repo_name = $("#issue_repository option:selected:first").val();

        var data = {
          title: $("#issue_title").val() != "" ? $("#issue_title").val() : "New Issue",
          body: $("#issue_body").val()
        };
        if($("#issue_assignee").val() !== ""){
          data.assignee = $("#issue_assignee").val();
        }
        // if($("#issue_labels").val() !== "" &&
        // $("#issue_labels").val().split(" ").length > 0){
        //   data.labels = $("#issue_labels").val().split(" ");
        // }
        // if ($("#issue_milestone option:selected:first").val() !== undefined){
        //     data.milestone = $("#issue_milestone option:selected:first").val();
        // }

        var issue = github.getIssues(repo_name.split("/", 2)[0],
        repo_name.split("/", 2)[1]);
        issue.create(data, function(err, result){
          if(err !== null){
            $("#confirmation_status").text("Fail!");
          }
          else {
            $("#confirmation_status").html(
              "Success! See <a target=\"_blank\" href=\""+
              result.html_url+"\">here.</a>");
            }
          });

          $("#issue_form").addClass("hide");
          $("#confirmation_page").removeClass("hide");
          event.preventDefault();
          return false;
        });
      } else {
        $("#login_form").removeClass("hide");
        $("#issue_form").addClass("hide");

        $("#credentials_save").click(function(event){
          chrome.storage.local.set({
            "credentials_user": $("#credentials_user").val(),
            "credentials_pass": $("#credentials_pass").val()
          }, function(){
            $("#login_form").addClass("hide");
            $("#issue_form").removeClass("hide");
          });
          event.preventDefault();
          return false;
        });
      }
    });
  });

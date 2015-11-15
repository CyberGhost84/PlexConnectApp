/*
 Copyright (C) 2015 Baa. All rights reserved.
 See LICENSE.txt for this sample’s licensing information
 */

/*
 discover
 */
discover = function(event) {  // todo: show spinner, number of PMSs found
  var elem = event.target;
  
  var docSpinner = createSpinner(TEXT("Connecting to your Plex Media Servers..."));
  navigationDocument.pushDocument(docSpinner);
  
  var docString = swiftInterface.discover("Settings");
  var parser = new DOMParser();
  var doc = parser.parseFromString(docString, "application/xml");

  navigationDocument.popDocument();
  
  // update view
  var newElem = doc.getElementById(elem.getAttribute("id"));
  if (elem && newElem) {
    elem.innerHTML = newElem.innerHTML;
  }
}


/*
 myPlex sign in/out
 */
myPlexSignInOut = function(event)
{
  var _myPlexElem = event.target;
  if (!_myPlexElem) return;  // error - element not found
  
    getLabel = function(elem, label)
    {
        var elem_label = elem.getElementByTagName(label);
        if (!elem_label) return '';  // error - element not found
        return(elem_label.textContent)
    };
    
    setLabel = function(elem, label, text)
    {
        var elem_label = elem.getElementByTagName(label);
        if (!elem_label)
        {
            elem_label = document.makeElementNamed(label);
            elem.appendChild(elem_label);
        }
        elem_label.textContent = text;
    };
  
    updateWithDoc = function(doc) {
      // update MyPlexSignInOut
      var new_elem = doc.getElementById('MyPlexSignInOut');  // listItemLockup // _myPlexElem.getAttribute("id")
      if (new_elem) {
        _myPlexElem.innerHTML = new_elem.innerHTML;
      }
  
      // update Discover
      var elem = _myPlexElem.ownerDocument.getElementById('Discover');
      var new_elem = doc.getElementById('Discover');
      if (elem && new_elem) {
        elem.innerHTML = new_elem.innerHTML;
      }
      
      /*
      // update PlexHome
      var elem = document.getElementById('PlexHomeUser');
      var new_elem = doc.getElementById('PlexHomeUser');
      new_elem.removeFromParent();
      elem.parent.replaceChild(elem, new_elem);
      */
    };
  
    SignIn = function()
    {
        var _username = "";
        var _password = "";
      
        createTextEntryPage = function(type, title, description, callback_submit, defaultvalue)
        {
          var docString = `<?xml version="1.0" encoding="UTF-8" ?>
<document>
  <formTemplate>
    <banner>
      <!--img src="path to images on your server/Car_Movie_800X400.png" width="800" height="400"/-->
      <title>${title}</title>
      <description>${description}</description>
    </banner>
    <textField>${type}</textField>
    <footer>
      <button>
        <text>${TEXT("Submit")}</text>
      </button>
    </footer>
  </formTemplate>
</document>`
          var parser = new DOMParser();
          var doc = parser.parseFromString(docString, "application/xml");
          
          var button = doc.getElementByTagName("button");
          button.addEventListener("select", callback_submit);
          
          return doc
        };
        
        gotUsername = function(event)
        {
            var elem = event.target;
          
            var doc = navigationDocument.documents[navigationDocument.documents.length-1];
            var textField = doc.getElementByTagName("textField")

            _username = textField.getFeature("Keyboard").text;  // get the textField's Keyboard element
            if (!_username) {  // empty string - try again
                var docNext = createTextEntryPage('user Id', TEXT("MyPlex Username"), TEXT("To sign in to MyPlex, enter your Email address, username or Plex forum username."), gotUsername, null);
            } else {  // todo: hide password while entering
                var docNext = createTextEntryPage('password', TEXT("MyPlex Password"), TEXT("Enter the MyPlex password for {0}.").format(_username), gotPassword, null);
            }
          
          navigationDocument.popDocument();  // fades through Settings.xml
          navigationDocument.pushDocument(docNext);
          //navigationDocument.replaceDocument(docPwd, doc);  // todo: doesn't work. keyboard is dead. need to re-attach keyboard feature to new doc?
        };
        
        gotPassword = function(event)
        {
          var elem = event.target;

          var doc = navigationDocument.documents[navigationDocument.documents.length-1];
          var textField = doc.getElementByTagName("textField")
          
          _password = textField.getFeature("Keyboard").text;  // get the textField's keyboard element
          if (!_password) {  // empty string - try again
              var docNext = createTextEntryPage('password', TEXT("MyPlex Password"), TEXT("Enter the MyPlex password for {0}.").format(_username), gotPassword, null);
            
              navigationDocument.popDocument();  // fades through Settings.xml
              navigationDocument.pushDocument(docNext);
              return;
          }

          var docSpinner = createSpinner(TEXT("MyPlex: Signing in..."));
          navigationDocument.replaceDocument(docSpinner, doc);
          
          doLogin();
        };
        
        doLogin = function()
        {
            // login and get new settings page
            var docString = swiftInterface.signInUserPasswordView(_username, _password, "Settings");
            var parser = new DOMParser();
            var doc = parser.parseFromString(docString, "application/xml");

            // update view
            updateWithDoc(doc);
          
            // check success, signal failed
            //var elem = document.getElementById('MyPlexSignInOut');
            var username = getLabel(_myPlexElem, 'decorationLabel');
            if (username)
            {
                console.log("MyPlex Login - done");
                navigationDocument.popDocument();  // remove spinner
            }
            else
            {
                //setLabel(_myPlexElem, 'decorationLabel', _failed);
                console.log("MyPlex Login - failed");
              
                var doc = navigationDocument.documents[navigationDocument.documents.length-1];
                var docAlert = createAlert("MyPlex", TEXT("Sign in failed."));
                navigationDocument.replaceDocument(docAlert, doc);  // remove spinner, show error page
            }
        };
        
        setLabel(_myPlexElem, 'decorationLabel', '');
        var doc = createTextEntryPage('user Id', TEXT("MyPlex Username"), TEXT("To sign in to MyPlex, enter your Email address, username or Plex forum username."), gotUsername, null);
        navigationDocument.pushDocument(doc);
    };
    
    
    SignOut = function()
    {
        doLogout = function()
        {
            // logout and get new settings page
            var docString = swiftInterface.signOut("Settings");
            var parser = new DOMParser();
            var doc = parser.parseFromString(docString, "application/xml");
          
            // update view
            updateWithDoc(doc);
          
            console.log("MyPlex Logout - done");
        };
      
        setLabel(_myPlexElem, 'decorationLabel', '');
        doLogout();
    };
  

    var username = getLabel(_myPlexElem, 'decorationLabel');
    
    if (username == '')
    {
        SignIn();
    }
    else
    {
        SignOut();
    }
};

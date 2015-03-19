/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var Vector2 = require('vector2');
var ajax = require('ajax');
var Settings = require('settings');
var Accel = require('ui/accel');
var json;
var connectionName;
Settings.data('user', null);
Settings.data('uid', null);

var isType = function(data, type){
  for(var i in data){
    if(data[i].type == type){return true;}
  }
  return false;
};

var main = new UI.Card({
  title: 'Tapp',
  body: 'Bump with any user!'
});

var menu = new UI.Menu({
  sections: [{
    items: [{
      title: 'Facebook',
      subtitle: 'Add on facebook'
    }, {
      title: 'Email',
      subtitle: 'Send email to contact'
    }]
  }]
});
menu.on('select', function(e) {
  console.log('Section item #' + e.itemIndex);
  if(e.itemIndex === 0){
    main.body("Sent " + e.item.title);
    main.show();  
  }else{
  main.body("Sent " + e.item.title + "@ " + e.itemIndex);
  main.show();
  }
});

main.show();

var card = new UI.Card();
card.title('Tapp');
card.body('Press select to confim bump');
card.on('click', 'select', function(e) {
  ajax(
    {
      url: 'https://bump-server.herokuapp.com/serverEvents?type=confirmed&uid='+Settings.data('uid')+'&sessionId='+json.sessionId
    }
  );  
  var signedIn = setInterval(function(){
      ajax(
        {
          url: 'https://kvtest.firebaseio.com/clients/'+Settings.data('uid')+'.json',
          type: 'json'
        },
        function(data) { 
          if(data !== null && isType(data, "session_confirmed")) { 
            main.body('Connected with ' + connectionName + ' . Open app for more options.'); 
            main.show();
            clearInterval(signedIn);
          }else{console.log('session nope');}
      },
      function(error) {
        console.log('The ajax request failed: ' + error);
      }
    );
  }, 1000);
});

var user = Settings.data('user');

if(user == null) {
  var validateCode = Math.floor(Math.random()*10000);
  console.log(validateCode);
  main.body('Type \"' + validateCode + '\" on your phone' );
  ajax(
    {
      url: 'https://bump-server.herokuapp.com/registerCode?code='+validateCode+''
    }
  );
  Settings.data('user', validateCode);
  console.log(Settings.data('user'));
  var signedIn = setInterval(function(){
  ajax(
    {
      url: 'https://kvtest.firebaseio.com/authCodes/'+Settings.data('user')+'.json',
      type: 'json'
    },
    function(data) {
      console.log('watching for uid');  
      if(data !=  "" ) {
            Settings.data('uid', data);
            ajax(
              {
                url: 'https://bump-server.herokuapp.com/clearUid/'+Settings.data('uid')
              }
            );
            main.body('You have connected to your phone');
            clearInterval(signedIn);
        }
      },
    function(error) {
      console.log('The ajax request failed: ' + error);
    }
  );
  }, 1000);
} else {
  var signedIn = setInterval(function(){
  ajax(
    {
      url: 'https://kvtest.firebaseio.com/authCodes/'+Settings.data('user')+'.json',
      type: 'json'
    },
    function(data) {
      console.log('watching for uid');  
      if(data !=  "" ) {
            Settings.data('uid', data);
            ajax(
              {
                url: 'https://bump-server.herokuapp.com/clearUid/'+Settings.data('uid')
              }
            );
            main.body('You have connected to your phone');
            clearInterval(signedIn);
        }
      },
    function(error) {
      console.log('The ajax request failed: ' + error);
    }
  );
  }, 1000);
}

//Accelerometer
Accel.init();
Accel.on('tap', function(e) {
   if(Settings.data('uid') != null || Settings.data('uid') != "") { 
    var dateTime = String(Math.floor(new Date()/1000));
    ajax(
      {
        url: 'https://bump-server.herokuapp.com/serverEvents?type=bump&uid='+Settings.data('uid')+'&timestamp='+dateTime
      }
    );
    var signedIn = setInterval(function(){
      ajax(
        {
          url: 'https://kvtest.firebaseio.com/clients/'+Settings.data('uid')+'.json',
          type: 'json'
        },
        function(data) { 
          if(data !== null  && isType(data, "confirm_request")) { 
            json = data[Object.keys(data)];
            connectionName =  data[Object.keys(data)].otherName;
            console.log('From user ' + data[Object.keys(data)].otherName);
            card.body('Confirm request from user ' + data[Object.keys(data)].otherName);
            //Vibe.vibrate('double');
            card.show();
            clearInterval(signedIn);
           }else{console.log('nope');}
        },
        function(error) {
          console.log('The ajax request failed: ' + error);
        }
      );
      }, 1000);
   }else {
     main.body('You are not connected to your phone.'+'Type \"' + Settings.data('user') + '\" on your phone');
   }
});

main.on('click', 'up', function(e) {
  menu.show();
});

main.on('click', 'select', function(e) {
  var wind = new UI.Window();
  var textfield = new UI.Text({
    position: new Vector2(0, 50),
    size: new Vector2(144, 30),
    font: 'gothic-24-bold',
    text: 'Text Anywhere!',
    textAlign: 'center'
  });
  wind.add(textfield);
  Settings.data('user', null);
  Settings.data('uid', null);
  wind.show();
});

main.on('click', 'down', function(e) {
  card.show();
});

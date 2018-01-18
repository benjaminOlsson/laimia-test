  // Global variables used trough out the page
  var lng, lat, coords;
  var mainArea = document.getElementById('mainArea');
  var placesDiv = document.getElementById('places');
  var listOfPlaces = 0;

  /****************************************************/
  /*** Getting the users coords when the page loads ***/
  /****************************************************/

  // Remove the add form when clicking on the background div
  function clearForm(){
    var background = document.getElementById('addBackground');
    var form = document.getElementById('addPos');
    background.outerHTML = '';
    form.outerHTML = '';
    delete background;
    delete form;
  };

  // Getting the users coords
  function getLocation(){
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(showPosition);
    }
  }
  function showPosition(position){
    lng = position.coords.longitude;
    lat = position.coords.latitude;
  };
  getLocation();

  /***************/
  /*** The Map ***/
  /***************/
  function initMap(markers, places, zoom){
    var ready = 0;
    if(markers == undefined){
      delete markers;
    }
    if(typeof(lat) !== 'undefined' && typeof(lng) !== 'undefined'){
      ready = 1;
      var map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: lat, lng: lng},
        zoom: zoom,
        disableDoubleClickZoom: true
      });
    }
    if(zoom === undefined){
      zoom = 3;
    }
    if(ready === 1){
    map.addListener('dblclick', function(e){
      placeMarker(e.latLng, map);
    });
    var user = new google.maps.Marker({
      map: map,
      position: {lat: lat, lng: lng},
      icon: 'https://maps.google.com/mapfiles/kml/shapes/man.png',
      title: 'You are here!'
    });
    if(places !== undefined){
      markers = JSON.parse(markers);
      for(let i = 0; i < markers.length; i++){
        addMarkers(map, markers[i], places[i], places[i].title, i);
      }
    }
    }
  };

  /***********************/
  /*** When page loads ***/
  /***********************/
    // It takes about 3 seconds to load the users coords so we wait for them and then we load the map
  window.onload = function(){
    var getCoords = setInterval(function(){
      // When we get the coords we load the map and and the interval
      if(typeof(lng) !== 'undefined' && typeof(lat) !== 'undefined'){
        listAll();
        clearInterval(getCoords);
      }
    }, 100);
  };
  // Add markers from db via ajax
  var addMarkers = function(map, marker, place, name, i){
      var button = 'button' + i;
        var contentString =
        "<div class='markerInfo'>" +
          "<h3 class='markerHeader'>"+
            place.title +
          "</h3>"+
          "<p class='markerDescription'>"+
            place.description+
          "</p>"+
          "<table class='markerTable'>"+
            "<tr>"+
              "<td>"+
                "<p class='markerTableP'>"+
                  "Monday - Thursday: "+
                "</p>"+
              "</td>"+
              "<td>"+
                "<p class='markerTableP'>"+
                  place.open.weekdays+
                "</p>"+
              "</td>"+
            "</tr>"+
            "<tr>"+
              "<td>"+
                "<p class='markerTableP'>"+
                  "Friday: "+
                "</p>"+
              "</td>"+
              "<td>"+
                "<p class='markerTableP'>"+
                  place.open.friday+
                "</p>"+
              "</td>"+
            "</tr>"+
            "<tr>"+
              "<td>"+
                "<p class='markerTableP'>"+
                  "Saturday: "+
                "</p>"+
              "</td>"+
              "<td>"+
                "<p class='markerTableP'>"+
                  place.open.saturday+
                "</p>"+
              "</td>"+
            "</tr>"+
            "<tr>"+
              "<td>"+
                "<p class='markerTableP'>"+
                  "Sunday: "+
                "</p>"+
              "</td>"+
              "<td>"+
                "<p class='markerTableP'>"+
                  place.open.sunday+
                "</p>"+
              "</td>"+
            "</tr>"+
          "</table>"+
          "<button id='" + button + "' class='markerDelete'>Delete place"+
          "</button>"+
        '</div>';
        var infowindow = new google.maps.InfoWindow({
          content: contentString
        });
      name = new google.maps.Marker({
        position: {lat: parseFloat(marker.lat), lng: parseFloat(marker.lng)},
        map: map,
      });
        name.addListener('click', function(){
          infowindow.open(map, name);
        document.getElementById(button).addEventListener('click', function(){
          removeAPlace(place.title)
        });
        });
      }
  /***************************************/
  /*** DIV on the left side of the map ***/
  /***************************************/
  // Function for removing a place
  function removeAPlace(place){
    var data = {
      title: place,
    }
    var connect = new XMLHttpRequest();
    var urlEncodedData = "";
    var urlEncodedDataPairs = [];
    var name;

    for(name in data) {
      urlEncodedDataPairs.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]));
    }
    urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');

    connect.addEventListener('load', function(event) {
      if(listOfPlaces === 0){
        listAll();
      }else if(listOfPlaces === 1){
        listFav();
      }else if(listOfPlaces === 2){
        settings();
      }
    });
    connect.addEventListener('error', function(event) {
      alert('Oups! Something goes wrong.');
    });

    connect.open('DELETE', 'http://localhost:8080/api/places/' + place);
    connect.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    connect.send(urlEncodedData);
  }

  // Listing all places in the div on the left of the map
  function listAll(){
    removePlaces();
    listOfPlaces = 0;

    var buttonUsed = document.getElementById('allPlaces');
    var button1 = document.getElementById('settings')
    var button2 = document.getElementById('favPlaces');
    // changing the buttons colors so that the user know what they use
    if(button1.style.backgroundColor !== 'lightgray'){
      button1.style.backgroundColor = 'lightgray';
    }
    if(button2.style.backgroundColor !== 'lightgray'){
      button2.style.backgroundColor = 'lightgray';
    }
    buttonUsed.style.backgroundColor = 'white';
    getPlaces();
  }

  // Listing just the favorite places of a user
  function listFav(){
    removePlaces();
    listOfPlaces = 1;
    // accessing the buttons in the div
    var buttonUsed = document.getElementById('favPlaces');
    var button1 = document.getElementById('allPlaces')
    var button2 = document.getElementById('settings');
    // changing the buttons colors so that the user know what they use
    if(button1.style.backgroundColor !== 'lightgray'){
      button1.style.backgroundColor = 'lightgray';
    }
    if(button2.style.backgroundColor !== 'lightgray'){
      button2.style.backgroundColor = 'lightgray';
    }
    buttonUsed.style.backgroundColor = 'white';
    // Get data from api/mongo.
    // All the places and the current user
    var connect = new XMLHttpRequest();
    var places, user, markers = [], place = [];
    connect.onreadystatechange = function(){
      if(this.readyState == 4 && this.status == 200){
        // Store the places in a variable called places
        places = JSON.parse(this.response);
        var connect2 = new XMLHttpRequest();
        connect2.onreadystatechange = function(){
          if(this.readyState == 4 && this.status == 200){
            // Store the user in a variable called user
            user = JSON.parse(this.response);
            // Loop trough all places and only show the ones that match the id of the ids in users favorites
            for(let i = 0; i < user.favorites.length; i++){
              for(let j = 0; j < places.length; j++){
                if(user.favorites[i] === places[j].title){
                  place.push(places[j]);
                  var day = new Date().getDay();
                  var times;
                  if(day > 0 && day < 5){
                    times = places[i].open.weekdays;
                  }else if(day === 5){
                    times = places[i].open.friday;
                  }else if(day === 6){
                    times = places[i].open.saturday;
                  }else if(day === 0){
                    times = places[i].open.sunday;
                  }
                  listPlaces(places[j].title, places[j].description, times);
                  markers.push({lat: places[i].coords.lat, lng: places[i].coords.lng});
                }
                initMap(JSON.stringify(markers), place, 10);
              }
            }
          }
        }
        // Connectiong to the single user api by GET
        connect2.open('GET', 'http://localhost:8080/api/users/' + userName);
        connect2.send();
      }
    }
    // Connectiong to the api for all the places by GET
    connect.open('GET', 'http://localhost:8080/api/places');
    connect.send();
  }

  // Settings
  function settings(){
    removePlaces();
    listOfPlaces = 2;
    // accessing the buttons in the div
    var buttonUsed = document.getElementById('settings');
    var button1 = document.getElementById('allPlaces')
    var button2 = document.getElementById('favPlaces');
    // changing the buttons colors so that the user know what they use
    if(button1.style.backgroundColor !== 'lightgray'){
      button1.style.backgroundColor = 'lightgray';
    }
    if(button2.style.backgroundColor !== 'lightgray'){
      button2.style.backgroundColor = 'lightgray';
    }
    buttonUsed.style.backgroundColor = 'white';
    var connect = new XMLHttpRequest();
    connect.onreadystatechange = function(){
      if(this.readyState == 4 && this.status == 200){
        var user = JSON.parse(this.response);
        var table = document.createElement('table');
        table.id = 'settingsTable';
        placesDiv.appendChild(table);
          for(key in user){
            if(key !== 'password' && key !== '_id'){
              addToTable(table, key, user[key]);
            }
          }
          var sendButton = document.createElement('button');
          sendButton.id = 'sendSettings';
          sendButton.innerText = 'Change Settings';
          placesDiv.appendChild(sendButton);

          document.getElementById('sendSettings').addEventListener('click', function(){
            var settings = {
              username: document.getElementById('username').value,
              firstName: document.getElementById('firstName').value,
              lastName: document.getElementById('lastName').value,
              age: document.getElementById('age').value,
              gender: document.getElementById('gender').value,
              address: document.getElementById('address').value,
              city: document.getElementById('city').value,
              postCode: document.getElementById('postCode').value,
              email: document.getElementById('email').value,
              method: 'update'
            }
            sendTheSettings(settings);
          });
        }
      }
    connect.open('GET', 'http://localhost:8080/api/users/' + userName);
    connect.send();
  };

  // Function for sending the changed settings to the database
  function sendTheSettings(data){
    var connect = new XMLHttpRequest();
    var urlEncodedData = "";
    var urlEncodedDataPairs = [];
    var id;
    console.log(data);
    for(id in data){
      urlEncodedDataPairs.push(encodeURIComponent(id) + '=' + encodeURIComponent(data[id]));
    }
    urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');
    connect.addEventListener('load', function(event) {
        listAll();
    });
    connect.addEventListener('error', function(event) {
      alert('Oups! Something goes wrong.');
    });

    connect.open('PUT', 'http://localhost:8080/api/users/' + userName);
    connect.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    connect.send(urlEncodedData);
  }

  // Add a table row and table data to settings table
  function addToTable(table, title, value){
    // Adding a linebreak between the tags and the favorites
    if(typeof(value) === 'object'){
      var br = document.createElement('br');
      table.appendChild(br);
    }
    // First row
      var tr = document.createElement('tr');
      table.appendChild(tr);
    // Table data in the first row
      var dataElement = document.createElement('td');
      tr.appendChild(dataElement);
    // Title
      var dataTitle = document.createElement('p');
      dataTitle.className = 'settingsTitle';
      dataTitle.innerText = title;
      dataElement.appendChild(dataTitle);
    // Table second table data in first row
      var dataElement2 = document.createElement('td');
      dataElement2.className = 'dataValue'
      tr.appendChild(dataElement2);
    // If the type of the data is 'string' we do this
    if(typeof(value) === 'string'){
      var dataInput = document.createElement('input');
      dataInput.className = 'settingsInput';
      dataInput.value = value;
      dataInput.id = title;
      dataElement2.appendChild(dataInput);
    // If the data is 'object' aka array then we use this
      // Used for the tags and favorites
    }else if(typeof(value) === 'object'){
      for(let i = 0; i < value.length; i++){
        // Making a box that contains a tag/favorite
        var box = document.createElement('div');
        box.className = 'smallBox';
        box.innerText = value[i];
        dataElement2.appendChild(box);
        // The button for deleting a tag or a favorite
        var deleteIt = document.createElement('button');
        deleteIt.id = value[i];
        deleteIt.className = 'deleteTag';
        deleteIt.innerText = 'X';
        // Function for deleting
        if(title === 'tags'){
          deleteIt.addEventListener('click', function(){var del = 'tag'; removeTag(del, this.id);});
        }else if(title === 'favorites'){
          deleteIt.addEventListener('click', function(){var del = 'fav'; removeTag(del, this.id);});
        }
        box.appendChild(deleteIt);
      }
      if(title === 'tags'){
      // Adding a row for an function to insert a new tag to the database
      var tr3 = document.createElement('tr');
      table.appendChild(tr3);
      // Data
      var dataElement3 = document.createElement('td');
      tr3.appendChild(dataElement3);
      // How ele do the user know what this is all about?
      var inputTagTitle = document.createElement('p');
      inputTagTitle.className = 'settingsTitle';
      inputTagTitle.innerText = 'Add a new tag: ';
      dataElement3.appendChild(inputTagTitle);
      // Data
      var dataElement4 = document.createElement('td');
      tr3.appendChild(dataElement4);
      // The field where the user tells the database what the tag is called
      var inputTag = document.createElement('input');
        inputTag.id = 'inputTag';
        inputTag.type = 'text';
      inputTag.placeholder =' Write tag here...';
      dataElement4.appendChild(inputTag);
      // Add a break just for styling
      var brr = document.createElement('br');
      dataElement4.appendChild(brr);
      // Button for adding the tag to the database
      var pushTag = document.createElement('button');
        pushTag.id = 'pushTag';
        pushTag.innerText = 'Add Tag';
      dataElement4.appendChild(pushTag);
      pushTag.addEventListener('click', function(){
        if(inputTag.value !== ''){
        addTag(inputTag.value);
        }
       });
     }
   }
  };

  // Function for removing tags from database
  // This is also used when removing favorites from database
  function removeTag(del, tag){
    if(del === 'tag'){
      var data = {
        tags: tag,
        method: 'remove'
      }
    }else if(del === 'fav'){
      var data = {
        favorites: tag,
        method: 'remove'
      }
    }
    var connect = new XMLHttpRequest();
    var urlEncodedData = "";
    var urlEncodedDataPairs = [];
    var id;

    for(tag in data) {
      urlEncodedDataPairs.push(encodeURIComponent(tag) + '=' + encodeURIComponent(data[tag]));
    }
    urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');

    connect.addEventListener('load', function(event) {
      if(listOfPlaces === 0){
        listAll();
      }else if(listOfPlaces === 1){
        listFav();
      }else if(listOfPlaces === 2){
        settings();
      }
    });
    connect.addEventListener('error', function(event) {
      alert('Oups! Something goes wrong.');
    });

    connect.open('PUT', 'http://localhost:8080/api/users/' + userName);
    connect.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    connect.send(urlEncodedData);
  };

  // Function for adding a tag to the users database
  function addTag(tag){
    var data = {
      tags: tag,
      method: 'add'
    };
    var connect = new XMLHttpRequest();
    var urlEncodedData = "";
    var urlEncodedDataPairs = [];
    var id;
    for(tag in data) {
      urlEncodedDataPairs.push(encodeURIComponent(tag) + '=' + encodeURIComponent(data[tag]));
    }
    urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');
    connect.addEventListener('load', function(event) {
      settings();
    });
    connect.addEventListener('error', function(event) {
      alert('Oups! Something goes wrong.');
    });

    connect.open('PUT', 'http://localhost:8080/api/users/' + userName);
    connect.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    connect.send(urlEncodedData);
  };

  // Create a list of the places in the div next to the map
  function listPlaces(name, description, openH, isFav){
    var addToFavorites = {
      favorites: name,
      method: 'add'
    };
    //The div that cointains info about a place
    var place = document.createElement('div');
    place.className = 'onePlace';
    placesDiv.appendChild(place);

    var title = document.createElement('h3');
    title.className = 'placeTitle';
    title.innerText = name;
    place.appendChild(title);

    var info = document.createElement('p');
    info.className = 'placeInfo';
    info.innerText = description;
    place.appendChild(info);

    var openP = document.createElement('p');
    openP.className = 'isOpen';
      openP.innerText = 'Open today: ' + openH;
    place.appendChild(openP);

    var addToFav = document.createElement('button');
    addToFav.id = name;
    if(isFav === 0){
      addToFav.className = 'addFav';
      addToFav.innerText = 'Add to favorites';
      place.appendChild(addToFav);
      document.getElementById(name).addEventListener('click', function(){
        addFav(addToFavorites);
      });
    }else if(isFav !== 0){
      addToFav.className = 'removeFav';
      addToFav.innerText = 'Remove from favorites';
      place.appendChild(addToFav);
      document.getElementById(name).addEventListener('click', function(){
        removeTag('fav', name);
      });
    }
  };

  // Add a place to favorites
  function addFav(data){

    var connect = new XMLHttpRequest();
    var urlEncodedData = "";
    var urlEncodedDataPairs = [];
    var id;

    for(id in data) {
      urlEncodedDataPairs.push(encodeURIComponent(id) + '=' + encodeURIComponent(data[id]));
    }
    urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');

    connect.addEventListener('load', function(event) {
        listAll();
    });
    connect.addEventListener('error', function(event) {
      alert('Oups! Something goes wrong.');
    });

    connect.open('PUT', 'http://localhost:8080/api/users/' + userName);
    connect.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    connect.send(urlEncodedData);
  };

  // Remove all the places in the list when a new is added or old is deleted
  function removePlaces(){

    // Getting the number of places
    var many = placesDiv.childNodes.length;

    // Looping trough all and removing them
    for(let i = 0; i < many; i++){
      placesDiv.removeChild(placesDiv.childNodes[0]);
    }
  };

  // Getting the places stored in the database
  function getPlaces(){
    var places, markers = [], user;
    var ajax = new XMLHttpRequest();
    ajax.onreadystatechange = function(){
      if(this.readyState == 4 && this.status == 200){
        places = JSON.parse(this.response);
        var ajax2 = new XMLHttpRequest();
        ajax2.onreadystatechange = function(){
          if(this.readyState == 4 && this.status == 200){
            user = JSON.parse(this.response);
            for(let i = 0; i < places.length; i++){
              var isFav = 0;
              user.favorites.forEach(function(favorite){
                if(places[i].title === favorite){
                  ++isFav;
                }
              });
              var day = new Date().getDay();
              var times;
              if(day > 0 && day < 5){
                times = places[i].open.weekdays;
              }else if(day === 5){
                times = places[i].open.friday;
              }else if(day === 6){
                times = places[i].open.saturday;
              }else if(day === 0){
                times = places[i].open.sunday;
              }
              listPlaces(places[i].title, places[i].description, times, isFav);
              markers.push({lat: places[i].coords.lat, lng: places[i].coords.lng});
            }
            initMap(JSON.stringify(markers), places, 10);
          }
        }
        ajax2.open('GET', 'http://localhost:8080/api/users/' + userName);
        ajax2.send();
      }
    }
    ajax.open('GET', 'http://localhost:8080/api/places');
    ajax.send();
  };

  // Adding eventlisteners to the buttons
  // The button that lists all the places
  var aPlaces = document.getElementById('allPlaces');
  aPlaces.addEventListener('click', listAll);

  //The button that lists only favorite places
  var fPlaces = document.getElementById('favPlaces');
  fPlaces.addEventListener('click', listFav);

  // The button for the settings
  var sett = document.getElementById('settings');
  sett.addEventListener('click', settings);

  /*********************************/
  /*** Adding new markers/places ***/
  /*********************************/

  // Add a new place when double clicking on the position
  function placeMarker(latLng, map){
    // Centering the map to the new place
    map.panTo(latLng);
    // Saving the coords of the new place
    var lat1 = JSON.stringify(latLng);
    coords = JSON.parse(lat1);
    newPlaceForm(coords);
  };

  // Adding the input fields to the form
  function addInput(name, table, type, pTitle){
    var tr = document.createElement('tr');
    table.appendChild(tr);
    var td1 = document.createElement('td');
    var td2 = document.createElement('td');
    tr.appendChild(td1);
    tr.appendChild(td2);
    var title = document.createElement('p');
    title.className = 'addPara';
    title.innerText = pTitle;
    td1.appendChild(title);
    var input = document.createElement(type);
    if(type === 'input'){
      input.type = 'text';
    }
    if(type === 'textarea'){
      input.id = 'addTextarea';
    }
    input.name = name;
    td2.appendChild(input);
  };

  // Adding the dropdowns for the opening hours
  function addTime(name, table, pTitle){
    var tr = document.createElement('tr');
    table.appendChild(tr);
    var td1 = document.createElement('td');
    var td2 = document.createElement('td');
    var td3 = document.createElement('td');
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    var title = document.createElement('p');
    title.className = 'addPara';
    title.innerText = pTitle;
    td1.appendChild(title);
    var selectOpen = document.createElement('select');
    selectOpen.name = name + 'Open';
    td2.appendChild(selectOpen);
    var selectClose = document.createElement('select');
    selectClose.name = name + 'Closed';
    td3.appendChild(selectClose);
    time(selectOpen);
    time(selectClose);
  };

  // Function for adding the time to the options
  function time(select){
    var option = document.createElement('option');
    option.value = 'closed';
    option.innerText = 'Closed';
    select.appendChild(option);
    for(let i = 0; i < 1440; i += 30){
      option = document.createElement('option');
      var hour = Math.floor(i/60);
      var min = i % 60;
      if(min === 0){
        min = min.toString();
        min = '0' + min;
      }else{
        min = min.toString();
      }
      if(hour < 10){
        hour = hour.toString();
        hour = '0' + hour;
      }else{
        hour = hour.toString();
      }
      option.value = hour + ':' + min;
      option.innerText = hour + ':' + min;
      select.appendChild(option);
    }
  };

  // Add markers from db via ajax
  function addMarkers(map){
    var markers = new XMLHttpRequest();
    markers.onreadystatechange = function(){
      if(this.readyState == 4 && this.status == 200){
        var places = JSON.parse(this.response);
        for(let i = 0; i < places.length; i++){
          var marker = new google.maps.Marker({
            position: {lat: parseFloat(places[i].coords.lat), lng: parseFloat(places[i].coords.lng)},
            map: map
          });
        }
      }
    }
      markers.open('GET', 'http://localhost:8080/api/places');
      markers.send();
  };

  // This form that pops up when the user creates a new place
  function newPlaceForm(coords){
    // The form input names
    var inputs = ['title', 'description', 'tags'];
    // The form input names as shown to users
    var inputTitle = ['Place name: ', 'Description: ', 'Tags (separated by a comma): '];
    // The form select names
    var days = ['weekday', 'friday', 'saturday', 'sunday'];
    // The form select names as show to users
    var daysTitle = ['Monday - Thursday: ', 'Friday: ', 'Saturday: ', 'Sunday: '];

    // Gray background that is just for styling
    var addBackground = document.createElement('div');
    addBackground.id = 'addBackground';
    mainArea.appendChild(addBackground);
    document.getElementById('addBackground').addEventListener('click', clearForm);

    // This is for getting the form in the middle
    var addPos = document.createElement('div');
    addPos.id = 'addPos';
    mainArea.appendChild(addPos);

    // Add a header to the form
    var addHeader = document.createElement('h1');
    addHeader.id = 'addHeader';
    addHeader.innerHTML = 'Add this place to database';
    addPos.appendChild(addHeader);

    //Create the form
    var addForm = document.createElement('form');
    addForm.id = 'addForm';
    addForm.method = 'POST';
    addForm.action = '/api/places';
    addPos.appendChild(addForm);

    // A table that makes the form look better
    var inputTable = document.createElement('table');
    inputTable.id = 'inputTable';
    addForm.appendChild(inputTable);

    // Adding the title field
    addInput(inputs[0], inputTable, 'input', inputTitle[0]);
    // Adding a textarea for the description
    addInput(inputs[1], inputTable, 'textarea', inputTitle[1]);

    // A new table with 3 columns for adding the opening and closing times
    var timeTable = document.createElement('table');
    timeTable.id = 'timeTable';
    addForm.appendChild(timeTable);

    // Row
    var titleRow = document.createElement('tr');
    timeTable.appendChild(titleRow);

    // An empty td
    var titleData1 = document.createElement('td');
    titleData1.className = 'timeData';
    titleRow.appendChild(titleData1);

    // Header for the opening dropdowns
    var titleData2 = document.createElement('td');
    titleData2.className = 'timeData';
    titleData2.innerText = 'Opening:';
    titleRow.appendChild(titleData2);

    // Header for the closing dropdowns
    var titleData3 = document.createElement('td');
    titleData3.className = 'timeData';
    titleData3.innerText = 'Closing:';
    titleRow.appendChild(titleData3);

    // This adds the dropdowns with the times
    for(let i = 0; i < days.length; i++){
      addTime(days[i], timeTable, daysTitle[i]);
    }
    addInput(inputs[2], timeTable, 'input', inputTitle[2]);

    // Adding coords for the place
    var inputlat = document.createElement('input');
    inputlat.name = 'lat';
    inputlat.type = 'hidden';
    inputlat.value = coords.lat;
    addForm.appendChild(inputlat);
    var inputlng = document.createElement('input');
    inputlng.name = 'lng';
    inputlng.type = 'hidden';
    inputlng.value = coords.lng;
    addForm.appendChild(inputlng);
    // Adding the submit button
    var sub = document.createElement('input');
    sub.type = 'submit';
    addForm.appendChild(sub);

    // Send the form when pushing submit
    addForm.addEventListener('submit', function(e){
      e.preventDefault();
      // Object that will be sent to the api
      var result = {
        title: addForm.title.value,
        description: addForm.description.value,
        weekdayOpen: addForm.weekdayOpen.value,
        weekdayClosed: addForm.weekdayClosed.value,
        fridayOpen: addForm.fridayOpen.value,
        fridayClosed: addForm.fridayClosed.value,
        saturdayOpen: addForm.saturdayOpen.value,
        saturdayClosed: addForm.saturdayClosed.value,
        sundayOpen: addForm.sundayOpen.value,
        sundayClosed: addForm.sundayClosed.value,
        tags: addForm.tags.value,
        lat: coords.lat,
        lng: coords.lng
      };
      // Function that sends the object
      send(result);
      // Loading the map with the added marker
      initMap();
      // Removing the markers in the right side Div
      removePlaces();
      // Adding the markers, if 0 we add all, if 1 we add favorites. Also the new place is added
      if(listOfPlaces === 0){
        listAll();
      }else if(listOfPlaces === 1){
        listFav();
      }else if(listOfPlaces === 2){
        settings();
      }
    });
  };

  // Senda an ajax POST request to api/mongo that adds a new place
  function send(data){

    var connect = new XMLHttpRequest();
    var urlEncodedData = "";
    var urlEncodedDataPairs = [];
    var name;

    for(name in data) {
      urlEncodedDataPairs.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]));
    }
    urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');

    connect.addEventListener('load', function(event) {
      alert('Added to database');
      clearForm();
    });
    connect.addEventListener('error', function(event) {
      alert('Oups! Something goes wrong.');
    });

    connect.open('POST', 'http://localhost:8080/api/places');
    connect.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    connect.send(urlEncodedData);
  }

function debug(text) {
  console.log(text);
  return 0;
}

function output(text) {
  document.getElementById("output").innerHTML += text + "<br>";
  return 0;
}

function changeById(id, text) {
  try {
    document.getElementById(id).innerHTML = text;
  }
  catch(err) {
    debug("problem in changeById. tried to change id:" + id + " to text: " + text);
  }
  return 0;
}

var tools = {
  makeDropdown(list, typeOfItem) {
    //currently not used by anything
    var dropdownHtml = "";
    typeOfItem = typeOfItem || "one";
    var c;
    var l = list.length;
    for(c = 0; c < l; c++) {
      dropdownHtml += "<option>" + list[c] + "</option>\n";
    }
    return dropdownHtml = "<select>\n<option selected disabled>by " + typeOfItem + "</option>\n" + dropdownHtml + "</select>";
  },
  storeLocal(whichAction) {
    if(whichAction == "clear") {
      var yesClear = confirm("Are you sure?");
      if(yesClear) {
        changeById("local-data-status","Cleared local storage.");
        localStorage.clear();
        globalVar.resetData();
        changeById("number-of-reviews", "Show All Reviews (" + globalVar.reviewsList.length.toString() + ")");
      }
      else {
        changeById("local-data-status","No action taken");
      }
    }
    else {
      try {
        localStorage.setItem("localReviewData", JSON.stringify(globalVar.reviewsList));
        localStorage.setItem("localReviewDataChapters", JSON.stringify(globalVar.chaptersList));
        localStorage.setItem("localReviewDataTitle",globalVar.ficTitle);
      }
      catch(err) {
        debug(err);
        changeById("local-data-status","Error: Couldn't save data to browser.");
      }
      changeById("local-data-status","Success: Saved data to browser.");
    }
    return 0;
  },
  makeCards(list) {
    var cardsHtml = [];
    var guestOrNah = "";
    var c;
    var l = list.length;
    var each;
    var eachDate;
    for(c = 0; c < l; c++) {
      each = "<div class='review-card'>";
      if(list[c].signedIn == false) {
        guestOrNah = " [guest]";
      }
      else {
        guestOrNah = "";
      }
      each += "<span class='review-card-username' onclick='show.reviews.byName(\"" +
        list[c].username + "\")'>" + list[c].username + guestOrNah + "</span> ";
      each += "<span class='review-card-chapter' onclick='show.reviews.byChapter(" +
        list[c].chapter + ")'>chapter " + list[c].chapter + "</span>";
      each += "<p class='review-card-contents'>" + list[c].contents + "</p>";
      //make the date text clickable for search in local time
      eachDate = list[c].date.toString();
      each += "<p class='review-card-date'><span style='cursor:pointer' onclick='show.reviews.byDate(\"" +
        eachDate + "\",\"" + eachDate + "\")'>" + eachDate + "</span></p>"; //toString is locale time
      each += "</div>";
      cardsHtml.push(each);
    }
    return cardsHtml.join("\n");
  }
};

var globalVar = {
  defaultHtml : "",
  ficTitle : "",
  reviewsList : [],
  usersList : [],
  usersMatrix : [
    [],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]
  ],
  chaptersList : [],
  maxPages : 1,
  resetData : function() {
    this.ficTitle = "";
    this.reviewsList = [];
    this.usersList = [];
    this.usersMatrix = [
      [],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]
    ];
    this.chaptersList = [];
    this.maxPages = 1;
    return 0;
  }
};

function listUniqueNames(reviewList) {
  //receives list of review objects and returns alphabetized matrix of usernames
  //TODO: count how many reviews per user?

  var uniqueNamesList = [];
  var rl = reviewList.length;

  function scaleSort() {
    //called when there are too many reviews/usernames to reasonably sort in a single array

    function createMatrix(aMatrix) {
      var alphabet = ["#", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
      var each,c,l,iMatrix,firstLetter;
      for(c = 0; c < rl; c++) {
        //for each username
        each = reviewList[c].username;
        //find the index of the array for the first letter
        iMatrix = alphabet.indexOf(each[0].toLowerCase());
        //usernames that start with numbers go in "#" category at index 0
        if(iMatrix == -1) {
          iMatrix = 0;
        }
        //if that username is not already in that array, then add the username to that array
        if(aMatrix[iMatrix].indexOf(each) == -1) {
          aMatrix[iMatrix].push(each);
        }
      }
      return aMatrix; //not really necessary if global var was passed as self?
    }

    function sortMatrix(aMatrix) {
      //sorts each subarray
      var c;
      var l = aMatrix.length;
      for(c = 0; c < l; c++) {
        //if subarray is not empty
        if(aMatrix[c].length != 0) {
          //sort it
          aMatrix[c] = aMatrix[c].sort();
          //and concatenate it onto the whole list
          uniqueNamesList = uniqueNamesList.concat(aMatrix[c]);
        }
      }
      return aMatrix;
    }

    //Construct matrix of unique user names, and sort matrix while also concatenating non-empty subarrays into flat list
    globalVar.usersMatrix = sortMatrix(createMatrix(globalVar.usersMatrix));
    //Repopulate global username list with updated username list
    globalVar.usersList = uniqueNamesList;
    return 0; //don't need to return anything since global variable was modified
  }//end of scaleSort

  uniqueNamesMatrix = scaleSort();

  return uniqueNamesMatrix;
}

var show = {
  sidebar : function(value) {
    var sideBar = document.getElementById("side-bar");
    var backdropDiv = document.getElementById("side-bar-backdrop");
    if(value) {
      sideBar.style.left = 0;
      backdropDiv.style.visibility = "visible";
      backdropDiv.style.opacity = 0.3;
    }
    else {
      sideBar.style.left = -264;
      backdropDiv.style.opacity = 0;
      setTimeout(function(){
        backdropDiv.style.visibility = "hidden";
      },500);
    }
    return 0;
  },
  mainPage : function() {
    show.sidebar(false);
    window.scrollTo(0,0);
    changeById("output", globalVar.defaultHtml);
    return 0;
  },
  exportPage : function() {
    show.sidebar(false);
    window.scrollTo(0,0);
    changeById("output", document.getElementById("hidden-export").innerHTML);
    return 0;
  },
  helpPage : function() {
    show.sidebar(false);
    window.scrollTo(0,0);
    changeById("output", document.getElementById("hidden-help").innerHTML);
    return 0;
  },
  feedbackPage : function() {
    show.sidebar(false);
    window.scrollTo(0,0);
    changeById("output", '<iframe src="https://docs.google.com/forms/d/e/1FAIpQLSfB8eaIGfqWVLfzvmlP4znI1JyXFuSUJfaPz59Z-RHxa5bxgA/viewform?embedded=true" style="height:100%;width:100%;max-width:500px;" frameborder="0" marginheight="0" marginwidth="0">Loading...</iframe>');
    return 0;
  },
  allReviews() {
    changeById("output", "<p>Showing <strong>" + globalVar.reviewsList.length.toString() + "</strong> reviews by <strong>" +
      globalVar.usersList.length + "</strong> users</p>");
    output(tools.makeCards(globalVar.reviewsList));
    return 0;
  },
  filters : {
    byName : function() {
      //list all alphabetized names, clickable
      show.sidebar(false);
      window.scrollTo(0,0);
      changeById("output","Listing all usernames...");
      var preHtml = '<hr><p><input id="username-input" type="text" placeholder="username search" size="20"></input>' +
        '<input id="username-input-submit" type="submit" value="Find" onclick="show.reviews.byName();"></input>';
      var toHtml = [];
      var c;
      var l = globalVar.usersList.length;
      var thisName;
      for(c = 0; c < l; c++) {
        thisName = globalVar.usersList[c];
        toHtml.push("<span class='list-linked' onclick='show.reviews.byName(\"" + thisName + "\")'>" + thisName + "</span>");
      }
      changeById("output", preHtml +
        "<p>Alphabetical list of all <strong>" + toHtml.length + "</strong> usernames</p>" + toHtml.join("<br>") + "</p>");
      return 0;
    },
    byChapter : function() {
      show.sidebar(false);
      window.scrollTo(0,0);
      changeById("output","Listing all chapters...");
      var preHtml = '<hr><p><input id="chapter-input" type="text" placeholder="chapter number search" size="20"></input>' +
        '<input id="chapter-input-submit" type="submit" value="Find" onclick="show.reviews.byChapter();"></input>';
      var toHtml = [];
      var maxChapter = globalVar.chaptersList.length - 1;
      var c;
      for(c = 1; c < maxChapter + 1; c++) {
        if(globalVar.chaptersList[c]) {
          toHtml.push("<span class='list-linked' onclick='show.reviews.byChapter(" + c.toString() + ");'>" +
            c.toString() + " - has " + globalVar.chaptersList[c] + " reviews</span>");
        }
        else {
          toHtml.push("<span class='list-unlinked'>" + c.toString() + "</span>");
        }
      }
      changeById("output", preHtml + "<p>List of all <strong>" + maxChapter +
        "</strong> chapters</p>" + toHtml.join("<br>") + "</p>");
      return 0;
    },
    byDate : function() {
      show.sidebar(false);
      window.scrollTo(0,0);
      //TODO: put today's date as the default value
      var theHtml = [
        '<hr><p>Select date range: <p>',
        'start date: <input id="start-date-input" type="date" value=""></input>',
        '<br>',
        'end date: <input id="end-date-input" type="date" value=""></input>',
        '<input id="date-input-submit" type="submit" value="Find" onclick="show.reviews.byDate();"></input>',
        '</p>'
      ];
      changeById("output",theHtml.join(""));
      return 0;
    },
    bySearch : function() {
      show.sidebar(false);
      window.scrollTo(0,0);
      var theHtml = '<hr><p><input id="search-input" type="text" placeholder="enter search term" size="20"></input>' +
        '<input id="search-input-submit" type="submit" value="Find" onclick="show.reviews.bySearch();"></input></p>';
      changeById("output", theHtml);
      return 0;
    }
  },
  reviews : {
    byName : function(username) {
      username = username || document.getElementById("username-input").value; //fallback to input box
      username = username.toLowerCase();
      show.reviews.generic(username, "username","byName",function(each){return each.username.toLowerCase() == username;});
      return 0;
    },
    byChapter : function(chapter) {
      chapter = chapter || document.getElementById("chapter-input").value; //fallback to input box
      show.reviews.generic(chapter,"chapter","byChapter",function(each){return each.chapter == Number(chapter);});
      return 0;
    },
    byDate : function(startDate, endDate) {
      //can read input boxes or receive date parameters in toString form of local timezone
      var rangeLabel = "";
      if(!startDate && !endDate) {
        //fallback to input boxes
        startDate = document.getElementById("start-date-input").value + "T23:59:59.999";
        endDate = document.getElementById("end-date-input").value;
        //fallback to start date if user didn't supply end date
        if(!endDate) {
          endDate = startDate;
        }
        else {
          endDate = endDate + "T23:59:59.999";
        }
      }

      //construct date object using local timezone
      startDate = new Date(startDate);
      endDate = new Date(endDate);

      rangeLabel = startDate.toLocaleDateString() + " <span style='font-weight:normal;'>to</span> " + endDate.toLocaleDateString();

      //now make times be set to earliest and latest points
      startDate.setHours(0);
      startDate.setMinutes(0);
      startDate.setSeconds(0);
      endDate.setHours(23);
      endDate.setMinutes(59);
      endDate.setSeconds(59);

      //now use pure milliseconds for ranges
      startDate = startDate.getTime();
      endDate = endDate.getTime();

      show.reviews.generic(rangeLabel,"date range","byDate",function(each){
        var eachDate = each.date.getTime();
        if(startDate < eachDate && endDate > eachDate) {
          return true;
        }
        else {
          return false;
        }
      });
      return 0;
    },
    bySearch : function(searchTerm) {
      searchTerm = searchTerm || document.getElementById("search-input").value; //fallback to input box
      if(searchTerm == "") {searchTerm = "[no term specified]"}
      searchTerm = searchTerm.toLowerCase();
      show.reviews.generic(searchTerm,"search term","bySearch",function(each){
        //non-found is -1, so adding one makes it zero i.e. false, while positive numbers are truthy. buahaha i'm a genius.
        return (1 + each.contents.toLowerCase().indexOf(searchTerm));
      });
      return 0;
    },
    generic : function(keyword, byType, backButton, searchFxn) {
      //Called via more specific function when user activates a filter
      var inputId = byType + "-input";
      byType = byType || "search"; //default to review content search
      var selectedReviews = "Error: Could not find reviews for " + byType + ": " + keyword;
      try {
        selectedReviews = globalVar.reviewsList.filter(searchFxn);
      }
      catch(err) {
        debug(err);
      }

      //add a back button to go back to filter page
      changeById("output", "<p><span class='list-linked' onclick='show.filters." + backButton + "()'>Filter by: " + byType + "</span><br>" +
        byType + " <span style='font-weight:bold;'>" + keyword +
        "</span> has <span style='font-weight:bold;'>" + selectedReviews.length.toString() + "</span> reviews</p>");
      output(tools.makeCards(selectedReviews));
      window.scrollTo(0, 0);
      return 0;
    }
  }
};

function exportReviewsToFile(filetype) {
  if(globalVar.reviewsList.length == 0) {
    alert("Sorry, I don't see any reviews to download.");
    return 0;
  }

  var revLink = document.getElementById("exportReviewsLink");
  var filename = "offline-reviews.txt";
  var type = "text/plain";
  var text = "";

  function convertToPlaintext(list) {
    var plaintext = [];
    var c;
    var l = list.length;
    for(c = 0; c < l; c++) {
      plaintext.push(list[c].username);
      plaintext.push("chapter " + list[c].chapter.toString());
      plaintext.push(list[c].date.toString());
      plaintext.push(list[c].contents);
      plaintext.push("----------------");
    }
    return plaintext.join("\r\n");
  }

  if(filetype == "json") {
    filename = "offline-reviews.json";
    type = "application/json";
    text = JSON.stringify(globalVar.reviewsList);
  }
  else {
    text = convertToPlaintext(globalVar.reviewsList);
  }

  var file = new Blob([text], {type: type});
  revLink.href = URL.createObjectURL(file);
  revLink.download = filename;
  revLink.innerHTML = "Ready: click to download";
  return 0;
}

function parseReviews(data) {
  //Get rid of all the excess html that comes with the reviews webpage

  var extract = {
    generic : function(wholeText, beginString, endString, offsetA, offsetB) {
      //set default values for optional offsets
      offsetA = offsetA || 0;
      offsetB = offsetB || 0;
      var indexA = wholeText.indexOf(beginString) + offsetA;
      var slicedString = wholeText.slice(indexA); //slices from here to the end
      var indexZ = slicedString.indexOf(endString) + offsetB;
      return slicedString.slice(0, indexZ);
    },
    contents(robj) {
      robj.contents = extract.generic(robj.raw, "<div style='margin-top:5px'>", "</div>", 28, 0);
      //remove the newline characters inserted by stringifying website
      robj.contents = robj.contents.replace(/\\n/g,"");
      return robj;
    },
    chapter(robj) {
      robj.chapter = Number(extract.generic(robj.raw, ">chapter", ".", 9, -1));
      if(globalVar.chaptersList[robj.chapter]) {
        globalVar.chaptersList[robj.chapter] += 1;
      }
      else {
        globalVar.chaptersList[robj.chapter] = 1;
      }
      return robj;
    },
    username(robj) {
      var indexA;
      var indexZ = robj.raw.indexOf(" <small");
      var revName = robj.raw.slice(0, indexZ);
      if(revName[revName.length - 2] == ">") {
        //signed in user, set flag
        robj.signedIn = true;
        revName = revName.slice(0,-5);
        indexA = revName.lastIndexOf(">") + 1;
        revName = revName.slice(indexA);
      }
      else {
        //guest
        indexA = revName.lastIndexOf(">") + 2;
        revName = revName.slice(indexA);
      }
      //debug(revName);
      robj.username = revName;
      return robj;
    },
    date(robj) {
      //add three zeroes for ff.net's missing milliseconds
      var rdate = Number(extract.generic(robj.raw, "xutime", "'>", 8, 0) + "000");
      robj.date = new Date(rdate);
      //debug(robj.date);
      return robj;
    }
  };

  //Find title and update displayed page
  globalVar.ficTitle = extract.generic(data, "Reviews for", "|", 12, -1);
  changeById("fanfiction-title", globalVar.ficTitle);

  //Cut down data to only the table of reviews, split into array
  var dataTextTable = extract.generic(data, "tbody>", "</tbody>", 17, -9);
  var dataArray = dataTextTable.split("</tr>");

  //Review object constructor
  function Review(raw) {
    //Receives text to initialize value.
    try {
      this.username = "";
      this.signedIn = false;
      this.date = 0;
      this.chapter = 0;
      this.contents = "";
      this.raw = raw;
    }
    catch(err) {
      throw {name:"Missing argument",message:"Review constructor has properties that must be initialized by passed object."};
    }
  }

  var fullReviewPage = [];
  var uniqueNamesMatrix = [];

  var c;
  var a;
  //Loop through all raw reviews, extracting their data from the mess of html
  for(c = 0; c < dataArray.length; c++) {
    a = new Review(dataArray[c]);
    extract.contents(a); //because object is being changed, don't need to use return value
    extract.chapter(a);
    extract.username(a); //also sets flag for signed in versus guest
    extract.date(a);
    delete a.raw; //get rid of the ugly html that this data came from
    fullReviewPage.push(a);
  }


  //Add this page of reviews to the whole list
  globalVar.reviewsList = globalVar.reviewsList.concat(fullReviewPage);
  //Update the onscreen review count
  changeById("number-of-reviews", "Show All Reviews (" + globalVar.reviewsList.length.toString() + ")");
  //Add unique names to global matrix of usernames. Don't bore user by waiting until end.
  listUniqueNames(fullReviewPage);

  return fullReviewPage;
}

var fetch = {
  page : function() {},
  fromWebsite : function(path, callback, pageNum) {
    //Requests webpage from site.

    //Add page number to end of path
    path = path + pageNum.toString() + "/";
    debug("Requesting webpage: " + path);

    //Workaround for no-cross-origin-scripting issue
    path = "https://allorigins.me/get?url=" + encodeURIComponent(path) + "&callback=?";

    try {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", path, true);
      xhr.onreadystatechange = function() {
        if(xhr.readyState == 4) {
          if(xhr.status == 200) {
            //debug(xhr.responseText);
            callback(null, xhr.responseText, pageNum);
          }
          else {
            debug("Failed: no okay from server");
            callback("no okay");
          }
        }
      }
      xhr.send(null);
    }
    catch(err) {
      debug("Failed: could not make request");
    }

    return 0;
  }, //end of .fromWebsite
  fromLocal : function() {
    //if user specifies local source
    var localData;
    var ficTitle;
    var chapList;
    try {
      localData = localStorage.getItem("localReviewData");
      ficTitle = localStorage.getItem("localReviewDataTitle");
      chapList = localStorage.getItem("localReviewDataChapters");

      if(localData == null) {
        throw("error: no local data");
      }
    }
    catch(err) {
      debug(err);
      changeById('output', 'Failed to find local data. Troubleshooting: <ol>' +
        '<li>Have you already fetched review data in the past and saved it with the export/download page?</li>' +
        '<li>Make sure you have NOT cleared your browser data since then.</li>' +
        '<li>If you did everything right, the problem might be my fault. Sorry :/</li></ol>' +
        '<span class="pseudolink" onclick="show.mainPage();">Click here</span> to go back to start page.');
      document.getElementById("url-for-reviews-submit").value = "Retry?";
      document.getElementById("url-for-reviews-submit").disabled = false;
      return 0;
    }

    var dateTimeReviver = function(key, value) {
      //workaround because for some reason JSON doesn't parse date objects? i thought it did in node.
      if (key == "date") {
        return new Date(value);
      }
      return value;
    }
    globalVar.reviewsList = JSON.parse(localData,dateTimeReviver);
    globalVar.ficTitle = ficTitle;
    globalVar.chaptersList = JSON.parse(chapList);

    document.getElementById("url-for-reviews-submit").value = "Done!";
    document.getElementById("url-for-reviews-submit").disabled = false;
    //Update fanfiction title
    changeById("fanfiction-title", globalVar.ficTitle);
    //Update the onscreen review count
    changeById("number-of-reviews", "Show All Reviews (" + globalVar.reviewsList.length.toString() + ")");
    //Add unique names to global matrix of usernames. Don't bore user by waiting until end.
    listUniqueNames(globalVar.reviewsList);
    //Display first batch of reviews in card form
    changeById("output", "<p>Showing first batch of <strong>1-" + globalVar.reviewsList.length.toString() + "</strong> reviews</p>");
    output(tools.makeCards(globalVar.reviewsList));
    return 0;
  },
  reviewData : function() {
    //Called when user clicks submit button.

    //Show busyness and disable button to prevent repeat clicking
    var urlSubmitButton = document.getElementById("url-for-reviews-submit");
    urlSubmitButton.value = "wait...";
    urlSubmitButton.disabled = true;

    //Get story id value from url input field.
    var userSuppliedURL = document.getElementById("url-for-reviews").value;

    //Reset variables for repeat usage
    globalVar.resetData;

    //If user says local, use local data
    if(userSuppliedURL == "local") {
      fetch.fromLocal();
      return 0;
    }

    //Extract story ID for safe and predictable behavior
    var pageNum = 1;
    var storyId = userSuppliedURL.match(/\d+/);
    try {
      var createdURL = "https://www.fanfiction.net/r/" + storyId[0] + "/0/";
    }
    catch(err) {
      debug(err);
      changeById("output","Error: Is that a URL with a story number in it?");
      urlSubmitButton.value = "Retry?";
      urlSubmitButton.disabled = false;
      return 0;
    }

    function reviewCallback(err, data, pageNum) {
      var indexZ, slicedString, indexA;
      if(err) {
        urlSubmitButton.value = "Failed :(";
        urlSubmitButton.disabled = false;
        //TODO: count number of errors and display help dialog after several.
      }
      else {
        parseReviews(data);
        //on first run, find the last page number and display first batch
        if(pageNum == 1) {
          indexZ = data.lastIndexOf("Last") - 3;
          if(indexZ < 0) {
            //if Last isn't found, then there are less than 3 pages
            if(data.lastIndexOf("Next") == -1) {
              //if Next isn't found, then there's only 1 page
              globalVar.maxPages = 1;
            }
            else {
              //if Next is found, there there are 2 pages
              globalVar.maxPages = 2;
            }
          }
          else {
            //if Last was found just fine, unearth the last page number
            slicedString = data.slice(0,indexZ); //slices from beginning to here
            indexA = slicedString.lastIndexOf("/") + 1;
            globalVar.maxPages = Number(slicedString.slice(indexA));
          }
          //Display first batch of reviews in card form
          changeById("output", "<p>Showing first batch of <strong>1-" + globalVar.reviewsList.length.toString() + "</strong> reviews</p>");
          output(tools.makeCards(globalVar.reviewsList));
        }
        //if there are more pages left, iterate number and go again. otherwise stop.
        if(pageNum < globalVar.maxPages) {
          pageNum++;
          setTimeout(function() {
            fetch.fromWebsite(createdURL, reviewCallback, pageNum);
          }, 500); //500 ms = half a second delay. DO NOT MAKE IT FASTER AND OVERWHELM THEM WITH REQUESTS
        }
        else {
          urlSubmitButton.value = "Done!";
          urlSubmitButton.disabled = false;
        }
      }
      return 0;
    }

    fetch.fromWebsite(createdURL, reviewCallback, 1); //1 is first chapter, start there

    return 0;
  } //end of fetch.reviews
}; //end of fetch

function main() {
  //prevent page from reloading and losing all review data. doesn't prevent browser automatic reloads :(
  //ehhhhh disable the "are you sure" dialog. it's too annoying. could enable on request.
  //window.onbeforeunload = function(){ return 'Let browser reload page?';}

  //save the start message to display later
  globalVar.defaultHtml = document.getElementById("output").innerHTML;

  return 0;
}

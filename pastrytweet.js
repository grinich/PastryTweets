var controller = {
  init: function() {
    var a = parseInt(document.body.style.height);
    if (!a) {
        a = window.innerHeight
    }

    this.navigation = new PKNavigationView();
    this.navigation.size = new PKSize(window.innerWidth, a);
    this.navigation.delegate = this;
    this.navigation.zIndex = 1;
    this.navigation.autoresizingMask = PKViewAutoresizingFlexibleWidth;
    PKRootView.sharedRoot.addSubview(this.navigation);
    this.navigation.layer.style.backgroundImage = "url('images/startupimage.png')";
    this.navigation.layer.style.backgroundRepeat = "repeat-x";
    this.becomesTopItemTransition = {
        properties: ["transform"],
        from: ["translateY($height)"],
        to: ["translateY(0)"]
    };
    this.wasTopItemTransition = {
        properties: ["transform"],
        from: ["translateY(0)"],
        to: ["translateY($height)"]
    };

    this.loadingView = new PKView();
    this.loadingView.size = new PKSize(30, 30);
    this.loadingView.position = new PKPoint((window.innerWidth - this.loadingView.size.width) / 2, (window.innerHeight - 40 -     this.loadingView.size.height) / 2);
    this.loadingView.id = "loading";
    this.loadingView.delegate = this;
    this.loadingView.zIndex = 10;
    var b = document.createElement("img");
    b.src = "images/activityindicator.png";
    b.id = "loadingImage";
    this.loadingView.layer.appendChild(b);

    this.navigation.addSubview(this.loadingView)
    

    setTimeout(function () {
		controller.startTwitterDataSetup();
    },
    1);
  },

	
	startTwitterDataSetup: function() {
		// Using http://code.google.com/p/jquery-twitter-api/
		// With http://code.google.com/p/jquery-jsonp/
		$.twitter.trends.current(controller.finishTwitterDataSetup);
	},

	finishTwitterDataSetup: function(data, textStatus) {
		// TODO : Check textStatus
		
		t = eval(data).trends;
			
		for (var datetime in t)
		{
			twitterdata = t[datetime]
		}
		
		// Cannot setup view here since 'this' doesn't refer to the controller. 
		// I think this is a result of using the callback.
		controller.setupTrendsView();
	},
	
	setupTrendsView: function() {				
		var table_view = new PKTableView();
	    table_view.delegate = this;
	    table_view.dataSource = this;

	    table_view.style = PKTableViewStylePlain; 

		table_view.autoresizingMask = PKViewAutoresizingFlexibleWidth | PKViewAutoresizingFlexibleHeight; // expand to max size
		table_view.reloadData();
	    
	var twitterViewNavItem = new PKNavigationItem("Twitter Trends", table_view);
		this.loadingView.removeFromSuperview();
		controller.navigation.pushNavigationItem(twitterViewNavItem, true);				
	},

	numberOfSectionsInTableView: function() { 
		return 1;
	},

	tableViewNumberOfRowsInSection: function() { 
		return twitterdata.length;
	},

	tableViewCellForRowAtPath: function(tableView, indexPath) {
		
		var cell = new PKTableViewCell();
		cell.accessoryType = PKTableViewCellAccessoryDisclosureIndicator;
		
		var trend = twitterdata[indexPath.row];	
		cell.text = trend.name;
		return cell;
	},



// Table View Delegates for interaction

	tableViewDidSelectRowAtPath: function(tableView, indexPath) {
		var hashtag = twitterdata[indexPath.row].name;
		
		$.twitter.search.anytag(hashtag,controller.setupTrendsDetailView);	
	}, 

	setupTrendsDetailView: function(data, textStatus) {
		// TODO : Check textStatus
		
		t = eval(data)
		searchResults = t.results;
				
		console.log(searchResults);
		
						
		tweetView = new PKView();
		var tweetContentView = controller.createContentView();
		tweetView.addSubview(tweetContentView);
		tweetView._contentView = tweetContentView

		// Need to do some refactoring to add this
		// d.addSubview(this.loadingView);

		// dom element
		var g = tweetView._contentView.subviews[0];
	    var a = g.layer;

		a.innerHTML = '';
		
		// Insert all tweets.
		for (var i in searchResults)
		{	
			var tweet = searchResults[i].text;
			var byline = searchResults[i].from_user
			
			// Just add some basic HTML with the tweet text and a byline.
			var h = '<p class="Subhead">' + tweet + '</p><p class="Para">' + byline + '</p><hr>';
			
			a.innerHTML += h;
		}
		
		
		var tag = $.URLDecode(t.query)
	    var a = new PKNavigationItem(tag, tweetView);

	    controller.navigation.pushNavigationItem(a, true);
	},
	
	

	// For the new view

	createContentView: function () 
	{
	    var scrollView = new PKScrollView();
	    scrollView.autoresizingMask = PKViewAutoresizingFlexibleWidth | PKViewAutoresizingFlexibleHeight;
	    scrollView.horizontalScrollEnabled = false;
	    scrollView.scrollIndicatorsColor = "#333";
	    scrollView._isContent = true;
	    scrollView.layer.id = "contentScrollView";
	    var myDiv = document.createElement("div");
	    myDiv.className = "content";
	    scrollView.addSubview(new PKContentView(myDiv));

	    return scrollView
	},




// Navigation controller delegate methods

/*	
	navigationViewDidPopItem:  function (a, b) {
		// code here
	},
	
	
	navigationViewDidPushItem: function (b, j) {
		// code here
	}
*/

};

window.addEventListener('load', function() {
  controller.init(); // do this for scoping
});



// Twitter JSONP API built on top of JQuery. 
// http://code.google.com/p/jquery-twitter-api/


/*
screen_name = "grinich"

$.twitter.search.user(screen_name,printSuccess);
$.twitter.search.repliesTo(screen_name,printSuccess);
$.twitter.search.mentioned("sroucheray",printSuccess);
$.twitter.search.hashtag("35days",printSuccess);

//Trends methods
$.twitter.trends.current(printSuccess);
$.twitter.trends.daily(printSuccess);
$.twitter.trends.weekly(printSuccess);

//Public methods
$.twitter.statuses.publicTimeline(printSuccess);
$.twitter.statuses.show("123", printSuccess);
$.twitter.statuses.friends("42421507", printSuccess);

//Social Graph methods 
$.twitter.friends.ids("123", printSuccess);
$.twitter.followers.ids("123", printSuccess);

//Twitter API limitation check
$.twitter.account.rateLimitStatus(printSuccess);

*/
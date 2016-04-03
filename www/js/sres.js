
$.sres.testdata = {};

$.sres.testdata.testAuthenticationResponse = {
	'result': {
		'success':true,
		'message':'welcome'
	},
	'user': {
		'givennames':'Paul John',
		'surname':'Jones',
		'email':'paul.jones@uni.edu.au',
		'userid':'pjones',
		'_id':'284n5v4yuiy2nv4i'
	},
	'authcode':'qoi4nycqi43nyrcqo34y87qy4fqny4yvutq'
};
$.sres.testdata.testAccessibleColumns = [
	{
		'metadata': {
			'name':'BIOL123',
			'description':'Introduction to biology'
		},
		'columns': [
			{
				'_id':'845ynv8mnc9843mycnmy',
				'name':'week 1 attendance',
				'description':'lab attendance in week 1'
			},
			{
				'_id':'oiy4rmcoqr34587ny3c',
				'name':'report grade',
				'description':'draft report hand-in'
			}
		]
	}
];
$.sres.testdata.testColumn = {
	'_id':'845ynv8mnc9843mycnmy',
	'name':'week 1 attendance',
	'description':'lab attendance in week 1',
	'activefrom':moment('2016-03-01'),
	'activeto':moment('2016-04-12'),
	'scanmethod':'timestamp'
};


/* **********************************
	   User interactivity functions 
   *********************************** */
$.sres.scanControlCode = function() {
	$.sres.scanSomething($.sres.scanControlCodeCallback);
};

$.sres.scanControlCodeCallback = function(result) {
	if (result.success && !result.cancelled && result.result) {
		alert(result.result.text);
	}
};

$.sres.identifyPerson = function() {
	$.sres.redirectPage('identifyperson');
};

$.sres.logout = function() {
	$.sres.clearSession();
	$("#leftpanel").panel("close");
	$.sres.redirectPage('login');
};

$.sres.activateColumn = function(columnid) {
	// Fetch column info from server
	var columnInfo = $.sres.testdata.testColumn; // TODO
	// Parse
	session.currentColumn = columnInfo;
	// Redirect
	$.sres.redirectPage('scan');
};

/* **********************************
		  Utility functions 
   *********************************** */
$.sres.loadHeader = function() {
	if ($.isEmptyObject(session.user)) {
		$("[data-loggedout]").show();
		$("[data-loggedin]").hide();
	} else {
		$("[data-loggedin]").show();
		$("[data-loggedout]").hide();
	}
};

$.sres.redirectPage = function(pageid, options) {
	if (typeof options === 'undefined') {
		options = {'reload':true};
	}
	$(":mobile-pagecontainer").pagecontainer("change", $("#" + pageid), options);
};

$.sres.clearSession = function() {
	session = {
		'user':{},
		'currentColumn':{}
	};
};

$.sres.scanSomething = function(callbackSuccess) {
	var res = { 'success':false, 'cancelled':false, 'result':'' };
	try {
		cordova.plugins.barcodeScanner.scan(
			function (result) {
				res = {
					'success': true,
					'cancelled': result.cancelled,
					'result': {
						'text':result.text, 
						'format':result.format
					}
				};
				callbackSuccess(res);
			}, 
			function (error) {
				callbackSuccess(res);
			}
		);
		/*cloudSky.zBar.scan(
			{'flash':'off'}, 
			function(s) {
				res.success = true;
				res.result = s;
				callbackSuccess(res);
			}, 
			function(s) {
				res.success = true;
				res.cancelled = true;
				res.result = s;
				return res;
			}
		);*/
	} catch (err) {
		res.success = false;
		res.result = {'text':err};
		return res;
	}
};


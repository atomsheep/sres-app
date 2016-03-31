var session = {};
var storage = window.localStorage;

var testAuthenticationResponse = {
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
var testAccessibleColumns = [
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
var testColumn = {
	'_id':'845ynv8mnc9843mycnmy',
	'name':'week 1 attendance',
	'description':'lab attendance in week 1',
	'activefrom':moment('2016-03-01'),
	'activeto':moment('2016-04-12'),
	'scanmethod':'timestamp'
};

$(function() {
	$( "body>[data-role='panel']" ).panel();
	$("div[data-role=header]").toolbar();
	clearSession();
});

/* **********************************
       User interactivity functions 
   *********************************** */
function scanControlCode() {
	var scancode = scanSomething();
	// Parse
	alert(scancode.result.text);
	// Fetch details from server
	
	// Display/redirect
	
}

function identifyPerson() {
	redirectPage('identifyperson');
}

function logout() {
	clearSession();
	$("#leftpanel").panel("close");
	redirectPage('login');
	return;
}

function activateColumn(columnid) {
	// Fetch column info from server
	var columnInfo = testColumn; // TODO
	// Parse
	session.currentColumn = columnInfo;
	// Redirect
	redirectPage('scan');
}

/* **********************************
              Page events
   *********************************** */

$(document).on("pagecontainerbeforeshow", function(event, ui) {
	loadHeader();
});

$(document).on("pagecreate", "#scan", function() {
	
	if ($.isEmptyObject(session.currentColumn)) {
		// No current column specified - redirect
		redirectPage('selectcolumn');
	} else {
		$("#scan_columninfo").append(session.currentColumn.name);
		// Do different things depending on scanmethod
		// TODO
		
	}
});

$(document).on("pagecreate", "#identifyperson", function() {
	
});

$(document).on("pagecreate", "#selectcolumn", function() {
	
	// Fetch available columns from server
	var availableColumns = testAccessibleColumns; // TODO
	
	// Show
	var html = '';
	availableColumns.forEach(function(table){
		html += '<div data-role="collapsible" data-inset="false">';
		html += '<h3>' + table.metadata.name + '</h3>';
		html += '<ul data-role="listview">';
		table.columns.forEach(function(column){
			html += '<li><a href="javascript:activateColumn(\'' + column._id + '\')">' + column.name + '</a></li>';
		});
		html += '</ul>';
		html += '</div>';
	});
	$("#selectcolumn_columnlist").append(html).trigger('create');
	
});

$(document).on("pagecreate", "#login", function() {
	
	// Fetch stored login_target if exists
	var loginTarget = storage.getItem('login_target');
	if (loginTarget) {
		$("select[id=login_target]").val(loginTarget).selectmenu('refresh');
	}
	
	$("#login_submit").bind("click", function() {
		// Authenticate
		var authResult = testAuthenticationResponse; // TODO
		// Process
		if (authResult.result.success) {
			// Login success
			$("input[id=password]").val('');
			storage.setItem('login_target', $("select[id=login_target]").val());
			// Save some session variables
			session.user.username = authResult.user.userid;
			session.user.email = authResult.user.email;
			session.user.authcode = authResult.authcode;
			// Redirect
			redirectPage('selectcolumn');
		} else {
			$("#login_failed").show('fast');
			$("input[id=password]").val('').focus();
		}
	});
	
});

/* **********************************
          Utility functions 
   *********************************** */
function loadHeader() {
	if ($.isEmptyObject(session.user)) {
		$("[data-loggedout]").show();
		$("[data-loggedin]").hide();
	} else {
		$("[data-loggedin]").show();
		$("[data-loggedout]").hide();
	}
}

function redirectPage(pageid, options={'reload':true}) {
	$(":mobile-pagecontainer").pagecontainer("change", $("#" + pageid), options);
	return;
}

function clearSession() {
	session = {
		'user':{},
		'currentColumn':{}
	};
}

function scanSomething() {
	var res = { 'success':false, 'cancelled':false, 'result':{} };
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
			return res;
		}, 
		function (error) {
			return res;
		}
	);
}


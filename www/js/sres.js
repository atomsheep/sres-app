
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
	'token':'qoi4nycqi43nyrcqo34y82345nf23597cv36n507387qy4fqny4yvutq'
};
$.sres.testdata.testAccessibleColumns = [
	{
		'metadata': {
			'name':'BIOL123',
			'description':'Introduction to biology'
		},
		'columns': [
			{
				'_id':'845ynv8mnc9843mycnm',
				'name':'week 1 attendance',
				'description':'lab attendance in week 1'
			},
			{
				'_id':'oiy4rmcoqr34587ny3c',
				'name':'report grade',
				'description':'draft report hand-in'
			},
			{
				'_id':'incqo4itrmcyq3847tr',
				'name':'student photo',
				'description':'photo of student'
			}
		]
	}
];
$.sres.testdata.testColumns = {
	'845ynv8mnc9843mycnm':{
		'_id':'845ynv8mnc9843mycnm',
		'name':'week 1 attendance',
		'description':'lab attendance in week 1',
		'activefrom':moment('2016-03-01'),
		'activeto':moment('2016-04-28'),
		'scanmethod':'timestamp'
	},
	'oiy4rmcoqr34587ny3c':{
		'_id':'oiy4rmcoqr34587ny3c',
		'name':'report grade',
		'description':'draft report hand-in',
		'activefrom':moment('2016-03-01'),
		'activeto':moment('2016-04-28'),
		'scanmethod':'scanselect',
		'possiblevalues':[
			{'display':'Great', 'value':5},
			{'display':'OK', 'value':3},
			{'display':'Poor', 'value':1}
		],
		'customvalue':true
	
	},
	'incqo4itrmcyq3847tr':{
		'_id':'incqo4itrmcyq3847tr',
		'name':'student photo',
		'description':'photo of student',
		'activefrom':moment('2016-03-01'),
		'activeto':moment('2016-04-28'),
		'scanmethod':'photo'
	
	}
};


/* **********************************
	   User interactivity functions 
   *********************************** */
$.sres.scanControlCode = function() {
	$.sres.scanSomething($.sres.scanControlCodeCallback);
	return true;
};
$.sres.scanControlCodeCallback = function(result) {
	if (result.success && !result.cancelled && result.result) {
		alert(result.result);
		// TODO redirect to correct column (after checking it is an accessible column)
		
	} else {
		alert('Error with scan: ' + JSON.stringify(result));
	}
	return true;
};

$.sres.scanStudent = function() {
	$.sres.scanSomething($.sres.scanStudentCallback);
	return true;
};
$.sres.scanStudentCallback = function(result) {
	if (result.success && !result.cancelled && result.result) {
		alert(result.result);
		// TODO
		
		// Identify user
		var users = $.sres.findUsers(result.result);
		if (users.length > 1) {
			alert('Warning: more than one user identified');
		}
		var user = users[0];
		
		// Do different things depending on scanmethod
		switch (session.currentColumn.scanmethod) {
			case 'timestamp':
				// Save data
				var res = $.sres.saveUserdata(
					user.id, 
					session.currentColumn._id, 
					new Date().toISOString(),
					$.sres.saveUserdataTimestampCallback
				);
				break;
			case 'scanselect':
				// Collapse find person
				$.sres.scanActionsCollapse(true);
				// Show custom display
				$.sres.showCustomDisplay(user.id);
				// Show buttons
				var html = '';
				var gridBlock = 'b';
				var valueIndex = 0;
				session.currentColumn.possiblevalues.forEach(function(row){
					if (gridBlock == 'b') { gridBlock = 'a' } else { gridBlock = 'b' };
					html += '<div class="ui-block-' + gridBlock + '">' + 
						'<input type="button" ' +
							'data-valueindex="' + valueIndex + '" ' + 
							'value="' + row.display + '" ' + 
							'onclick="javascript:$.sres.saveUserdataScanselect(\'' + user.id + '\',' + valueIndex + ');"' + 
							'/>' + 
						'</div>';
					valueIndex++;
					// TODO: bind actions to buttons
					
				});
				$("#scan_entry_buttons").html(html).trigger('create').show();
				$("#scan_entry_container").show();
				// Show input if allowed
				if (session.currentColumn.customvalue) {
					$("#scan_entry_custom").show();
				}
				break;
		}
		
	} else {
		alert('Error with scan: ' + JSON.stringify(result));
	}
	return true;
};
$.sres.scanStudentSelect = function() {
	
};

$.sres.identifyPerson = function() {
	$.sres.redirectPage('identifyperson');
};

$.sres.selectColumn = function() {
	$.sres.redirectPage('selectcolumn');
};

$.sres.logout = function() {
	$.sres.clearSession();
	$("#leftpanel").panel("close");
	$.sres.redirectPage('login');
};

$.sres.activateColumn = function(columnid) {
	// Fetch column info from server
	var columnInfo = $.sres.testdata.testColumns[columnid]; // TODO
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
		/*cordova.plugins.barcodeScanner.scan(
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
				return true;
			}, 
			function (error) {
				callbackSuccess(res);
				return false;
			}
		);*/
		cloudSky.zBar.scan(
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
		);
	} catch (err) {
		/*alert('Error in scanner: ' + err);
		return false;*/
		
		// TESTONLY
		res.success = true;
		res.result = 'somecode';
		callbackSuccess(res);
		
	}
};

$.sres.findUsers = function(term) {
	// TODO
	
	// TESTONLY
	var res = [{'id':'u4857394875', 'givennames':'Sammy', 'lastname':'de\'Student', 'email':'sammy.student@uni.edu.xx'}];
	return res;
};

$.sres.saveUserdata = function(userid, columnid, data, callbackSuccess) {
	// TODO put call
	//alert('saving data [' + JSON.stringify(data) + '] for userid [' + userid + '] in columnid [' + columnid + ']');
	
	// TESTONLY
	callbackSuccess(data);
	return true;
};
$.sres.saveUserdataTimestampCallback = function(TESTONLYdata) {
	// TESTONLY
	var res = {'success':true, 'message':'OK', 'userid':'u4857394875', 'currentdata':TESTONLYdata, 'previousdata':'bleh'};
	$.sres.showSavedData(res);
	return true;
};
$.sres.saveUserdataScanselect = function(userid, index) {
	$.sres.saveUserdata(
		userid, 
		session.currentColumn._id, 
		session.currentColumn.possiblevalues[index].value, 
		$.sres.saveUserdataScanselectCallback
	);
	return true;
};
$.sres.saveUserdataScanselectCustom = function(userid, customdata) {
	$.sres.saveUserdata(
		userid, 
		session.currentColumn._id, 
		customdata, 
		$.sres.saveUserdataScanselectCallback
	);
	return true;
};
$.sres.saveUserdataScanselectCallback = function(TESTONLYdata) {
	// TESTONLY
	var res = {'success':true, 'message':'OK', 'userid':'u4857394875', 'currentdata':TESTONLYdata, 'previousdata':'bleh'};
	console.log(res);
	$.sres.showSavedData(res);
	$.sres.scanActionsCollapse(false);
	$.sres.scanDataentryCollapse(true);
	return true;
};

$.sres.showSavedData = function(result) {
	// Show result
	if (result.success) {
		// Show recorded data
		$("#scan_displayresult").html(result.currentdata);
		$("#scan_displayresult_container").show();
		// Show custom display
		$.sres.showCustomDisplay(result.userid);
	} else {
		alert('Error saving data');
	}
};

$.sres.showCustomDisplay = function(userid) {
	$("#scan_customdisplay").html( $.sres.getCustomDisplay(userid, session.currentColumn._id) ).show();
	return true;
};

$.sres.getCustomDisplay = function(userid, columnid) {
	// TODO
	
	// TESTONLY
	var res = "this is some custom text for column " + columnid + " and user " + userid;
	return res;
};

$.sres.scanActionsCollapse = function(collapse) {
	$.sres.changeCollapse('scan_actions_container', collapse);
	return true;
};
$.sres.scanDataentryCollapse = function(collapse) {
	$.sres.changeCollapse('scan_entry_container', collapse);
	return true;
};
$.sres.changeCollapse = function(elementId, collapse) {
	if (collapse) {
		$("#" + elementId).collapsible('collapse');
	} else {
		$("#" + elementId).collapsible('expand');
	}
	return true;
};

$.sres.takePhoto = function() {
	// TODO
	
};
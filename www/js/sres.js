
$.sres.testonly = {};

$.sres.testonly.testAuthenticationResponse = {
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
$.sres.testonly.testAccessibleColumns = [
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
$.sres.testonly.testColumns = {
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
$.sres.testonly.possibleValues = [
	{'display':'Great', 'value':5},
	{'display':'OK', 'value':3},
	{'display':'Poor', 'value':1}
];


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

$.sres.showLogin = function() {
	// Fetch stored login_target if exists
	var loginTarget = window.localStorage.getItem('login_target');
	if (loginTarget) {
		$("select[id=login_target]").val(loginTarget).selectmenu('refresh');
	}
	// Login button event handler
	$("#login_submit").bind("click", function() {
		session.api.target = $("select[id=login_target]").val();
		// Authenticate
		$.sres.login($("input[id=username]").val(), $("input[id=password]").val(), session.api.target);
	});
};

$.sres.showScan = function() {
	// Reset a few things
	$("#scan div[data-sres-starthidden]").hide();
	$.sres.scanActionsReset();
	// Determine what to show.
	if ($.isEmptyObject(session.currentColumn)) {
		// No current column specified - redirect.
		$.sres.redirectPage('selectcolumn');
	} else if ( typeof session.scan.entryMethod === 'undefined' ) {
		// Display the select scan entry method.
		$("#scan_selectentrymethod").show();
		// Bind select entrymethod.
		$("button[id=scan_selectentrymethod_start]").unbind().bind("click", function(){ $.sres.scanSelectEntryMethod() });
	} else if (session.scan.entryMethod == 'selectscan' && typeof session.scan.selectScanData === 'undefined') {
		$("#leftpanel_changeentrymethod").show();
		// Need to show the data entry interface first.
		$("#scan_dataentry_header").html('Select data to apply to multiple').trigger('create');
		$("#scan_dataentry_container").show();
		$.sres.scanPopulateDataentry();
	} else {
		$("#leftpanel_changeentrymethod").show();
		// Should be all good to display usual scan interface.
		$("#scan_columninfo").html(session.currentColumn.name);
		$("#scan_actions_container").show();
		$.sres.scanActionsCollapse(false);
		// Bind scan button.
		$("#scan_actions_scanner").unbind().bind("click", function(){ $.sres.scanStudent() });
		// Activate find person filter.
		$.sres.activateFindPersonFilter('scan_actions_search_results', '$.sres.scanUserIdentified');
	}
};

/* Saves the current scan entry method */
$.sres.scanSelectEntryMethod = function() {
	session.scan.entryMethod = $("input:radio[name=scan_selectentrymethod]:checked").val();
	$.sres.redirectPage('scan');
	return true;
};
/* Populates scan_dataentry_container */
$.sres.scanPopulateDataentry = function() {
	var html = '';
	var gridBlock = 'b';
	var valueIndex = 0;
	
	// TESTONLY
	$.sres.testonly.possibleValues.forEach(function(row){
		if (gridBlock == 'b') { gridBlock = 'a' } else { gridBlock = 'b' };
		html += '<div class="ui-block-' + gridBlock + '">' + 
			'<input type="button" ' +
				'data-valueindex="' + valueIndex + '" ' + 
				'value="' + row.display + '" ' + 
				'onclick="javascript:$.sres.dataEntry(\'' + JSON.stringify(row.value) + '\');"' + 
				'/>' + 
			'</div>';
		valueIndex++;
	});
	
	$("#scan_dataentry_buttons").html(html).trigger('create').show();
	
	// Show custom input if allowed
	//if (session.currentColumn.customvalue) {
		// Custom entry.
		$("#scan_dataentry_custom_submit").unbind().bind("click", function() {
			$.sres.dataEntry(JSON.stringify($("#scan_dataentry_custom_input").val()));
		});
		// Custom entry pick up enter in input box.
		$("#scan_dataentry_custom_input").unbind().keyup(function(event) {
			if (event.which == 13) {
				event.preventDefault();
				$("#scan_dataentry_custom_submit").trigger('click');
			}
		});
		// Show container.
		$("#scan_dataentry_custom").show();
	//}
	
	$("#scan_dataentry_container").show();
	
};
$.sres.scanStudent = function() {
	$.sres.scanSomething($.sres.scanStudentCallback);
	return true;
};
$.sres.scanStudentCallback = function(result) {
	if (result.success && !result.cancelled && result.result) {
		alert(result.result);
		// Search the server for this user.
		$.ajax({
			url: session.api.target + 'api/users',
			method: 'GET',
			data: {
				token: session.api.token,
				term: encodeURI($input.val()),
				paperid: session.currentColumn.paperref
			},
			success: function(data) {
				if (users.length > 1) {
					alert('Warning: more than one user identified. Using first user found.');
				}
				var user = users[0];
				$.sres.scanUserIdentified(user._id);
			},
			error: function(data) {
				alert('Error finding users');
			}
		});
	} else {
		alert('Error with scan: ' + JSON.stringify(result));
	}
	return true;
};

$.sres.scanUserIdentified = function(userId) {
	session.scan.targetUserId = userId;
	switch (session.scan.entryMethod) {
		case 'selectscan':
			$.sres.saveUserData(userId);
			break;
		case 'scanselect':
			// Collapse and expand relevant collapsibles.
			$.sres.scanActionsCollapse(true);
			$.sres.scanDataentryCollapse(false);
			// Show custom display.
			$.sres.showCustomDisplay(userId);
			// Show data entry.
			$.sres.scanPopulateDataentry();
			// Show rightpanel button.
			session.rightPanel.userId = userId;
			$.sres.showIdentifyPersonButton();
			break;
	}
	return true;
};

$.sres.selectColumn = function() {
	session.scan = {};
	$.sres.redirectPage('selectcolumn');
};
$.sres.showSelectColumn = function() {
	$.ajax({
		url: session.api.target + 'api/papers',
		method: 'GET',
		data: {
			token: session.api.token
		},
		success: function(data) {
			console.log(data);
			// Show
			var html = '';
			data.forEach(function(paper) {
				html += '<div data-role="collapsible" data-sres-paperid="' + paper._id + '">';
				html += '<h3>' + paper.code + ' ' + paper.name + '</h3>';
				html += '<ul data-role="listview" data-sres-paperid="' + paper._id + '">';
				html += '</ul>';
				html += '</div>';
				$.ajax({
					url: session.api.target + 'api/columns/' + paper._id,
					method: 'GET',
					data: {
						token: session.api.token
					},
					success: $.sres.showSelectColumnLoadColumns(paper._id),
					error: function(data) {
						alert('Error fetching columns from server for paper id ' + paper._id);
					}
				});
			});
			$("#selectcolumn_columnlist").html(html).trigger('create').collapsibleset('refresh');
		},
		error: function(data) {
			alert('Error fetching papers from server for paper id');
		}
	});
};
$.sres.showSelectColumnLoadColumns = function(paperid) {
	return function(data, textStatus, jqXHR) {
		html = '';
		console.log(data);
		data.forEach(function(column) {
			html += '<li><a href="javascript:$.sres.activateColumn(\'' + column._id + '\')">' + column.name + '</a></li>';
		});
		$('ul[data-role=listview][data-sres-paperid=' + paperid + ']').append(html).listview('refresh');
		$("#selectcolumn_columnlist").collapsibleset('refresh'); // TODO fix up
	};
};

$.sres.identifyPerson = function() {
	$.sres.redirectPage('identifyperson');
};
$.sres.showIdentifyPerson = function() {
	$.sres.activateFindPersonFilter('identifyperson_search_results', '$.sres.identifyPersonShowData');
};
$.sres.showIdentifyPersonButton = function() {
	$("a[id=header_rightpanel]").show();
};
$.sres.identifyPersonShowData = function(data) {
	$.sres.showIdentifyPersonButton();
	alert(data);
	// TODO
	
	$("#rightpanel").panel('open');
};

$.sres.showRightPanel = function() {
	$("#rightpanel_heading").html('');
	$("#rightpanel_userdata").html('');
	$("#rightpanel_userdata_container").trigger('create');
	if (typeof session.rightPanel.userId === 'undefined') {
		$("#rightpanel_userdata").html('No target user defined');
		return false;
	}
	// Fetch user info from server.
	$.ajax({
		url: session.api.target + 'api/user/' + session.rightPanel.userId,
		method: 'GET',
		data: {
			token: session.api.token
		},
		success: function(data) {
			$("#rightpanel_heading").html(
				'<h3>' + data.preferredName + ' ' + data.surname + '</h3>'
			).trigger('create');
			
		},
		error: function(data) {
		
		}
	});
	// Fetch userdata from server.
	$.ajax({
		url: session.api.target + 'api/columns/' + session.currentColumn.paperref,
		method: 'GET',
		data: {
			token: session.api.token
		},
		success: function(data) {
			data.forEach(function(column){
				// Add a display row.
				var i = column.index;
				$("#rightpanel_userdata").append(
					'<div class="ui-field-contain" id="rightpanel-field-' + i + '">' +  
	    				'<label for="rightpanel-textinput-' + i + '">' + column.name + '</label>' + 
	    				'<input type="text" name="rightpanel-textinput-' + i + '" id="rightpanel-textinput-' + i + '" readonly="true">' + 
					'</div>'
				);
				// Get the data for this user for this column.
				$.ajax({
					url: session.api.target + 'api/userdata',
					method: 'GET',
					data: {
						token: session.api.token,
						userid: session.rightPanel.userId,
						columnid: column._id
					},
					success: function(data) {
						console.log(i, data);
						if (data.colref == column._id && data.userref == session.rightPanel.userId) {
							$("input[id=rightpanel-textinput-" + i + "]").val(data.data[0].value);
							$("#rightpanel-field-" + i).trigger('create');
						} else {
							console.log('colref or userref mismatch', data);
						}
					},
					error: function(data) {
						
					}
				});
			});
		},
		error: function(data) {
			$("#rightpanel_userdata").html('Could not retrieve paper information.');
		}
	});
	return true;
};

$.sres.logout = function() {
	$("#leftpanel").panel("close");
	$.ajax({
		url: session.api.target + 'api/logout',
		method: 'GET',
		data: {
			token: session.api.token
		},
		success: function(data) {
			$.sres.clearSession();
			$.sres.redirectPage('login');
		},
		error: function(data) {
			alert('Error logging out');
		}
	});
};

$.sres.activateColumn = function(columnid) {
	// Fetch column info from server
	$.ajax({
		url: session.api.target + 'api/column/' + columnid,
		method: 'GET',
		data: {
			token: session.api.token
		},
		success: function(data) {
			console.log(data);
			// Store
			session.currentColumn = data;
			// Redirect
			$.sres.redirectPage('scan');
		},
		error: function(data) {
			alert('Error fetching column information from server.');
		}
	});
};

/* Activates the filterable for a specified elementId.
     elementId: id of element
	 target: function to call with id of selected user
*/
$.sres.activateFindPersonFilter = function(elementId, target) {
	$("#" + elementId).on('filterablebeforefilter', function(e, data) {
		var $ul = $(this);
		var $input = $(data.input);
		var value = $input.val();
		var html = "";
		$ul.html("");
		if (value && value.length > 2) {
			$ul.html("<li><div class='ui-loader'><span class='ui-icon ui-icon-loading'></span></div></li>");
			$ul.listview('refresh');
			$.ajax({
				url: session.api.target + 'api/users',
				method: 'GET',
				data: {
					token: session.api.token,
					term: encodeURI($input.val())
				}
			}).then(function(response) {
				$.each(response, function(i, data) {
					html += '<li><a href="javascript:' + target + '(\'' + data._id + '\');">' + data.preferredName + ' ' + data.surname + '</a></li>';
				});
				$ul.html(html);
				$ul.listview('refresh');
				$ul.trigger('updatelayout');
			});
		}
	});
};

/* **********************************
		  Utility functions 
   *********************************** */
$.sres.loadHeader = function() {
	if ($.isEmptyObject(session.user)) {
		$("[data-sres-loggedout]").show();
		$("[data-sres-loggedin]").hide();
	} else {
		$("[data-sres-loggedin]").show();
		$("[data-sres-loggedout]").hide();
	}
};

$.sres.redirectPage = function(pageid, options) {
	if (typeof options === 'undefined') {
		options = {'reload':true};
	}
	if ($(":mobile-pagecontainer").pagecontainer("getActivePage").attr("id") == pageid) {
		// Loading the same page - trigger something.
		$("#" + pageid).trigger("pagebeforeshow");
	} else {
		// Loading a different page - do the usual.
		$(":mobile-pagecontainer").pagecontainer("change", $("#" + pageid), options);
	}
};

$.sres.clearSession = function() {
	session = {
		'user':{}, // Authorised (logged-in) user.
		'currentColumn':{},
		'api':{}, // API endpoint and credentials.
		'scan':{},
		'rightPanel':{} // Stores information about currently targeted user.
	};
};

$.sres.login = function(username, password, target) {
	$.ajax({
		url: target + 'api/login',
		method: 'POST',
		data: {
			'username':username,
			'password':password
		},
		success: function(data) {
			console.log(data);
			// Login success
			$("input[id=password]").val('');
			window.localStorage.setItem('login_target', $("select[id=login_target]").val());
			// Save some session variables
			session.user = data.user;
			session.api.token = data.token;
			// Redirect
			$.sres.redirectPage('selectcolumn');
		},
		error: function(data) {
			console.log('error');
			console.log(data);
			// Process
			$("#login_failed").show('fast');
			$("input[id=password]").val('').focus();
		}
	});
};

$.sres.scanSomething = function(callbackSuccess) {
	var res = { 'success':false, 'cancelled':false, 'result':'' };
	try {
		cloudSky.zBar.scan(
			{
				'flash':'off',
				'text_title': "Scan identifying code", // Android only
				'text_instructions': "Please point your camera at a valid code." // Android only
			}, 
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
		alert('Error in scanner: ' + err);
		return false;
	}
};

$.sres.saveUserData = function(userId, data) {
	// Do different things based on entrymethod.
	switch (session.scan.entryMethod) {
		case 'selectscan':
			// There should be data saved already.
			if (typeof session.scan.selectScanData === 'undefined') {
				// If not, redirect.
				alert('No data entered. Redirecting you now...');
				$.sres.changeEntryMethod();
				return false;
			}
			// Check if data parameter has content, otherwise use previously selected data.
			if (typeof data === 'undefined') {
				data = session.scan.selectScanData;
			}
			console.log('selectscan: saving to user these data', userId, data);
			break;
		case 'scanselect':
			console.log('scanselect: saving to user these data', userId, data);
			break;
	}
	// Update session.
	session.rightPanel.userId = userId;
	// POST data to server.
	$.ajax({
		url: session.api.target + 'api/userdata',
		method: 'POST',
		data: {
			token: session.api.token,
			userid: userId,
			columnid: session.currentColumn.id,
			data: data
		},
		success: function(data) {
			console.log(data);
			$.sres.showSavedData(data[0], userId);
		},
		error: function(data) {
			alert('Error saving data.');
			return false;
		}
	});
};

/*	Triggered when some data is entered (either pressing a button or entering custom value).
	This function needs to decide what to do afterwards.
*/
$.sres.dataEntry = function(data) {
	var value = JSON.parse(data);
	switch (session.scan.entryMethod) {
		case 'selectscan':
			// This means user has just chosen some data to apply to multiple.
			// Save the selected data/value.
			session.scan.selectScanData = value;
			// Show the scan page to scan a student.
			$.sres.redirectPage('scan');
			break;
		case 'scanselect':
			// This means the user has just chosen some data to apply to an already-scanned student.
			$.sres.saveUserData(session.scan.targetUserId, value);
			break;
	}
	return true;
};

$.sres.changeEntryMethod = function() {
	delete session.scan.entryMethod;
	delete session.scan.selectScanData;
	$("#leftpanel").panel('close');
	$.sres.redirectPage('scan');
	return true;
};

$.sres.showSavedData = function(result, userId) {
	// Update session.
	session.rightPanel.userId = userId;
	// Show recorded data.
	$("#scan_displayresult").html(result.data[0].value);
	$("#scan_displayresult_container").show();
	// Show custom display.
	$.sres.showCustomDisplay(userId);
	// Enable right panel info button.
	$.sres.showIdentifyPersonButton();
};

$.sres.showCustomDisplay = function(userId) {
	$.ajax({
		url: session.api.target + 'api/user/' + userId,
		method: 'GET',
		data: {
			token: session.api.token
		},
		success: function(data) {
			// TODO
			console.log(data);
			$("#scan_customdisplay")
				.html('<h3>' + data.preferredName + ' ' + data.surname + '</h3>')
				.show();
			return true;
		},
		error: function(data) {
			alert('Error showing custom dispaly');
			return false;
		}
	});
	return true;
};

$.sres.scanActionsReset = function() {
	$("input[id=scan_actions_search]").val('').trigger('keyup');
};

$.sres.scanActionsCollapse = function(collapse) {
	$.sres.changeCollapse('scan_actions_container', collapse);
	return true;
};

$.sres.scanDataentryCollapse = function(collapse) {
	$.sres.changeCollapse('scan_dataentry_container', collapse);
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
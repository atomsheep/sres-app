var session = {};

$(function() {
	$( "body>[data-role='panel']" ).panel();
	clearSession();
});

function clearSession() {
	session = {
		'user':{}
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

function scanControlCode() {
	var scancode = scanSomething();
	// Parse
	alert(scancode.result.text);
	// Fetch details from server
	
	// Display/redirect
	
}

function redirectPage(pageid, options={'reload':true}) {
	$(":mobile-pagecontainer").pagecontainer("change", $("#" + pageid), options);
	return;
}

function logout() {
	clearSession();
	$("#leftpanel").panel("close");
	redirectPage('login');
	return;
}

$(document).on("pagecreate", "#select_column", function() {
	
});

$(document).on("pagecreate", "#login", function() {
	
	$("#login_submit").bind("click", function() {
		// Authenticate
		if (confirm('I would now authenticate via API. Test login success?')) {
			// Login success
			$("input[id=password]").val('');
			// Save some session variables
			session.user.username = $("input[id=username]").val();
			session.user.authcode = '';
			
			// Redirect
			redirectPage('select_column');
		} else {
			$("#login_failed").show('fast');
			$("input[id=password]").val('').focus();
		}
	});
	
});

$(document).on("pagecreate", "#home", function() {
	
	$("#scanner").bind("click", function() {
		var scancode = scanSomething();
		
	});
});

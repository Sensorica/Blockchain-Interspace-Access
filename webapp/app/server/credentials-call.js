//import { HTTP } from 'meteor/http';

Meteor.startup(function () {
	  Meteor.methods({
	    postCredentials: function () {
		     console.log('Called credentials contract');
             console.log('Credentials: true');
		     HTTP.call('POST',
                   'http://localhost:3080/credentials' , {
                        data: {"hasCredentials": true},
                        headers: { 'Content-Type': 'application/json'}
                        },
                    function(error, result) {
                        if (error) {
                            console.log('SERVER ERRR');
                            console.log(error);
                        } else
                            console.log('SERVER RESULT');
                            console.log(result);
                        });
	    }

	 
	 })
});


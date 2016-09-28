//import { HTTP } from 'meteor/http';

Meteor.startup(function () {
	  Meteor.methods({
	    postIdentity: function (name) {
		     console.log('Called identity contract');
         console.log('Name: '+ name);
		     HTTP.call('POST',
                   'http://localhost:3080/identity' , {
                        data: {"name": name},
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


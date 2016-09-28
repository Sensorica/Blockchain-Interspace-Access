//import { HTTP } from 'meteor/http';

Meteor.startup(function () {
	  Meteor.methods({
	    postSaflok: function (checkoutDate, checkoutTime, room) {
		     console.log('Called saflok contract');
             console.log('Date: '+ checkoutDate + ' Time: ' + checkoutTime + ' Room: ' + room);
		     HTTP.call('POST',
                   'http://localhost:3080/saflok' , {
                        data: {"expiryDate": checkoutDate, "expiryTime": checkoutTime, "room": room},
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


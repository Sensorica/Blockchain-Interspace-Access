//import { HTTP } from 'meteor/http';

Meteor.startup(function () {
	  Meteor.methods({
	    postSaflok: function (id, expiryDate, expiryTime, room) {
		     console.log('Called saflok contract');
             console.log('Id: '+id+' Date: '+ expiryDate + ' Time: ' + expiryTime + ' Room: ' + room);
		     expiryDate = expiryDate.replace(/-/g, ''); 
             expiryTime= expiryTime.replace(/:/g, ''); 
             HTTP.call('POST',
                   'http://localhost:3080/saflok' , {
                        data: {"id": id, "expiryDate": expiryDate, "expiryTime": expiryTime, "room": room},
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
	    },
        getSaflok: function (result) {
            HTTP.call('GET',
                'http://localhost:3080/saflokKey', {
                    headers: { 'Content-Type': 'application/json'}
                },
            function(error, result) {
                        if (error) {
                            console.log('SERVER ERRR');
                            console.log(error);
                        } else
                            console.log('SERVER RESULT');
                            console.log(result);
                            return result;
                        });
        }

	 
	 })
});


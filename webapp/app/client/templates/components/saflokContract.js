
// When the template is rendered
Template['components_saflokContract'].onRendered(function(){
    TemplateVar.set('state', {isInactive: true});
});


Template['components_saflokContract'].events({

	"submit form":function (event) { 
        event.preventDefault();
        txtId = event.target.id.value;
        txtCheckoutDate = event.target.checkoutDate.value;
        txtCheckoutTime = event.target.checkoutTime.value;
        txtRoom = event.target.room.value;  
        /*Saflok.insert({checkoutDate: event.target.checkoutDate.value,
                       checkoutTime: event.target.checkoutTime.value,
                       room: event.target.room.value});*/
        console.log(txtId);
        console.log(txtCheckoutDate);
        console.log(txtCheckoutTime);
        console.log(txtRoom);
        TemplateVar.set('state', {isMining: true});
        Meteor.call('postSaflok', txtId, txtCheckoutDate, txtCheckoutTime, txtRoom, function(err, response) {
            console.log(response);
        });
        TemplateVar.set('state', {isMined: true});
        response = Meteor.call('getSaflok');
    }

});

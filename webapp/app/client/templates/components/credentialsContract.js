// When the template is rendered
Template['components_credentialsContract'].onRendered(function(){
    TemplateVar.set('state', {isInactive: true});
});

Template['components_credentialsContract'].helpers({

});

Template['components_credentialsContract'].events({

	/**
	On "Create New Contract" click
	
	@event (click .btn-default)
	*/
    "click .btn-default":function () {
        TemplateVar.set('state', {isMining: true});
        Meteor.call('postCredentials',function(err, response) {
            console.log(response);
        });
           }

   
});

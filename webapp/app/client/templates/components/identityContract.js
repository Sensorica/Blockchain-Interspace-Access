// When the template is rendered
Template['components_identityContract'].onRendered(function(){
    TemplateVar.set('state', {isInactive: true});
});

Template['components_identityContract'].helpers({

	
	
});

Template['components_identityContract'].events({

	/**
	On "Create New Contract" click
	
	@event (click .btn-default)
	*/     
         
          "click .btn-default":function () {
            TemplateVar.set('state', {isMining: true});
		Meteor.call('postIdentity',function(err, response) {
            
            console.log(response);
		});
        TemplateVar.set('state', {isMined: true});
        //TemplateVar.set('state', {isInactive: true});
           }
          


});

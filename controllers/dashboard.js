const CreationGoal = require('../models/CreationGoal');

// Method to GET all creationGoals associated with the logged in user
exports.getAllUsersCreationGoals = async (req, res) => {
  /* #swagger.security = [{ "bearerAuth": [] }] */
  /* #swagger.summary = "GETS all creationGoals associated with the _id of a user - essentially the LOGGED IN HOME ---------- (!!!OAUTH PROTECTED ROUTE!!!) */ 
  /* #swagger.description = 'All creationGoals associated with that user are displayed on the dashboard page.' */
  /* #swagger.responses[200] = { 
    description: 'SUCCESS, GET returned all creationGoals associated with the user, after a successful loading of page.
    \nRedirection SUCCESS loading options: #1 after a CREATOINGOAL was UPDATED, #2 after a CREATOINGOAL was DELETED'} */
  // #swagger.responses[201] = { description: 'SUCCESS, GET returned all creationGoals associated with the user, after ADDING another CREATIONGOAL'}      
  // #swagger.responses[401] = { description: 'You are NOT AUTHORIZED to GET the creationGoals'}    
  // #swagger.responses[500] = { description: 'There was an INTERNAL SERVER ERROR while trying to GET all creationGoals associated with the user'}
   /* #swagger.parameters['registered'] = { 
  in: 'query',
  description: '(true) indicates a new user was successfully created, this trigger a post to the dashboard page that the user is redirected to.',
  required: false,
  type: 'boolean'
  } */
  /* #swagger.parameters['created'] = { 
  in: 'query',
  description: '(true) indicates a new creationGoal was successfully created, this trigger a post to the dashboard page that the user is redirected to.',
  required: false,
  type: 'boolean'
  } */
  /* #swagger.parameters['updated'] = { 
  in: 'query',
  description: '(true) indicates a new creationGoal was successfully updated, this trigger a post to the dashboard page that the user is redirected to.',
  required: false,
  type: 'boolean'
  } */
  /* #swagger.parameters['deleted'] = { 
  in: 'query',
  description: '(true) indicates a new creationGoal was successfully deleted, this trigger a post to the dashboard page that the user is redirected to.',
  required: false,
  type: 'boolean'
  } */
try {  
  const creationGoals = await CreationGoal.find({ user: req.user.id }).populate('user').lean();  
  // Check if the `registered` query parameter is true  
  const registered = req.query.registered === 'true';  
  // Check if the `created` query parameter is true
  const created = req.query.created === 'true';
  // Check if the `created` query parameter is true
  const updated = req.query.updated === 'true';
  // Check if the `created` query parameter is true
  const deleted = req.query.deleted === 'true';
  res.status(created ? 201 : 200).render('dashboard', {      
    name: `${req.user.firstName} ${req.user.lastName}`,      
    creationGoals, 
    registered, // Pass this to the Handlebars template          
    created, // Pass this to the Handlebars template 
    updated, // Pass this to the Handlebars template 
    deleted, // Pass this to the Handlebars template 
  });
} catch (error) {
  console.error(error);
  res.status(500).render('error/500')
}
};
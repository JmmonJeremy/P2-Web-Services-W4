const db = require('../models');
const CreationGoal = db.goals;

/*** OTHER types of GET METHODS ********************************************************************************************************************/
// #1 extra "Get" method to search Public creationGoals by a term within their goal section
exports.getPublicSearchResults = async (req, res) => {
    // #swagger.ignore = true
  try{
    const searchQuery = await req.query.query; // Capture the search term
    const creationGoals = await CreationGoal.find({goal: new RegExp(searchQuery,'i'), status: 'Public'})
    .populate('user')
    .sort({ createdAt: 'desc'})
    .lean()

    // Capture the previous URL or set a default if not available
    const back = req.get('Referer') || "/creationGoals";

    res.status(200).render('creationGoals/index', { 
      back,
      heading: `Search Results within Goal for "${searchQuery}"`,
      creationGoals 
    })
  } catch(err){
    console.log(err)
    res.status(404).render('error/404')
  }
};

// #2 extra "Get" method to get all Public creationGoals associated with selected user by their id
exports.getUserCreationGoals = async (req, res) => {
    /* #swagger.security = [{ "bearerAuth": [] }] */
    /* #swagger.summary = "GETS all Public creationGoals associated with a selected user _id ---------- (!!!OAUTH PROTECTED ROUTE!!!)" */ 
    /* #swagger.description = 'All Public creationGoals associated with a selected user are displayed on the dashboard page..' */
    // #swagger.responses[200] = { description: 'SUCCESS, GET returned all creationGoals associated with the user' } 
    // #swagger.responses[401] = { description: 'You are NOT AUTHORIZED to GET the creationGoals' }
    // #swagger.responses[404] = { description: 'The selected user associated with creationGoals was NOT FOUND' }
    // #swagger.responses[412] = { description: 'The PRECONDITION FAILED in the validation of the USER _id PARAMETER' }
    // #swagger.responses[500] = { description: 'There was an INTERNAL SERVER ERROR while trying to GET all creationGoals associated with the user' }
    /* #swagger.parameters['userId'] = { 
        in: 'path',
        description: 'The MongoDB ObjectId under the _id label.',     
    } */
  try {
    console.log("PARAMS Object:", req.params);
    const creationGoals = await CreationGoal.find({
      user: req.params.userId,      
      status: 'Public',
    })
      .populate('user') // Populate the user field
      .lean(); // Convert to plain JavaScript object

    // Get the user from the first creationGoal (assuming user is populated correctly)
    const user = creationGoals[0]?.user;

    if (!user) {
      return res.status(404).render('error/404'); // Handle user not found
    }

    res.status(200).render('creationGoals/index', {
      back: "/creationGoals",
      heading: `by ${user.displayName}`,
      creationGoals,
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error/500');
  }
};

// #3 extra "Get" method to get a specific creationGoal by _id belonging to the user for editing
exports.getUsersCreationGoalById = async (req, res) => { 
    /* #swagger.security = [{ "bearerAuth": [] }] */
    /* #swagger.summary = "GETS the creationGoal belonging to a user by _id for the user to edit & update ---------- (!!!OAUTH PROTECTED ROUTE!!!)" */   
    /* #swagger.description = 'The creationGoal to be edited is displayed on the creationGoals edit page.' */      
    // #swagger.responses[200] = { description: 'SUCCESS, GET returned the selected creationGoal belonging to the user' }
    // #swagger.responses[401] = { description: 'You are NOT AUTHORIZED to GET this creationGoal for editing'}
    // #swagger.responses[404] = { description: 'The selected creationGoal was NOT FOUND' }
    // #swagger.responses[412] = { description: 'The PRECONDITION FAILED in the validation of the CREATIONGOAL _id PARAMETER'}
    // #swagger.responses[500] = { description: 'There was an INTERNAL SERVER ERROR while trying to GET the selected creationGoal'}
  try {
    const creationGoal = await CreationGoal.findOne({
      _id: req.params.id,
    }).lean()
    if (!creationGoal) {
      return res.status(404).render('error/404')
    }

    if (creationGoal.user != req.user.id) {
      res.redirect('/creationGoals')
    } else {
      res.status(200).render('creationGoals/edit', {
        creationGoal,
      })
    }
  } catch (err) {
    console.error(err)
    return res.status(500).render('error/500')
  }
};

// #4 extra "Get" method to load the form page for adding a creationGoal
exports.getAddForm = (req, res) => { 
    /* #swagger.security = [{ "bearerAuth": [] }] */
    /* #swagger.summary = "GETS the form page to be able to create a new creationGoal ---------- (!!!OAUTH PROTECTED ROUTE!!!)" */   
    /* #swagger.description = 'The form to fill out for a new creationGoal is loaded onto a page.' */      
    // #swagger.responses[200] = { description: 'SUCCESS, GET returned the from page to add a new creationGoal' }
    // #swagger.responses[401] = { description: 'You are NOT AUTHORIZED to GET the form page that adds a new creationGoal'}
    // #swagger.responses[500] = { description: 'There was an INTERNAL SERVER ERROR while trying to GET the form page for adding a creationGoal'}
  try { 
  res.status(200).render('creationGoals/add')
  } catch (err) {
    console.error(err)
    res.status(500).render('error/500')
  }
};

/*** MAIN 2 types of GET METHODS *******************************************************************************************************************/
// #1 maing "Get" method for getting all Public creationGoals
exports.getAllPublicCreationGaols = async (req, res) => {
    /* #swagger.security = [{ "bearerAuth": [] }] */
    /* #swagger.summary = "GETS all the creationGoals with a status of Public ---------- (!!!OAUTH PROTECTED ROUTE!!!)" */   
    /* #swagger.description = 'All public creationGoals are displayed on the creationGoals index page.' */      
    // #swagger.responses[200] = { description: 'SUCCESS, GET returned all Public creationGoals' }
    // #swagger.responses[401] = { description: 'You are NOT AUTHORIZED to GET the Public creationGoals'}
    // #swagger.responses[500] = { description: 'There was an INTERNAL SERVER ERROR while trying to GET all Public creationGoals'}
  try {   
    const creationGoals = await CreationGoal.find({ status: 'Public' })
      .populate('user')
      .sort({ createdAt: 'desc' })
      .lean()

    // Capture the previous URL or set a default if not available ***(Do I need this here? This is in helpers/hbs)
    const back = req.get('Referer') || "/creationGoals";

    res.status(200).render('creationGoals/index', {
      back,
      heading: ``,
      creationGoals     
    })
  } catch (err) {
    console.error(err)
    res.status(500).render('error/500')
  }
};

// #2 main "Get" method for getting 1 Public creationGoal by id
exports.getCreationGoalById= async (req, res) => {
    // #swagger.ignore = true
  try {
    let creationGoal = await CreationGoal.findById(req.params.id).lean()

    if (!creationGoal) {
      return res.render('error/404')
    }

    if (creationGoal.user._id != req.user.id && creationGoal.status == 'Private') {
      res.status(404).render('error/404')
    } else {
      res.status(200).render('creationGoals/show', {
        creationGoal,
      })
    }
  } catch (err) {
    console.error(err)
    res.status(404).render('error/404')
  }
};

/*** MAIN 3 alter data METHODS *********************************************************************************************************************/
// The "Post" method for a new creationGoal
exports.addCreationGoal = async (req, res) => {
    /* #swagger.security = [{ "bearerAuth": [] }] */
    /* #swagger.summary = "POSTS the data entered into the form page to create a new creationGoal ---------- (!!!OAUTH PROTECTED ROUTE!!!)" */   
    /* #swagger.description = 'The filled out form for a new creationGoal is added to the database & the user is notified & redirected to the dashboard page.<br><b>OPTIONAL FIELDS Category Titles to Copy & Pate to JSON Body -> "creationNumber":, "creationDate":, & "status":</b>' */      
    // #swagger.responses[201] = { description: 'SUCCESS, POST added a new creationGoal to the database' }
    // #swagger.responses[401] = { description: 'You are NOT AUTHORIZED to POST the form page that adds a new creationGoal'}
    // #swagger.responses[412] = { description: 'The PRECONDITION FAILED in the validation of the creationGoal data'}
    // #swagger.responses[500] = { description: 'There was an INTERNAL SERVER ERROR while trying to POST the form page for adding a creationGoal'}
  try {
        /* #swagger.parameters['body'] = {
            in: 'body',
            description: 'Fields to fill out.
                         \n(Additional OPTIONAL FIELDS you can add to the BODY BELOW = \"creationNumber\":, \"creationDate\":, & \"status\":)',
            required: true,
            '@schema': {
              "type": "object",
              "properties": {         
                "goal": {
                  "type": "string",
                  "example": "New added goal"
                },
                "motivator": {
                  "type": "string",
                  "example": "New added motivator"
                },
                "desire": {
                  "type": "string",
                  "example": "New added desire"
                },
                "belief": {
                  "type": "string",
                  "example": "New added belief"
                },
                "desire": {
                  "type": "string",
                  "example": "New added desire"
                },
                "knowledge": {
                  "type": "string",
                  "example": "New added knowledge"
                },
                "plan": {
                  "type": "string",
                  "example": "New added plan"
                },
                "action": {
                  "type": "string",
                  "example": "New added action"
                },
                "victory": {
                  "type": "string",
                  "example": "New added victory"
                }           
              },
              "required": "goal"
            }
          }
        }
      */   
    req.body.user = req.user.id    
    await CreationGoal.create(req.body)      
    res.status(201).redirect('/dashboard?created=true')
  } catch (err) {
    console.error(err)
    res.status(500).render('error/500')
  }
};

// The "Put" method for updating a creationGoal selected by id
exports.updateCreationGoal = async (req, res) => {
  /* #swagger.security = [{ "bearerAuth": [] }] */  
  /* #swagger.summary = "UPDATES a creationGoal that has been selected by id with the data entered into the form ---------- (!!!OAUTH PROTECTED ROUTE!!!)" */   
  /* #swagger.description = 'The updated data in the form for the creationGoal changes the database & the user is notified & redirected to the dashboard page.<br><b>OPTIONAL FIELDS Category Titles to Copy & Pate to JSON Body -> "creationNumber":, "creationDate":, & "status":</b>' */      
  // #swagger.responses[200] = { description: 'SUCCESS, PUT updated the selected creationGoal in the database' }
  // #swagger.responses[401] = { description: 'You are NOT AUTHORIZED to PUT the form page that updates the selected creationGoal'}
  // #swagger.responses[404] = { description: 'The attempted PUT of the specified creationGoal for updating was Not Found'}
  // #swagger.responses[412] = { description: 'The PRECONDITION FAILED in the validation of the creationGoal data'}
  // #swagger.responses[500] = { description: 'There was an INTERNAL SERVER ERROR while trying to PUT the form page for updating the selected creationGoal'}
  /* #swagger.parameters['id'] = {       
         description: 'Equal to the Unique identifier _id field for the creationGoal (ie: 6736b9dc941b8c39d5d9ef23)',      
     } */
  try {    
    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Fields to update
                     \n(Additional OPTIONAL FIELDS you can add to the BODY BELOW = \"creationNumber\":, \"creationDate\":, & \"status\":)',
        required: true,
         '@schema': {
          "type": "object",
          "properties": {         
            "goal": {
              "type": "string",
              "example": "Updated goal"
            },
            "motivator": {
              "type": "string",
              "example": "Updated motivator"
            },
            "desire": {
              "type": "string",
              "example": "Updated desire"
            },
            "belief": {
              "type": "string",
              "example": "Updated belief"
            },
            "desire": {
              "type": "string",
              "example": "Updated desire"
            },
            "knowledge": {
              "type": "string",
              "example": "Updated knowledge"
            },
            "plan": {
              "type": "string",
              "example": "Updated plan"
            },
            "action": {
              "type": "string",
              "example": "Updated action"
            },
            "victory": {
              "type": "string",
              "example": "Updated victory"
            }           
          },
          "required": "goal"
        }
      }
    }
  */
    let creationGoal = await CreationGoal.findById(req.params.id).lean();
    const creationGoals = await CreationGoal.find({ user: req.user.id }).populate('user').lean();

    if (!creationGoal) {
      return res.status(404).render('error/404')
    }

    if (creationGoal.user != req.user.id) {
      res.status(401).redirect('/error/401')
    } else {
      creationGoal = await CreationGoal.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      })    
      // Changed this from res.redirect to stop errors in swagger doc & .rest routes
      const updated = 'true'; 
      res.status(200).render('dashboard', {      
        name: `${req.user.firstName} ${req.user.lastName}`,      
        creationGoals,     
        updated, // Pass this to the Handlebars template        
      });
    }
  } catch (err) {
    console.error(err)
    return res.status(500).render('error/500')
  }
};

// The "Delete" method for removing a creationGoal selected by id
exports.deleteCreationGoal = async (req, res) => {
    /* #swagger.security = [{ "bearerAuth": [] }] */
    /* #swagger.summary = "DELETES a creationGoal by its _id ---------- (!!!OAUTH PROTECTED ROUTE!!!)" */ 
    /* #swagger.description = 'After deletion it returns a success code and redirects to the dashboard page with an alert notification of the successful deletion of the creationGoal.' */
    // #swagger.responses[200] = { description: 'SUCCESS, the creationGoal was DELETED' }
    // #swagger.responses[401] = { description: 'You are NOT AUTHORIZED to DELETE this creationGoal'}
    // #swagger.responses[404] = { description: 'The selected creationGoal for DELETION was NOT FOUND'}
    // #swagger.responses[412] = { description: 'The PRECONDITION FAILED in the validation of the CREATIONGOAL _id PARAMETER'}
    // #swagger.responses[500] = { description: 'There was an INTERNAL SERVER ERROR while trying to DELETE all Public creationGoals'}
  try {
    let creationGoal = await CreationGoal.findById(req.params.id).lean()
    const creationGoals = await CreationGoal.find({ user: req.user.id }).populate('user').lean();

    if (!creationGoal) {
      return res.status(404).render('error/404')
    }

    if (creationGoal.user != req.user.id) {
      res.status(401).render('/error/401')
    } else {
      await CreationGoal.deleteOne({ _id: req.params.id })      
      // Changed this from res.redirect to stop errors in swagger doc & .rest routes
      const deleted = 'true'; 
      res.status(200).render('dashboard', {      
        name: `${req.user.firstName} ${req.user.lastName}`,      
        creationGoals,     
        deleted, // Pass this to the Handlebars template        
      });
    }
  } catch (err) {
    console.error(err)
    return res.status(500).render('error/500')
  }
};

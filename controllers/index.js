

// Home page sign on checking Method
exports.grantAccess = (req, res) => { 
  /* #swagger.summary = GETS the HOME page ---------- (!!!OAUTH DOORWAY ROUTE!!!)*/  
  /* #swagger.description = 'For the HOME page if you are NOT LOGGED IN it loads the LOGIN page OR if you are LOGGED IN it loads the DASHBOARD.<br>
  <b>The outcome will only reflect if you are signed in through Google or GitHub OAuth. Changing the boolean below has no direct effect.</b>' */ 
  // #swagger.responses[200] = { description: 'SUCCESS, the LOGIN page is loaded or you are already logged in & the DASHBOARD page is loaded' }
  // #swagger.responses[401] = { description: 'A previous LOGIN was NOT AUTHORIZED & you were redirected here to try again.'}
  // #swagger.responses[500] = { description: 'There was an INTERNAL SERVER ERROR while trying to get AUTHORIZATION for you.'}
  /* #swagger.parameters['accessDenied'] = { 
  in: 'query',
  description: '(false) denotes that AUTHORIZATION was GIVEN, thus redirecting you to the dashboard page
              \n(true) denotes that AUTHORIZATION was DENIED, thus rendering the login page.',
  required: false,
  type: 'boolean'
  } */
try {  
  const accessDenied = req.query.accessDenied === 'true';  // Check if 'accessDenied' is true in the query
  res.status(accessDenied ? 401 : 200).render('login', {
      layout: 'login',
      accessDenied, // Pass accessDenied flag to the view
  })
} catch (error) {
  console.error('Error in rendering login page:', error);
  res.status(500).render('error/500')
}
};
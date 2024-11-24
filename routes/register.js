const express = require('express');
const routes = express.Router();

routes.get('/', (req, res) => { // register an email and password
      /* #swagger.summary = "Get the page for registering a user ---(AUTH DOORWAY FOR PASSWORD SIGN IN)---" */ 
      /* #swagger.description = 'Special page created for registering new users for password sign-in capability.' */  
  try {  
    res.status(200).render('register', { // Add missing curly brace
      layout: 'login',   
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error/500');
  }
});

  module.exports = routes;
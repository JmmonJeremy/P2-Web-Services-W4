const express = require('express');
const routes = express.Router();

routes.get('/', (req, res) => { // register an email and password
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
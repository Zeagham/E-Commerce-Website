var mongoose = require('mongoose');

var product =  require('../models/product');
 var products = new product({

   imagepath:"http://jonvilma.com/images/headphones-1.jpg",
   title:  "THIS IS THE FIRST PRODUCT",
   price:20,
   description :"THIS IS THE DESCRIPTION OF PRODUCT"

 });

products.save(function(err,data){
    if(err){throw err}
    else {console.log('data saved ')}
} );
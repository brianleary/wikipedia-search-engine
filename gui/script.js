/*jslint browser: true, indent: 3 */

document.addEventListener('DOMContentLoaded', function () {

   // Enforce stricter JavaScript rules.
   'use strict';

   // Declare this function's local variables.
   var queryInputElement, queryOutputElement, submitqueryButton;

   // Find all needed elements and save them in variables.
   queryInputElement = document.querySelector('#query-input');
   submitqueryButton = document.querySelector('#submit-query');
   queryOutputElement = document.querySelector('#query-output');

   // Make things happen when a user clicks on the button element.
   submitqueryButton.addEventListener('click', function () {
      var query, result;

      // Get the string value out of the input textbox.
      query = queryInputElement.value;

      if (query.length === 0) {
         // The user didn't input a query, so use a default.
         queryOutputElement.textContent = 'Please type in a search query';
      } else {
         // The user did input a query, so use it.

         var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 
         var url = "http://localhost:9200/articlesindex/_search";
         xmlhttp.open("POST", url);
         xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
         xmlhttp.send(JSON.stringify({"query": { "match": { "text": { "query": query}}}}));
         xmlhttp.onload = () => {
            console.log(xmlhttp);
            if (xmlhttp.status === 200) {
               result = xmlhttp.response;
            } else {
               result = 'API error'
            };
         }
         

         // Doesn't want to show the text on the page for some reason
         queryOutputElement.textContent = result;
      }
   }, false);

}, false);

/*jslint browser: true, indent: 3 */
/*jshint esversion: 6 */

document.addEventListener('DOMContentLoaded', function () {

   // Enforce stricter JavaScript rules.
   'use strict';

   // Declare this function's local variables.
   var idInputElement, titleInputElement, textInputElement, submitArticleButton, articleOutputElement;

   // Find all needed elements and save them in variables.
   idInputElement = document.querySelector('#id-input');
   titleInputElement = document.querySelector('#title-input');
   textInputElement = document.querySelector('#text-input');
   submitArticleButton = document.querySelector('#submit-article');
   articleOutputElement = document.querySelector('#article-output');

   // Check if string only contains numbers
   function isNum(string) {
      return (/^[0-9]*$/).test(string);
   }

   // API Fetch Function
   function addArticleAPICall(url, dataToSend) {
      fetch(url, {
         method: 'POST',
         body: dataToSend,
         mode: 'cors',
         headers: new Headers({
            'Content-Type': 'application/json'
         })
      })
      // Convert response to JSON
      .then(response => {
         return response.json();
      })
      .then(data => {
         // Log response to console
         console.log('Response', data);

         // Check if article was added successfully
         if (data.result === "created") {
            articleOutputElement.textContent = "Article added succesfully!";
         } else {
            articleOutputElement.textContent = "Error adding article";
         }
      })
      // Catch and log error to console
      .catch(error => console.log(error));
   }

   // Function called when searching (called by eventlisteners)
   function addArticleFunction() {
      var id, title, text, dataToSend, url;

      url = "http://localhost:9200/articlesindex/_doc/";

      // Get the string values out of the input textboxes.
      id = idInputElement.value;
      title = titleInputElement.value;
      text = textInputElement.value;

      if (id.length === 0) {
         // No ID inputted
         articleOutputElement.textContent = 'Please type in an article ID';
      } else if (!isNum(id)) {
         // ID is non-integer
         articleOutputElement.textContent = 'IDs must only be numeric characters';
      } else if (title.length === 0) {
         // No title inputted
         articleOutputElement.textContent = 'Please type in a title';
      } else if (text.length === 0) {
         // No text inputted
         articleOutputElement.textContent = 'Please type in text for the article';
      } else {
         // Add article
         dataToSend = '{"docid": ' +  Number(id) + ', "title": "' + title.replaceAll('"', "'") + '", "text": "' + text.replaceAll('"', "'").replaceAll("\n", " ") + '"}';
         console.log(dataToSend);
         addArticleAPICall(url, dataToSend);
      }
   }

   // Handle clicking on button
   submitArticleButton.addEventListener('click', function () {
      addArticleFunction();
   }, false);

}, false);

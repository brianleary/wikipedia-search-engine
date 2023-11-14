/*jslint browser: true, indent: 3 */
/*jshint esversion: 6 */

document.addEventListener('DOMContentLoaded', function () {

   // Enforce stricter JavaScript rules.
   'use strict';

   // Declare this function's local variables.
   var queryInputElement, queryOutputElement, searchTextBoxElement,
       submitqueryButton, addAndButton, addOrButton, addNotButton,
       advancedSearchActive, andClauseActive, orClauseActive, notClauseActive;

   // Find all needed elements and save them in variables.
   queryInputElement = document.querySelector('#query-input');
   submitqueryButton = document.querySelector('#submit-query');
   queryOutputElement = document.querySelector('#query-output');
   searchTextBoxElement = document.querySelector('#searchTextBoxArea');
   addAndButton = document.querySelector('#add-and');
   addOrButton = document.querySelector('#add-or');
   addNotButton = document.querySelector('#add-not');

   // API Fetch Function
   function searchAPICall(url, dataToSend) {
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

         // Clear output for each search
         queryOutputElement.textContent = "";

         if (data.hits.hits.length === 0) {
            // If array size is zero, there were no search results
            queryOutputElement.textContent = "No results";
         } else {
            // There were results

            // Create table header
            queryOutputElement.insertAdjacentHTML('beforeend', `<th class="tableCell">Document Score</td>
                                                                <th class="tableCell">Document Title</td>
                                                                <th class="tableCell">Link</td>
                                                                <th class="tableCell">Text Preview</td>`);

            // Access data.hits.hits, which is an array of the search results
            // Loop through each result and create a row in the table
            data.hits.hits.map(searchResult => {
               // Create table row element
               var urlString = "https://en.wikipedia.org/wiki/" + searchResult._source.title.replace(' ', '_');
               const markup = `<td class="tableCell">${searchResult._score}</td>
                               <td class="tableCell">${searchResult._source.title}</td>
                               <td class="tableCell"><a href=${urlString}>Go to page</a></td>
                               <td class="tableCell">${searchResult._source.text.substring(0, 250)}</td>`;
               queryOutputElement.insertAdjacentHTML('beforeend', markup);
            });
         }
      })
      // Catch and log error to console
      .catch(error => console.log(error));
   }

   // Function called when searching (called by eventlisteners)
   function searchQueryFunction() {
      var query, dataToSend, url;

      url = "http://localhost:9200/articlesindex/_search";

      // Get the string value out of the input textbox.
      query = queryInputElement.value.toLowerCase();

      if (query.length === 0) {
         // No query inputted
         queryOutputElement.textContent = 'Please type in a search query';
      } else {
         // Query inputted
         // Create JSON object for search query

         // Build more advanced query with AND/OR support
         // Include initial text box value as first AND clause
         dataToSend = '{"query": { "bool": { "should": [{"bool": {"must": [{"match": { "text": "' + query + '"}}';

         // Start building advanced API call
         if (advancedSearchActive) {

            // Add additional AND clauses if needed
            if (andClauseActive) {
               var elements = document.getElementsByClassName("and-clause");

               // https://medium.com/coding-beauty/javascript-remove-empty-strings-from-array-4b6c81f8faec#:~:text=To%20remove%20empty%20strings%20from%20an%20array%20in%20JavaScript%2C%20call,array%20excluding%20the%20empty%20strings.
               // Remove any empty elements
               var elementTextValues = []

               for(var i = 0; i < elements.length; i++) {
                  elementTextValues[i] = elements[i].value.toLowerCase()
               }

               elementTextValues = elementTextValues.filter((str) => str != '')

               // Loop through text value array (if there are none the loop doesn't run)
               for(var i = 0; i < elementTextValues.length; i++) {
                  dataToSend += ',{"match": { "text": "' + elementTextValues[i] + '"}}';
               }
            }

            // Add closing brackets for AND clauses
            dataToSend += ']';
            if (!notClauseActive) {
               dataToSend += '}}';
            }



            // Add additional NOT clauses if needed
            if (notClauseActive) {
               var elements = document.getElementsByClassName("not-clause");

               // Remove any empty elements
               var elementTextValues = []

               for(var i = 0; i < elements.length; i++) {
                  elementTextValues[i] = elements[i].value.toLowerCase()
               }

               elementTextValues = elementTextValues.filter((str) => str != '')

               // Loop through text value array (if there are none the loop doesn't run)
               for(var i = 0; i < elementTextValues.length; i++) {
                  if (i == 0) {
                     // Add beginning of NOT clauses if on first element
                     dataToSend += ',"must_not": ['
                  } else {
                     // Add comma if there are multiple NOT clauses
                     dataToSend += ',';
                  }

                  dataToSend += '{"match": { "text": "' + elementTextValues[i] + '"}}';
               }

               if (elementTextValues.length != 0) {
                  // Add closing brackets for NOT clauses
                  dataToSend += ']}}';
               }
            }

            



            // Add additional OR clauses if needed
            if (orClauseActive) {
               var elements = document.getElementsByClassName("or-clause");

               // Remove any empty elements
               var elementTextValues = []

               for(var i = 0; i < elements.length; i++) {
                  elementTextValues[i] = elements[i].value.toLowerCase()
               }

               elementTextValues = elementTextValues.filter((str) => str != '')

               for(var i = 0; i < elementTextValues.length; i++) {
                  // Check for any empty query values
                  if (elements[i].value) {
                     dataToSend += ',{"match": { "text": "' + elementTextValues[i] + '"}}';
                  }  
               }
            }

            // Add closing brackets
            dataToSend += ']}}}';
            
         } else {
            // If no extra text boxes were added, just run the basic query
            dataToSend = '{"query": { "match": { "text": { "query": "' + query + '"}}}}';
         }

         console.log(dataToSend)

         // Uncomment when ready for testing
         searchAPICall(url, dataToSend);
      }
   }

   // Handle pressing enter on textbox
   queryInputElement.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
         searchQueryFunction();
      }
   }, false);

   // Handle clicking on search button
   submitqueryButton.addEventListener('click', function () {
      searchQueryFunction();
   }, false);

   // Handle clicking on "Add AND" button
   addAndButton.addEventListener('click', function () {
      const markup = `<h3>AND</h3>
                      <input class="and-clause" type="text" />`;
      searchTextBoxElement.insertAdjacentHTML('beforeend', markup);
      advancedSearchActive = true;
      andClauseActive = true;
   }, false);

   // Handle clicking on "Add OR" button
   addOrButton.addEventListener('click', function () {
      const markup = `<h3>OR</h3>
                      <input class="or-clause" type="text" />`;
      searchTextBoxElement.insertAdjacentHTML('beforeend', markup);
      advancedSearchActive = true;
      orClauseActive = true;
   }, false);

   // Handle clicking on "Add NOT" button
   addNotButton.addEventListener('click', function () {
      const markup = `<h3>NOT</h3>
                      <input class="not-clause" type="text" />`;
      searchTextBoxElement.insertAdjacentHTML('beforeend', markup);
      advancedSearchActive = true;
      notClauseActive = true;
   }, false);

}, false);

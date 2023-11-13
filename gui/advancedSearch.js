/*jslint browser: true, indent: 3 */
/*jshint esversion: 6 */

document.addEventListener('DOMContentLoaded', function () {

   // Enforce stricter JavaScript rules.
   'use strict';

   // Declare this function's local variables.
   var queryInputElement, queryOutputElement, submitqueryButton, addAndButton, addOrButton, addNotButton, searchTextBoxElement;

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
         body: JSON.stringify(dataToSend),
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
         // Basic query used for testing
         // dataToSend = {"query": { "match": { "text": { "query": query }}}};

         // Build more advanced query with AND/OR support
         dataToSend = '{"query": {"should": [{"bool": {"must": [{"match": { "';

         var words = query.split(" ");

         for (var i = 0; i < words.length; i += 1) {
            if (words[i] === "and") {

            } else if (words[i] === "or") {

            } else {
               dataToSend += words[i] + " ";
            }
         }

         queryOutputElement.textContent = dataToSend;

         // Uncomment when ready for testing
         //searchAPICall(url, dataToSend);
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
                      <input id="and-clause" type="text" />`;
      searchTextBoxElement.insertAdjacentHTML('beforeend', markup);
   }, false);

   // Handle clicking on "Add OR" button
   addOrButton.addEventListener('click', function () {
      const markup = `<h3>OR</h3>
                      <input id="or-clause" type="text" />`;
      searchTextBoxElement.insertAdjacentHTML('beforeend', markup);
   }, false);

   // Handle clicking on "Add NOT" button
   addNotButton.addEventListener('click', function () {
      const markup = `<h3>NOT</h3>
                      <input id="not-clause" type="text" />`;
      searchTextBoxElement.insertAdjacentHTML('beforeend', markup);
   }, false);

}, false);

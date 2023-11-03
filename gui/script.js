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

   // API Fetch Function
   // https://www.youtube.com/watch?v=zUcc4vW-jsI
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
         queryOutputElement.textContent = ""

         if (data.hits.hits.length === 0) {
            // If array size is zero, there were no search results
            queryOutputElement.textContent = "No results"
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
                               <td class="tableCell">${searchResult._source.text.substring(0, 250)}</td>`
               queryOutputElement.insertAdjacentHTML('beforeend', markup);
            })
         }
      })
      // Catch and log error to console
      .catch(error => console.log(error));
   }

   // Search query button element handler
   submitqueryButton.addEventListener('click', function () {
      var query, dataToSend, url;

      url = "http://localhost:9200/articlesindex/_search";

      // Get the string value out of the input textbox.
      query = queryInputElement.value;

      if (query.length === 0) {
         // The user didn't input a query, so use a default.
         queryOutputElement.textContent = 'Please type in a search query';
      } else {
         // The user did input a query, so use it         
         // Create JSON object for search query
         dataToSend = {"query": { "match": { "text": { "query": query }}}}

         //result = searchAPICall(url, dataToSend)
         searchAPICall(url, dataToSend)
      }
   }, false);
}, false);

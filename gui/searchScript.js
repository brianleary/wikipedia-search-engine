/*jslint browser: true, indent: 3 */
/*jshint esversion: 6 */

document.addEventListener('DOMContentLoaded', function () {

   // Enforce stricter JavaScript rules.
   'use strict';

   // Declare this function's local variables.
   var queryInputElement, queryOutputElement, submitqueryButton,
       previousPageButton, nextPageButton, numberOfPages,
       pageNumber, response, globalURL, globalNumberOfResults;

   globalURL = "http://localhost:9200/articlesindex/_search";
   globalNumberOfResults = 1000;

   // Find all needed elements and save them in variables.
   queryInputElement = document.querySelector('#query-input');
   submitqueryButton = document.querySelector('#submit-query');
   queryOutputElement = document.querySelector('#query-output');

   // API Fetch Function
   async function getData(url, dataToSend) {
      const response = await fetch(url, {
         method: 'POST',
         body: dataToSend,
         mode: 'cors',
         headers: new Headers({
            'Content-Type': 'application/json'
         })
      });
    
      return response.json();
   }

   function displayResults(response, pageNumber) {
      var searchResult, startingResult, endingResult;

      // Determine which results to display based on page number
      startingResult = pageNumber * 10;
      endingResult = startingResult + 10;
      if (endingResult > response.hits.hits.length) {
         endingResult = response.hits.hits.length;
      }

      // Save results in variable
      searchResult = response.hits.hits;

      // Clear output for each print
      queryOutputElement.textContent = "";

      // Create table header
      queryOutputElement.insertAdjacentHTML('beforeend', `<p>Page: ${pageNumber + 1}<p>
                                                          <th class="tableCell">Document Score</th>
                                                          <th class="tableCell">Document Title</th>
                                                          <th class="tableCell">Text Preview</th>`);

      for (let i = startingResult; i < endingResult; i += 1) {
         // Create table row element
         var urlString = "https://en.wikipedia.org/wiki/" + searchResult[i]._source.title.replaceAll(' ', '_');
         const markup = `<td class="tableCell">${searchResult[i]._score}</td>
                           <td class="tableCell"><a href=${urlString}>${searchResult[i]._source.title}</td>
                           <td class="tableCell">${searchResult[i]._source.text.substring(0, 250)}</td>`;
         queryOutputElement.insertAdjacentHTML('beforeend', markup);
      }
      
      // Add page buttons
      const markup = `<p>
                      <div class="pageButton"><button id="previousPageButton" type="button">Previous Page</button></div>
                      <div class="pageButton"><button id="nextPageButton" type="button">Next Page</button></div>
                      </p>`;
      queryOutputElement.insertAdjacentHTML('beforeend', markup);

      // Tie page buttons to functions
      previousPageButton = document.querySelector('#previousPageButton');
      nextPageButton = document.querySelector('#nextPageButton');
      previousPageButton.onclick = previousPageButtonFunction;
      nextPageButton.onclick = nextPageButtonFunction;
   }

   // Function called when searching (called by eventlisteners)
   async function searchQueryFunction() {
      var query, dataToSend, url, numberOfResults;

      url = globalURL;
      numberOfResults = globalNumberOfResults;

      // Get the string value out of the input textbox.
      query = queryInputElement.value.toLowerCase();

      if (query.length === 0) {
         // No query inputted
         queryOutputElement.textContent = 'Please type in a search query';
      } else {
         // Clear output for each search
         queryOutputElement.textContent = "";

         // Query inputted
         // Create JSON object for search query
         // Basic query used for testing
         dataToSend = '{"size": ' + numberOfResults + ', "query": { "match": { "text": { "query": "' + query.replaceAll('"', "'") + '"}}}}';
         console.log(dataToSend);

         response = await getData(url, dataToSend).then();
         console.log('Response', response);

         if (response.hits.hits.length === 0) {
            // If array size is zero, there were no search results
            queryOutputElement.textContent = "No results";
         } else {
            // There were results; display them
            numberOfPages = Math.floor((response.hits.hits.length - 1)/ 10);
            pageNumber = 0;
            displayResults(response, pageNumber);
         }         
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

   // Handle clicking on previous page button
   function previousPageButtonFunction() {
      if (pageNumber > 0) {
         pageNumber -= 1;
         displayResults(response, pageNumber);
      }    
   }

   // Handle clicking on next page button
   function nextPageButtonFunction() {
      if (pageNumber < numberOfPages) {
         pageNumber += 1;
         displayResults(response, pageNumber);
      }    
   }

}, false);

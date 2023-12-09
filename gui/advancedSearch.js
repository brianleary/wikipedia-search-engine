/*jslint browser: true, indent: 3 */
/*jshint esversion: 6 */

document.addEventListener('DOMContentLoaded', function () {

   // Enforce stricter JavaScript rules.
   'use strict';

   // Declare this function's local variables.
   var queryInputElement, queryOutputElement, searchTextBoxElement, pageButtonElement,
       submitqueryButton, addAndButton, addOrButton, addNotButton,
       advancedSearchActive, andClauseActive, orClauseActive, notClauseActive,
       previousPageButton, nextPageButton, numberOfPages, pageNumber, response,
       globalURL, globalNumberOfResults;

   globalURL = "http://localhost:9200/articlesindex/_search";
   globalNumberOfResults = 1000;

   // Find all needed elements and save them in variables.
   queryInputElement = document.querySelector('#query-input');
   submitqueryButton = document.querySelector('#submit-query');
   queryOutputElement = document.querySelector('#query-output');
   pageButtonElement = document.querySelector('#pageButtons');
   searchTextBoxElement = document.querySelector('#searchTextBoxArea');
   addAndButton = document.querySelector('#add-and');
   addOrButton = document.querySelector('#add-or');
   addNotButton = document.querySelector('#add-not');

   // Function to change double quotes to single quotes in a string
   function cleanQuotes(stringWithQuotes) {
      return stringWithQuotes.replaceAll('"', "'").replaceAll('\\', "");
   }
   
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
      pageButtonElement.textContent = "";

      // Create table header
      queryOutputElement.insertAdjacentHTML('beforeend', `<p>Page: ${pageNumber + 1}</p>
                                                          <th class="tableCell">Document Score</th>
                                                          <th class="tableCell">Document Title</th>
                                                          <th class="tableCell">Text Preview</th>`);

      for (let i = startingResult; i < endingResult; i += 1) {
         // Create table row element
         var urlString = "https://en.wikipedia.org/wiki/" + searchResult[i]._source.title.replaceAll(' ', '_');
         const markup = `<tr>
                           <td class="tableCell">${searchResult[i]._score}</td>
                           <td class="tableCell"><a href=${urlString}>${searchResult[i]._source.title}</td>
                           <td class="tableCell">${searchResult[i]._source.text.substring(0, 250)}</td>
                         </tr>`;
         queryOutputElement.insertAdjacentHTML('beforeend', markup);
      }
      
      // Add page buttons
      pageButtonElement.insertAdjacentHTML('beforeend', `<p id="pageButtonContainer">
                                                            <button id="previousPageButton" type="button">Previous Page</button>
                                                            <button id="nextPageButton" type="button">Next Page</button>
                                                         </p>`);

      // Tie page buttons to functions
      previousPageButton = document.querySelector('#previousPageButton');
      nextPageButton = document.querySelector('#nextPageButton');
      previousPageButton.onclick = previousPageButtonFunction;
      nextPageButton.onclick = nextPageButtonFunction;
   }

   // Function called when searching (called by eventlisteners)
   async function searchQueryFunction() {
      var query, dataToSend, url, numberOfResults, phraseSearchActive;

      url = globalURL;
      numberOfResults = globalNumberOfResults;

      // Get the string value out of the input textbox.
      query = cleanQuotes(queryInputElement.value.toLowerCase());

      // Check if phrase search is enabled
      phraseSearchActive = document.getElementById("yes").checked == true;

      // Clear page buttons regardless of query length (they will be reprinted if needed)
      pageButtonElement.textContent = "";

      if (query.length === 0) {
         // No query inputted
         queryOutputElement.textContent = 'Please type in a search query';
      } else {
         // Clear output for each search
         queryOutputElement.textContent = "";

         // Query inputted
         // Create JSON object for search query

         // Build more advanced query with AND/OR support
         // Include initial text box value as first AND clause
         dataToSend = '{"size": ' + numberOfResults + ', "query": { "bool": { "should": [{"bool": {"must": [{"match';
         if (phraseSearchActive) {
            dataToSend += '_phrase';
         }
         dataToSend += '": { "text": "' + cleanQuotes(query) + '"}}';

         // Start building advanced API call
         if (advancedSearchActive) {

            // Add additional AND clauses if needed
            if (andClauseActive) {
               var elements = document.getElementsByClassName("and-clause");

               // Remove any empty elements
               var elementTextValues = [];

               for(var i = 0; i < elements.length; i++) {
                  elementTextValues[i] = cleanQuotes(elements[i].value.toLowerCase());
               }

               elementTextValues = elementTextValues.filter((str) => str != '');

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
               var elementTextValues = [];

               for(var i = 0; i < elements.length; i++) {
                  elementTextValues[i] = cleanQuotes(elements[i].value.toLowerCase());
               }

               elementTextValues = elementTextValues.filter((str) => str != '');

               // Loop through text value array (if there are none the loop doesn't run)
               for(var i = 0; i < elementTextValues.length; i++) {
                  if (i == 0) {
                     // Add beginning of NOT clauses if on first element
                     dataToSend += ',"must_not": [';
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
               var elementTextValues = [];

               for(var i = 0; i < elements.length; i++) {
                  elementTextValues[i] = cleanQuotes(elements[i].value.toLowerCase());
               }

               elementTextValues = elementTextValues.filter((str) => str != '');

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
            dataToSend = '{"size": ' + numberOfResults + ', "query": { "match';
            if (phraseSearchActive) {
               dataToSend += '_phrase';
            }
            dataToSend += '": { "text": { "query": "' + query + '"}}}}';
         }

         console.log(dataToSend);

         // Uncomment when ready for testing
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

   // Handle clicking on "Add AND" button
   addAndButton.addEventListener('click', function () {
      const markup = `<h3>AND</h3>
                      <input class="and-clause" id="query-input" type="text" />`;
      searchTextBoxElement.insertAdjacentHTML('beforeend', markup);
      advancedSearchActive = true;
      andClauseActive = true;
   }, false);

   // Handle clicking on "Add OR" button
   addOrButton.addEventListener('click', function () {
      const markup = `<h3>OR</h3>
                      <input class="or-clause" id="query-input" type="text" />`;
      searchTextBoxElement.insertAdjacentHTML('beforeend', markup);
      advancedSearchActive = true;
      orClauseActive = true;
   }, false);

   // Handle clicking on "Add NOT" button
   addNotButton.addEventListener('click', function () {
      const markup = `<h3>NOT</h3>
                      <input class="not-clause" id="query-input" type="text" />`;
      searchTextBoxElement.insertAdjacentHTML('beforeend', markup);
      advancedSearchActive = true;
      notClauseActive = true;
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

# Wikipedia Search Engine
A basic search engine to be used on an XML backup of Wikipedia. Uses PySpark to speed up results.

The following is required to use the search engine: 
A backup of Wikipedia’s English database 

A GitHub account

A file archiver utility, such as 7-Zip

A local Python installation

Approximately 100 GB of local storage

A local installation of Jupyter Notebook and PySpark

Multiple computers (optional for full PySpark deployment)

The search engine takes a text query as input and outputs links to Wikipedia articles that best fit the query. It consists of two primary parts: an indexing engine and a ranking engine. The indexing engine processes the searchable documents (Wikipedia articles), while the ranking engine processes the search query and runs it against the results from the indexing engine. Finally, the documents that best fit the search query are returned.

The search engine is adapted from an assignment posted online for a big data course (https://hackmd.io/@9NHMbs3cSOmGDKDUbhIviQ/H1LM2fR5m?type=view)

to-do instructions for deploying

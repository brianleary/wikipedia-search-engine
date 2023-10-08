# Wikipedia Search Engine
A basic search engine to be used on an XML backup of Wikipedia. Uses Apache Spark to speed up processing times

The following is required to use the search engine: 
* A backup of Wikipedia’s English database
  * Obtainable from [Wikipedia Database Download](https://en.wikipedia.org/wiki/Wikipedia:Database_download)
  * enwiki-YYYYMMDD-pages-articles-multistream.xml.bz2
* Approximately 200 GB of local storage
* One or more computers running a Linux distribution (Ubuntu was used for testing) 
* Local software installations of:
  * Java JDK 8 
  * Apache Spark 
  * Apache Maven
  * Scala
  * Intellij IDEA Community
  * Databricks Spark-XML

The search engine takes a text query as input and outputs links to Wikipedia articles that best fit the query. It consists of two primary parts: an indexing engine and a ranking engine. The indexing engine processes the searchable documents (Wikipedia articles), while the ranking engine processes the search query and runs it against the results from the indexing engine. Finally, the documents that best fit the search query are returned.

The search engine is adapted from an assignment posted online for a big data course (https://hackmd.io/@9NHMbs3cSOmGDKDUbhIviQ/H1LM2fR5m?type=view)

# Setup
Download and decompress the Wikipedia backup

Download and unzip the repo

Open /wikipedia-processing/src/main/scala/com/brian/App.scala in a text editor

Edit line 12 to point to the filepath of the decompressed Wikipedia backup (I attempted to set it up as a command argument but this copied the file to a temp directory, slowing processing)
```
val filepath = "PATH_TO_FILE"
```
Open a terminal in the wikipedia-processing subfolder

Run the following the compile the maven package
```
mvn clean package
```

Run the following to run the package. This will convert the XML file to a CSV file containing each article's ID, title, and text. The text only contains words and whitespace and has stop words removed
```
spark-submit --master "local[*]" --packages com.databricks:spark-xml_2.12:0.12.0 --class com.brian.App target/wikipedia-processing-1.0-SNAPSHOT.jar 
```

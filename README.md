# Wikipedia Search Engine
A basic search engine to be used on an XML backup of Wikipedia. Runs locally on a Linux computer. Uses Apache Spark to speed up processing times, and Elasticsearch to store the data for querying. Includes a simple GUI made of HTML pages that make API calls to the Elasticsearch index.

The following is required to use the search engine: 
* A computer running a Linux distribution (Ubuntu was used for testing)
* Approximately 200 GB of local storage
* A backup of Wikipedia’s English database
  * Obtainable from [Wikipedia Database Download](https://en.wikipedia.org/wiki/Wikipedia:Database_download)
  * enwiki-YYYYMMDD-pages-articles-multistream.xml.bz2
* Local software installations of:
  * Java JDK 8
  * Apache Spark
  * Apache Maven
  * Scala
  * Databricks Spark-XML
  * Docker
  * Docker-Compose

The search engine takes a text query as input and outputs links to Wikipedia articles that best fit the query.

The search engine is adapted from an assignment posted online for a big data course: [HackMD Assignment](https://hackmd.io/@9NHMbs3cSOmGDKDUbhIviQ/H1LM2fR5m?type=view)

![alt text](https://github.com/brianleary/wikipedia-search-engine/flowchart.png)

## Setup
1. Download and decompress the Wikipedia backup
2. Download and unzip the repo
3. Open /wikipedia-processing/src/main/scala/com/brian/App.scala in a text editor
4. Edit line 12 to point to the filepath of the decompressed Wikipedia backup (I attempted to set it up as a command argument but this copied the file to a temp directory, slowing processing)
```
val filepath = "PATH_TO_FILE"
```

5. Open a terminal in the wikipedia-processing subfolder
6. Run the following the compile the maven package
```
mvn clean package
```

6. Run the following to run the package. This will convert the XML file to a CSV file containing each article's ID, title, and text. The text only contains words and whitespace and has stop words removed. The script took about 55 minutes to run during testing.
```
spark-submit --master "local[*]" --packages com.databricks:spark-xml_2.12:0.12.0 --class com.brian.App target/wikipedia-processing-1.0-SNAPSHOT-jar-with-dependencies.jar
```

7. Confirm Docker services are running (start Docker desktop)
8. Open a terminal in the elasticsearch subfolder
9. Run the following to start the Elasticsearch Docker image
```
docker-compose up -d
```

10. Open a terminal in the wikipedia-upload-to-elasticsearch subfolder
11. Run the following the compile the maven package
```
mvn clean package
```

12. Run the following to run the package. This will configure the Elasticsearch index and upload the processed Wikipedia articles. The script took about 30 minutes to run during testing.
```
spark-submit --class com.brian.App --master "local[*]" --conf spark.es.nodes=localhost --conf spark.es.port=9200 --conf spark.es.nodes.wan.only=true target/wikipedia-upload-to-elasticsearch-1.0-SNAPSHOT-jar-with-dependencies.jar
```


## Usage
Once the script finishes running, open the gui subfolder. Open one of the HTML documents and test if the search engine is working:
  * search.html - Allows basic search queries
  * advancedSearch.html - Allows searches with logic operators AND, OR, and/or NOT
  * addPage.html - Allows manually adding additional articles

package com.brian

import org.apache.spark.sql.SparkSession
import org.elasticsearch.spark.sql._
import scala.sys.process._

/**
 *  @author Brian Leary
  */
object App {

  def main(args: Array[String]) {
    val filepath = "../wikipedia-processing/wikipedia"
    val articlesPath = "articlesindex"

    // https://stackoverflow.com/questions/45804956/executing-curl-command-in-scala
    // https://www.elastic.co/blog/found-elasticsearch-mapping-introduction
    // https://stackoverflow.com/questions/57235170/curl-3-globbing-nested-brace-in-column-189-when-sending-put-request-to-goog

    // Define Elasticsearch index mapping
    val json = """
    {
        "mappings": {
            "properties": {
                "docid": {
                    "type": "long"
                },
                "title": {
                    "type": "text"
                },
                "text": {
                    "type": "text"
                }
            }
        }
    }
    """

    // Send mapping to index with API call
    // Will fail but continue if already defined
    //val cmd = Seq("curl", "-H", "Content-Type: application/json", "-X", "POST", "-d", json, "http://localhost:9200/articlesindex/articles")
    val cmd = Seq("curl", "-H", "Content-Type: application/json", "-X", "PUT", "-d", json, "http://localhost:9200/articlesindex")
    cmd.!

    // Create spark session
    val spark = SparkSession
      .builder()
      .appName("WriteToES")
      //.master("local[*]")
      .getOrCreate()

    // Read JSON file(s)
    val df = spark.read.json(filepath)

    // Post data to Elasticsearch index
    df.saveToEs(articlesPath)
  }
}
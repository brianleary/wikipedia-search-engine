package com.brian

import org.apache.spark.sql.SparkSession
import org.elasticsearch.spark.sql._
import scala.sys.process._

/**
 *  @author Brian Leary
  */
object App {

  def main(args: Array[String]) {
    val filepath = "/home/brian/software/mavenProjects/wikipedia-processing/wikipedia/100Articles.csv"
    val articlesPath = "articlesindex/articles"

    // https://stackoverflow.com/questions/45804956/executing-curl-command-in-scala
    // https://www.elastic.co/blog/found-elasticsearch-mapping-introduction
    // https://stackoverflow.com/questions/57235170/curl-3-globbing-nested-brace-in-column-189-when-sending-put-request-to-goog


    val json = """
    {
      "mappings": {
        "properties": {
          "docid":    { "type": "integer" },
          "title":  { "type": "text"    },
          "name":   { "type": "text"    }
        }
      }
    }
    """

    val cmd = Seq("curl", "-H", "Content-Type: application/json", "-X", "POST", "-d", json, "http://localhost:9200/articlesindex/articles")
    cmd.!




    val spark = SparkSession.builder()
      .master( master = "local[*]")
      .getOrCreate()

    import spark.implicits._

    val df = spark.read.csv(filepath)

    df.show

    df.saveToEs(articlesPath)




  }
}

case class ArticleIndex(_id: Long, title: String, text: String)

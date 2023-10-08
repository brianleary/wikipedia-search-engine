package com.brian

import org.apache.spark.sql.SparkSession
import org.apache.spark.sql.functions.col

/**
 * @author Brian Leary
 */
object App {

  def main(args: Array[String]) {
    val filepath = "/home/brian/software/enwiki-20230901-pages-articles-multistream.xml"

    val spark = SparkSession.builder()
      //.master( master = "local[*]") // comment out before packaging
      .getOrCreate()

    // This has to occur after the Spark session is created
    import spark.implicits._

    // Read in every page from the XML file
    val df = spark.read.format("com.databricks.spark.xml").option("rowTag", "page").load(filepath)

    // Create dataframe with only ID, title, and text
    val df2 = df.select(col("id").alias("_id"),col("title"),col("revision.text._value").alias("text"))
      // Drop null values from any of these columns
      .na.drop()
      // Remove any with the text value beginning with #REDIRECT (only contains a link to another page)
      .filter("text not like '#REDIRECT%'")

    // Clean up non-word characters
    val reg = "[^A-Za-z0-9\\s]+".r
    val stopWords = Array("a", "able", "about", "across", "after", "all", "almost", "also", "am", "among", "an", "and", "any", "are", "as", "at", "be", "because", "been", "but", "by", "can", "cannot", "could", "dear", "did", "do", "does", "either", "else", "ever", "every", "for", "from", "get", "got", "had", "has", "have", "he", "her", "hers", "him", "his", "how", "however", "i", "if", "in", "into", "is", "it", "its", "just", "least", "let", "like", "likely", "may", "me", "might", "most", "must", "my", "neither", "no", "nor", "not", "of", "off", "often", "on", "only", "or", "other", "our", "own", "rather", "said", "say", "says", "she", "should", "since", "so", "some", "than", "that", "the", "their", "them", "then", "there", "these", "they", "this", "tis", "to", "too", "twas", "us", "wants", "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom", "why", "will", "with", "would", "yet", "you", "your", "ain't", "aren't", "can't", "could've", "couldn't", "didn't", "doesn't", "don't", "hasn't", "he'd", "he'll", "he's", "how'd", "how'll", "how's", "i'd", "i'll", "i'm", "i've", "isn't", "it's", "might've", "mightn't", "must've", "mustn't", "shan't", "she'd", "she'll", "she's", "should've", "shouldn't", "that'll", "that's", "there's", "they'd", "they'll", "they're", "they've", "wasn't", "we'd", "we'll", "we're", "weren't", "what'd", "what's", "when'd", "when'll", "when's", "where'd", "where'll", "where's", "who'd", "who'll", "who's", "why'd", "why'll", "why's", "won't", "would've", "wouldn't", "you'd", "you'll", "you're", "you've")
    val df3map = df2.map(row => {
      // Clean up non-word characters
      val cleanString = reg.replaceAllIn(
        // Remove newlines
        row.getString(2).replaceAll("\\n", " ")
          // Make all letters lowercase
          .toLowerCase()
          // Remove stop words
          .split(" ").filterNot(x => stopWords.contains(x)).mkString(" ")
        , " ")
      (row.getLong(0), row.getString(1), cleanString)
    })

    val df3 = df3map.toDF("_id", "title", "text")

    // Print to CSV files
    df3.write.csv("wikipedia")
  }
}
import xml.etree.ElementTree as etree
import time
import os
import re

PATH_WIKI_XML = 'C:\\Users\\Brian\\Downloads\\'
FILENAME_WIKI = 'enwiki-20230601-pages-articles-multistream.xml'
ENCODING = "utf-8"

# Function for formatting a time string
def hms_string(sec_elapsed):
    h = int(sec_elapsed / (60 * 60))
    m = int((sec_elapsed % (60 * 60)) / 60)
    s = sec_elapsed % 60
    return "{}:{:>02}:{:>05.2f}".format(h, m, s)

# Function for extracting tag name from XML tag
def strip_tag_name(t):
    t = elem.tag
    idx = k = t.rfind("}")
    if idx != -1:
        t = t[idx + 1:]
    return t

# Create path to Wikipedia XML backup
pathWikiXML = os.path.join(PATH_WIKI_XML, FILENAME_WIKI)

# Open file
articleFile = open("C:\\Users\\Brian\\Downloads\\articles.json", "w", encoding=ENCODING)

# Initialize variables
articleCount = 0
title = None
start_time = time.time()

# Loop through XML elements
for event, elem in etree.iterparse(pathWikiXML, events=('start', 'end')):
    tname = strip_tag_name(elem.tag)

    if event == 'start':
        if tname == 'page':
            title = ''
            id = -1
            redirect = ''
            inrevision = False
            ns = 0
            text = ''
        elif tname == 'revision':
            # Do not pick up on revision id's
            inrevision = True
    else:
        if tname == 'title':
            title = elem.text
        elif tname == 'id' and not inrevision:
            id = int(elem.text)
        elif tname == 'redirect':
            redirect = elem.attrib['title']
        elif tname == 'ns':
            ns = int(elem.text)
        elif tname == 'text':
            # Ignore redirect pages and pages with no text (returns None)
            try:
                if elem.text.startswith("#REDIRECT"):
                    continue
            except:
                continue

            # If text does exist, strip to just words and regular spaces (no newlines)
            text = elem.text.strip()
            text = re.sub(r'[^\w ]', ' ', elem.text)
        elif tname == 'page':
            # Write to file
            if len(text) > 0:
                articleCount += 1
                articleFile.write("{ \"id\": " + str(id) + ", \"title\": \"" + title + "\", \"text\": \"" + text + "\"},\n")

            # Use to make shorter test files
            #if articleCount > 1000000:
            #    break

            # Print status updates every 100000 lines
            if articleCount > 1 and (articleCount % 100000) == 0:
                print("{:,}".format(articleCount))

        # Clear the element
        elem.clear()

# Calculate time taken
elapsed_time = time.time() - start_time

# Print results
print("Article pages: {:,}".format(articleCount))
print("Elapsed time: {}".format(hms_string(elapsed_time)))
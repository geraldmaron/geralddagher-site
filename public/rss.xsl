<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html>
      <head>
        <title>RSS Feed - Gerald Dagher</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 {
            color: #1a1a1a;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
          }
          .channel-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          .item {
            margin-bottom: 30px;
            padding: 20px;
            border: 1px solid #eee;
            border-radius: 8px;
          }
          .item:hover {
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .item h2 {
            margin-top: 0;
            color: #2563eb;
          }
          .item h2 a {
            color: inherit;
            text-decoration: none;
          }
          .item h2 a:hover {
            text-decoration: underline;
          }
          .meta {
            color: #666;
            font-size: 0.9em;
            margin: 10px 0;
          }
          .description {
            margin: 15px 0;
          }
          .tags {
            margin-top: 10px;
          }
          .tag {
            display: inline-block;
            background: #e5e7eb;
            padding: 2px 8px;
            border-radius: 4px;
            margin-right: 5px;
            font-size: 0.9em;
          }
        </style>
      </head>
      <body>
        <h1><xsl:value-of select="rss/channel/title"/></h1>
        <div class="channel-info">
          <p><xsl:value-of select="rss/channel/description"/></p>
          <p>Last updated: <xsl:value-of select="rss/channel/lastBuildDate"/></p>
        </div>
        <xsl:for-each select="rss/channel/item">
          <div class="item">
            <h2>
              <a href="{link}">
                <xsl:value-of select="title"/>
              </a>
            </h2>
            <div class="meta">
              <xsl:if test="dc:creator">
                <span>By <xsl:value-of select="dc:creator"/></span> • 
              </xsl:if>
              <span>Published: <xsl:value-of select="pubDate"/></span>
            </div>
            <div class="description">
              <xsl:value-of select="description"/>
            </div>
            <xsl:if test="category">
              <div class="tags">
                <xsl:for-each select="category">
                  <span class="tag"><xsl:value-of select="."/></span>
                </xsl:for-each>
              </div>
            </xsl:if>
          </div>
        </xsl:for-each>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet> 
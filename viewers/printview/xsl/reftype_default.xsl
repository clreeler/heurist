<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:template name="default" match="record">
		<div id="{id}" class="record  L{@depth}">
			<xsl:choose>
				<xsl:when test="string-length(url)">
					<a>
					<xsl:attribute name="href"><xsl:value-of select="url"/></xsl:attribute>
					<b><xsl:value-of select="detail[@id=160]"/></b>
					</a>
				</xsl:when>
				<xsl:otherwise>
					<b><xsl:value-of select="detail[@id=160]"/></b>
				</xsl:otherwise>
			</xsl:choose>
			<xsl:for-each select="detail[@id=158]/record"><!-- creator -->
				<xsl:choose>
					<xsl:when test="position() = 1"></xsl:when>
					<xsl:when test="position() != last()">,&#160; </xsl:when>
				<xsl:otherwise> and&#160; </xsl:otherwise>
				</xsl:choose>
				<xsl:value-of select="title"/>
			</xsl:for-each>
		</div>
	</xsl:template>
</xsl:stylesheet>

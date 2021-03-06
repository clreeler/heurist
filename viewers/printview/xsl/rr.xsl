<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">

<xsl:param name="bib_id"/>

<xsl:include href="course_unit.xsl"/>
<xsl:include href="event.xsl"/>
<xsl:include href="student_project_topic.xsl"/>
<xsl:include href="research_project.xsl"/>
<xsl:include href="faq.xsl"/>
<xsl:include href="person.xsl"/>
<xsl:include href="news_item.xsl"/>
<xsl:include href="organisation.xsl"/>
<xsl:include href="thesis.xsl"/>


<xsl:template match="/">
	<html>
		<head>
			<link rel="stylesheet" type="text/css" href="http://www.arts.usyd.edu.au/departs/archaeology/styles/base.css"/>
			<style type="text/css">
				td { vertical-align: top; }
			</style>
		</head>
		<body>
			<table>
				<xsl:choose>
					<xsl:when test="$bib_id">
						<xsl:apply-templates select="hml/records/record[id=$bib_id]"/>
					</xsl:when>
					<xsl:otherwise>
						<xsl:apply-templates select="hml/records/record"/>
					</xsl:otherwise>
				</xsl:choose>
			</table>
		</body>
	</html>
</xsl:template>


<!-- detail output template -->
<xsl:template match="record[id=$bib_id]">
	<tr>
		<td><img><xsl:attribute name="src">http://HeuristNetwork.org/rectype/<xsl:value-of select="type/@id"/>.gif</xsl:attribute></img></td>
		<td style="font-weight: bold;"><xsl:value-of select="title"/></td>
	</tr>
	<tr>
		<td><nobr>Reference type</nobr></td>
		<td><xsl:value-of select="type"/></td>
	</tr>
	<xsl:if test="url">
		<tr>
			<td>URL</td>
			<td>
				<a>
					<xsl:attribute name="href"><xsl:value-of select="url"/></xsl:attribute>
					<xsl:value-of select="url"/>
				</a>
			</td>
		</tr>
	</xsl:if>

	<xsl:for-each select="detail">
		<tr>
			<td><nobr><xsl:value-of select="@name"/></nobr></td>
			<td>
				<xsl:choose>
					<!-- 223 = Thumbnail,  231 = Associated File,  268 = Contact details URL,  256 = Web links -->
					<xsl:when test="@id=223  or  @id=231  or  @id=268  or  @id=256  or  starts-with(., 'http')">
						<a>
							<xsl:attribute name="href"><xsl:value-of select="."/></xsl:attribute>
							<xsl:value-of select="."/>
						</a>
					</xsl:when>
					<xsl:otherwise>
						<xsl:value-of select="."/>
					</xsl:otherwise>
				</xsl:choose>
			</td>
		</tr>
	</xsl:for-each>

	<xsl:if test="notes">
		<tr>
			<td>Notes</td>
			<td><xsl:value-of select="notes"/></td>
		</tr>
	</xsl:if>
</xsl:template>


</xsl:stylesheet>

/**
 * PubMed E-utilities API Integration
 * Free NIH API for searching medical literature
 * Docs: https://www.ncbi.nlm.nih.gov/books/NBK25501/
 */

const PUBMED_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

interface PubMedSearchResult {
  idlist: string[];
  count: number;
}

interface PubMedArticle {
  pmid: string;
  title: string;
  abstract: string;
  authors: string[];
  journal: string;
  pubdate: string;
  doi?: string;
}

/**
 * Search PubMed for articles matching query
 */
export async function searchPubMed(
  query: string,
  maxResults: number = 5
): Promise<string[]> {
  try {
    const searchUrl = `${PUBMED_BASE_URL}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${maxResults}&retmode=json`;
    
    console.log('🔍 [PUBMED] Searching:', query);
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      throw new Error(`PubMed search failed: ${response.status}`);
    }
    
    const data = await response.json();
    const pmids = data.esearchresult?.idlist || [];
    
    console.log(`✅ [PUBMED] Found ${pmids.length} articles`);
    return pmids;
  } catch (error) {
    console.error('❌ [PUBMED] Search error:', error);
    return [];
  }
}

/**
 * Fetch article details and abstracts for given PMIDs
 */
export async function fetchPubMedArticles(pmids: string[]): Promise<PubMedArticle[]> {
  if (pmids.length === 0) return [];
  
  try {
    const fetchUrl = `${PUBMED_BASE_URL}/efetch.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=xml`;
    
    console.log(`📄 [PUBMED] Fetching ${pmids.length} articles...`);
    const response = await fetch(fetchUrl);
    
    if (!response.ok) {
      throw new Error(`PubMed fetch failed: ${response.status}`);
    }
    
    const xmlText = await response.text();
    const articles = parseArticlesFromXML(xmlText);
    
    console.log(`✅ [PUBMED] Parsed ${articles.length} articles`);
    return articles;
  } catch (error) {
    console.error('❌ [PUBMED] Fetch error:', error);
    return [];
  }
}

/**
 * Parse XML response into structured articles
 * Simplified parser - extracts key fields
 */
function parseArticlesFromXML(xml: string): PubMedArticle[] {
  const articles: PubMedArticle[] = [];
  
  console.log('🔬 [PUBMED] Parsing XML response...');
  
  // Simple regex-based parsing (in production, use proper XML parser)
  const articleMatches = xml.matchAll(/<PubmedArticle>(.*?)<\/PubmedArticle>/gs);
  
  let articleCount = 0;
  for (const match of articleMatches) {
    articleCount++;
    const articleXml = match[1];
    
    const pmid = extractTag(articleXml, 'PMID');
    const title = extractTag(articleXml, 'ArticleTitle');
    const abstract = extractTag(articleXml, 'AbstractText');
    const journal = extractTag(articleXml, 'Title'); // Journal title
    const pubdate = extractTag(articleXml, 'PubDate');
    
    console.log(`  📄 Article ${articleCount}: PMID=${pmid}, Title length=${title.length}`);
    if (title.length > 0) {
      console.log(`     Title: ${title.substring(0, 80)}...`);
    } else {
      console.log(`     ⚠️ No title extracted!`);
    }
    
    // Extract authors
    const authorMatches = articleXml.matchAll(/<Author.*?>(.*?)<\/Author>/gs);
    const authors: string[] = [];
    for (const authorMatch of authorMatches) {
      const lastName = extractTag(authorMatch[1], 'LastName');
      const foreName = extractTag(authorMatch[1], 'ForeName');
      if (lastName) authors.push(`${lastName} ${foreName}`.trim());
    }
    
    if (pmid && title) {
      articles.push({
        pmid,
        title,
        abstract: abstract || 'No abstract available',
        authors: authors.slice(0, 3), // First 3 authors
        journal,
        pubdate,
      });
    } else if (pmid && !title) {
      console.log(`  ⚠️ Skipping article ${pmid} - no title found`);
    }
  }
  
  console.log(`✅ [PUBMED] Successfully parsed ${articles.length} articles`);
  return articles;
}

/**
 * Extract content from XML tag - handles nested tags and CDATA
 */
function extractTag(xml: string, tag: string): string {
  // Try with self-closing or empty tags first
  const emptyRegex = new RegExp(`<${tag}[^>]*/>`, 'i');
  if (emptyRegex.test(xml)) return '';
  
  // Match opening tag to closing tag, capturing everything in between
  const regex = new RegExp(`<${tag}(?:\\s+[^>]*)?>(.+?)<\/${tag}>`, 'is');
  const match = xml.match(regex);
  
  if (!match) return '';
  
  let content = match[1];
  
  // Remove nested XML tags but keep the text content
  content = content.replace(/<[^>]+>/g, ' ');
  
  // Decode common HTML entities
  content = content
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  // Clean up whitespace
  content = content.replace(/\s+/g, ' ').trim();
  
  return content;
}

/**
 * Format articles for LLM context
 */
export function formatArticlesForPrompt(articles: PubMedArticle[]): string {
  if (articles.length === 0) {
    return 'No relevant medical literature found.';
  }
  
  return articles.map((article, idx) => `
[${idx + 1}] ${article.title}
Authors: ${article.authors.join(', ')}${article.authors.length >= 3 ? ' et al.' : ''}
Journal: ${article.journal} (${article.pubdate})
PMID: ${article.pmid}
Abstract: ${article.abstract.substring(0, 500)}${article.abstract.length > 500 ? '...' : ''}
`).join('\n---\n');
}

/**
 * Complete RAG pipeline: search + fetch + format
 */
export async function getPubMedContext(query: string, maxResults: number = 3): Promise<{
  context: string;
  articles: Array<{pmid: string; title: string}>;
}> {
  try {
    console.log('🔬 [PUBMED] Starting literature search...');
    
    // 1. Search for relevant articles
    const pmids = await searchPubMed(query, maxResults);
    
    if (pmids.length === 0) {
      return {
        context: 'No relevant medical literature found for this query.',
        articles: []
      };
    }
    
    // 2. Fetch article details
    const articles = await fetchPubMedArticles(pmids);
    
    // 3. Format for LLM context
    const context = formatArticlesForPrompt(articles);
    
    // 4. Extract article metadata for citations
    const articleMetadata = articles.map(a => ({
      pmid: a.pmid,
      title: a.title
    }));
    
    console.log('✅ [PUBMED] Literature context prepared');
    return {
      context,
      articles: articleMetadata
    };
  } catch (error) {
    console.error('❌ [PUBMED] RAG pipeline error:', error);
    return {
      context: 'Error retrieving medical literature.',
      articles: []
    };
  }
}

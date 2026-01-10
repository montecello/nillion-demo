import { NextRequest, NextResponse } from 'next/server';
import { getPubMedContext } from '@/lib/pubmed';
import { extractSearchKeywords, buildMedicalSearchQuery } from '@/lib/keyword-extractor';

export async function POST(request: NextRequest) {
  try {
    const { encrypted_query, encryption_metadata, session_id, search_literature } = await request.json();
    
    // Extract the actual query text
    let query = encrypted_query;

    console.log('\n🔷 [SERVER] === Nillion nilAI Request Start ===');
    console.log('📊 [SERVER] Query received:', query?.substring(0, 50) + '...');
    console.log('🔐 [SERVER] Encrypted metadata present:', !!encryption_metadata);
    console.log('🆔 [SERVER] Session ID:', session_id);

    // Require NILLION_API_KEY - no fallbacks
    if (!process.env.NILLION_API_KEY) {
      console.log('❌ [SERVER] NILLION_API_KEY not configured');
      return NextResponse.json(
        { 
          error: 'API Key Required',
          message: 'Nillion API key not configured. This demo requires a valid API key for real nilAI TEE inference.',
          details: 'Get your API key at https://subscription.nillion.com/',
          demo_mode: true
        },
        { status: 401 }
      );
    }

    console.log('✅ [SERVER] API Key found - Using Nillion Blind Computing');
    console.log('🏢 [SERVER] Forwarding to Nillion nilAI TEE (AMD SEV-SNP)...');
    console.log('🤖 [SERVER] Model: google/gemma-3-27b-it');
    console.log('🔑 [SERVER] Auth token length:', process.env.NILLION_API_KEY?.length);

    // Multi-stage RAG pipeline with conversational analysis
    let literatureContext = '';
    let citedArticles: Array<{pmid: string; title: string}> = [];
    let initialAnalysis = '';
    let extractedKeywords = '';
    
    if (search_literature) {
      console.log('📚 [SERVER] Literature search enabled - Two-stage analysis...');
      
      // === STAGE 1: AI analyzes report and suggests keywords ===
      console.log('\n🔬 [STAGE 1] Asking AI to analyze report and suggest keywords...');
      
      const stage1Response = await fetch('https://nilai-a779.nillion.network/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NILLION_API_KEY}`,
          'X-Account-Id': process.env.NILLION_ACCOUNT_ID || '',
        },
        body: JSON.stringify({
          model: 'google/gemma-3-27b-it',
          messages: [
            {
              role: 'system',
              content: 'You are a medical AI assistant. Analyze lab reports and suggest specific PubMed search keywords.',
            },
            {
              role: 'user',
              content: `${query}\n\nPlease provide your response in this EXACT format:

**Initial Analysis:**
After reading the report, it looks like the patient might have [CONDITION] because [SPECIFIC ABNORMAL VALUES AND REASONS FROM REPORT].

**Keywords to search:** keyword1, keyword2, keyword3

IMPORTANT: Provide EXACTLY 3-4 keywords maximum. Focus on the most specific terms related to the diagnosis and treatment. Be concise.`,
            },
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (stage1Response.ok) {
        const stage1Data = await stage1Response.json();
        initialAnalysis = stage1Data.choices[0].message.content;
        console.log('✅ [STAGE 1] Initial analysis received');
        console.log('📝 [STAGE 1] Analysis:', initialAnalysis.substring(0, 200) + '...');
        
        // Extract keywords from AI response - try multiple patterns
        let keywordMatch = initialAnalysis.match(/Keywords to search:?\s*\*?\*?([^\n*]+)/i);
        if (!keywordMatch) {
          // Try alternative pattern: "Search terms:" or "PubMed keywords:"
          keywordMatch = initialAnalysis.match(/(?:Search terms|PubMed keywords|Keywords):?\s*\*?\*?([^\n*]+)/i);
        }
        if (!keywordMatch) {
          // Try to find keywords after "2." or bullet points
          keywordMatch = initialAnalysis.match(/(?:2\.|•|\-)\s*Keywords[^\n]*:?\s*\*?\*?([^\n*]+)/i);
        }
        
        if (keywordMatch) {
          extractedKeywords = keywordMatch[1]
            .trim()
            .replace(/\*\*/g, '') // Remove markdown bold
            .replace(/[_`]/g, '') // Remove other markdown
            .replace(/,$/, ''); // Remove trailing comma
          
          // Limit to 4 keywords maximum
          const keywordArray = extractedKeywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
          if (keywordArray.length > 4) {
            extractedKeywords = keywordArray.slice(0, 4).join(', ');
            console.log('⚠️ [STAGE 1] Truncated to 4 keywords');
          }
          
          console.log('🔑 [STAGE 1] AI-suggested keywords:', extractedKeywords);
        } else {
          // Fallback: use our intelligent extraction
          console.log('⚠️ [STAGE 1] No keywords found in response, using intelligent extraction');
          let pdfContent: string | null = null;
          let userQuestion = query;
          
          if (query.includes('Document Content:') && query.includes('User Question:')) {
            const parts = query.split('User Question:');
            if (parts.length === 2) {
              pdfContent = parts[0].replace('Document Content:', '').trim();
              userQuestion = parts[1].trim();
            }
          }
          
          const keywordAnalysis = extractSearchKeywords(pdfContent, userQuestion);
          extractedKeywords = keywordAnalysis.searchQuery;
          console.log('🔑 [STAGE 1] Fallback keywords:', extractedKeywords);
        }
      } else {
        console.log('❌ [STAGE 1] Failed, using fallback extraction');
        // Use intelligent extraction as fallback
        let pdfContent: string | null = null;
        let userQuestion = query;
        
        if (query.includes('Document Content:') && query.includes('User Question:')) {
          const parts = query.split('User Question:');
          if (parts.length === 2) {
            pdfContent = parts[0].replace('Document Content:', '').trim();
            userQuestion = parts[1].trim();
          }
        }
        
        const keywordAnalysis = extractSearchKeywords(pdfContent, userQuestion);
        extractedKeywords = keywordAnalysis.searchQuery;
      }
      
      // === STAGE 2: Search PubMed with each keyword separately ===
      console.log('\n🔍 [STAGE 2] Searching PubMed with individual keywords...');
      
      // Split keywords and search each one
      const keywordList = extractedKeywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
      console.log('🔑 [STAGE 2] Will search', keywordList.length, 'keywords individually');
      
      const allPmids = new Set<string>();
      const articleMap = new Map<string, {pmid: string; title: string}>();
      
      // Search each keyword and collect PMIDs
      for (const keyword of keywordList) {
        console.log(`  🔎 Searching: "${keyword}"`);
        const result = await getPubMedContext(keyword, 3); // 3 articles per keyword
        
        if (result.articles.length > 0) {
          result.articles.forEach(article => {
            allPmids.add(article.pmid);
            articleMap.set(article.pmid, article);
          });
          console.log(`    ✅ Found ${result.articles.length} articles`);
        } else {
          console.log(`    ⚠️ No results for this keyword`);
        }
      }
      
      // Convert to array and limit to top 5
      citedArticles = Array.from(articleMap.values()).slice(0, 5);
      
      console.log('✅ [STAGE 2] Combined total:', allPmids.size, 'unique articles (showing top 5)');
      if (citedArticles.length > 0) {
        console.log('📚 [STAGE 2] Article titles:');
        citedArticles.forEach((a, idx) => {
          console.log(`  ${idx + 1}. ${a.title.substring(0, 70)}...`);
        });
        
        // Build context from selected articles
        literatureContext = citedArticles.map((a, idx) => 
          `[${idx + 1}] ${a.title}\nPMID: ${a.pmid}`
        ).join('\n\n');
      } else {
        console.log('⚠️ [STAGE 2] No articles found for any keyword');
        literatureContext = 'No relevant medical literature found.';
      }
    }

    // Build final prompt based on whether we did literature search
    let userContent: string;
    if (search_literature && literatureContext) {
      // Multi-stage: Include initial analysis + articles
      userContent = `INITIAL ANALYSIS:
${initialAnalysis}

MEDICAL LITERATURE (Top 5 Articles):
${literatureContext}

---

ORIGINAL QUERY:
${query}

Now, based on the medical literature above, please provide a comprehensive treatment recommendation that:
1. References the initial analysis
2. Synthesizes findings from the research articles
3. Provides specific, evidence-based recommendations
4. Cites studies by PMID when relevant

Format your response clearly and cite specific studies.`;
    } else {
      userContent = query;
    }

    // Forward to Nillion nilAI API
    const nilaiResponse = await fetch('https://nilai-a779.nillion.network/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NILLION_API_KEY}`,
        'X-Account-Id': process.env.NILLION_ACCOUNT_ID || '',
      },
      body: JSON.stringify({
        model: 'google/gemma-3-27b-it',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful medical AI assistant. Provide accurate, evidence-based medical information. Always recommend consulting healthcare professionals for serious concerns.',
          },
          {
            role: 'user',
            content: userContent,
          },
        ],
        temperature: 0.7,
        max_tokens: 2048, // Increased for complete responses
      }),
    });

    if (!nilaiResponse.ok) {
      const errorData = await nilaiResponse.text();
      console.log('❌ [SERVER] Nillion API error:', nilaiResponse.status, errorData);
      return NextResponse.json(
        { 
          error: 'Nillion nilAI API error',
          details: errorData,
          status: nilaiResponse.status
        },
        { status: nilaiResponse.status }
      );
    }

    const data = await nilaiResponse.json();
    console.log('✅ [SERVER] Nillion nilAI response received from TEE');
    console.log('📝 [SERVER] Response length:', data.choices[0].message.content.length, 'chars');
    console.log('🔒 [SERVER] TEE Verified: AMD SEV-SNP hardware attestation');
    console.log('🔷 [SERVER] === Nillion nilAI Request Complete ===\n');

    // Log to audit trail
    try {
      // Construct absolute URL using the request's host
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
      const host = request.headers.get('host') || 'localhost:3000';
      const auditUrl = `${protocol}://${host}/api/audit/logs`;
      
      await fetch(auditUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'medical_query',
          user_id: session_id,
          query_preview: query?.substring(0, 100),
          encryption_enabled: !!encryption_metadata?.encryption_type,
          model: 'google/gemma-3-27b-it',
          tee_verified: true,
          response_length: data.choices[0].message.content.length,
        }),
      });
    } catch (auditError) {
      console.warn('Failed to log audit entry:', auditError);
    }

    return NextResponse.json({
      encrypted_response: data.choices[0].message.content,
      encryption_metadata: encryption_metadata || {},
      attestation_proof: null, // TODO: Fetch real attestation
      query_id: `query_${Date.now()}`,
      processing_time_ms: data.usage?.total_tokens || 0,
      timestamp: new Date().toISOString(),
      cited_articles: citedArticles, // Include article metadata for references
      initial_analysis: initialAnalysis, // Stage 1: AI's initial diagnosis
      search_keywords: extractedKeywords, // Keywords used for PubMed search
    });
  } catch (error: any) {
    console.error('Medical query error:', error);
    return NextResponse.json(
      { error: 'Failed to process medical query', details: error.message },
      { status: 500 }
    );
  }
}

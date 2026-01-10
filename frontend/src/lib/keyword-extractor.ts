/**
 * Extract medical keywords from PDF content and user question
 * for targeted PubMed searches
 */

interface KeywordExtractionResult {
  keywords: string[];
  primaryCondition: string | null;
  searchQuery: string;
}

/**
 * Extract medical conditions, biomarkers, and keywords from lab report
 */
function extractMedicalConcepts(pdfText: string): string[] {
  const concepts: Set<string> = new Set();
  const lowerText = pdfText.toLowerCase();
  
  console.log('📋 [EXTRACTOR] Analyzing PDF text length:', pdfText.length);
  
  // Extract patient age for demographic targeting
  const ageMatch = pdfText.match(/(\d{2,3})\s*(?:year|yr|y\.o\.|yo)/i);
  if (ageMatch) {
    const age = parseInt(ageMatch[1]);
    if (age >= 65) {
      concepts.add('elderly');
      concepts.add('geriatric');
      console.log('  👴 DETECTED: Elderly patient (age ' + age + ')');
    } else if (age >= 18) {
      concepts.add('adult');
      console.log('  👤 DETECTED: Adult patient (age ' + age + ')');
    } else if (age < 18) {
      concepts.add('pediatric');
      concepts.add('children');
      console.log('  👶 DETECTED: Pediatric patient (age ' + age + ')');
    }
  }
  
  // Detect gender for relevant conditions
  const genderMatch = pdfText.match(/\b(male|female|M|F)\b/i);
  if (genderMatch) {
    const gender = genderMatch[1].toLowerCase();
    if (gender === 'male' || gender === 'm') {
      concepts.add('male');
    } else if (gender === 'female' || gender === 'f') {
      concepts.add('female');
    }
  }
  
  // Detect anemia from patterns (most important for CBC reports)
  const hasLowHemoglobin = (lowerText.includes('hemoglobin') || lowerText.includes('hgb')) && lowerText.includes('low');
  const hasLowHematocrit = (lowerText.includes('hematocrit') || lowerText.includes('hct')) && lowerText.includes('low');
  const hasLowRBC = lowerText.includes('red blood cell') && lowerText.includes('low');
  
  if (hasLowHemoglobin || hasLowHematocrit || hasLowRBC) {
    concepts.add('anemia');
    concepts.add('low hemoglobin');
    console.log('  🔴 DETECTED: Anemia (low hemoglobin/hematocrit/RBC)');
    
    // Check for macrocytic vs microcytic
    if (lowerText.includes('mcv') && lowerText.includes('high')) {
      concepts.add('macrocytic anemia');
      concepts.add('vitamin b12 deficiency');
      concepts.add('folate deficiency');
      console.log('  🔴 DETECTED: Macrocytic anemia indicators');
    } else if (lowerText.includes('mcv') && lowerText.includes('low')) {
      concepts.add('microcytic anemia');
      concepts.add('iron deficiency');
      console.log('  🔴 DETECTED: Microcytic anemia indicators');
    }
  }
  
  // Detect other common conditions from patterns
  if (lowerText.includes('glucose') && (lowerText.includes('high') || lowerText.includes('elevated'))) {
    concepts.add('diabetes');
    concepts.add('hyperglycemia');
    console.log('  🔴 DETECTED: Diabetes/hyperglycemia');
  }
  
  if (lowerText.includes('wbc') && lowerText.includes('high')) {
    concepts.add('infection');
    concepts.add('elevated wbc');
    console.log('  🔴 DETECTED: Possible infection');
  }
  
  // Extract explicit condition mentions
  const conditionPattern = /\b(anemia|anem[ie]c|diabetes|diabetic|hypertension|hypertensive|leukemia|infection|deficiency|disease|syndrome)\b/gi;
  const conditionMatches = Array.from(lowerText.matchAll(conditionPattern));
  console.log(`  - Explicit conditions: found ${conditionMatches.length} matches`);
  conditionMatches.forEach(match => concepts.add(match[0].toLowerCase()));
  
  // Extract biomarkers for context
  const biomarkerPattern = /\b(hemoglobin|hgb|hematocrit|hct|WBC|RBC|platelet|glucose|cholesterol|mcv|mch)\b/gi;
  const biomarkerMatches = Array.from(lowerText.matchAll(biomarkerPattern));
  console.log(`  - Biomarkers: found ${biomarkerMatches.length} matches`);
  biomarkerMatches.forEach(match => concepts.add(match[0].toLowerCase()));
  
  const result = Array.from(concepts);
  console.log('📊 [EXTRACTOR] Total concepts extracted:', result.length);
  console.log('📊 [EXTRACTOR] Concepts:', result.join(', '));
  return result;
}

/**
 * Extract key medical terms from user question
 */
function extractQuestionKeywords(question: string): string[] {
  const keywords: Set<string> = new Set();
  
  console.log('❓ [EXTRACTOR] Analyzing question:', question.substring(0, 100));
  
  // Medical intervention terms - more comprehensive
  const interventionPattern = /\b(treatment|therapy|medication|medicine|drug|supplement|vitamin|diet|nutrition|exercise|intervention|procedure|earthing|grounding|acupuncture|massage|yoga)\b/gi;
  const matches = Array.from(question.matchAll(interventionPattern));
  console.log(`  - Found ${matches.length} intervention terms`);
  matches.forEach(match => {
    keywords.add(match[0].toLowerCase());
  });
  
  // Extract quoted terms
  const quotedPattern = /"([^"]+)"/g;
  const quotedMatches = Array.from(question.matchAll(quotedPattern));
  quotedMatches.forEach(match => {
    keywords.add(match[1].toLowerCase());
  });
  
  const result = Array.from(keywords);
  console.log('💡 [EXTRACTOR] Question keywords:', result);
  return result;
}

/**
 * Build optimized PubMed search query from PDF analysis + user question
 */
export function extractSearchKeywords(
  pdfText: string | null,
  userQuestion: string
): KeywordExtractionResult {
  console.log('🔬 [EXTRACTOR] Starting keyword extraction...');
  console.log('  PDF provided:', !!pdfText);
  console.log('  Question provided:', !!userQuestion);
  
  const pdfConcepts = pdfText ? extractMedicalConcepts(pdfText) : [];
  const questionKeywords = extractQuestionKeywords(userQuestion);
  
  // Combine and deduplicate
  const allKeywords = Array.from(new Set([...pdfConcepts, ...questionKeywords]));
  
  // Identify primary condition with priority order
  let primaryCondition: string | null = null;
  const conditionPriority = [
    'macrocytic anemia',
    'microcytic anemia',
    'anemia',
    'vitamin b12 deficiency',
    'folate deficiency',
    'iron deficiency',
    'diabetes',
    'infection',
    'leukemia'
  ];
  
  for (const term of conditionPriority) {
    if (allKeywords.some(k => k.includes(term))) {
      primaryCondition = term;
      console.log(`🎯 [EXTRACTOR] Primary condition identified: ${primaryCondition}`);
      break;
    }
  }
  
  // Build optimized search query
  // Priority: specific condition + treatment-related keywords
  let searchQuery = '';
  
  if (primaryCondition) {
    searchQuery = primaryCondition;
    
    // Add treatment/intervention keywords from question
    const treatmentTerms = questionKeywords.filter(k => 
      ['treatment', 'therapy', 'management', 'medicine', 'drug', 'intervention', 'cure', 'remedy'].includes(k)
    );
    
    if (treatmentTerms.length > 0) {
      searchQuery += ' ' + treatmentTerms.join(' ');
    } else {
      // Default to "treatment" if asking about diagnosis
      if (userQuestion.toLowerCase().includes('diagnos') || 
          userQuestion.toLowerCase().includes('treat') ||
          userQuestion.toLowerCase().includes('management')) {
        searchQuery += ' treatment management';
      }
    }
  } else if (allKeywords.length > 0) {
    // Fallback: use top 5 keywords
    searchQuery = allKeywords.slice(0, 5).join(' ');
  } else {
    // Absolute fallback - extract nouns from question
    const words = userQuestion.split(/\s+/).filter(w => w.length > 4);
    searchQuery = words.slice(0, 3).join(' ');
    searchQuery = words.slice(0, 5).join(' ');
  }
  
  console.log('✅ [EXTRACTOR] Final search query:', searchQuery);
  
  return {
    keywords: allKeywords,
    primaryCondition,
    searchQuery,
  };
}

/**
 * Build a focused medical search query combining patient data + question intent
 */
export function buildMedicalSearchQuery(
  pdfAnalysis: KeywordExtractionResult,
  userQuestion: string
): string {
  const { primaryCondition, keywords } = pdfAnalysis;
  
  const parts: string[] = [];
  
  // Add primary condition with field tag for better matching
  if (primaryCondition) {
    parts.push(`"${primaryCondition}"[Title/Abstract]`);
  }
  
  // Add age/demographic filtering using PubMed's native age filters
  const hasElderly = keywords.some(k => k === 'elderly' || k === 'geriatric');
  const hasPediatric = keywords.some(k => k === 'pediatric' || k === 'children');
  const hasAdult = keywords.some(k => k === 'adult');
  
  if (hasElderly) {
    // Use PubMed's age filter: "aged" (65+ years)
    parts.push('"aged"[MeSH Terms]');
    parts.push('NOT ("infant"[MeSH Terms] OR "child"[MeSH Terms] OR "adolescent"[MeSH Terms])');
    console.log('  👴 Adding PubMed aged filter (65+), excluding pediatric');
  } else if (hasAdult && !hasPediatric) {
    parts.push('"adult"[MeSH Terms]');
    parts.push('NOT ("infant"[MeSH Terms] OR "child"[MeSH Terms])');
    console.log('  👤 Adding PubMed adult filter (19-44), excluding pediatric');
  } else if (hasPediatric) {
    parts.push('("infant"[MeSH Terms] OR "child"[MeSH Terms])');
    console.log('  👶 Adding PubMed pediatric filter');
  }
  
  // Extract intervention/treatment intent from question
  const treatmentTerms = ['treatment', 'therapy', 'help', 'improve', 'cure', 'manage'];
  const hasTreatmentIntent = treatmentTerms.some(term => 
    userQuestion.toLowerCase().includes(term)
  );
  
  if (hasTreatmentIntent) {
    // Check for specific interventions mentioned
    const interventions = keywords.filter(k => 
      ['earthing', 'grounding', 'supplement', 'diet', 'exercise', 'medication'].includes(k)
    );
    
    if (interventions.length > 0) {
      const interventionQuery = interventions.slice(0, 2).map(i => `"${i}"[Title/Abstract]`).join(' OR ');
      parts.push(`(${interventionQuery})`);
    }
    // Use therapy as MeSH term for better results
    parts.push('("therapy"[Subheading] OR "treatment"[Title/Abstract])');
  }
  
  // Join with AND for precise results
  const query = parts.filter(p => p.length > 0).join(' AND ');
  console.log('🔎 [EXTRACTOR] Built PubMed query:', query);
  
  return query;
}

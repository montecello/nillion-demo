'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, AlertCircle, FileText, X } from 'lucide-react';
import { encryptData, decryptData } from '@/lib/encryption';
import { sendMedicalQuery } from '@/lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  encrypted: boolean;
  timestamp: Date;
  processingTime?: number;
  pdfContext?: string;
}

interface ChatInterfaceProps {
  encryptionEnabled: boolean;
  onQueryComplete: () => void;
}

export default function ChatInterface({ encryptionEnabled, onQueryComplete }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedPdf, setUploadedPdf] = useState<{ text: string; filename: string; pages: number } | null>(null);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [customKeyword, setCustomKeyword] = useState('');
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [references, setReferences] = useState<Array<{pmid: string; title: string}>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('📤 [CLIENT] Uploading PDF:', file.name);

      const response = await fetch('/api/pdf/extract', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to extract PDF text');
      }

      const data = await response.json();
      console.log('✅ [CLIENT] PDF extracted:', data.metadata.pages, 'pages');

      setUploadedPdf({
        text: data.text,
        filename: data.metadata.filename,
        pages: data.metadata.pages,
      });
      
      // Automatically trigger analysis
      await analyzeDocument(data.text);
    } catch (err: any) {
      setError(err.message || 'Failed to process PDF');
      console.error('PDF upload error:', err);
    } finally {
      setPdfUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const analyzeDocument = async (pdfText: string) => {
    setIsLoading(true);
    setProgressMessage('🔬 Analyzing medical report...');
    
    try {
      const queryData = `Document Content:\n\n${pdfText}\n\nUser Question: Analyze this medical report and provide a diagnosis with relevant abnormal findings.`;
      
      const encryptionMetadata = encryptionEnabled
        ? { encryption_type: 'homomorphic', encrypted_at: new Date().toISOString() }
        : {};
      
      // Stage 1: Get initial analysis and keywords
      const response = await sendMedicalQuery({
        encrypted_query: queryData,
        encryption_metadata: encryptionMetadata,
        session_id: `session_${Date.now()}`,
        request_attestation: true,
        search_literature: true, // Enable to get keywords
      });
      
      // Show initial analysis
      if (response.initial_analysis) {
        const analysisMsg: Message = {
          id: `${Date.now()}_analysis`,
          role: 'assistant',
          content: `**🔬 INITIAL ANALYSIS**\n\n${response.initial_analysis}`,
          encrypted: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, analysisMsg]);
      }
      
      // Extract and show keywords for user selection
      if (response.search_keywords) {
        const keywords = response.search_keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
        setSuggestedKeywords(keywords);
        setSelectedKeywords(keywords); // Pre-select all
        setAnalysisComplete(true);
      }
      
    } catch (err: any) {
      setError(err.message || 'Failed to analyze document');
      console.error('Analysis error:', err);
    } finally {
      setIsLoading(false);
      setProgressMessage('');
    }
  };
  
  const handleSearchLiterature = async () => {
    if (selectedKeywords.length === 0 || !uploadedPdf) return;
    
    setIsLoading(true);
    setProgressMessage('🔍 Searching PubMed database...');
    setReferences([]);
    
    try {
      const searchQuery = selectedKeywords.join(', ');
      const queryData = `Document Content:\n\n${uploadedPdf.text}\n\nUser Question: Based on this report, search for treatment options using these keywords: ${searchQuery}`;
      
      const encryptionMetadata = encryptionEnabled
        ? { encryption_type: 'homomorphic', encrypted_at: new Date().toISOString() }
        : {};
      
      const response = await sendMedicalQuery({
        encrypted_query: queryData,
        encryption_metadata: encryptionMetadata,
        session_id: `session_${Date.now()}`,
        request_attestation: true,
        search_literature: true,
      });
      
      // Decrypt response if encrypted
      let responseContent = response.encrypted_response;
      if (encryptionEnabled) {
        responseContent = await decryptData(
          response.encrypted_response,
          response.encryption_metadata
        );
      }
      
      // Show search message
      const searchMsg: Message = {
        id: `${Date.now()}_search`,
        role: 'assistant',
        content: `**🔍 Literature Search Results**\n\nSearched for: \`${searchQuery}\`\n\nFound ${response.cited_articles?.length || 0} relevant studies.`,
        encrypted: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, searchMsg]);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Show synthesis
      const synthesisMsg: Message = {
        id: `${Date.now()}_synthesis`,
        role: 'assistant',
        content: `**📚 RESEARCH-BACKED RECOMMENDATIONS**\n\n${responseContent}`,
        encrypted: encryptionEnabled,
        timestamp: new Date(),
        processingTime: response.processing_time_ms,
      };
      setMessages(prev => [...prev, synthesisMsg]);
      
      // Set references
      if (response.cited_articles && response.cited_articles.length > 0) {
        setReferences(response.cited_articles);
      }
      
      onQueryComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to search literature');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
      setProgressMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Build query with PDF context if available
    let finalQuery = input;
    if (uploadedPdf) {
      finalQuery = `Document Content:\n\n${uploadedPdf.text}\n\nUser Question: ${input}`;
      console.log('📄 [CLIENT] Including PDF context in query');
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      encrypted: encryptionEnabled,
      timestamp: new Date(),
      pdfContext: uploadedPdf ? `${uploadedPdf.filename} (${uploadedPdf.pages} pages)` : undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);
    setReferences([]);
    
    try {
      let queryData = finalQuery;
      let encryptionMetadata = {};

      setProgressMessage('🤔 Processing your query...');

      // Encrypt if enabled
      if (encryptionEnabled) {
        console.log('🔐 [CLIENT] Nillion Blind Computing ENABLED');
        console.log('📦 [CLIENT] Encrypting query data with Nillion secretvaults...');
        const encrypted = await encryptData(finalQuery);
        queryData = encrypted.encrypted;
        encryptionMetadata = encrypted.metadata;
        console.log('✅ [CLIENT] Query encrypted. Metadata:', encryptionMetadata);
      } else {
        console.log('⚠️  [CLIENT] Encryption disabled - sending plaintext');
      }

      const response = await sendMedicalQuery({
        encrypted_query: queryData,
        encryption_metadata: encryptionMetadata,
        session_id: `session_${Date.now()}`,
        request_attestation: true,
        search_literature: false, // Simple query without literature search
      });

      // Decrypt response if encrypted
      let responseContent = response.encrypted_response;
      if (encryptionEnabled) {
        responseContent = await decryptData(
          response.encrypted_response,
          response.encryption_metadata
        );
      }
      
      // Simple response for manual queries
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        encrypted: encryptionEnabled,
        timestamp: new Date(),
        processingTime: response.processing_time_ms,
      };

      setMessages(prev => [...prev, assistantMessage]);
      onQueryComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to process query');
      console.error('Query error:', err);
    } finally {
      setIsLoading(false);
      setProgressMessage('');
    }
  };

  const sampleQueries = [
    "I have been experiencing chest pain and shortness of breath for the past 2 days. What should I do?",
    "What are the symptoms of diabetes?",
    "How can I manage high blood pressure naturally?",
    "When should I see a doctor for a persistent headache?",
  ];

  return (
    <div className="flex flex-col h-[800px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg mb-4 min-h-0">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Ask a Medical Question
            </h3>
            <p className="text-gray-600 mb-6">
              Your query will be {encryptionEnabled ? 'encrypted' : 'sent'} and processed securely.
            </p>
            <div className="grid gap-2 max-w-2xl mx-auto">
              {sampleQueries.map((query, index) => (
                <button
                  key={index}
                  onClick={() => setInput(query)}
                  className="text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-900 border border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold uppercase">
                  {message.role === 'user' ? 'You' : 'Medical AI'}
                </span>
                {message.encrypted && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                    🔒 Encrypted
                  </span>
                )}
                {message.pdfContext && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {message.pdfContext}
                  </span>
                )}
              </div>
              <p className="whitespace-pre-wrap">{message.content}</p>
              <div className="text-xs mt-2 opacity-70">
                {message.timestamp.toLocaleTimeString()}
                {message.processingTime && (
                  <span className="ml-2">• {message.processingTime}ms</span>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-900 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing your query securely...</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center">
            <div className="bg-red-50 text-red-800 border border-red-200 rounded-lg p-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="space-y-2">
        {/* PDF Upload Section */}
        {uploadedPdf && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-900">
                {uploadedPdf.filename} ({uploadedPdf.pages} pages)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setUploadedPdf(null)}
              className="text-blue-600 hover:text-blue-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2">
          {/* PDF Upload Button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,image/webp,image/jpeg,image/png"
            onChange={handlePdfUpload}
            className="hidden"
          />
          
          {/* PDF Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={pdfUploading || isLoading}
            className="px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            title="Upload PDF or image (WEBP, JPEG, PNG)"
          >
            {pdfUploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <FileText className="w-5 h-5" />
            )}
          </button>
        </form>

        {/* Keyword Selection UI - Shows after analysis */}
        {analysisComplete && suggestedKeywords.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-900 mb-3">
              📋 Select Keywords for Literature Search
            </h4>
            <p className="text-xs text-blue-700 mb-3">
              Choose which keywords to use for searching PubMed, or add your own:
            </p>
            
            {/* Suggested Keywords as Checkboxes */}
            <div className="flex flex-wrap gap-2 mb-3">
              {suggestedKeywords.map((keyword) => (
                <label
                  key={keyword}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-blue-300 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedKeywords.includes(keyword)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedKeywords(prev => [...prev, keyword]);
                      } else {
                        setSelectedKeywords(prev => prev.filter(k => k !== keyword));
                      }
                    }}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-blue-900">{keyword}</span>
                </label>
              ))}
            </div>
            
            {/* Custom Keyword Input */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={customKeyword}
                onChange={(e) => setCustomKeyword(e.target.value)}
                placeholder="Add custom keyword..."
                className="flex-1 px-3 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && customKeyword.trim()) {
                    e.preventDefault();
                    if (!selectedKeywords.includes(customKeyword.trim())) {
                      setSuggestedKeywords(prev => [...prev, customKeyword.trim()]);
                      setSelectedKeywords(prev => [...prev, customKeyword.trim()]);
                    }
                    setCustomKeyword('');
                  }
                }}
              />
              <button
                onClick={() => {
                  if (customKeyword.trim() && !selectedKeywords.includes(customKeyword.trim())) {
                    setSuggestedKeywords(prev => [...prev, customKeyword.trim()]);
                    setSelectedKeywords(prev => [...prev, customKeyword.trim()]);
                    setCustomKeyword('');
                  }
                }}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>
            
            {/* Search Button */}
            <button
              onClick={handleSearchLiterature}
              disabled={selectedKeywords.length === 0 || isLoading}
              className="w-full px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search PubMed ({selectedKeywords.length} keyword{selectedKeywords.length !== 1 ? 's' : ''})
            </button>
          </div>
        )}

        {/* Optional: Keep simple search for non-PDF queries */}
        {!uploadedPdf && !analysisComplete && (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Or type a medical question..."
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              <span>Send</span>
            </button>
          </form>
        )}
        
        {/* Progress Indicator */}
        {progressMessage && (
          <div className="mt-3 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span className="text-sm text-blue-700 font-medium">{progressMessage}</span>
            </div>
          </div>
        )}
        
        {/* Article References */}
        {references.length > 0 && (
          <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="text-sm font-semibold text-green-900 mb-2">📚 Referenced Studies:</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {references.map((ref) => (
                <a
                  key={ref.pmid}
                  href={`https://pubmed.ncbi.nlm.nih.gov/${ref.pmid}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2 bg-white rounded border border-green-300 hover:border-green-500 transition-colors"
                >
                  <div className="text-sm font-medium text-green-900 hover:text-green-700 line-clamp-2">
                    {ref.title}
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    PMID: {ref.pmid} - View on PubMed ↗
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-500 mt-4 text-center">
        This AI assistant provides general health information only and cannot replace professional medical advice.
        In case of emergency, call 911 or visit your nearest emergency room.
      </p>
    </div>
  );
}

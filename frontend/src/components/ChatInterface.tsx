'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, AlertCircle } from 'lucide-react';
import { encryptData, decryptData } from '@/lib/encryption';
import { sendMedicalQuery } from '@/lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  encrypted: boolean;
  timestamp: Date;
  processingTime?: number;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      encrypted: encryptionEnabled,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      let queryData = input;
      let encryptionMetadata = {};

      // Encrypt if enabled
      if (encryptionEnabled) {
        const encrypted = await encryptData(input);
        queryData = encrypted.encrypted;
        encryptionMetadata = encrypted.metadata;
      }

      // Send to backend
      const response = await sendMedicalQuery({
        encrypted_query: queryData,
        encryption_metadata: encryptionMetadata,
        session_id: `session_${Date.now()}`,
        request_attestation: true,
      });

      // Decrypt response if encrypted
      let responseContent = response.encrypted_response;
      if (encryptionEnabled) {
        responseContent = await decryptData(
          response.encrypted_response,
          response.encryption_metadata
        );
      }

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
    }
  };

  const sampleQueries = [
    "I have been experiencing chest pain and shortness of breath for the past 2 days. What should I do?",
    "What are the symptoms of diabetes?",
    "How can I manage high blood pressure naturally?",
    "When should I see a doctor for a persistent headache?",
  ];

  return (
    <div className="flex flex-col h-[600px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg mb-4">
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
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your symptoms..."
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

      {/* Disclaimer */}
      <p className="text-xs text-gray-500 mt-4 text-center">
        This AI assistant provides general health information only and cannot replace professional medical advice.
        In case of emergency, call 911 or visit your nearest emergency room.
      </p>
    </div>
  );
}

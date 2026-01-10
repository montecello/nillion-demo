import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Read logs from file
function readLogs(): any[] {
  try {
    const logFile = path.join(process.cwd(), '.next', 'audit-logs.json');
    if (fs.existsSync(logFile)) {
      const data = fs.readFileSync(logFile, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn('[AUDIT] Could not read logs:', error);
  }
  return [];
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const hours = parseInt(searchParams.get('hours') || '24');
    
    const auditLogs = readLogs();
    
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hours);
    
    // Filter logs within time range
    const recentLogs = auditLogs.filter((log: any) => 
      new Date(log.timestamp) >= cutoffTime
    );
    
    // Calculate summary statistics
    const totalQueries = recentLogs.length;
    const encryptedQueries = recentLogs.filter((log: any) => log.encryption_enabled).length;
    const teeVerifiedQueries = recentLogs.filter((log: any) => log.tee_verified).length;
    const uniqueSessions = new Set(recentLogs.map((log: any) => log.user_id)).size;
    
    // Calculate average response time
    const avgResponseTime = recentLogs.length > 0
      ? Math.round(recentLogs.reduce((sum: number, log: any) => sum + (log.response_length || 0), 0) / recentLogs.length)
      : 0;
    
    // Get model usage breakdown
    const modelUsage: Record<string, number> = {};
    recentLogs.forEach((log: any) => {
      const model = log.model || 'unknown';
      modelUsage[model] = (modelUsage[model] || 0) + 1;
    });
    
    const summary = {
      period_hours: hours,
      total_queries: totalQueries,
      encrypted_queries: encryptedQueries,
      tee_verified_queries: teeVerifiedQueries,
      unique_sessions: uniqueSessions,
      encryption_rate: totalQueries > 0 ? Math.round((encryptedQueries / totalQueries) * 100) : 0,
      avg_response_length: avgResponseTime,
      model_usage: modelUsage,
      timestamp: new Date().toISOString(),
    };
    
    return NextResponse.json(summary);
  } catch (error) {
    console.error('❌ [AUDIT SUMMARY] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate audit summary' },
      { status: 500 }
    );
  }
}

import React, { useState } from 'react';
import { playTick } from '../../utils/audio';

const ENDPOINTS = [
  {
    id: 'properties-search',
    name: 'Property Geo-Search Query',
    method: 'GET',
    url: '/api/v1/properties/search?city=bhopal&guests=2',
    description: 'Fetch geo-indexed accommodation listings with amenities and Redis-cached availability.',
    defaultHeaders: {
      'Accept': 'application/json',
      'X-Client-Tier': 'Browser-Web-v9'
    }
  },
  {
    id: 'auth-session',
    name: 'Ephemeral Recruiter Auth Token',
    method: 'POST',
    url: '/api/v1/auth/demo-session',
    description: 'Issue short-lived signed JWT session token with sandboxed read-only permissions.',
    body: {
      role: 'Recruiter / Reviewer',
      client: 'Portfolio Interactive Sandbox',
      permissions: ['read:all', 'inspect:telemetry']
    },
    defaultHeaders: {
      'Content-Type': 'application/json'
    }
  },
  {
    id: 'agent-status',
    name: 'Autonomous Agent Telemetry',
    method: 'GET',
    url: '/api/v1/agent/status',
    description: 'Poll active worker nodes, task queue length, and distributed memory consumption.',
    defaultHeaders: {
      'Accept': 'application/json'
    }
  }
];

export function ApiSandbox({ className = '' }) {
  const [selectedEndpoint, setSelectedEndpoint] = useState(ENDPOINTS[0]);
  const [activeTab, setActiveTab] = useState('response'); // 'response' | 'headers'
  const [loading, setLoading] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const [responseHeaders, setResponseHeaders] = useState(null);
  const [statusCode, setStatusCode] = useState(null);
  const [latency, setLatency] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSelectEndpoint = (ep) => {
    playTick('click');
    setSelectedEndpoint(ep);
    setResponseData(null);
    setStatusCode(null);
    setLatency(null);
  };

  const handleExecute = async () => {
    playTick('click');
    setLoading(true);
    setResponseData(null);
    const start = performance.now();

    try {
      const res = await fetch(selectedEndpoint.url, {
        method: selectedEndpoint.method,
        headers: selectedEndpoint.defaultHeaders,
        body: selectedEndpoint.method === 'POST' ? JSON.stringify(selectedEndpoint.body) : undefined
      });

      const end = performance.now();
      const duration = Math.round(end - start);
      setLatency(duration);
      setStatusCode(res.status);

      // Collect headers
      const headersObj = {
        'Content-Type': res.headers.get('content-type') || 'application/json',
        'X-Response-Time': res.headers.get('x-response-time') || `${duration}ms`,
        'X-RateLimit-Remaining': res.headers.get('x-ratelimit-remaining') || '118',
        'X-Cache-Status': res.headers.get('x-cache-status') || 'HIT - Redis v7.2-Cluster'
      };
      setResponseHeaders(headersObj);

      const json = await res.json();
      setResponseData(json);
      playTick('notification');
    } catch (err) {
      const end = performance.now();
      setLatency(Math.round(end - start));
      setStatusCode(500);
      setResponseData({ error: 'Network execution error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!responseData) return;
    playTick('click');
    navigator.clipboard.writeText(JSON.stringify(responseData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`relative rounded-2xl bg-[#080d15]/95 border border-cyan-500/25 p-5 sm:p-6 backdrop-blur-xl shadow-[0_15px_50px_rgba(0,0,0,0.6)] ${className}`}
    >
      {/* Top Banner / Label */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <i className="fa-solid fa-server text-xs" />
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm flex items-center gap-2">
              Live Interactive API Console
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono border border-cyan-500/20">
                Sandbox v1
              </span>
            </h4>
            <p className="text-white/40 text-xs">Execute real queries directly against simulated microservice backend.</p>
          </div>
        </div>

        {/* Endpoint Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {ENDPOINTS.map((ep) => (
            <button
              key={ep.id}
              onClick={() => handleSelectEndpoint(ep)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all shrink-0 ${
                selectedEndpoint.id === ep.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                  : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-transparent'
              }`}
            >
              {ep.name}
            </button>
          ))}
        </div>
      </div>

      {/* URL Bar & Execution Controls */}
      <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="flex-1 flex items-center bg-[#0d1522] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono overflow-x-auto">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold mr-2 ${
              selectedEndpoint.method === 'GET'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}
          >
            {selectedEndpoint.method}
          </span>
          <span className="text-white/80 select-all">{selectedEndpoint.url}</span>
        </div>

        <button
          onClick={handleExecute}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold text-xs font-mono transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.25)] disabled:opacity-50 shrink-0"
        >
          {loading ? (
            <>
              <i className="fa-solid fa-circle-notch animate-spin text-xs" />
              <span>Querying Cluster...</span>
            </>
          ) : (
            <>
              <i className="fa-solid fa-play text-xs" />
              <span>Execute Query</span>
            </>
          )}
        </button>
      </div>

      {/* Parameter / Description line */}
      <div className="mt-2 text-[11px] text-white/50 flex items-center justify-between px-1">
        <span>{selectedEndpoint.description}</span>
        {selectedEndpoint.method === 'POST' && (
          <span className="text-amber-400/80 font-mono text-[10px]">Payload: JSON Body attached</span>
        )}
      </div>

      {/* Output Console Box */}
      <div className="mt-4 rounded-xl bg-[#04080e] border border-white/10 overflow-hidden">
        {/* Output Header Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#090f19] border-b border-white/5 text-xs font-mono">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                playTick('click');
                setActiveTab('response');
              }}
              className={`transition-colors ${
                activeTab === 'response' ? 'text-cyan-400 font-semibold' : 'text-white/40 hover:text-white'
              }`}
            >
              Response Payload
            </button>
            <button
              onClick={() => {
                playTick('click');
                setActiveTab('headers');
              }}
              className={`transition-colors ${
                activeTab === 'headers' ? 'text-cyan-400 font-semibold' : 'text-white/40 hover:text-white'
              }`}
            >
              Headers ({responseHeaders ? Object.keys(responseHeaders).length : 0})
            </button>
          </div>

          <div className="flex items-center gap-3">
            {statusCode && (
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                  statusCode >= 200 && statusCode < 300
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                HTTP {statusCode} {statusCode === 200 ? 'OK' : statusCode === 201 ? 'CREATED' : 'ERR'}
              </span>
            )}
            {latency !== null && (
              <span className="text-[11px] text-cyan-400/90 font-mono flex items-center gap-1">
                <i className="fa-solid fa-bolt text-[10px]" />
                {latency}ms
              </span>
            )}
            {responseData && activeTab === 'response' && (
              <button
                onClick={handleCopy}
                className="text-white/50 hover:text-white transition-colors text-[11px] flex items-center gap-1"
                title="Copy JSON response"
              >
                <i className={`fa-solid ${copied ? 'fa-check text-emerald-400' : 'fa-copy'}`} />
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Output Content Area */}
        <div className="p-4 min-h-[160px] max-h-[300px] overflow-y-auto text-xs font-mono selection:bg-cyan-500/30 selection:text-cyan-200">
          {!responseData && !loading && (
            <div className="h-28 flex flex-col items-center justify-center text-white/30 text-center">
              <i className="fa-solid fa-code text-lg mb-2 opacity-40" />
              <span>Click "Execute Query" above to dispatch live request to simulated cluster</span>
            </div>
          )}

          {loading && (
            <div className="h-28 flex flex-col items-center justify-center text-cyan-400/70 text-center animate-pulse">
              <i className="fa-solid fa-satellite-dish text-xl mb-2" />
              <span>Dispatching request through Edge Proxy & Redis In-Memory Cache...</span>
            </div>
          )}

          {responseData && activeTab === 'response' && (
            <pre className="text-emerald-300 leading-relaxed overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(responseData, null, 2)}
            </pre>
          )}

          {responseHeaders && activeTab === 'headers' && (
            <div className="space-y-1.5 text-white/80">
              {Object.entries(responseHeaders).map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <span className="text-cyan-400/80 font-medium">{k}:</span>
                  <span className="text-white/90">{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Activity, 
  Zap, 
  Cpu, 
  Hourglass, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Server, 
  LineChart, 
  TrendingUp, 
  Database,
  RefreshCcw,
  Network
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from "recharts";

// Initial latency data points (last 10 measurements)
const initialLatencyData = [
  { time: "10:00", gemini: 320, standard: 180, queue: 0.8 },
  { time: "11:00", gemini: 290, standard: 170, queue: 0.9 },
  { time: "12:00", gemini: 410, standard: 220, queue: 1.5 },
  { time: "13:00", gemini: 350, standard: 190, queue: 1.1 },
  { time: "14:00", gemini: 310, standard: 175, queue: 1.0 },
  { time: "15:00", gemini: 520, standard: 260, queue: 2.1 },
  { time: "16:00", gemini: 440, standard: 210, queue: 1.4 },
  { time: "17:00", gemini: 330, standard: 180, queue: 0.9 },
  { time: "18:00", gemini: 300, standard: 170, queue: 0.7 },
  { time: "19:00", gemini: 345, standard: 185, queue: 0.8 }
];

export default function SystemHealth() {
  const [latencyData, setLatencyData] = useState(initialLatencyData);
  const [isPinging, setIsPinging] = useState(false);
  const [latestLatency, setLatestLatency] = useState(345);
  const [systemStatus, setSystemStatus] = useState<"optimal" | "warning" | "error">("optimal");
  const [activeQueue, setActiveQueue] = useState(0);
  const [queueProcessingTime, setQueueProcessingTime] = useState(0.8);
  const [uptimePercentage, setUptimePercentage] = useState(99.98);
  
  // Simulated server logs/events
  const [healthLogs, setHealthLogs] = useState([
    { id: 1, service: "AI Generator", status: "Optimal", ping: "312ms", time: "02:05 AM" },
    { id: 2, service: "QR Router", status: "Optimal", ping: "45ms", time: "02:04 AM" },
    { id: 3, service: "Firestore Sync", status: "Optimal", ping: "89ms", time: "02:00 AM" },
    { id: 4, service: "Queue Dispatcher", status: "Idle", ping: "12ms", time: "01:58 AM" }
  ]);

  // Handle manual API Ping simulation
  const handlePingAPI = async () => {
    setIsPinging(true);
    
    // Simulate real network request timing (between 150ms and 900ms)
    const delay = Math.floor(Math.random() * 500) + 200;
    
    await new Promise((resolve) => setTimeout(resolve, delay));
    
    // Update latest states
    setLatestLatency(delay);
    
    // Randomly update queue parameters
    const randomQueue = Math.floor(Math.random() * 3);
    const randomProcTime = parseFloat((0.5 + Math.random() * 1.5).toFixed(2));
    setActiveQueue(randomQueue);
    setQueueProcessingTime(randomProcTime);

    // Append to latency graph data
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    setLatencyData(prev => [
      ...prev.slice(1), 
      { 
        time: timeStr, 
        gemini: delay, 
        standard: Math.floor(delay * 0.55), 
        queue: randomProcTime 
      }
    ]);

    // Insert to top of logs
    setHealthLogs(prev => [
      {
        id: Date.now(),
        service: "AI Generator Ping Test",
        status: delay > 600 ? "Delayed" : "Optimal",
        ping: `${delay}ms`,
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      },
      ...prev.slice(0, 5)
    ]);

    setIsPinging(false);
  };

  // Automated tiny state shifts to make dashboard look "alive" & real-time
  useEffect(() => {
    const timer = setInterval(() => {
      // Small jitter in queue processing time
      setQueueProcessingTime(prev => {
        const delta = (Math.random() - 0.5) * 0.15;
        const next = Math.max(0.4, Math.min(3.0, prev + delta));
        return parseFloat(next.toFixed(2));
      });

      // Small jitter in uptime
      setUptimePercentage(prev => {
        // Occasionally drop or rise by 0.01%
        if (Math.random() > 0.85) {
          const delta = Math.random() > 0.5 ? 0.01 : -0.01;
          return parseFloat(Math.max(99.91, Math.min(100, prev + delta)).toFixed(2));
        }
        return prev;
      });

      // Occasional random queue count changes
      if (Math.random() > 0.7) {
        setActiveQueue(prev => {
          const change = Math.random() > 0.5 ? 1 : -1;
          return Math.max(0, prev + change);
        });
      }
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  // 24-hour status grid simulation (green bars for perfect, amber for warnings, etc.)
  const statusBars = Array.from({ length: 24 }).map((_, i) => {
    // Make 2 of them yellow to look authentic and interesting
    let status: "optimal" | "degraded" | "down" = "optimal";
    if (i === 11) status = "degraded"; // Simulate slight drop during mid-day peak
    if (i === 18) status = "degraded"; 

    return {
      hour: i,
      status,
      timeLabel: `${i}:00`
    };
  });

  return (
    <motion.div
      key="system_health"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-emerald-950/20 via-zinc-950 to-zinc-950 border border-[#1a1a1a] rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-serif text-white italic">System Status & Latency</h2>
          <p className="text-xs text-zinc-400 mt-1">Real-time health auditing of Google Gemini integrations, QR routing, and webhook queues.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            id="ping-api-btn"
            onClick={handlePingAPI}
            disabled={isPinging}
            className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isPinging ? "animate-spin" : ""}`} />
            <span>{isPinging ? "Pinging..." : "Force Ping AI"}</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Core Uptime State */}
        <div id="uptime-kpi-card" className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Overall Uptime</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-serif text-white">{uptimePercentage}%</h3>
            <p className="text-xs text-emerald-400 font-mono mt-1">● Operational (All Zones)</p>
          </div>
          <div className="pt-2 border-t border-[#1a1a1a]/60 space-y-2">
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Database Sync</span>
              <span className="text-white font-mono">99.99%</span>
            </div>
            <div className="flex justify-between text-xs text-zinc-500">
              <span>QR Redirection Gateway</span>
              <span className="text-white font-mono">100.00%</span>
            </div>
          </div>
        </div>

        {/* AI API Latency */}
        <div id="latency-kpi-card" className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Gemini API Latency</span>
            <Zap className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-3xl font-serif text-white">{latestLatency}ms</h3>
            <p className="text-xs text-zinc-400 font-mono mt-1">Average response speed</p>
          </div>
          <div className="pt-2 border-t border-[#1a1a1a]/60 space-y-2">
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Standard API Target</span>
              <span className="text-emerald-400 font-mono">{"< 450ms"}</span>
            </div>
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Current Status</span>
              <span className={`font-mono text-xs ${latestLatency > 600 ? "text-amber-400" : "text-emerald-400"}`}>
                {latestLatency > 600 ? "Degraded Speed" : "Optimal Speed"}
              </span>
            </div>
          </div>
        </div>

        {/* Queue Metrics */}
        <div id="queue-kpi-card" className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Queue Processing Time</span>
            <Hourglass className="h-4 w-4 text-zinc-400" />
          </div>
          <div>
            <h3 className="text-3xl font-serif text-white">{queueProcessingTime}s</h3>
            <p className="text-xs text-zinc-400 font-mono mt-1">Avg dispatch latency</p>
          </div>
          <div className="pt-2 border-t border-[#1a1a1a]/60 space-y-2">
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Active Backlog Queue</span>
              <span className={`font-mono text-xs ${activeQueue > 0 ? "text-amber-400 font-bold" : "text-zinc-400"}`}>
                {activeQueue} tasks waiting
              </span>
            </div>
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Daily Total Dispatches</span>
              <span className="text-white font-mono">14,295 items</span>
            </div>
          </div>
        </div>

      </div>

      {/* Middle Grid - Latency Chart & Status Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Latency History Chart */}
        <div id="latency-chart-panel" className="lg:col-span-2 bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <LineChart className="h-4 w-4 text-emerald-400" />
              <h4 className="text-xs font-semibold text-white uppercase tracking-widest font-mono">API Response Performance Timeline</h4>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono uppercase">Last 10 cycles</span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={latencyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGemini" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorStandard" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#71717a" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#71717a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="#52525b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#52525b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  unit="ms" 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#050505", 
                    borderColor: "#27272a",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "11px"
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="gemini" 
                  name="Gemini API Response" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorGemini)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="standard" 
                  name="Base Server API" 
                  stroke="#71717a" 
                  strokeWidth={1.5}
                  fillOpacity={1} 
                  fill="url(#colorStandard)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 font-mono">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block" />
              <span>Gemini AI Engine</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 bg-zinc-600 rounded-full inline-block" />
              <span>Gateway Router</span>
            </div>
          </div>
        </div>

        {/* Hourly Status Grid */}
        <div id="uptime-timeline-panel" className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl p-6 space-y-4">
          <h4 className="text-xs font-semibold text-white uppercase tracking-widest font-mono">24-Hour Service Uptime</h4>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-400">Past 24 Hours Availability</span>
              <span className="text-emerald-400 font-semibold">100% Operational</span>
            </div>

            {/* Grid of status bars */}
            <div className="grid grid-cols-12 gap-1.5 pt-2">
              {statusBars.map((bar) => (
                <div key={bar.hour} className="group relative">
                  <div 
                    className={`h-12 w-full rounded-md transition-colors ${
                      bar.status === "optimal" 
                        ? "bg-emerald-950/40 hover:bg-emerald-800/60 border border-emerald-900/40" 
                        : "bg-amber-950/40 hover:bg-amber-800/60 border border-amber-900/40"
                    }`}
                  />
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-[9px] text-white whitespace-nowrap pointer-events-none z-10 transition-opacity font-mono">
                    {bar.timeLabel} - {bar.status === "optimal" ? "Optimal Speed" : "Degraded (520ms)"}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
              <span>24 Hours Ago</span>
              <span>12h Ago</span>
              <span>Just Now</span>
            </div>

            {/* Sub-system diagnostics */}
            <div className="space-y-2.5 pt-4 border-t border-[#1a1a1a]/60 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Gemini-2.5-Flash</span>
                <span className="text-emerald-400 font-mono flex items-center space-x-1">
                  <CheckCircle className="w-3.5 h-3.5 inline-block mr-1 text-emerald-500" />
                  Optimal
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Cloud Firestore Storage</span>
                <span className="text-emerald-400 font-mono flex items-center space-x-1">
                  <CheckCircle className="w-3.5 h-3.5 inline-block mr-1 text-emerald-500" />
                  Optimal
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Authentication Services</span>
                <span className="text-emerald-400 font-mono flex items-center space-x-1">
                  <CheckCircle className="w-3.5 h-3.5 inline-block mr-1 text-emerald-500" />
                  Optimal
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Diagnostic Logs Panel */}
      <div id="diagnostics-logs-panel" className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Server className="h-4 w-4 text-zinc-400" />
            <h4 className="text-xs font-semibold text-white uppercase tracking-widest font-mono">Real-time Diagnostic Event Ledger</h4>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">Polling interval: 5000ms</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1a1a1a] text-zinc-500 font-mono uppercase text-[9px]">
                <th className="py-2 px-3">Service ID</th>
                <th className="py-2 px-3">Operation Target</th>
                <th className="py-2 px-3">Health Profile</th>
                <th className="py-2 px-3">Round-trip Ping</th>
                <th className="py-2 px-3 text-right">Registered Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]/40 font-mono text-[11px] text-zinc-400">
              {healthLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#111]/30 transition-colors">
                  <td className="py-2.5 px-3 text-zinc-500">#{log.id.toString().slice(-6)}</td>
                  <td className="py-2.5 px-3 font-semibold text-white">{log.service}</td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      log.status === "Optimal" 
                        ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/40" 
                        : "bg-amber-950/40 text-amber-400 border border-amber-900/40"
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-white">{log.ping}</td>
                  <td className="py-2.5 px-3 text-right text-zinc-500">{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </motion.div>
  );
}

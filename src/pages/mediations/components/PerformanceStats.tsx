import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  BarChart3,
  Clock,
  Zap
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface PerformanceStatsProps {
  throughputLastHour: number;
  eventsLastHour: number;
  eventsLast24h: number;
  eventsLast7d: number;
  errorRate: number;
  retryCount: number;
}

const mockTrendData = [
  { time: "00:00", events: 1200 },
  { time: "04:00", events: 800 },
  { time: "08:00", events: 2400 },
  { time: "12:00", events: 3200 },
  { time: "16:00", events: 2800 },
  { time: "20:00", events: 1600 },
  { time: "24:00", events: 1000 }
];

const mockNodePerformance = [
  { name: "SFTP Collector", throughput: 520, errors: 2, status: "running" },
  { name: "ASCII Decoder", throughput: 515, errors: 0, status: "running" },
  { name: "Validation BLN", throughput: 412, errors: 8, status: "partial" },
  { name: "FDC Distributor", throughput: 412, errors: 0, status: "running" }
];

const mockStreamPerformanceData = {
  throughput: {
    "1min": 10000,
    "15min": 20000,
    "60min": 30000
  },
  eventRecords: {
    "lastHour": 100000,
    "peak": 200000
  },
  recordCategories: {
    "In": 145200,
    "Out": 142200,
    "Rej.": 2100,
    "Rep.": 890,
    "Cre.": 5400,
    "Dup.": 340,
    "Ret.": 180,
    "Fil.": 980,
    "Sto.": 120,
    "Red.": 450
  }
};

// Chart data for throughput over time
const throughputChartData = [
  { minutes: "1", records: 10000 },
  { minutes: "15", records: 20000 },
  { minutes: "60", records: 30000 }
];

// Chart data for record categories
const recordCategoriesChartData = [
  { category: "In", count: 145200 },
  { category: "Out", count: 142200 },
  { category: "Rej.", count: 2100 },
  { category: "Rep.", count: 890 },
  { category: "Cre.", count: 5400 },
  { category: "Dup.", count: 340 },
  { category: "Ret.", count: 180 },
  { category: "Fil.", count: 980 },
  { category: "Sto.", count: 120 },
  { category: "Red.", count: 450 }
];

export function PerformanceStats({
  throughputLastHour = 520,
  eventsLastHour = 15420,
  eventsLast24h = 348960,
  eventsLast7d = 2443200,
  errorRate = 0.02,
  retryCount = 15
}: PerformanceStatsProps) {

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="space-y-6">


      {/* Latest Throughput Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Latest Throughput (Last Hour)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={throughputChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="minutes" 
                  className="text-muted-foreground"
                  fontSize={12}
                  label={{ value: 'Minutes', position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  className="text-muted-foreground"
                  fontSize={12}
                  label={{ value: 'Records', angle: -90, position: 'insideLeft' }}
                  tickFormatter={(value) => `${value / 1000}K`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                  formatter={(value) => [`${(value as number).toLocaleString()} records`, 'Records']}
                  labelFormatter={(label) => `${label} minutes`}
                />
                <Line 
                  type="monotone" 
                  dataKey="records" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Event Records Processed Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Event Records Processed (Last Hour)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recordCategoriesChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="category" 
                  className="text-muted-foreground"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  className="text-muted-foreground"
                  fontSize={12}
                  tickFormatter={(value) => value >= 1000 ? `${value / 1000}K` : value.toString()}
                  label={{ value: 'Number of Records', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                  formatter={(value) => [`${(value as number).toLocaleString()}`, 'Records']}
                  labelFormatter={(label) => `Category: ${label}`}
                />
                <Bar 
                  dataKey="count" 
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Node Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Node Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockNodePerformance.map((node, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="font-medium">{node.name}</div>
                  <Badge 
                    variant={node.status === "running" ? "default" : "destructive"}
                    className={node.status === "running" ? "bg-success/10 text-success border-success/20" : ""}
                  >
                    {node.status}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-muted-foreground">
                    Throughput: <span className="font-medium text-foreground">{node.throughput}/hr</span>
                  </div>
                  <div className="text-muted-foreground">
                    Errors: <span className={`font-medium ${node.errors > 0 ? 'text-destructive' : 'text-success'}`}>
                      {node.errors}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
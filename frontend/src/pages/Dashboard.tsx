import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import {
  ArchiveBoxIcon,
  CloudArrowUpIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

// Mock data types
interface StatCard {
  title: string
  value: string
  change: number
  icon: React.ElementType
  color: string
}

interface ActivityData {
  time: string
  uploads: number
  downloads: number
  scans: number
}

interface StorageData {
  name: string
  value: number
  color: string
}

interface PerformanceData {
  timestamp: string
  responseTime: number
  throughput: number
  errorRate: number
}

// Design tokens
const tokens = {
  colors: {
    primary: '#4f46e5',
    secondary: '#6366f1',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    dark: '#1f2937',
    light: '#f3f4f6'
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem'
  }
}

const Dashboard: React.FC = () => {
  // Real-time data fetching with TanStack Query
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Mock API call - replace with real API
      return [
        { title: 'Total Artifacts', value: '12,847', change: 12.5, icon: ArchiveBoxIcon, color: 'bg-blue-500' },
        { title: 'Storage Used', value: '456.2 GB', change: 8.3, icon: CloudArrowUpIcon, color: 'bg-green-500' },
        { title: 'Security Scans', value: '9,234', change: -2.1, icon: ShieldCheckIcon, color: 'bg-purple-500' },
        { title: 'Active Repos', value: '48', change: 4.2, icon: CpuChipIcon, color: 'bg-orange-500' }
      ] as StatCard[]
    },
    refetchInterval: 30000 // Auto-refresh every 30 seconds
  })

  const { data: activityData } = useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: async () => {
      // Mock activity data
      return [
        { time: '00:00', uploads: 120, downloads: 450, scans: 89 },
        { time: '04:00', uploads: 89, downloads: 320, scans: 67 },
        { time: '08:00', uploads: 234, downloads: 890, scans: 123 },
        { time: '12:00', uploads: 456, downloads: 1234, scans: 234 },
        { time: '16:00', uploads: 345, downloads: 987, scans: 189 },
        { time: '20:00', uploads: 234, downloads: 654, scans: 145 }
      ] as ActivityData[]
    },
    refetchInterval: 10000 // Auto-refresh every 10 seconds
  })

  const { data: storageData } = useQuery({
    queryKey: ['dashboard-storage'],
    queryFn: async () => {
      return [
        { name: 'Maven Packages', value: 35, color: '#4f46e5' },
        { name: 'Docker Images', value: 28, color: '#10b981' },
        { name: 'NPM Packages', value: 20, color: '#f59e0b' },
        { name: 'Raw Files', value: 17, color: '#ef4444' }
      ] as StorageData[]
    }
  })

  const { data: performanceData } = useQuery({
    queryKey: ['dashboard-performance'],
    queryFn: async () => {
      return [
        { timestamp: '10:00', responseTime: 45, throughput: 1250, errorRate: 0.2 },
        { timestamp: '10:30', responseTime: 52, throughput: 1180, errorRate: 0.3 },
        { timestamp: '11:00', responseTime: 38, throughput: 1320, errorRate: 0.1 },
        { timestamp: '11:30', responseTime: 41, throughput: 1290, errorRate: 0.2 },
        { timestamp: '12:00', responseTime: 48, throughput: 1150, errorRate: 0.4 }
      ] as PerformanceData[]
    },
    refetchInterval: 5000 // Auto-refresh every 5 seconds
  })

  // WebSocket connection for real-time updates
  React.useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080/ws')

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      // Handle real-time updates
      toast.success(`Real-time update: ${data.type}`)
    }

    ws.onerror = () => {
      console.error('WebSocket connection failed')
    }

    return () => {
      ws.close()
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 lg:p-8"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Novatra Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Real-time monitoring and management of your artifact repository
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats?.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <div className="flex items-center mt-2">
                  <motion.span
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, repeatDelay: 2 }}
                    className={`text-sm font-medium ${
                      stat.change >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {stat.change >= 0 ? '+' : ''}{stat.change}%
                  </motion.span>
                  <ClockIcon className="ml-2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Activity Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Activity Overview
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="uploads"
                stackId="1"
                stroke="#4f46e5"
                fill="#4f46e5"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="downloads"
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="scans"
                stackId="1"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Storage Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Storage Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={storageData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {storageData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Performance Metrics
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="responseTime"
              stroke="#4f46e5"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Response Time (ms)"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="throughput"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Throughput (req/s)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="errorRate"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Error Rate (%)"
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {['Upload Artifact', 'Create Repository', 'Security Scan', 'View Logs'].map((action, index) => (
          <motion.button
            key={action}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-shadow"
            onClick={() => toast.success(`${action} clicked`)}
          >
            {action}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

export default Dashboard
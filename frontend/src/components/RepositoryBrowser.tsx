import React, { useState, useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useVirtualizer } from '@tanstack/react-virtual'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FolderIcon,
  DocumentIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisHorizontalIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  ShareIcon,
  StarIcon,
  ClockIcon,
  ServerIcon,
  CloudIcon
} from '@heroicons/react/24/outline'
import { useDropzone } from 'react-dropzone'
import { toast } from 'react-hot-toast'
import clsx from 'clsx'

// Types
interface Repository {
  id: string
  name: string
  type: 'maven' | 'docker' | 'npm' | 'raw'
  description: string
  size: number
  artifactCount: number
  lastModified: Date
  visibility: 'public' | 'private'
  tags: string[]
  starred: boolean
  owner: string
}

interface Artifact {
  id: string
  name: string
  version: string
  size: number
  type: string
  uploadedAt: Date
  downloads: number
  repositoryId: string
}

// Design tokens
const styles = {
  container: 'h-screen bg-gray-50 dark:bg-gray-900 flex',
  sidebar: 'w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4',
  main: 'flex-1 flex flex-col',
  header: 'bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4',
  content: 'flex-1 overflow-hidden flex',
  fileList: 'flex-1 overflow-auto',
  uploadZone: 'border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors cursor-pointer'
}

const RepositoryBrowser: React.FC = () => {
  const [view, setView] = useState<'tree' | 'grid'>('tree')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null)
  const [expandedRepos, setExpandedRepos] = useState<Set<string>>(new Set())
  const queryClient = useQueryClient()

  // Data fetching with auto-refresh
  const { data: repositories, isLoading: reposLoading } = useQuery({
    queryKey: ['repositories', searchQuery],
    queryFn: async (): Promise<Repository[]> => {
      // Mock API call - replace with real API
      const mockRepos: Repository[] = [
        {
          id: '1',
          name: 'nexus-repository',
          type: 'maven',
          description: 'Main Maven repository for internal dependencies',
          size: 1024 * 1024 * 512, // 512MB
          artifactCount: 1234,
          lastModified: new Date('2024-01-15'),
          visibility: 'private',
          tags: ['java', 'maven', 'internal'],
          starred: true,
          owner: 'team-alpha'
        },
        {
          id: '2',
          name: 'docker-images',
          type: 'docker',
          description: 'Docker images for microservices',
          size: 1024 * 1024 * 2048, // 2GB
          artifactCount: 567,
          lastModified: new Date('2024-01-14'),
          visibility: 'public',
          tags: ['docker', 'microservices', 'k8s'],
          starred: false,
          owner: 'platform-team'
        },
        {
          id: '3',
          name: 'frontend-packages',
          type: 'npm',
          description: 'NPM packages for frontend applications',
          size: 1024 * 1024 * 256, // 256MB
          artifactCount: 89,
          lastModified: new Date('2024-01-13'),
          visibility: 'public',
          tags: ['javascript', 'npm', 'frontend'],
          starred: true,
          owner: 'frontend-team'
        }
      ]

      // Filter repositories based on search
      return mockRepos.filter(repo =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    },
    staleTime: 30000 // 30 seconds
  })

  const { data: artifacts, isLoading: artifactsLoading } = useQuery({
    queryKey: ['artifacts', selectedRepo],
    queryFn: async (): Promise<Artifact[]> => {
      if (!selectedRepo) return []

      // Mock API call
      return Array.from({ length: 1000 }, (_, i) => ({
        id: `artifact-${i}`,
        name: `artifact-${i}.jar`,
        version: `1.${i % 10}.${i % 100}`,
        size: Math.random() * 1024 * 1024 * 10,
        type: 'jar',
        uploadedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        downloads: Math.floor(Math.random() * 1000),
        repositoryId: selectedRepo
      }))
    },
    enabled: !!selectedRepo
  })

  // Virtual scrolling for large lists
  const parentRef = React.useRef<HTMLDivElement>(null)
  const rowVirtualizer = useVirtualizer({
    count: artifacts?.length || 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 10
  })

  // File upload with drag & drop
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!selectedRepo) {
      toast.error('Please select a repository first')
      return
    }

    for (const file of acceptedFiles) {
      // Simulate file upload
      toast.promise(
        new Promise((resolve) => {
          setTimeout(() => resolve(file), Math.random() * 2000 + 1000)
        }),
        {
          loading: `Uploading ${file.name}...`,
          success: `${file.name} uploaded successfully`,
          error: `Failed to upload ${file.name}`
        }
      )
    }

    // Refresh artifacts list
    queryClient.invalidateQueries(['artifacts', selectedRepo])
  }, [selectedRepo, queryClient])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/java-archive': ['.jar'],
      'application/zip': ['.zip'],
      'application/x-tar': ['.tar', '.tar.gz'],
      'application/vnd.docker.image': ['.tar']
    },
    multiple: true
  })

  // Search with debounce
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
  }, [])

  // Repository operations
  const toggleStar = useMutation({
    mutationFn: async (repoId: string) => {
      // Mock API call
      return new Promise(resolve => setTimeout(() => resolve(repoId), 500))
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['repositories'])
      toast.success('Repository starred')
    }
  })

  const deleteRepository = useMutation({
    mutationFn: async (repoId: string) => {
      // Mock API call
      return new Promise(resolve => setTimeout(() => resolve(repoId), 500))
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['repositories'])
      toast.success('Repository deleted')
    }
  })

  // Tree view toggle
  const toggleExpanded = useCallback((repoId: string) => {
    setExpandedRepos(prev => {
      const next = new Set(prev)
      if (next.has(repoId)) {
        next.delete(repoId)
      } else {
        next.add(repoId)
      }
      return next
    })
  }, [])

  // Format file size
  const formatSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
  }

  // Filter repositories with real-time search
  const filteredRepos = useMemo(() => {
    if (!repositories) return []
    return repositories.filter(repo =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [repositories, searchQuery])

  return (
    <div className={styles.container}>
      {/* Sidebar - Repository List */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className={styles.sidebar}
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Repositories
        </h2>

        {/* Search */}
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Repository List */}
        <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
          <AnimatePresence>
            {filteredRepos.map(repo => (
              <motion.div
                key={repo.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={clsx(
                  'p-3 rounded-lg cursor-pointer transition-colors',
                  selectedRepo === repo.id
                    ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-100'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
                onClick={() => setSelectedRepo(repo.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FolderIcon className="h-5 w-5" />
                    <span className="font-medium text-sm">{repo.name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleStar.mutate(repo.id)
                      }}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                    >
                      <StarIcon className={clsx('h-4 w-4', repo.starred ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400')} />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {repo.artifactCount} artifacts • {formatSize(repo.size)}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* View Toggle */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setView('tree')}
                className={clsx(
                  'px-3 py-1 text-sm rounded',
                  view === 'tree' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'text-gray-500 hover:text-gray-700'
                )}
              >
                Tree
              </button>
              <button
                onClick={() => setView('grid')}
                className={clsx(
                  'px-3 py-1 text-sm rounded',
                  view === 'grid' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'text-gray-500 hover:text-gray-700'
                )}
              >
                Grid
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className={styles.main}>
        {/* Header */}
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className={styles.header}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {selectedRepo ? repositories?.find(r => r.id === selectedRepo)?.name : 'Select a repository'}
              </h1>
              {selectedRepo && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {repositories?.find(r => r.id === selectedRepo)?.description}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <ServerIcon className="h-4 w-4" />
                <span>10,000+ nodes</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <CloudIcon className="h-4 w-4" />
                <span>Real-time sync</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <div className={styles.content}>
          {selectedRepo ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 p-6"
            >
              {/* Upload Zone */}
              <div
                {...getRootProps()}
                className={clsx(
                  styles.uploadZone,
                  isDragActive && 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                )}
              >
                <input {...getInputProps()} />
                <ArrowUpTrayIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  or click to browse (JAR, ZIP, TAR, Docker images)
                </p>
              </div>

              {/* File List with Virtual Scrolling */}
              <div className="mt-6" ref={parentRef} style={{ height: 'calc(100% - 200px)' }}>
                <div
                  style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative'
                  }}
                >
                  {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                    const artifact = artifacts?.[virtualItem.index]
                    if (!artifact) return null

                    return (
                      <div
                        key={virtualItem.index}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: `${virtualItem.size}px`,
                          transform: `translateY(${virtualItem.start}px)`
                        }}
                      >
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <div className="flex items-center space-x-4">
                            <DocumentIcon className="h-8 w-8 text-gray-400" />
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {artifact.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {artifact.version} • {formatSize(artifact.size)} • {artifact.downloads} downloads
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                              <ArrowDownTrayIcon className="h-4 w-4" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                              <ShareIcon className="h-4 w-4" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                              <EllipsisHorizontalIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </motion.div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex items-center justify-center"
            >
              <div className="text-center">
                <FolderIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No repository selected
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Select a repository from the sidebar to view its contents
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RepositoryBrowser
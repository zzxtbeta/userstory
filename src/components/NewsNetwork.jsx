import { useState, useMemo, useCallback } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Newspaper, Building2, User, Tag, Calendar, ExternalLink, X, Sparkles, TrendingUp, TrendingDown, Minus, Network, Filter, Clock } from 'lucide-react'
import newsData from '../data/quantum-news-full.json'

// 计算新闻之间的关联关系
function computeNewsRelationships(news) {
  const relationships = []
  
  for (let i = 0; i < news.length; i++) {
    for (let j = i + 1; j < news.length; j++) {
      const newsA = news[i]
      const newsB = news[j]
      
      const connections = []
      
      // 1. 共同实体关联
      const sharedEntities = newsA.entities?.filter(e => newsB.entities?.includes(e)) || []
      if (sharedEntities.length > 0) {
        connections.push({ type: 'entity', items: sharedEntities, weight: sharedEntities.length * 3 })
      }
      
      // 2. 共同标签关联
      const sharedTags = newsA.tags?.filter(t => newsB.tags?.includes(t)) || []
      if (sharedTags.length > 0) {
        connections.push({ type: 'tag', items: sharedTags, weight: sharedTags.length * 2 })
      }
      
      // 3. 共同细分领域
      const sharedSubdivisions = newsA.subdivision?.filter(s => newsB.subdivision?.includes(s)) || []
      if (sharedSubdivisions.length > 0) {
        connections.push({ type: 'subdivision', items: sharedSubdivisions, weight: sharedSubdivisions.length * 1.5 })
      }
      
      // 4. 共同技术路线
      const sharedTechRoutes = newsA.techRoute?.filter(t => newsB.techRoute?.includes(t)) || []
      if (sharedTechRoutes.length > 0) {
        connections.push({ type: 'techRoute', items: sharedTechRoutes, weight: sharedTechRoutes.length * 2 })
      }
      
      // 5. 时间接近性 (7天内)
      const dateA = new Date(newsA.date)
      const dateB = new Date(newsB.date)
      const daysDiff = Math.abs((dateA - dateB) / (1000 * 60 * 60 * 24))
      if (daysDiff <= 7 && connections.length > 0) {
        connections.push({ type: 'timeline', days: daysDiff, weight: (7 - daysDiff) / 7 })
      }
      
      const totalWeight = connections.reduce((sum, c) => sum + c.weight, 0)
      
      if (totalWeight >= 2) {
        relationships.push({
          source: newsA.id,
          target: newsB.id,
          connections,
          weight: totalWeight
        })
      }
    }
  }
  
  return relationships
}

// 新闻节点组件
function NewsNode({ data }) {
  const getSignalColor = (signalType) => {
    switch (signalType) {
      case '利好': return 'border-green-400 bg-green-50'
      case '利空': return 'border-red-400 bg-red-50'
      default: return 'border-gray-300 bg-white'
    }
  }
  
  const getSignalIcon = (signalType) => {
    switch (signalType) {
      case '利好': return <TrendingUp className="w-3 h-3 text-green-500" />
      case '利空': return <TrendingDown className="w-3 h-3 text-red-500" />
      default: return <Minus className="w-3 h-3 text-gray-400" />
    }
  }

  return (
    <div 
      className={`px-3 py-2 rounded-lg border-2 shadow-sm cursor-pointer transition-all hover:shadow-md ${getSignalColor(data.signalType)} ${data.selected ? 'ring-2 ring-primary ring-offset-2' : ''}`}
      style={{ width: 200 }}
      onClick={data.onClick}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <Newspaper className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
        {getSignalIcon(data.signalType)}
        <span className="text-xs text-text-light">{data.date}</span>
      </div>
      <p className="text-xs font-medium text-text line-clamp-2 leading-tight">
        {data.title}
      </p>
      {data.connectionCount > 0 && (
        <div className="mt-1.5 flex items-center gap-1">
          <Network className="w-3 h-3 text-primary" />
          <span className="text-xs text-primary font-medium">{data.connectionCount} 关联</span>
        </div>
      )}
    </div>
  )
}

const nodeTypes = { newsNode: NewsNode }

export default function NewsNetwork() {
  const [selectedNews, setSelectedNews] = useState(null)
  const [filterMode, setFilterMode] = useState('all') // all, recent, highImportance
  const [hoveredEdge, setHoveredEdge] = useState(null)
  
  // 过滤新闻
  const filteredNews = useMemo(() => {
    let news = [...newsData.news]
    
    switch (filterMode) {
      case 'recent':
        news = news.slice(0, 30)
        break
      case 'highImportance':
        news = news.filter(n => n.importance >= 8)
        break
      default:
        news = news.slice(0, 50) // 限制数量以保持性能
    }
    
    return news
  }, [filterMode])
  
  // 计算关联关系
  const relationships = useMemo(() => {
    return computeNewsRelationships(filteredNews)
  }, [filteredNews])
  
  // 构建节点和边
  const { initialNodes, initialEdges } = useMemo(() => {
    // 计算每个新闻的关联数
    const connectionCounts = {}
    relationships.forEach(rel => {
      connectionCounts[rel.source] = (connectionCounts[rel.source] || 0) + 1
      connectionCounts[rel.target] = (connectionCounts[rel.target] || 0) + 1
    })
    
    // 按关联度和时间排序
    const sortedNews = [...filteredNews].sort((a, b) => {
      const countDiff = (connectionCounts[b.id] || 0) - (connectionCounts[a.id] || 0)
      if (countDiff !== 0) return countDiff
      return new Date(b.date) - new Date(a.date)
    })
    
    // 使用螺旋布局 - 高关联度的在中心
    const nodes = sortedNews.map((news, index) => {
      const connectionCount = connectionCounts[news.id] || 0
      
      // 螺旋布局参数
      const angle = index * 0.8 // 角度增量
      const baseRadius = 80
      const radiusGrowth = 25
      const radius = baseRadius + radiusGrowth * Math.sqrt(index)
      
      return {
        id: news.id,
        type: 'newsNode',
        position: {
          x: 500 + radius * Math.cos(angle),
          y: 400 + radius * Math.sin(angle)
        },
        data: {
          ...news,
          connectionCount,
          selected: selectedNews?.id === news.id,
          onClick: () => setSelectedNews(news)
        }
      }
    })
    
    // 创建边
    const edges = relationships.map((rel, index) => {
      const isHighWeight = rel.weight >= 5
      const hasEntity = rel.connections.some(c => c.type === 'entity')
      
      return {
        id: `edge-${index}`,
        source: rel.source,
        target: rel.target,
        type: 'default',
        animated: isHighWeight,
        style: {
          stroke: hasEntity ? '#3b82f6' : '#94a3b8',
          strokeWidth: Math.min(rel.weight / 2, 3),
          opacity: 0.5
        },
        data: rel
      }
    })
    
    return { initialNodes: nodes, initialEdges: edges }
  }, [filteredNews, relationships, selectedNews])
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  
  // 当选中新闻变化时更新节点
  useMemo(() => {
    setNodes(nds => nds.map(node => ({
      ...node,
      data: {
        ...node.data,
        selected: selectedNews?.id === node.id,
        onClick: () => setSelectedNews(newsData.news.find(n => n.id === node.id))
      }
    })))
  }, [selectedNews, setNodes])
  
  // 获取选中新闻的关联新闻
  const relatedNews = useMemo(() => {
    if (!selectedNews) return []
    
    const related = relationships
      .filter(rel => rel.source === selectedNews.id || rel.target === selectedNews.id)
      .map(rel => {
        const otherId = rel.source === selectedNews.id ? rel.target : rel.source
        const otherNews = filteredNews.find(n => n.id === otherId)
        return { news: otherNews, relationship: rel }
      })
      .filter(r => r.news)
      .sort((a, b) => b.relationship.weight - a.relationship.weight)
    
    return related
  }, [selectedNews, relationships, filteredNews])

  const getConnectionTypeLabel = (type) => {
    switch (type) {
      case 'entity': return '共同实体'
      case 'tag': return '共同标签'
      case 'subdivision': return '同一领域'
      case 'techRoute': return '同一技术路线'
      case 'timeline': return '时间接近'
      default: return type
    }
  }

  const getConnectionTypeIcon = (type) => {
    switch (type) {
      case 'entity': return <Building2 className="w-3 h-3" />
      case 'tag': return <Tag className="w-3 h-3" />
      case 'timeline': return <Calendar className="w-3 h-3" />
      default: return <Network className="w-3 h-3" />
    }
  }

  return (
    <div className="h-full flex">
      {/* 网络图区域 */}
      <div className="flex-1 relative">
        {/* 过滤器 */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white rounded-lg shadow-sm border border-border p-1">
          <Filter className="w-4 h-4 text-text-muted ml-2" />
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 text-xs rounded transition-colors cursor-pointer ${filterMode === 'all' ? 'bg-primary text-white' : 'text-text-muted hover:bg-background'}`}
          >
            全部 (50)
          </button>
          <button
            onClick={() => setFilterMode('recent')}
            className={`px-3 py-1.5 text-xs rounded transition-colors cursor-pointer ${filterMode === 'recent' ? 'bg-primary text-white' : 'text-text-muted hover:bg-background'}`}
          >
            最近 (30)
          </button>
          <button
            onClick={() => setFilterMode('highImportance')}
            className={`px-3 py-1.5 text-xs rounded transition-colors cursor-pointer ${filterMode === 'highImportance' ? 'bg-primary text-white' : 'text-text-muted hover:bg-background'}`}
          >
            重要
          </button>
        </div>
        
        {/* 统计信息 */}
        <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-sm border border-border px-3 py-2">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <Newspaper className="w-3.5 h-3.5 text-primary" />
              <span className="text-text-muted">新闻</span>
              <span className="font-semibold text-text">{filteredNews.length}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-text-muted">关联</span>
              <span className="font-semibold text-text">{relationships.length}</span>
            </div>
          </div>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.3}
          maxZoom={1.5}
          defaultViewport={{ x: 0, y: 0, zoom: 0.6 }}
        >
          <Background color="#e2e8f0" gap={20} />
          <Controls />
        </ReactFlow>
      </div>
      
      {/* 详情面板 */}
      {selectedNews && (
        <div className="w-80 border-l border-border bg-white overflow-y-auto">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text">新闻详情</h3>
            <button 
              onClick={() => setSelectedNews(null)}
              className="p-1 hover:bg-background rounded transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 text-text-muted" />
            </button>
          </div>
          
          <div className="p-4">
            {/* 新闻标题 */}
            <h4 className="text-sm font-medium text-text mb-2 leading-snug">
              {selectedNews.title}
            </h4>
            
            {/* 元信息 */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">
                {selectedNews.category}
              </span>
              <span className="text-xs text-text-light flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {selectedNews.date}
              </span>
            </div>
            
            {/* 摘要 */}
            <p className="text-xs text-text-muted leading-relaxed mb-4">
              {selectedNews.summary}
            </p>
            
            {/* AI 解读 */}
            <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">AI 投资解读</span>
              </div>
              <p className="text-xs text-text leading-relaxed">
                {selectedNews.aiInsight}
              </p>
            </div>
            
            {/* 实体 */}
            {selectedNews.entities?.length > 0 && (
              <div className="mb-4">
                <h5 className="text-xs font-medium text-text-muted mb-2 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  涉及实体
                </h5>
                <div className="flex flex-wrap gap-1">
                  {selectedNews.entities.map((entity, idx) => (
                    <span key={idx} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded">
                      {entity}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* 原文链接 */}
            {selectedNews.url && (
              <a
                href={selectedNews.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-primary hover:text-primary-dark transition-colors mb-4 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                查看原文
              </a>
            )}
          </div>
          
          {/* 关联新闻 */}
          {relatedNews.length > 0 && (
            <div className="border-t border-border">
              <div className="p-4 pb-2">
                <h5 className="text-xs font-semibold text-text flex items-center gap-1.5">
                  <Network className="w-3.5 h-3.5 text-primary" />
                  关联新闻 ({relatedNews.length})
                </h5>
              </div>
              <div className="px-4 pb-4 space-y-3">
                {relatedNews.slice(0, 8).map(({ news, relationship }) => (
                  <div 
                    key={news.id}
                    className="p-2.5 bg-background rounded-lg cursor-pointer hover:bg-background/80 transition-colors"
                    onClick={() => setSelectedNews(news)}
                  >
                    <p className="text-xs font-medium text-text line-clamp-2 mb-2">
                      {news.title}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {relationship.connections.map((conn, idx) => (
                        <span 
                          key={idx}
                          className="text-xs px-1.5 py-0.5 bg-white border border-border rounded flex items-center gap-1"
                        >
                          {getConnectionTypeIcon(conn.type)}
                          <span className="text-text-muted">{getConnectionTypeLabel(conn.type)}</span>
                          {conn.items && (
                            <span className="text-primary font-medium">
                              {conn.items.slice(0, 2).join(', ')}
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

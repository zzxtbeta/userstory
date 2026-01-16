import { useState } from 'react'
import { TrendingUp, TrendingDown, Minus, ExternalLink, ChevronDown, ChevronUp, Sparkles, Clock, Radio } from 'lucide-react'
import newsData from '../data/quantum-news-full.json'

export default function NewsStream({ filters }) {
  const [expandedNews, setExpandedNews] = useState({})

  const toggleNews = (newsId) => {
    setExpandedNews(prev => ({
      ...prev,
      [newsId]: !prev[newsId]
    }))
  }

  const filteredNews = newsData.news.filter(news => {
    if (filters.entity) {
      const entityName = filters.entity.name
      const matchesEntity = 
        news.entities?.includes(entityName) ||
        news.tags?.includes(entityName) ||
        news.title.includes(entityName) ||
        news.summary.includes(entityName)
      
      if (!matchesEntity) return false
    }

    if (filters.subdivisions.length > 0) {
      const matchesSubdivision = news.subdivision?.some(sub => 
        filters.subdivisions.includes(sub)
      )
      if (!matchesSubdivision) return false
    }

    if (filters.tags.length > 0) {
      const matchesTags = news.tags?.some(tag => 
        filters.tags.includes(tag)
      )
      if (!matchesTags) return false
    }

    if (filters.techRoutes.length > 0) {
      const matchesTechRoute = news.techRoute?.some(route => 
        filters.techRoutes.includes(route)
      )
      if (!matchesTechRoute) return false
    }

    return true
  })

  const getSignalIcon = (signalType) => {
    switch (signalType) {
      case '利好':
        return <TrendingUp className="w-3.5 h-3.5" />
      case '利空':
        return <TrendingDown className="w-3.5 h-3.5" />
      default:
        return <Minus className="w-3.5 h-3.5" />
    }
  }

  const getSignalStyle = (signalType) => {
    switch (signalType) {
      case '利好':
        return 'bg-success/10 text-success border-success/20'
      case '利空':
        return 'bg-danger/10 text-danger border-danger/20'
      default:
        return 'bg-text/5 text-text-muted border-border'
    }
  }

  const getCategoryStyle = (category) => {
    const styles = {
      '融资动态': 'bg-blue-50 text-blue-600',
      '新闻动态': 'bg-purple-50 text-purple-600',
      '技术动态': 'bg-orange-50 text-orange-600',
      '人物动态': 'bg-pink-50 text-pink-600',
      '工商动态': 'bg-teal-50 text-teal-600',
    }
    return styles[category] || 'bg-background text-text-muted'
  }

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden sticky top-[4.5rem] max-h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-text">信号捕捉</h2>
          <span className="text-xs text-text-muted">
            {filteredNews.length} 条
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-success/10 rounded">
          <Radio className="w-3 h-3 text-success animate-pulse" />
          <span className="text-xs font-medium text-success">实时</span>
        </div>
      </div>

      {/* News List */}
      <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 10rem)' }}>
        {filteredNews.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-text-light" />
            </div>
            <p className="text-sm text-text-muted">暂无相关信号</p>
            <p className="text-xs text-text-light mt-1">调整筛选条件</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredNews.map((news) => (
              <div key={news.id} className="p-4 hover:bg-background/30 transition-colors">
                {/* Meta Row */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${getCategoryStyle(news.category)}`}>
                    {news.category}
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded border flex items-center gap-1 ${getSignalStyle(news.signalType)}`}>
                    {getSignalIcon(news.signalType)}
                    {news.signalType}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-text-light ml-auto">
                    <Clock className="w-3 h-3" />
                    <span>{news.date}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-sm font-medium text-text leading-snug mb-2 line-clamp-2">
                  {news.title}
                </h3>

                {/* Summary */}
                <p className="text-xs text-text-muted leading-relaxed mb-3 line-clamp-2">
                  {news.summary}
                </p>

                {/* AI Insight Toggle */}
                <button
                  onClick={() => toggleNews(news.id)}
                  className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-dark transition-colors mb-2 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>AI 解读</span>
                  {expandedNews[news.id] ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>
                
                {expandedNews[news.id] && (
                  <div className="mb-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <p className="text-xs text-text leading-relaxed">
                      {news.aiInsight}
                    </p>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {news.tags.slice(0, 4).map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-1.5 py-0.5 bg-background text-text-muted rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {news.tags.length > 4 && (
                    <span className="text-xs text-text-light">+{news.tags.length - 4}</span>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-light">{news.source}</span>
                    <span className="text-xs text-warning font-medium">★{news.importance}</span>
                  </div>
                  <a
                    href={news.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:text-primary-dark flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>原文</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

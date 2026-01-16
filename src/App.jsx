import { useState, useEffect, useMemo } from 'react'
import { Activity, Layers, Bell, Filter, X, Network, LayoutGrid, Settings, Zap, Search, Building2, User, Newspaper, ChevronRight } from 'lucide-react'
import TrackOverview from './components/TrackOverview'
import EntityNetwork from './components/EntityNetwork'
import NewsStream from './components/NewsStream'
import KnowledgeGraph from './components/KnowledgeGraph'
import SignalAlert from './components/SignalAlert'
import TrackSubscription from './components/TrackSubscription'
import companiesData from './data/quantum-companies-full.json'
import peopleData from './data/quantum-people-full.json'
import newsData from './data/quantum-news-full.json'
import entitiesData from './data/entities.json'

function App() {
  const [selectedEntity, setSelectedEntity] = useState(null)
  const [selectedTags, setSelectedTags] = useState([])
  const [selectedSubdivisions, setSelectedSubdivisions] = useState([])
  const [selectedTechRoutes, setSelectedTechRoutes] = useState([])
  const [viewMode, setViewMode] = useState('list')
  
  // 新增状态
  const [showSignalAlert, setShowSignalAlert] = useState(false)
  const [showSubscription, setShowSubscription] = useState(false)
  const [newSignalCount, setNewSignalCount] = useState(2)
  const [showNewSignalToast, setShowNewSignalToast] = useState(false)
  
  // 搜索状态
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)

  // 搜索结果
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { companies: [], people: [], news: [] }
    
    const query = searchQuery.toLowerCase()
    
    const companies = companiesData.companies.filter(c => 
      c.name.toLowerCase().includes(query) ||
      c.description?.toLowerCase().includes(query) ||
      c.tags?.some(t => t.toLowerCase().includes(query))
    ).slice(0, 5)
    
    const people = peopleData.people.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.role?.toLowerCase().includes(query) ||
      p.background?.toLowerCase().includes(query) ||
      p.companies?.some(c => c.toLowerCase().includes(query))
    ).slice(0, 5)
    
    const news = newsData.news.filter(n => 
      n.title.toLowerCase().includes(query) ||
      n.summary?.toLowerCase().includes(query) ||
      n.entities?.some(e => e.toLowerCase().includes(query)) ||
      n.tags?.some(t => t.toLowerCase().includes(query))
    ).slice(0, 5)
    
    return { companies, people, news }
  }, [searchQuery])

  const hasSearchResults = searchResults.companies.length > 0 || 
                          searchResults.people.length > 0 || 
                          searchResults.news.length > 0

  // 点击外部关闭搜索结果
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.search-container')) {
        setShowSearchResults(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const filters = {
    tags: selectedTags,
    subdivisions: selectedSubdivisions,
    techRoutes: selectedTechRoutes,
    entity: selectedEntity
  }

  const hasActiveFilters = selectedSubdivisions.length > 0 || selectedEntity !== null

  const clearAllFilters = () => {
    setSelectedEntity(null)
    setSelectedTags([])
    setSelectedSubdivisions([])
    setSelectedTechRoutes([])
  }

  // 模拟新信号到达
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNewSignalToast(true)
      setNewSignalCount(prev => prev + 1)
      setTimeout(() => setShowNewSignalToast(false), 5000)
    }, 10000)
    return () => clearTimeout(timer)
  }, [])

  const handleSignalClick = (signal) => {
    setShowSignalAlert(false)
    // 可以根据信号类型跳转到对应实体
    if (signal.entity) {
      const company = companiesData.companies.find(c => c.name === signal.entity)
      if (company) {
        setSelectedEntity(company)
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-[1800px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-baseline gap-2">
              <h1 className="text-lg font-semibold text-text">QuantumTrack</h1>
              <span className="text-xs text-text-muted hidden sm:inline">量子计算赛道认知</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* 全局搜索 */}
            <div className="relative search-container">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-lg border border-transparent focus-within:border-primary/40 focus-within:bg-white transition-all">
                <Search className="w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="搜索公司、人物、新闻..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setShowSearchResults(true)
                  }}
                  onFocus={() => setShowSearchResults(true)}
                  className="w-48 text-sm bg-transparent outline-none placeholder:text-text-light"
                />
                {searchQuery && (
                  <button 
                    onClick={() => {
                      setSearchQuery('')
                      setShowSearchResults(false)
                    }}
                    className="p-0.5 hover:bg-gray-200 rounded cursor-pointer"
                  >
                    <X className="w-3 h-3 text-text-muted" />
                  </button>
                )}
              </div>
              
              {/* 搜索结果下拉 */}
              {showSearchResults && searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-border shadow-lg z-50 max-h-[70vh] overflow-y-auto">
                  {!hasSearchResults ? (
                    <div className="p-4 text-center text-sm text-text-muted">
                      未找到相关结果
                    </div>
                  ) : (
                    <div className="p-2">
                      {/* 公司结果 */}
                      {searchResults.companies.length > 0 && (
                        <div className="mb-2">
                          <div className="px-2 py-1.5 text-xs font-medium text-text-muted flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5" />
                            公司 ({searchResults.companies.length})
                          </div>
                          {searchResults.companies.map(company => (
                            <div
                              key={company.id}
                              onClick={() => {
                                setSelectedEntity(company)
                                setSearchQuery('')
                                setShowSearchResults(false)
                              }}
                              className="px-3 py-2 rounded-lg hover:bg-background cursor-pointer transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-text">{company.name}</span>
                                <ChevronRight className="w-3.5 h-3.5 text-text-light" />
                              </div>
                              <p className="text-xs text-text-muted truncate">{company.description}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* 人物结果 */}
                      {searchResults.people.length > 0 && (
                        <div className="mb-2">
                          <div className="px-2 py-1.5 text-xs font-medium text-text-muted flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" />
                            人物 ({searchResults.people.length})
                          </div>
                          {searchResults.people.map(person => (
                            <div
                              key={person.id}
                              onClick={() => {
                                setSelectedEntity(person)
                                setSearchQuery('')
                                setShowSearchResults(false)
                              }}
                              className="px-3 py-2 rounded-lg hover:bg-background cursor-pointer transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-text">{person.name}</span>
                                <ChevronRight className="w-3.5 h-3.5 text-text-light" />
                              </div>
                              <p className="text-xs text-text-muted truncate">{person.role}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* 新闻结果 */}
                      {searchResults.news.length > 0 && (
                        <div>
                          <div className="px-2 py-1.5 text-xs font-medium text-text-muted flex items-center gap-1.5">
                            <Newspaper className="w-3.5 h-3.5" />
                            新闻 ({searchResults.news.length})
                          </div>
                          {searchResults.news.map(news => (
                            <div
                              key={news.id}
                              onClick={() => {
                                // 可以跳转到新闻详情或打开原文
                                if (news.url) window.open(news.url, '_blank')
                                setSearchQuery('')
                                setShowSearchResults(false)
                              }}
                              className="px-3 py-2 rounded-lg hover:bg-background cursor-pointer transition-colors"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-text-light">{news.date}</span>
                                <span className={`text-xs px-1.5 py-0.5 rounded ${
                                  news.signalType === '利好' ? 'bg-green-50 text-green-600' :
                                  news.signalType === '利空' ? 'bg-red-50 text-red-600' :
                                  'bg-gray-50 text-gray-600'
                                }`}>{news.signalType}</span>
                              </div>
                              <p className="text-sm font-medium text-text line-clamp-1">{news.title}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 视图切换 */}
            <div className="flex items-center bg-background rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-text'}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>列表</span>
              </button>
              <button
                onClick={() => setViewMode('graph')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${viewMode === 'graph' ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-text'}`}
              >
                <Network className="w-3.5 h-3.5" />
                <span>图谱</span>
              </button>
            </div>

            {/* 筛选状态 */}
            {hasActiveFilters && viewMode === 'list' && (
              <button 
                onClick={clearAllFilters}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-primary bg-primary/5 hover:bg-primary/10 rounded-md transition-colors cursor-pointer"
              >
                <Filter className="w-3 h-3" />
                <span>{selectedSubdivisions.length + (selectedEntity ? 1 : 0)} 筛选</span>
                <X className="w-3 h-3" />
              </button>
            )}
            
            {/* 实时状态 */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-success/10 text-success rounded-md">
              <Activity className="w-3 h-3" />
              <span className="text-xs font-medium">实时</span>
            </div>

            {/* 订阅管理 */}
            <button 
              onClick={() => setShowSubscription(true)}
              className="p-2 hover:bg-background rounded-lg transition-colors cursor-pointer"
              title="赛道订阅管理"
            >
              <Settings className="w-4 h-4 text-text-muted" />
            </button>
            
            {/* 信号中心 */}
            <button 
              onClick={() => {
                setShowSignalAlert(true)
                setNewSignalCount(0)
              }}
              className="p-2 hover:bg-background rounded-lg transition-colors relative cursor-pointer"
              title="信号中心"
            >
              <Bell className="w-4 h-4 text-text-muted" />
              {newSignalCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-danger text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                  {newSignalCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-6 py-5">
        {viewMode === 'list' ? (
          <div className="grid grid-cols-12 gap-5">
            <div className="col-span-3">
              <TrackOverview 
                onSubdivisionSelect={(subdivision) => {
                  setSelectedSubdivisions(prev => 
                    prev.includes(subdivision) 
                      ? prev.filter(s => s !== subdivision)
                      : [...prev, subdivision]
                  )
                }}
                selectedSubdivisions={selectedSubdivisions}
              />
            </div>
            <div className="col-span-5">
              <EntityNetwork 
                onEntitySelect={setSelectedEntity}
                selectedEntity={selectedEntity}
                filters={filters}
              />
            </div>
            <div className="col-span-4">
              <NewsStream filters={filters} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-5">
            <div className="col-span-8">
              <div className="bg-white rounded-xl border border-border overflow-hidden" style={{ height: 'calc(100vh - 8rem)' }}>
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Network className="w-4 h-4 text-primary" />
                    <h2 className="text-sm font-semibold text-text">知识图谱</h2>
                    <span className="text-xs text-text-muted">顺藤摸瓜 · 深度探索</span>
                  </div>
                </div>
                <div className="h-[calc(100%-3rem)]">
                  <KnowledgeGraph 
                    companies={companiesData.companies}
                    people={peopleData.people}
                    news={newsData.news}
                    technologies={entitiesData.technologies}
                    onEntityClick={setSelectedEntity}
                    selectedEntity={selectedEntity}
                  />
                </div>
              </div>
            </div>
            <div className="col-span-4">
              <NewsStream filters={filters} />
            </div>
          </div>
        )}
      </main>

      {/* 信号中心侧边栏 */}
      <SignalAlert 
        isOpen={showSignalAlert}
        onClose={() => setShowSignalAlert(false)}
        onSignalClick={handleSignalClick}
      />

      {/* 订阅管理弹窗 */}
      <TrackSubscription
        isOpen={showSubscription}
        onClose={() => setShowSubscription(false)}
      />

      {/* 新信号提示 Toast */}
      {showNewSignalToast && (
        <div 
          className="fixed bottom-6 right-6 z-50 animate-slide-in-up"
          onClick={() => {
            setShowNewSignalToast(false)
            setShowSignalAlert(true)
          }}
        >
          <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl shadow-lg border border-gray-200 cursor-pointer hover:shadow-xl transition-shadow">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">新信号到达</p>
              <p className="text-xs text-gray-500">本源量子完成新一轮融资</p>
            </div>
            <button className="ml-2 text-xs text-primary font-medium">查看</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App

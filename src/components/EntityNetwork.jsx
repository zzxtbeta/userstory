import { useState, useMemo } from 'react'
import { Building2, User, Cpu, TrendingUp, MapPin, Newspaper, Clock, ExternalLink, Sparkles, X, Tag, ChevronRight, FileText, Briefcase, Lightbulb, Users, DollarSign } from 'lucide-react'
import companiesData from '../data/quantum-companies-full.json'
import peopleData from '../data/quantum-people-full.json'
import entitiesData from '../data/entities.json'
import newsData from '../data/quantum-news-full.json'

// 判断是否为国内实体
const isChineseCompany = (company) => {
  const location = company.location || ''
  return location.includes('中国') || 
         location.includes('北京') || 
         location.includes('上海') || 
         location.includes('深圳') || 
         location.includes('合肥') ||
         location.includes('杭州') ||
         location.includes('广州') ||
         location.includes('成都') ||
         location.includes('武汉')
}

const isChinesePerson = (person) => {
  const name = person.name || ''
  const companies = person.companies || []
  // 中文名字或关联中国公司
  return /[\u4e00-\u9fa5]/.test(name) || 
         companies.some(c => 
           c.includes('中国') || 
           c.includes('大学') || 
           c.includes('科学院') ||
           c.includes('本源') ||
           c.includes('国盾') ||
           c.includes('国仪') ||
           c.includes('图灵') ||
           c.includes('华翊')
         )
}

// 排序函数：国内优先
const sortChineseFirst = (items, isChineseFn) => {
  return [...items].sort((a, b) => {
    const aIsChinese = isChineseFn(a)
    const bIsChinese = isChineseFn(b)
    if (aIsChinese && !bIsChinese) return -1
    if (!aIsChinese && bIsChinese) return 1
    return 0
  })
}

export default function EntityNetwork({ onEntitySelect, selectedEntity, filters }) {
  const [activeTab, setActiveTab] = useState('companies')
  const [selectedNews, setSelectedNews] = useState(null)

  const filterByMultipleCriteria = (items, getItemFields) => {
    return items.filter(item => {
      const fields = getItemFields(item)
      
      if (filters.subdivisions.length === 0 && filters.tags.length === 0 && filters.techRoutes.length === 0) {
        return true
      }
      
      if (filters.subdivisions.length > 0) {
        const hasSubdivision = fields.subdivisions?.some(sub => 
          filters.subdivisions.includes(sub)
        )
        if (!hasSubdivision) return false
      }
      
      if (filters.tags.length > 0) {
        const hasTag = fields.tags?.some(tag => 
          filters.tags.includes(tag)
        )
        if (!hasTag) return false
      }
      
      if (filters.techRoutes.length > 0) {
        const hasTechRoute = filters.techRoutes.includes(fields.techRoute)
        if (!hasTechRoute) return false
      }
      
      return true
    })
  }

  const filteredCompanies = sortChineseFirst(
    filterByMultipleCriteria(
      companiesData.companies,
      (company) => ({
        subdivisions: company.subdivision || [],
        tags: company.tags || [],
        techRoute: company.techRoute
      })
    ),
    isChineseCompany
  )

  const filteredPeople = sortChineseFirst(
    filterByMultipleCriteria(
      peopleData.people,
      (person) => ({
        subdivisions: person.subdivision || [],
        tags: person.tags || [],
        techRoute: null
      })
    ),
    isChinesePerson
  )

  const filteredTechnologies = filterByMultipleCriteria(
    entitiesData.technologies,
    (tech) => ({
      subdivisions: [tech.category],
      tags: tech.tags || [],
      techRoute: null
    })
  )

  const filteredNews = filterByMultipleCriteria(
    newsData.news,
    (news) => ({
      subdivisions: news.subdivision || [],
      tags: news.tags || [],
      techRoute: news.techRoute?.[0] || null
    })
  )

  const tabs = [
    { id: 'companies', label: '公司', icon: Building2, count: filteredCompanies.length },
    { id: 'people', label: '人物', icon: User, count: filteredPeople.length },
    { id: 'technologies', label: '技术', icon: Cpu, count: filteredTechnologies.length },
    { id: 'news', label: '新闻', icon: Newspaper, count: filteredNews.length },
  ]

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden sticky top-[4.5rem]">
      {/* Tabs - 紧凑设计 */}
      <div className="border-b border-border">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setSelectedNews(null)
                }}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-all relative cursor-pointer ${
                  activeTab === tab.id
                    ? 'text-primary bg-primary/5'
                    : 'text-text-muted hover:text-text hover:bg-background/50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    activeTab === tab.id
                      ? 'bg-primary/10 text-primary'
                      : 'bg-background text-text-muted'
                  }`}>
                    {tab.count}
                  </span>
                </div>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-h-[calc(100vh-10rem)] overflow-y-auto">
        {activeTab === 'companies' && (
          <CompanyList 
            companies={filteredCompanies}
            onSelect={onEntitySelect}
            selected={selectedEntity}
          />
        )}
        {activeTab === 'people' && (
          <PeopleList 
            people={filteredPeople}
            onSelect={onEntitySelect}
            selected={selectedEntity}
          />
        )}
        {activeTab === 'technologies' && (
          <TechnologyList 
            technologies={filteredTechnologies}
            onSelect={onEntitySelect}
            selected={selectedEntity}
          />
        )}
        {activeTab === 'news' && (
          <NewsList 
            news={filteredNews}
            allNews={newsData.news}
            selectedNews={selectedNews}
            onSelectNews={setSelectedNews}
          />
        )}
      </div>
    </div>
  )
}

function CompanyList({ companies, onSelect, selected }) {
  if (companies.length === 0) {
    return <EmptyState message="暂无匹配公司" />
  }

  return (
    <div className="space-y-3">
      {companies.map((company) => (
        <div
          key={company.id}
          onClick={() => onSelect(company)}
          className={`p-4 rounded-lg border transition-all cursor-pointer ${
            selected?.id === company.id
              ? 'border-primary bg-primary/5 shadow-sm'
              : 'border-border hover:border-primary/40 hover:shadow-sm'
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-text mb-1 truncate">
                {company.name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{company.location}</span>
                <span className="text-border">·</span>
                <span className="text-primary font-medium">{company.stage}</span>
              </div>
            </div>
            {company.valuation && (
              <div className="ml-2 px-2 py-1 bg-success/10 border border-success/20 rounded">
                <span className="text-xs font-semibold text-success">{company.valuation}</span>
              </div>
            )}
          </div>

          <p className="text-xs text-text-muted leading-relaxed mb-3 line-clamp-2">
            {company.description}
          </p>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {company.tags.slice(0, 4).map((tag, idx) => (
              <span
                key={idx}
                className="text-xs px-2 py-0.5 bg-background text-text-muted rounded"
              >
                {tag}
              </span>
            ))}
            {company.tags.length > 4 && (
              <span className="text-xs px-2 py-0.5 text-text-light">
                +{company.tags.length - 4}
              </span>
            )}
          </div>

          {company.latestRound && (
            <div className="pt-2 border-t border-border">
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <TrendingUp className="w-3 h-3 text-success" />
                <span>最新：{company.latestRound}</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function PeopleList({ people, onSelect, selected }) {
  if (people.length === 0) {
    return <EmptyState message="暂无匹配人物" />
  }

  return (
    <div className="space-y-3">
      {people.map((person) => (
        <div
          key={person.id}
          onClick={() => onSelect(person)}
          className={`p-4 rounded-lg border transition-all cursor-pointer ${
            selected?.id === person.id
              ? 'border-primary bg-primary/5 shadow-sm'
              : 'border-border hover:border-primary/40 hover:shadow-sm'
          }`}
        >
          <div className="flex items-start gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-text mb-0.5 truncate">
                {person.name}
              </h3>
              <p className="text-xs text-primary font-medium truncate">
                {person.role}
              </p>
            </div>
          </div>

          <p className="text-xs text-text-muted leading-relaxed mb-3 line-clamp-2">
            {person.background}
          </p>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {person.tags.slice(0, 4).map((tag, idx) => (
              <span
                key={idx}
                className="text-xs px-2 py-0.5 bg-background text-text-muted rounded"
              >
                {tag}
              </span>
            ))}
          </div>

          {person.companies && person.companies.length > 0 && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-text-muted truncate">
                <span className="text-text-light">关联：</span>
                {person.companies.slice(0, 2).join('、')}
                {person.companies.length > 2 && ` +${person.companies.length - 2}`}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function TechnologyList({ technologies, onSelect, selected }) {
  if (technologies.length === 0) {
    return <EmptyState message="暂无匹配技术" />
  }

  return (
    <div className="space-y-3">
      {technologies.map((tech) => (
        <div
          key={tech.id}
          onClick={() => onSelect(tech)}
          className={`p-4 rounded-lg border transition-all cursor-pointer ${
            selected?.id === tech.id
              ? 'border-primary bg-primary/5 shadow-sm'
              : 'border-border hover:border-primary/40 hover:shadow-sm'
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                <Cpu className="w-4 h-4 text-accent" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text">
                  {tech.name}
                </h3>
                <p className="text-xs text-text-muted">{tech.category}</p>
              </div>
            </div>
            <span className="px-2 py-0.5 bg-accent/10 text-accent text-xs font-medium rounded">
              {tech.maturity}
            </span>
          </div>

          <p className="text-xs text-text-muted leading-relaxed mb-3 line-clamp-2">
            {tech.description}
          </p>

          <div className="pt-2 border-t border-border">
            <p className="text-xs text-text-muted mb-1.5">关键玩家</p>
            <div className="flex flex-wrap gap-1.5">
              {tech.keyPlayers.slice(0, 4).map((player, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-0.5 bg-background text-text-muted rounded"
                >
                  {player}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ message }) {
  return (
    <div className="py-12 text-center">
      <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center mx-auto mb-3">
        <Building2 className="w-6 h-6 text-text-light" />
      </div>
      <p className="text-sm text-text-muted">{message}</p>
      <p className="text-xs text-text-light mt-1">调整筛选条件查看更多</p>
    </div>
  )
}

// 计算新闻关联度
function computeRelatedNews(targetNews, allNews) {
  if (!targetNews) return []
  
  return allNews
    .filter(news => news.id !== targetNews.id)
    .map(news => {
      let score = 0
      const reasons = []
      
      // 共同实体 (权重最高)
      const sharedEntities = targetNews.entities?.filter(e => news.entities?.includes(e)) || []
      if (sharedEntities.length > 0) {
        score += sharedEntities.length * 10
        reasons.push({ type: 'entity', items: sharedEntities })
      }
      
      // 共同标签
      const sharedTags = targetNews.tags?.filter(t => news.tags?.includes(t)) || []
      if (sharedTags.length > 0) {
        score += sharedTags.length * 5
        reasons.push({ type: 'tag', items: sharedTags })
      }
      
      // 同一细分领域
      const sharedSubdivisions = targetNews.subdivision?.filter(s => news.subdivision?.includes(s)) || []
      if (sharedSubdivisions.length > 0) {
        score += sharedSubdivisions.length * 3
        reasons.push({ type: 'subdivision', items: sharedSubdivisions })
      }
      
      // 同一技术路线
      const sharedTechRoutes = targetNews.techRoute?.filter(t => news.techRoute?.includes(t)) || []
      if (sharedTechRoutes.length > 0) {
        score += sharedTechRoutes.length * 4
        reasons.push({ type: 'techRoute', items: sharedTechRoutes })
      }
      
      // 同一类别
      if (targetNews.category === news.category) {
        score += 2
        reasons.push({ type: 'category', items: [news.category] })
      }
      
      return { news, score, reasons }
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
}

function NewsList({ news, allNews, selectedNews, onSelectNews }) {
  const [signalFilter, setSignalFilter] = useState('all')
  
  // 五类核心信息源
  const signalCategories = [
    { id: 'all', label: '全部', icon: Newspaper },
    { id: 'news', label: '新闻', icon: FileText, categories: ['新闻动态', '政策动态'] },
    { id: 'business', label: '工商', icon: Briefcase, categories: ['工商动态'] },
    { id: 'tech', label: '技术', icon: Lightbulb, categories: ['技术动态', '商业合作'] },
    { id: 'people', label: '人物', icon: Users, categories: ['人物动态'] },
    { id: 'funding', label: '融资', icon: DollarSign, categories: ['融资动态'] },
  ]

  // 按信号类型筛选
  const filteredBySignal = useMemo(() => {
    if (signalFilter === 'all') return news
    const category = signalCategories.find(c => c.id === signalFilter)
    if (!category?.categories) return news
    return news.filter(n => category.categories.includes(n.category))
  }, [news, signalFilter])

  // 统计各类别数量
  const categoryCounts = useMemo(() => {
    const counts = { all: news.length }
    signalCategories.forEach(cat => {
      if (cat.id !== 'all' && cat.categories) {
        counts[cat.id] = news.filter(n => cat.categories.includes(n.category)).length
      }
    })
    return counts
  }, [news])

  if (news.length === 0) {
    return <EmptyState message="暂无匹配新闻" />
  }

  const relatedNews = computeRelatedNews(selectedNews, allNews)

  const getSignalStyle = (signalType) => {
    switch (signalType) {
      case '利好': return 'bg-green-50 text-green-600 border-green-200'
      case '利空': return 'bg-red-50 text-red-600 border-red-200'
      default: return 'bg-gray-50 text-gray-600 border-gray-200'
    }
  }

  const getCategoryStyle = (category) => {
    const styles = {
      '融资动态': 'bg-blue-50 text-blue-600',
      '新闻动态': 'bg-purple-50 text-purple-600',
      '技术动态': 'bg-orange-50 text-orange-600',
      '人物动态': 'bg-pink-50 text-pink-600',
      '工商动态': 'bg-teal-50 text-teal-600',
      '政策动态': 'bg-red-50 text-red-600',
      '商业合作': 'bg-indigo-50 text-indigo-600',
    }
    return styles[category] || 'bg-gray-50 text-gray-600'
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case '融资动态': return DollarSign
      case '新闻动态': return FileText
      case '政策动态': return FileText
      case '技术动态': return Lightbulb
      case '商业合作': return Lightbulb
      case '人物动态': return Users
      case '工商动态': return Briefcase
      default: return Newspaper
    }
  }

  const getReasonLabel = (type) => {
    switch (type) {
      case 'entity': return '共同实体'
      case 'tag': return '共同标签'
      case 'subdivision': return '同一领域'
      case 'techRoute': return '同一技术'
      case 'category': return '同一类别'
      default: return type
    }
  }

  // 如果选中了新闻，显示详情和关联新闻
  if (selectedNews) {
    const CategoryIcon = getCategoryIcon(selectedNews.category)
    return (
      <div className="space-y-4">
        {/* 返回按钮 */}
        <button
          onClick={() => onSelectNews(null)}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-primary transition-colors cursor-pointer"
        >
          <ChevronRight className="w-3.5 h-3.5 rotate-180" />
          <span>返回列表</span>
        </button>

        {/* 新闻详情 */}
        <div className="p-4 bg-background rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded font-medium flex items-center gap-1 ${getCategoryStyle(selectedNews.category)}`}>
              <CategoryIcon className="w-3 h-3" />
              {selectedNews.category}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded border ${getSignalStyle(selectedNews.signalType)}`}>
              {selectedNews.signalType}
            </span>
            <span className="text-xs text-text-light flex items-center gap-1 ml-auto">
              <Clock className="w-3 h-3" />
              {selectedNews.date}
            </span>
          </div>
          
          <h3 className="text-sm font-semibold text-text mb-2 leading-snug">
            {selectedNews.title}
          </h3>
          
          <p className="text-xs text-text-muted leading-relaxed mb-3">
            {selectedNews.summary}
          </p>

          {/* AI 解读 */}
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 mb-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">AI 投资解读</span>
            </div>
            <p className="text-xs text-text leading-relaxed">
              {selectedNews.aiInsight}
            </p>
          </div>

          {/* 实体 */}
          {selectedNews.entities?.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-text-muted mb-1.5">涉及实体</p>
              <div className="flex flex-wrap gap-1">
                {selectedNews.entities.map((entity, idx) => (
                  <span key={idx} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded">
                    {entity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 标签 */}
          {selectedNews.tags?.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-text-muted mb-1.5">标签</p>
              <div className="flex flex-wrap gap-1">
                {selectedNews.tags.map((tag, idx) => (
                  <span key={idx} className="text-xs px-2 py-0.5 bg-background border border-border text-text-muted rounded">
                    {tag}
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
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary-dark transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              查看原文
            </a>
          )}
        </div>

        {/* 关联新闻 */}
        {relatedNews.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-text mb-3 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-primary" />
              关联新闻 ({relatedNews.length})
            </h4>
            <div className="space-y-2">
              {relatedNews.map(({ news: relNews, reasons }) => (
                <div
                  key={relNews.id}
                  onClick={() => onSelectNews(relNews)}
                  className="p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${getCategoryStyle(relNews.category)}`}>
                      {relNews.category}
                    </span>
                    <span className="text-xs text-text-light">{relNews.date}</span>
                  </div>
                  <p className="text-xs font-medium text-text line-clamp-2 mb-2">
                    {relNews.title}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {reasons.slice(0, 3).map((reason, idx) => (
                      <span key={idx} className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded">
                        {getReasonLabel(reason.type)}: {reason.items.slice(0, 2).join(', ')}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // 新闻列表
  return (
    <div className="space-y-3">
      {/* 五类信号源筛选 */}
      <div className="flex flex-wrap gap-1.5 pb-3 border-b border-border">
        {signalCategories.map((cat) => {
          const Icon = cat.icon
          const count = categoryCounts[cat.id] || 0
          const isActive = signalFilter === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => setSignalFilter(cat.id)}
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-all cursor-pointer ${
                isActive 
                  ? 'bg-primary text-white' 
                  : 'bg-background text-text-muted hover:bg-gray-100'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{cat.label}</span>
              <span className={`text-xs ${isActive ? 'text-white/80' : 'text-text-light'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {filteredBySignal.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-text-muted">该类别暂无新闻</p>
        </div>
      ) : (
        filteredBySignal.map((item) => {
          const CategoryIcon = getCategoryIcon(item.category)
          return (
            <div
              key={item.id}
              onClick={() => onSelectNews(item)}
              className="p-4 rounded-lg border border-border hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium flex items-center gap-1 ${getCategoryStyle(item.category)}`}>
                  <CategoryIcon className="w-3 h-3" />
                  {item.category}
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded border ${getSignalStyle(item.signalType)}`}>
                  {item.signalType}
                </span>
                <span className="text-xs text-text-light flex items-center gap-1 ml-auto">
                  <Clock className="w-3 h-3" />
                  {item.date}
                </span>
              </div>

              <h3 className="text-sm font-medium text-text leading-snug mb-2 line-clamp-2">
                {item.title}
              </h3>

              <p className="text-xs text-text-muted leading-relaxed mb-3 line-clamp-2">
                {item.summary}
              </p>

              <div className="flex flex-wrap gap-1">
                {item.tags?.slice(0, 4).map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-1.5 py-0.5 bg-background text-text-muted rounded"
                  >
                    {tag}
                  </span>
                ))}
                {item.tags?.length > 4 && (
                  <span className="text-xs text-text-light">+{item.tags.length - 4}</span>
                )}
              </div>

              {item.entities?.length > 0 && (
                <div className="mt-2 pt-2 border-t border-border">
                  <p className="text-xs text-text-muted truncate">
                    <span className="text-text-light">涉及：</span>
                    {item.entities.slice(0, 3).join('、')}
                    {item.entities.length > 3 && ` +${item.entities.length - 3}`}
                  </p>
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}

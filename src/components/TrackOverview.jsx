import { useState } from 'react'
import { ChevronRight, ChevronDown, TrendingUp, BarChart3, Zap, Check, Target, Flame, Globe, Calendar, Award, Lightbulb } from 'lucide-react'
import trackData from '../data/track-overview.json'

export default function TrackOverview({ onSubdivisionSelect, selectedSubdivisions }) {
  const [expandedSections, setExpandedSections] = useState({
    subdivisions: true,
    trends: false,
    hotspots: false,
    milestones: false
  })

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // 投资热点数据
  const investmentHotspots = [
    { name: '量子纠错', heat: 95, trend: '↑', reason: 'Google Willow突破带动' },
    { name: '中性原子', heat: 88, trend: '↑', reason: 'QuEra、Pasqal融资活跃' },
    { name: '离子阱', heat: 82, trend: '→', reason: '华翊量子、IonQ稳步发展' },
    { name: '量子云平台', heat: 75, trend: '↑', reason: 'AWS、Azure加速布局' },
  ]

  // 里程碑事件
  const milestones = [
    { date: '2024.12', event: 'Google发布Willow芯片，纠错能力突破', type: '技术' },
    { date: '2024.12', event: '本源量子估值120亿，IPO预期强烈', type: '融资' },
    { date: '2025.01', event: '七部门发布未来产业意见，量子列首位', type: '政策' },
    { date: '2025.01', event: '华翊量子完成新一轮融资', type: '融资' },
  ]

  // 核心指标
  const coreMetrics = [
    { label: '全球融资', value: '20亿+', unit: '美元/年' },
    { label: '中国企业', value: '50+', unit: '家' },
    { label: '上市公司', value: '18', unit: '家' },
  ]

  return (
    <div className="space-y-4 sticky top-[4.5rem]">
      {/* Header Card - 增强版 */}
      <div className="bg-white rounded-xl border border-border p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-xl font-semibold text-text mb-1">
              {trackData.trackName}
            </h2>
            <p className="text-xs text-text-muted">
              精准建模 · 信号捕捉
            </p>
          </div>
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
        </div>
        
        <div className="pt-3 border-t border-border mb-3">
          <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>市场规模</span>
          </div>
          <p className="text-sm font-medium text-text">
            {trackData.marketSize}
          </p>
        </div>

        {/* 核心指标 */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
          {coreMetrics.map((metric, idx) => (
            <div key={idx} className="text-center">
              <p className="text-lg font-semibold text-primary">{metric.value}</p>
              <p className="text-xs text-text-muted">{metric.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Subdivisions - 可选择筛选 */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <button
          onClick={() => toggleSection('subdivisions')}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-background/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="font-medium text-sm text-text">细分领域</span>
            {selectedSubdivisions.length > 0 && (
              <span className="text-xs px-1.5 py-0.5 bg-primary text-white rounded">
                {selectedSubdivisions.length}
              </span>
            )}
          </div>
          {expandedSections.subdivisions ? (
            <ChevronDown className="w-4 h-4 text-text-muted" />
          ) : (
            <ChevronRight className="w-4 h-4 text-text-muted" />
          )}
        </button>

        {expandedSections.subdivisions && (
          <div className="px-4 pb-4 space-y-2">
            {trackData.subdivisions.map((sub) => {
              const isSelected = selectedSubdivisions.includes(sub.name)
              return (
                <div
                  key={sub.id}
                  onClick={() => onSubdivisionSelect(sub.name)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer group ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/40 hover:bg-background/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      {isSelected && (
                        <div className="w-4 h-4 bg-primary rounded flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <h4 className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-text'}`}>
                        {sub.name}
                      </h4>
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      sub.maturity === '成熟期' ? 'bg-success/10 text-success' :
                      sub.maturity === '成长期' ? 'bg-primary/10 text-primary' :
                      sub.maturity === '工程化阶段' ? 'bg-blue-50 text-blue-600' :
                      sub.maturity === '工程化领先' ? 'bg-green-50 text-green-600' :
                      sub.maturity === '产业化初期' ? 'bg-teal-50 text-teal-600' :
                      sub.maturity === '技术攻坚' ? 'bg-orange-50 text-orange-600' :
                      'bg-warning/10 text-warning'
                    }`}>
                      {sub.maturity}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed mb-2 line-clamp-2">
                    {sub.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {sub.keyPlayers.slice(0, 3).map((player, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-1.5 py-0.5 bg-background text-text-muted rounded"
                      >
                        {player}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 投资热点 */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <button
          onClick={() => toggleSection('hotspots')}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-background/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="font-medium text-sm text-text">投资热点</span>
          </div>
          {expandedSections.hotspots ? (
            <ChevronDown className="w-4 h-4 text-text-muted" />
          ) : (
            <ChevronRight className="w-4 h-4 text-text-muted" />
          )}
        </button>

        {expandedSections.hotspots && (
          <div className="px-4 pb-4 space-y-2">
            {investmentHotspots.map((item, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-background/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-text">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${
                      item.trend === '↑' ? 'text-success' : 'text-text-muted'
                    }`}>{item.trend}</span>
                    <span className="text-xs font-semibold text-orange-500">{item.heat}</span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-1.5">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
                    style={{ width: `${item.heat}%` }}
                  />
                </div>
                <p className="text-xs text-text-muted">{item.reason}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 里程碑事件 */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <button
          onClick={() => toggleSection('milestones')}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-background/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-500" />
            <span className="font-medium text-sm text-text">里程碑事件</span>
          </div>
          {expandedSections.milestones ? (
            <ChevronDown className="w-4 h-4 text-text-muted" />
          ) : (
            <ChevronRight className="w-4 h-4 text-text-muted" />
          )}
        </button>

        {expandedSections.milestones && (
          <div className="px-4 pb-4">
            <div className="relative">
              {milestones.map((item, idx) => (
                <div key={idx} className="flex gap-3 pb-3 last:pb-0">
                  <div className="flex flex-col items-center">
                    <div className={`w-2 h-2 rounded-full ${
                      item.type === '技术' ? 'bg-blue-500' :
                      item.type === '融资' ? 'bg-green-500' :
                      'bg-red-500'
                    }`} />
                    {idx < milestones.length - 1 && (
                      <div className="w-px h-full bg-border mt-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-text-light">{item.date}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        item.type === '技术' ? 'bg-blue-50 text-blue-600' :
                        item.type === '融资' ? 'bg-green-50 text-green-600' :
                        'bg-red-50 text-red-600'
                      }`}>{item.type}</span>
                    </div>
                    <p className="text-xs text-text leading-relaxed">{item.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Key Trends - 折叠 */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <button
          onClick={() => toggleSection('trends')}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-background/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            <span className="font-medium text-sm text-text">关键趋势</span>
          </div>
          {expandedSections.trends ? (
            <ChevronDown className="w-4 h-4 text-text-muted" />
          ) : (
            <ChevronRight className="w-4 h-4 text-text-muted" />
          )}
        </button>

        {expandedSections.trends && (
          <div className="px-4 pb-4">
            <ul className="space-y-2">
              {trackData.keyTrends.map((trend, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-text-muted leading-relaxed">
                  <span className="w-1 h-1 bg-primary rounded-full mt-1.5 flex-shrink-0"></span>
                  <span>{trend}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

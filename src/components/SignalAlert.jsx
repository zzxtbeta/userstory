import { useState, useEffect } from 'react'
import { Bell, X, TrendingUp, Building2, Users, FileText, Coins, AlertTriangle, ChevronRight, Clock, Zap } from 'lucide-react'

// 信号类型配置
const SIGNAL_TYPES = {
  news: { icon: FileText, label: '新闻动态', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  business: { icon: Building2, label: '工商动态', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  tech: { icon: TrendingUp, label: '技术/产品', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  people: { icon: Users, label: '团队/人才', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  funding: { icon: Coins, label: '融资动态', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
}

// 信号强度配置
const SIGNAL_LEVELS = {
  critical: { label: '重大', color: 'text-red-600', bg: 'bg-red-100', dot: 'bg-red-500' },
  high: { label: '重要', color: 'text-orange-600', bg: 'bg-orange-100', dot: 'bg-orange-500' },
  medium: { label: '关注', color: 'text-blue-600', bg: 'bg-blue-100', dot: 'bg-blue-500' },
  low: { label: '一般', color: 'text-gray-500', bg: 'bg-gray-100', dot: 'bg-gray-400' },
}

// 模拟实时信号数据
const mockSignals = [
  {
    id: 1,
    type: 'funding',
    level: 'critical',
    title: '本源量子完成新一轮融资，估值达120亿',
    summary: '本源量子基于120亿元估值完成股权交易，标志着市场对硬科技定价逻辑的转变。',
    entity: '本源量子',
    time: '10分钟前',
    isNew: true,
  },
  {
    id: 2,
    type: 'people',
    level: 'high',
    title: '前华为智能驾驶AI负责人黄青妹创立墨奇智能',
    summary: '完成数亿元天使轮融资，聚焦具身智能领域。',
    entity: '墨奇智能',
    time: '1小时前',
    isNew: true,
  },
  {
    id: 3,
    type: 'tech',
    level: 'high',
    title: 'Google Willow芯片实现量子纠错里程碑',
    summary: '105量子比特芯片在随机电路采样任务中展示指数级优势。',
    entity: 'Google Quantum AI',
    time: '2小时前',
    isNew: false,
  },
  {
    id: 4,
    type: 'business',
    level: 'medium',
    title: '国仪量子科创板IPO获受理',
    summary: '计划募资11亿元，估值超95亿元，专注于量子精密测量。',
    entity: '国仪量子',
    time: '3小时前',
    isNew: false,
  },
  {
    id: 5,
    type: 'news',
    level: 'medium',
    title: '北京量子信息科学研究院发布年度报告',
    summary: '总结2025年量子科技进展，展望十五五规划重点方向。',
    entity: '北京量子院',
    time: '5小时前',
    isNew: false,
  },
]

export default function SignalAlert({ isOpen, onClose, onSignalClick }) {
  const [signals, setSignals] = useState(mockSignals)
  const [filterType, setFilterType] = useState('all')
  const [filterLevel, setFilterLevel] = useState('all')
  const [selectedSignal, setSelectedSignal] = useState(null)

  // 过滤信号
  const filteredSignals = signals.filter(signal => {
    if (filterType !== 'all' && signal.type !== filterType) return false
    if (filterLevel !== 'all' && signal.level !== filterLevel) return false
    return true
  })

  // 统计各类型数量
  const typeCounts = signals.reduce((acc, s) => {
    acc[s.type] = (acc[s.type] || 0) + 1
    return acc
  }, {})

  const newCount = signals.filter(s => s.isNew).length

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      
      {/* 侧边面板 */}
      <div className="relative w-[420px] bg-white shadow-xl flex flex-col h-full animate-slide-in-right">
        {/* 头部 */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-800">信号中心</h2>
              <p className="text-xs text-gray-500">实时追踪赛道动态</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {newCount > 0 && (
              <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                {newCount} 新
              </span>
            )}
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* 信号类型筛选 */}
        <div className="px-5 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setFilterType('all')}
              className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-full transition-colors cursor-pointer ${
                filterType === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              全部 ({signals.length})
            </button>
            {Object.entries(SIGNAL_TYPES).map(([key, config]) => {
              const Icon = config.icon
              const count = typeCounts[key] || 0
              return (
                <button
                  key={key}
                  onClick={() => setFilterType(key)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors cursor-pointer ${
                    filterType === key ? `${config.bg} ${config.color}` : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{config.label}</span>
                  {count > 0 && <span>({count})</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* 信号强度筛选 */}
        <div className="px-5 py-2 border-b border-gray-100 flex items-center gap-2">
          <span className="text-xs text-gray-500">强度：</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilterLevel('all')}
              className={`px-2 py-1 text-xs rounded cursor-pointer ${filterLevel === 'all' ? 'bg-gray-200 text-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              全部
            </button>
            {Object.entries(SIGNAL_LEVELS).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setFilterLevel(key)}
                className={`flex items-center gap-1 px-2 py-1 text-xs rounded cursor-pointer ${
                  filterLevel === key ? `${config.bg} ${config.color}` : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
                {config.label}
              </button>
            ))}
          </div>
        </div>

        {/* 信号列表 */}
        <div className="flex-1 overflow-y-auto">
          {filteredSignals.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <Bell className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">暂无符合条件的信号</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredSignals.map(signal => {
                const typeConfig = SIGNAL_TYPES[signal.type]
                const levelConfig = SIGNAL_LEVELS[signal.level]
                const Icon = typeConfig.icon

                return (
                  <div
                    key={signal.id}
                    onClick={() => setSelectedSignal(signal)}
                    className={`px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors ${signal.isNew ? 'bg-blue-50/30' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      {/* 类型图标 */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${typeConfig.bg} flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 ${typeConfig.color}`} />
                      </div>

                      {/* 内容 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {/* 强度标签 */}
                          <span className={`flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded ${levelConfig.bg} ${levelConfig.color}`}>
                            <span className={`w-1 h-1 rounded-full ${levelConfig.dot}`}></span>
                            {levelConfig.label}
                          </span>
                          {/* 新标记 */}
                          {signal.isNew && (
                            <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium rounded bg-red-100 text-red-600">
                              <Zap className="w-2.5 h-2.5" />
                              NEW
                            </span>
                          )}
                          {/* 实体标签 */}
                          <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                            {signal.entity}
                          </span>
                        </div>

                        {/* 标题 */}
                        <h3 className="text-sm font-medium text-gray-800 mb-1 line-clamp-2">
                          {signal.title}
                        </h3>

                        {/* 摘要 */}
                        <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                          {signal.summary}
                        </p>

                        {/* 底部信息 */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-[10px] text-gray-400">
                            <Clock className="w-3 h-3" />
                            <span>{signal.time}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-300" />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 底部操作 */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
          <button className="w-full py-2 text-xs font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors cursor-pointer">
            查看全部历史信号 →
          </button>
        </div>

        {/* 信号详情弹窗 */}
        {selectedSignal && (
          <div className="absolute inset-0 bg-white flex flex-col animate-slide-in-right">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
              <button 
                onClick={() => setSelectedSignal(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                <ChevronRight className="w-5 h-5 text-gray-400 rotate-180" />
              </button>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-800">信号详情</h3>
              </div>
              <button 
                onClick={() => {
                  setSelectedSignal(null)
                  onClose()
                }}
                className="p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {/* 信号类型和强度 */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg ${SIGNAL_TYPES[selectedSignal.type].bg} ${SIGNAL_TYPES[selectedSignal.type].color}`}>
                  {(() => { const Icon = SIGNAL_TYPES[selectedSignal.type].icon; return <Icon className="w-3.5 h-3.5" /> })()}
                  {SIGNAL_TYPES[selectedSignal.type].label}
                </span>
                <span className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${SIGNAL_LEVELS[selectedSignal.level].bg} ${SIGNAL_LEVELS[selectedSignal.level].color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${SIGNAL_LEVELS[selectedSignal.level].dot}`}></span>
                  {SIGNAL_LEVELS[selectedSignal.level].label}信号
                </span>
              </div>

              {/* 标题 */}
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                {selectedSignal.title}
              </h2>

              {/* 关联实体 */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-gray-500">关联实体：</span>
                <button 
                  onClick={() => {
                    onSignalClick?.(selectedSignal)
                    setSelectedSignal(null)
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-primary bg-primary/5 hover:bg-primary/10 rounded-lg cursor-pointer transition-colors"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  {selectedSignal.entity}
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {/* 摘要 */}
              <div className="mb-6">
                <h4 className="text-xs font-medium text-gray-500 mb-2">信号摘要</h4>
                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-4">
                  {selectedSignal.summary}
                </p>
              </div>

              {/* AI 解读 */}
              <div className="mb-6">
                <h4 className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  AI 投资视角解读
                </h4>
                <div className="text-sm text-gray-700 leading-relaxed bg-amber-50 rounded-lg p-4 border border-amber-100">
                  {selectedSignal.type === 'funding' && (
                    <p>该融资事件表明市场对量子计算赛道的持续看好。估值水平反映了硬科技领域的定价逻辑正在转变，建议关注后续IPO进程及产业化落地情况。</p>
                  )}
                  {selectedSignal.type === 'people' && (
                    <p>核心人才的创业动向是赛道成熟度的重要信号。该创始人具备大厂工程化经验，团队执行力值得关注。建议跟踪其技术路线选择和商业化策略。</p>
                  )}
                  {selectedSignal.type === 'tech' && (
                    <p>技术突破标志着量子计算正在从实验室走向工程化。纠错能力的提升是实现实用化量子计算的关键里程碑，将重塑行业竞争格局。</p>
                  )}
                  {selectedSignal.type === 'business' && (
                    <p>IPO进程加速表明一级市场退出通道正在打通。建议关注其收入结构、客户质量和技术壁垒，评估二级市场估值合理性。</p>
                  )}
                  {selectedSignal.type === 'news' && (
                    <p>政策层面的定调信号表明量子科技已上升为国家战略。建议关注后续配套政策和产业基金动向，把握政策红利窗口期。</p>
                  )}
                </div>
              </div>

              {/* 时间信息 */}
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{selectedSignal.time}</span>
              </div>
            </div>

            {/* 底部操作 */}
            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button 
                onClick={() => {
                  onSignalClick?.(selectedSignal)
                  setSelectedSignal(null)
                }}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors cursor-pointer"
              >
                查看关联实体
              </button>
              <button className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                加入跟踪
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 信号类型选择器组件（用于其他地方）
export function SignalTypeSelector({ selected, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(SIGNAL_TYPES).map(([key, config]) => {
        const Icon = config.icon
        const isSelected = selected.includes(key)
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              isSelected 
                ? `${config.bg} ${config.color} ${config.border}` 
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{config.label}</span>
          </button>
        )
      })}
    </div>
  )
}

// 信号强度指示器
export function SignalLevelIndicator({ level }) {
  const config = SIGNAL_LEVELS[level] || SIGNAL_LEVELS.low
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded ${config.bg} ${config.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      {config.label}
    </span>
  )
}

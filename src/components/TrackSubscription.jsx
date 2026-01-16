import { useState } from 'react'
import { Star, Bell, BellOff, Settings, ChevronDown, ChevronUp, Check, Plus } from 'lucide-react'

// 赛道订阅配置
const TRACK_CATEGORIES = [
  { id: 'quantum', name: '量子信息', subscribed: true, alertLevel: 'all' },
  { id: 'ai', name: '人工智能', subscribed: false, alertLevel: 'high' },
  { id: 'embodied', name: '具身智能', subscribed: true, alertLevel: 'critical' },
  { id: 'semiconductor', name: '半导体', subscribed: false, alertLevel: 'all' },
  { id: 'aerospace', name: '商业航空', subscribed: false, alertLevel: 'high' },
  { id: 'lowalt', name: '低空经济', subscribed: false, alertLevel: 'high' },
  { id: 'biotech', name: '生物医药', subscribed: false, alertLevel: 'critical' },
  { id: 'newenergy', name: '新能源', subscribed: false, alertLevel: 'all' },
  { id: 'newmaterial', name: '新材料', subscribed: false, alertLevel: 'high' },
  { id: 'bci', name: '脑机接口', subscribed: false, alertLevel: 'critical' },
]

const ALERT_LEVELS = [
  { id: 'all', label: '全部推送', desc: '接收所有信号' },
  { id: 'high', label: '重要以上', desc: '仅重要和重大信号' },
  { id: 'critical', label: '仅重大', desc: '仅重大信号' },
  { id: 'off', label: '关闭推送', desc: '不接收推送' },
]

export default function TrackSubscription({ isOpen, onClose }) {
  const [tracks, setTracks] = useState(TRACK_CATEGORIES)
  const [expandedTrack, setExpandedTrack] = useState(null)

  const toggleSubscription = (trackId) => {
    setTracks(prev => prev.map(t => 
      t.id === trackId ? { ...t, subscribed: !t.subscribed } : t
    ))
  }

  const setAlertLevel = (trackId, level) => {
    setTracks(prev => prev.map(t => 
      t.id === trackId ? { ...t, alertLevel: level } : t
    ))
  }

  const subscribedCount = tracks.filter(t => t.subscribed).length

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      
      <div className="relative w-[500px] max-h-[80vh] bg-white rounded-xl shadow-xl flex flex-col">
        {/* 头部 */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">赛道订阅管理</h2>
            <p className="text-xs text-gray-500 mt-0.5">已订阅 {subscribedCount} 个赛道</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
            <span className="text-gray-400 text-xl">×</span>
          </button>
        </div>

        {/* 赛道列表 */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {tracks.map(track => (
              <div 
                key={track.id}
                className={`rounded-lg border transition-colors ${
                  track.subscribed ? 'border-primary/30 bg-primary/5' : 'border-gray-200 bg-white'
                }`}
              >
                {/* 主行 */}
                <div className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleSubscription(track.id)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                        track.subscribed 
                          ? 'bg-primary text-white' 
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {track.subscribed ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </button>
                    <div>
                      <span className={`font-medium ${track.subscribed ? 'text-gray-800' : 'text-gray-600'}`}>
                        {track.name}
                      </span>
                      {track.subscribed && (
                        <span className="ml-2 text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                          已订阅
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {track.subscribed && (
                      <>
                        <span className="text-xs text-gray-500">
                          {ALERT_LEVELS.find(l => l.id === track.alertLevel)?.label}
                        </span>
                        <button
                          onClick={() => setExpandedTrack(expandedTrack === track.id ? null : track.id)}
                          className="p-1.5 hover:bg-white/50 rounded cursor-pointer"
                        >
                          {expandedTrack === track.id ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* 展开的设置 */}
                {expandedTrack === track.id && track.subscribed && (
                  <div className="px-4 pb-4 pt-2 border-t border-gray-100/50">
                    <p className="text-xs text-gray-500 mb-2">推送设置</p>
                    <div className="grid grid-cols-2 gap-2">
                      {ALERT_LEVELS.map(level => (
                        <button
                          key={level.id}
                          onClick={() => setAlertLevel(track.id, level.id)}
                          className={`px-3 py-2 text-left rounded-lg border transition-colors cursor-pointer ${
                            track.alertLevel === level.id
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-gray-200 hover:border-gray-300 text-gray-600'
                          }`}
                        >
                          <div className="text-xs font-medium">{level.label}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{level.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 底部 */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              订阅后将自动接收该赛道的重要信号推送
            </p>
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
            >
              完成
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// 快速订阅按钮组件
export function QuickSubscribeButton({ trackName, isSubscribed, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full transition-colors cursor-pointer ${
        isSubscribed
          ? 'bg-primary/10 text-primary border border-primary/20'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {isSubscribed ? (
        <>
          <Bell className="w-3 h-3" />
          <span>已订阅</span>
        </>
      ) : (
        <>
          <BellOff className="w-3 h-3" />
          <span>订阅</span>
        </>
      )}
    </button>
  )
}

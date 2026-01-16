import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Building2, User, Cpu, Newspaper, GraduationCap, Briefcase, X, Minus, Plus, RefreshCw } from 'lucide-react'

// 自定义节点组件
const EntityNode = ({ data, selected }) => {
  const getIcon = () => {
    switch (data.type) {
      case 'company': return <Building2 className="w-4 h-4" />
      case 'person': return <User className="w-4 h-4" />
      case 'technology': return <Cpu className="w-4 h-4" />
      case 'news': return <Newspaper className="w-4 h-4" />
      case 'education': return <GraduationCap className="w-4 h-4" />
      case 'subdivision': return <Briefcase className="w-4 h-4" />
      default: return <Cpu className="w-4 h-4" />
    }
  }

  const getStyle = () => {
    const base = 'px-3 py-2 rounded-lg border-2 shadow-sm transition-all cursor-pointer min-w-[100px] max-w-[160px]'
    const styles = {
      company: `${base} bg-blue-50 border-blue-200 ${selected ? 'border-blue-500 shadow-blue-200' : 'hover:border-blue-300'} ${data.isExpanded ? 'ring-2 ring-blue-300 ring-offset-1' : ''}`,
      person: `${base} bg-purple-50 border-purple-200 ${selected ? 'border-purple-500 shadow-purple-200' : 'hover:border-purple-300'} ${data.isExpanded ? 'ring-2 ring-purple-300 ring-offset-1' : ''}`,
      technology: `${base} bg-orange-50 border-orange-200 ${selected ? 'border-orange-500 shadow-orange-200' : 'hover:border-orange-300'} ${data.isExpanded ? 'ring-2 ring-orange-300 ring-offset-1' : ''}`,
      news: `${base} bg-green-50 border-green-200 ${selected ? 'border-green-500 shadow-green-200' : 'hover:border-green-300'} ${data.isExpanded ? 'ring-2 ring-green-300 ring-offset-1' : ''}`,
      education: `${base} bg-pink-50 border-pink-200 ${selected ? 'border-pink-500 shadow-pink-200' : 'hover:border-pink-300'} ${data.isExpanded ? 'ring-2 ring-pink-300 ring-offset-1' : ''}`,
      subdivision: `${base} bg-teal-50 border-teal-200 ${selected ? 'border-teal-500 shadow-teal-200' : 'hover:border-teal-300'} ${data.isExpanded ? 'ring-2 ring-teal-300 ring-offset-1' : ''}`,
    }
    return styles[data.type] || styles.technology
  }

  const getIconColor = () => {
    const colors = {
      company: 'text-blue-600',
      person: 'text-purple-600',
      technology: 'text-orange-600',
      news: 'text-green-600',
      education: 'text-pink-600',
      subdivision: 'text-teal-600',
    }
    return colors[data.type] || 'text-gray-600'
  }

  return (
    <div className={getStyle()}>
      <Handle type="target" position={Position.Top} className="!bg-gray-400 !w-2 !h-2" />
      <Handle type="source" position={Position.Bottom} className="!bg-gray-400 !w-2 !h-2" />
      <Handle type="target" position={Position.Left} className="!bg-gray-400 !w-2 !h-2" />
      <Handle type="source" position={Position.Right} className="!bg-gray-400 !w-2 !h-2" />
      
      <div className="flex items-center gap-2">
        <div className={`flex-shrink-0 ${getIconColor()}`}>
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-800 truncate">{data.label}</p>
          {data.subtitle && (
            <p className="text-[10px] text-gray-500 truncate">{data.subtitle}</p>
          )}
        </div>
        {data.hasChildren && (
          <div className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${data.isExpanded ? 'bg-gray-200' : 'bg-primary/10'}`}>
            {data.isExpanded ? (
              <Minus className="w-2.5 h-2.5 text-gray-600" />
            ) : (
              <Plus className="w-2.5 h-2.5 text-primary" />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const nodeTypes = { entity: EntityNode }

// 树状布局计算器
class TreeLayout {
  constructor() {
    this.nodeWidth = 160
    this.nodeHeight = 50
    this.horizontalSpacing = 40
    this.verticalSpacing = 80
    this.centerX = 500
    this.centerY = 100
  }

  // 计算子树宽度
  calculateSubtreeWidth(nodeId, nodes, edges, expandedNodes) {
    const children = edges
      .filter(e => e.source === nodeId)
      .map(e => nodes.find(n => n.id === e.target))
      .filter(Boolean)

    if (children.length === 0 || !expandedNodes.has(nodeId)) {
      return this.nodeWidth
    }

    let totalWidth = 0
    children.forEach((child, idx) => {
      totalWidth += this.calculateSubtreeWidth(child.id, nodes, edges, expandedNodes)
      if (idx < children.length - 1) {
        totalWidth += this.horizontalSpacing
      }
    })

    return Math.max(this.nodeWidth, totalWidth)
  }

  // 递归布局节点
  layoutNode(nodeId, nodes, edges, expandedNodes, x, y, positions) {
    positions[nodeId] = { x, y }

    const children = edges
      .filter(e => e.source === nodeId)
      .map(e => nodes.find(n => n.id === e.target))
      .filter(Boolean)

    if (children.length === 0 || !expandedNodes.has(nodeId)) {
      return
    }

    // 计算所有子节点的总宽度
    const childWidths = children.map(child => 
      this.calculateSubtreeWidth(child.id, nodes, edges, expandedNodes)
    )
    const totalWidth = childWidths.reduce((sum, w, idx) => 
      sum + w + (idx > 0 ? this.horizontalSpacing : 0), 0
    )

    // 从左到右布局子节点
    let currentX = x - totalWidth / 2
    const childY = y + this.verticalSpacing + this.nodeHeight

    children.forEach((child, idx) => {
      const childWidth = childWidths[idx]
      const childX = currentX + childWidth / 2
      this.layoutNode(child.id, nodes, edges, expandedNodes, childX, childY, positions)
      currentX += childWidth + this.horizontalSpacing
    })
  }

  // 执行布局
  layout(nodes, edges, expandedNodes, rootId = 'center') {
    const positions = {}
    
    // 找到根节点
    const rootNode = nodes.find(n => n.id === rootId)
    if (!rootNode) return nodes

    // 从根节点开始布局
    this.layoutNode(rootId, nodes, edges, expandedNodes, this.centerX, this.centerY, positions)

    // 应用位置
    return nodes.map(node => ({
      ...node,
      position: positions[node.id] || node.position
    }))
  }
}


export default function KnowledgeGraph({ 
  companies, 
  people, 
  news, 
  technologies,
  onEntityClick,
  selectedEntity 
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [expandedNodes, setExpandedNodes] = useState(new Set())
  const [detailPanel, setDetailPanel] = useState(null)
  const treeLayout = useRef(new TreeLayout())

  // 构建实体关系映射
  const relationshipMap = useMemo(() => {
    const map = {
      companyToPeople: {},
      personToCompanies: {},
      newsToEntities: {},
      techToCompanies: {},
    }

    companies.forEach(company => {
      map.companyToPeople[company.id] = people.filter(p => 
        p.companies?.some(c => c.includes(company.name) || company.name.includes(c))
      )
    })

    people.forEach(person => {
      map.personToCompanies[person.id] = companies.filter(c =>
        person.companies?.some(pc => pc.includes(c.name) || c.name.includes(pc))
      )
    })

    news.forEach(n => {
      map.newsToEntities[n.id] = {
        companies: companies.filter(c => 
          n.entities?.includes(c.name) || n.title?.includes(c.name) || n.summary?.includes(c.name)
        ),
        people: people.filter(p => 
          n.entities?.includes(p.name) || n.title?.includes(p.name) || n.summary?.includes(p.name)
        ),
        technologies: technologies.filter(t =>
          n.tags?.some(tag => t.name.includes(tag) || tag.includes(t.name)) || n.title?.includes(t.name)
        )
      }
    })

    technologies.forEach(tech => {
      map.techToCompanies[tech.id] = companies.filter(c =>
        tech.keyPlayers?.some(kp => c.name.includes(kp) || kp.includes(c.name)) || c.techRoute?.includes(tech.name)
      )
    })

    return map
  }, [companies, people, news, technologies])

  // 应用树状布局
  const applyTreeLayout = useCallback((currentNodes, currentEdges, currentExpanded) => {
    return treeLayout.current.layout(currentNodes, currentEdges, currentExpanded)
  }, [])

  // 获取节点的子节点数据
  const getChildrenData = useCallback((nodeData) => {
    const children = { nodes: [] }
    const nodeId = nodeData.id
    const entityType = nodeData.entityType
    const entityData = nodeData.entityData

    if (entityType === 'subdivision') {
      const subName = entityData?.name || nodeData.label
      const subCompanies = companies.filter(c => c.subdivision?.includes(subName)).slice(0, 6)
      const subTechs = technologies.filter(t => 
        t.subdivision?.includes(subName) || t.category === subName
      ).slice(0, 3)

      subCompanies.forEach(company => {
        const relatedPeople = relationshipMap.companyToPeople[company.id] || []
        children.nodes.push({
          id: company.id,
          type: 'company',
          label: company.name,
          subtitle: company.techRoute,
          entityData: company,
          hasChildren: relatedPeople.length > 0,
          parentId: nodeId
        })
      })

      subTechs.forEach(tech => {
        const relatedCompanies = relationshipMap.techToCompanies[tech.id] || []
        children.nodes.push({
          id: tech.id,
          type: 'technology',
          label: tech.name,
          subtitle: tech.category,
          entityData: tech,
          hasChildren: relatedCompanies.length > 0,
          parentId: nodeId
        })
      })
    } else if (entityType === 'company') {
      const company = entityData
      const relatedPeople = (relationshipMap.companyToPeople[company.id] || []).slice(0, 5)
      const relatedNews = news.filter(n => 
        n.entities?.includes(company.name) || n.title?.includes(company.name)
      ).slice(0, 2)

      relatedPeople.forEach(person => {
        children.nodes.push({
          id: person.id,
          type: 'person',
          label: person.name,
          subtitle: person.role,
          entityData: person,
          hasChildren: !!person.education,
          parentId: nodeId
        })
      })

      relatedNews.forEach(n => {
        children.nodes.push({
          id: n.id,
          type: 'news',
          label: n.title?.slice(0, 15) + '...',
          subtitle: n.source,
          entityData: n,
          hasChildren: false,
          parentId: nodeId
        })
      })
    } else if (entityType === 'person') {
      const person = entityData
      if (person.education) {
        children.nodes.push({
          id: `edu-${person.id}`,
          type: 'education',
          label: person.education,
          subtitle: '学历背景',
          entityData: { education: person.education },
          hasChildren: false,
          parentId: nodeId
        })
      }
    } else if (entityType === 'technology') {
      const tech = entityData
      const relatedCompanies = (relationshipMap.techToCompanies[tech.id] || []).slice(0, 4)
      relatedCompanies.forEach(company => {
        children.nodes.push({
          id: `${tech.id}-${company.id}`,
          type: 'company',
          label: company.name,
          subtitle: company.techRoute,
          entityData: company,
          hasChildren: false,
          parentId: nodeId
        })
      })
    }

    return children
  }, [companies, people, news, technologies, relationshipMap])

  // 处理节点点击
  const handleNodeClick = useCallback((event, node) => {
    const nodeData = node.data
    
    if (nodeData.entityData) {
      setDetailPanel({
        type: nodeData.type,
        data: nodeData.entityData
      })
      onEntityClick?.(nodeData.entityData)
    }

    if (!nodeData.hasChildren) return

    const nodeId = node.id
    const isExpanded = expandedNodes.has(nodeId)

    if (isExpanded) {
      // 折叠
      const nodesToRemove = new Set()
      const findDescendants = (parentId, nodeList) => {
        nodeList.forEach(n => {
          if (n.data.parentId === parentId) {
            nodesToRemove.add(n.id)
            findDescendants(n.id, nodeList)
          }
        })
      }
      findDescendants(nodeId, nodes)

      const newExpanded = new Set(expandedNodes)
      newExpanded.delete(nodeId)
      nodesToRemove.forEach(id => newExpanded.delete(id))

      const newNodes = nodes
        .map(n => n.id === nodeId ? { ...n, data: { ...n.data, isExpanded: false } } : n)
        .filter(n => !nodesToRemove.has(n.id))

      const newEdges = edges.filter(e => 
        !nodesToRemove.has(e.source) && !nodesToRemove.has(e.target)
      )

      const layoutedNodes = applyTreeLayout(newNodes, newEdges, newExpanded)
      setNodes(layoutedNodes)
      setEdges(newEdges)
      setExpandedNodes(newExpanded)
    } else {
      // 展开
      const childrenData = getChildrenData({ 
        id: nodeId, 
        entityType: nodeData.entityType || nodeData.type,
        entityData: nodeData.entityData,
        label: nodeData.label
      })

      if (childrenData.nodes.length === 0) return

      const newChildNodes = childrenData.nodes.map((child) => ({
        id: child.id,
        type: 'entity',
        position: { x: 0, y: 0 }, // 临时位置，布局会重新计算
        data: {
          ...child,
          entityType: child.type,
          isExpanded: false,
          depth: (nodeData.depth || 0) + 1
        }
      }))

      const newChildEdges = childrenData.nodes.map(child => ({
        id: `${nodeId}-to-${child.id}`,
        source: nodeId,
        target: child.id,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#94a3b8', strokeWidth: 1.5 }
      }))

      const updatedNodes = nodes.map(n => 
        n.id === nodeId ? { ...n, data: { ...n.data, isExpanded: true } } : n
      )

      const newExpanded = new Set([...expandedNodes, nodeId])
      const allNodes = [...updatedNodes, ...newChildNodes]
      const allEdges = [...edges, ...newChildEdges]

      const layoutedNodes = applyTreeLayout(allNodes, allEdges, newExpanded)
      
      setNodes(layoutedNodes)
      setEdges(allEdges)
      setExpandedNodes(newExpanded)
    }
  }, [nodes, edges, expandedNodes, getChildrenData, applyTreeLayout, onEntityClick])

  // 重新布局
  const handleRelayout = useCallback(() => {
    const layoutedNodes = applyTreeLayout(nodes, edges, expandedNodes)
    setNodes(layoutedNodes)
  }, [nodes, edges, expandedNodes, applyTreeLayout])


  // 初始化图谱
  useEffect(() => {
    const subdivisions = ['量子硬件', '量子软件', '量子通信', '量子传感', '量子纠错']

    const initialNodes = [
      {
        id: 'center',
        type: 'entity',
        position: { x: 0, y: 0 },
        data: { 
          label: '量子计算', 
          subtitle: '点击展开探索',
          type: 'subdivision',
          entityType: 'root',
          hasChildren: true,
          isExpanded: true,
          depth: 0
        }
      },
      ...subdivisions.map((sub) => ({
        id: `sub-${sub}`,
        type: 'entity',
        position: { x: 0, y: 0 },
        data: { 
          label: sub, 
          type: 'subdivision',
          entityType: 'subdivision',
          entityData: { name: sub },
          hasChildren: true,
          isExpanded: false,
          depth: 1,
          parentId: 'center'
        }
      }))
    ]

    const initialEdges = subdivisions.map(sub => ({
      id: `center-to-sub-${sub}`,
      source: 'center',
      target: `sub-${sub}`,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#94a3b8', strokeWidth: 1.5 }
    }))

    const initialExpanded = new Set(['center'])
    const layoutedNodes = treeLayout.current.layout(initialNodes, initialEdges, initialExpanded)
    
    setNodes(layoutedNodes)
    setEdges(initialEdges)
    setExpandedNodes(initialExpanded)
  }, [])

  const closeDetailPanel = () => {
    setDetailPanel(null)
    onEntityClick?.(null)
  }

  // 渲染详情面板
  const renderDetailPanel = () => {
    if (!detailPanel) return null
    const { type, data } = detailPanel

    return (
      <div className="absolute top-4 right-4 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-10 max-h-[calc(100%-2rem)] overflow-auto">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
          <h3 className="font-semibold text-gray-800 text-sm">{data.name || data.title || data.label}</h3>
          <button onClick={closeDetailPanel} className="p-1 hover:bg-gray-100 rounded cursor-pointer">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="p-4 space-y-3 text-xs">
          {type === 'company' && (
            <>
              {data.techRoute && <div><span className="text-gray-500">技术路线：</span><span className="text-gray-800 ml-1">{data.techRoute}</span></div>}
              {data.location && <div><span className="text-gray-500">地点：</span><span className="text-gray-800 ml-1">{data.location}</span></div>}
              {data.stage && <div><span className="text-gray-500">阶段：</span><span className="text-gray-800 ml-1">{data.stage}</span></div>}
              {data.valuation && <div><span className="text-gray-500">估值：</span><span className="text-gray-800 ml-1">{data.valuation}</span></div>}
              {data.description && <div><span className="text-gray-500">简介：</span><p className="text-gray-700 mt-1 leading-relaxed">{data.description}</p></div>}
              {data.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {data.tags.map((tag, i) => (
                    <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px]">{tag}</span>
                  ))}
                </div>
              )}
            </>
          )}
          {type === 'person' && (
            <>
              {data.role && <div><span className="text-gray-500">职位：</span><span className="text-gray-800 ml-1">{data.role}</span></div>}
              {data.education && <div><span className="text-gray-500">学历：</span><span className="text-gray-800 ml-1">{data.education}</span></div>}
              {data.researchGroup && <div><span className="text-gray-500">研究团队：</span><span className="text-gray-800 ml-1">{data.researchGroup}</span></div>}
              {data.companies?.length > 0 && <div><span className="text-gray-500">关联机构：</span><span className="text-gray-800 ml-1">{data.companies.join('、')}</span></div>}
              {data.background && <div><span className="text-gray-500">背景：</span><p className="text-gray-700 mt-1 leading-relaxed">{data.background}</p></div>}
              {data.achievements?.length > 0 && (
                <div>
                  <span className="text-gray-500">成就：</span>
                  <ul className="mt-1 space-y-1">{data.achievements.map((a, i) => <li key={i} className="text-gray-700">• {a}</li>)}</ul>
                </div>
              )}
            </>
          )}
          {type === 'news' && (
            <>
              {data.source && <div><span className="text-gray-500">来源：</span><span className="text-gray-800 ml-1">{data.source}</span></div>}
              {data.date && <div><span className="text-gray-500">日期：</span><span className="text-gray-800 ml-1">{data.date}</span></div>}
              {data.title && <div><span className="text-gray-500">标题：</span><p className="text-gray-800 mt-1">{data.title}</p></div>}
              {data.summary && <div><span className="text-gray-500">摘要：</span><p className="text-gray-700 mt-1 leading-relaxed">{data.summary}</p></div>}
            </>
          )}
          {type === 'technology' && (
            <>
              {data.category && <div><span className="text-gray-500">类别：</span><span className="text-gray-800 ml-1">{data.category}</span></div>}
              {data.description && <div><span className="text-gray-500">描述：</span><p className="text-gray-700 mt-1 leading-relaxed">{data.description}</p></div>}
            </>
          )}
          {type === 'education' && <div><span className="text-gray-500">学历信息：</span><span className="text-gray-800 ml-1">{data.education}</span></div>}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.1}
        maxZoom={2}
        nodesDraggable={true}
        nodesConnectable={false}
      >
        <Background color="#e2e8f0" gap={20} />
        <Controls showInteractive={false} />
      </ReactFlow>
      {renderDetailPanel()}
      
      <div className="absolute top-4 left-4 flex gap-2">
        <button
          onClick={handleRelayout}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>整理布局</span>
        </button>
      </div>
      
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-lg p-3 shadow-sm border border-gray-100">
        <p className="text-[10px] text-gray-500 mb-2">图例</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-teal-100 border border-teal-300"></div><span className="text-gray-600">细分领域</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-blue-100 border border-blue-300"></div><span className="text-gray-600">公司/机构</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-purple-100 border border-purple-300"></div><span className="text-gray-600">人物</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-orange-100 border border-orange-300"></div><span className="text-gray-600">技术</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-green-100 border border-green-300"></div><span className="text-gray-600">新闻</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-pink-100 border border-pink-300"></div><span className="text-gray-600">学历</span></div>
        </div>
        <p className="text-[10px] text-gray-400 mt-2 border-t border-gray-100 pt-2">点击展开/折叠 · 拖拽调整 · 滚轮缩放</p>
      </div>
    </div>
  )
}

# 量子计算赛道认知系统 MVP

## 项目简介

这是一个专注于**精准赛道认知建模和投资信号捕捉**的系统，而非简单的信息聚合网页。

### 核心理念
- **精准建模** > 信息聚合
- **顺藤摸瓜式探索** > 线性浏览
- **投资信号捕捉** > 新闻阅读

### 三大核心模块

1. **赛道认知模块**（左侧）
   - No bias的赛道介绍
   - 细分领域树状结构
   - 市场规模与关键趋势

2. **实体网络模块**（中间）
   - 公司、人物、技术的关系图谱
   - 可交互探索
   - 支持标签筛选

3. **信号捕捉模块**（右侧）
   - 按标签筛选的新闻流
   - AI解读（投资/产业视角）
   - 信号类型标注（利好/利空/中性）

## 技术栈

- **框架**: React 18 + Vite
- **样式**: Tailwind CSS
- **图标**: Lucide React
- **字体**: Poppins (标题) + Open Sans (正文)
- **配色**: 4色方案（蓝色主题 + 浅色调）

## 快速开始

### 1. 安装依赖

```bash
cd quantum-track-mvp
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 3. 构建生产版本

```bash
npm run build
```

## 数据说明

所有数据位于 `src/data/` 目录：

- `track-overview.json` - 赛道概览数据
- `entities.json` - 实体数据（公司、人物、技术）
- `quantum-news-full.json` - **新闻数据（48条，已集成）**
- `quantum-companies-full.json` - 公司数据（待补充）
- `quantum-people-full.json` - 人物数据（待补充）

### 数据状态
- ✅ **新闻数据**: 48条量子计算相关新闻，包含AI投资视角解读
- ⏳ **公司数据**: 需要15-20家公司信息
- ⏳ **人物数据**: 需要10-15位关键人物信息

数据来源：
- 基于真实的量子计算行业信息
- AI生成的投资视角解读
- 静态数据（MVP阶段）

## 设计特点

### UI/UX
- **Minimalism + Swiss Style**：简洁、专业、网格布局
- **4色配色方案**：
  - Primary: #3B82F6（蓝色 - 信任感）
  - Background: #F8FAFC（浅灰 - 干净）
  - Text: #1E293B（深灰 - 可读性）
  - Border: #E2E8F0（边框 - 分隔）

### 交互设计
- **顺藤摸瓜**：点击实体 → 查看相关新闻 → 点击标签 → 筛选内容
- **信号捕捉**：每条新闻标注信号类型和重要度
- **AI辅助**：投资视角的AI解读，帮助快速理解信息价值

## 项目结构

```
quantum-track-mvp/
├── src/
│   ├── components/
│   │   ├── TrackOverview.jsx    # 赛道认知模块
│   │   ├── EntityNetwork.jsx    # 实体网络模块
│   │   └── NewsStream.jsx       # 信号捕捉模块
│   ├── data/
│   │   ├── track-overview.json  # 赛道数据
│   │   ├── entities.json        # 实体数据
│   │   └── news.json            # 新闻数据
│   ├── App.jsx                  # 主应用
│   ├── main.jsx                 # 入口文件
│   └── index.css                # 全局样式
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 功能特性

### 已实现
- ✅ 赛道细分领域展示
- ✅ 公司/人物/技术实体管理
- ✅ 新闻流展示与筛选
- ✅ AI解读（投资视角）
- ✅ 标签筛选联动
- ✅ 实体关联展示
- ✅ 信号类型标注

### 未来扩展
- [ ] 知识图谱可视化（力导向图）
- [ ] 实时数据爬取
- [ ] 用户笔记功能
- [ ] 赛道对比分析
- [ ] 投资决策辅助

## 开发说明

### 添加新赛道
1. 在 `src/data/` 创建新的JSON文件
2. 按照现有格式填充数据
3. 在 `App.jsx` 中添加赛道切换逻辑

### 添加新实体
在 `entities.json` 的对应数组中添加新对象：
- `companies` - 公司
- `people` - 人物
- `technologies` - 技术

### 添加新闻
在 `news.json` 的 `news` 数组中添加新对象，确保包含：
- 基本信息（标题、日期、来源）
- 分类标签
- 内容概要
- AI解读

## License

MIT

export const profile = {
  nameZh: '蔡辰玮',
  nameEn: 'CAI CHENWEI',
  mark: 'CCW',
  role: 'ELECTRONIC SCIENCE STUDENT / AI AGENT BUILDER',
  location: 'Nanjing, China',
  email: '3087291376@qq.com',
  phone: '18852048007',
  qq: '3087291376',
  github: {
    username: 'withlovehub',
    url: 'https://github.com/withlovehub',
    avatar: 'https://avatars.githubusercontent.com/u/301390906?v=4',
    publicRepos: 3,
    totalStars: 3,
    joined: '2026.07',
  },
  school: '金陵科技学院',
  major: '电子科学与技术 · 本科在读',
  language: 'CET-4 · 524',
  status: 'OPEN TO LEARNING & COLLABORATION',
  intro:
    '金陵科技学院电子科学与技术专业本科生，现任班长。我关注 AI Agent 在学习与开发中的实际应用，熟练使用 Claude Code、Codex 与 OpenAI 工具链推进需求拆解、代码实现和迭代验证；以 C、C++、Python 为主要开发语言，正在学习 Java，并使用 LangChain 进行 AI 应用编排。',
  quote: '把问题想清楚，把细节做扎实，让每一次执行都有可靠的结果。',
}

export const metrics = [
  { value: '200+', category: '教学实践', label: '作业与阶段测试批改' },
  { value: '95%+', category: '教学实践', label: '学生作业订正率' },
  { value: '100+', category: '校园管理', label: '班级事务处理' },
]

export const experiences = [
  {
    period: '2025.09 — NOW',
    title: '班长 / 金陵科技学院',
    meta: 'LEADERSHIP & COORDINATION · CAMPUS',
    text: '统筹 30+ 人班级日常管理，承担师生对接、数据统计与通知传达，累计处理事务 100+ 项；综合测评位列班级前 10。',
  },
  {
    period: '2026.06 — 2026.07',
    title: '暑期助教 / 北京高斯学习成长中心',
    meta: 'EDUCATION OPERATIONS · NANJING',
    text: '负责 20+ 人课堂教务、学生考勤与秩序维护，独立批改作业和阶段测试 200+ 份，并以错题台账和学情报告持续跟进学习效果。',
  },
  {
    period: '2025.07 — 2025.08',
    title: '学科辅导 / 社区私人家教',
    meta: 'ONE-ON-ONE TUTORING · NANJING',
    text: '为 3 名中小学生定制一对一辅导方案，根据阶段测试动态调整训练重点，辅导后学生单科平均提升 10–15 分。',
  },
]

export const projects = [
  {
    index: '01',
    title: '学习成长追踪',
    en: 'LEARNING PROGRESS SYSTEM',
    category: 'EDUCATION OPS / 2026',
    description: '通过错题台账、阶段测评与标准化学情报告，让学习问题和改进路径清晰可见。',
    image: '/assets/learning-progress-v2.png',
    imageAlt: '半透明评估档案与荧光进度曲线构成的学习成长追踪视觉',
    accent: '#67e7ff',
  },
  {
    index: '02',
    title: 'AI 教务工作流',
    en: 'AI-ASSISTED WORKFLOW',
    category: 'AI WORKFLOW / 2026',
    description: '使用 AI 辅助整理教案、生成练习题与统计成绩，减少重复工作，把时间留给真正重要的沟通。',
    image: '/assets/ai-workflow-v2.png',
    imageAlt: '纸质教案经过橙色计算节点转化为结构化数据模块的 AI 工作流视觉',
    accent: '#ff6859',
  },
  {
    index: '03',
    title: '开源技术实践',
    en: 'OPEN-SOURCE LAB',
    category: 'GITHUB / ONGOING',
    description: '持续公开维护 3 个 GitHub 项目，从效率工具、数据聚合到视觉创作，在真实迭代中训练工程思维。',
    image: '/assets/open-source-lab-v2.png',
    imageAlt: '精密电路板、探针与蓝色协作网络构成的开源电子实践视觉',
    accent: '#91d6e2',
    href: 'https://github.com/withlovehub',
  },
]

export const githubRepositories = [
  {
    index: 'GH.01',
    name: 'clipboard-keeper',
    title: 'Clipboard Keeper',
    description: '隐私优先的剪贴板历史工具，以本地 SQLite 保存数据，通过 SSE 实时同步，并自动识别文本、图片、链接与代码。',
    url: 'https://github.com/withlovehub/clipboard-keeper',
    language: 'Python',
    stars: 1,
    forks: 0,
    license: 'MIT',
    updated: '2026.07',
    tags: ['SQLITE', 'SSE', 'LOCAL FIRST'],
    accent: '#67e7ff',
  },
  {
    index: 'GH.02',
    name: 'music-chart-aggregator-',
    title: 'Music Chart Aggregator',
    description: '面向全球音乐榜单的自动化聚合器，每月追踪 8 大平台热门歌曲，形成跨平台综合排名与专业乐评。',
    url: 'https://github.com/withlovehub/music-chart-aggregator-',
    language: 'Python',
    stars: 1,
    forks: 0,
    license: 'MIT-0',
    updated: '2026.07',
    tags: ['AUTOMATION', 'DATA', 'MUSIC'],
    accent: '#ff6859',
  },
  {
    index: 'GH.03',
    name: 'feibi-jiubi-codex-pet',
    title: 'Feibi Jiubi Codex Pet',
    description: '为 Codex 制作的菲比啾比像素风桌面宠物，包含角色精灵图、方向对照与完整的视觉 QA 结果。',
    url: 'https://github.com/withlovehub/feibi-jiubi-codex-pet',
    language: 'Assets',
    stars: 1,
    forks: 0,
    license: '—',
    updated: '2026.07',
    tags: ['PIXEL ART', 'CODEX', 'VISUAL QA'],
    accent: '#91d6e2',
  },
]

export const strengths = [
  {
    number: 'A.01',
    title: '统筹协作',
    en: 'COORDINATION',
    text: '在班长与助教经历中持续协调同学、老师和家长，让信息准确传达，让多人协作有序发生。',
    tags: ['LEADERSHIP', 'COMMUNICATION', 'TEAMWORK'],
  },
  {
    number: 'A.02',
    title: '数据跟进',
    en: 'DATA-INFORMED ACTION',
    text: '从考勤、作业到阶段测评，用结构化记录发现问题，并把数据转化为清晰可执行的改进建议。',
    tags: ['EXCEL', 'REPORTING', 'ANALYSIS'],
  },
  {
    number: 'A.03',
    title: 'AI Agent 工作流',
    en: 'AI-ASSISTED DELIVERY',
    text: '熟练使用 Claude Code、Codex 与 OpenAI 工具链，把需求拆解、代码实现、调试验证和文档整理串成可复用流程。',
    tags: ['CLAUDE CODE', 'CODEX', 'OPENAI'],
  },
  {
    number: 'A.04',
    title: '编程与工程实践',
    en: 'PROGRAMMING FOUNDATION',
    text: '以 C、C++、Python 为主要开发语言，能够完成算法练习、脚本自动化与项目开发；正在学习 Java，并用 LangChain 探索 AI 应用编排。',
    tags: ['C / C++', 'PYTHON', 'LANGCHAIN'],
  },
]

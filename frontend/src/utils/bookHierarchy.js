export const bookHierarchy = {
  '计算机学院': {
    '软件工程': {
      '软件工程导论': ['第3版', '第4版'],
      '数据结构': ['2022版', '2024版'],
      '操作系统': ['第4版', '第5版'],
    },
    '计算机科学与技术': {
      '计算机组成原理': ['第3版', '第4版'],
      '数据库系统': ['第5版', '第6版'],
      '计算机网络': ['第7版', '第8版'],
    },
  },
  '文学院': {
    '汉语言文学': {
      '中国现代文学': ['2021版', '2023版'],
      '古代汉语': ['第2版', '第3版'],
    },
    '新闻学': {
      '新闻采访与写作': ['第4版', '第5版'],
      '传播学概论': ['2020版', '2023版'],
    },
  },
  '经济管理学院': {
    '会计学': {
      '基础会计': ['第8版', '第9版'],
      '财务管理': ['第6版', '第7版'],
    },
    '国际经济与贸易': {
      '国际贸易实务': ['第4版', '第5版'],
      '西方经济学': ['第8版', '第9版'],
    },
  },
  '理学院': {
    '数学与应用数学': {
      '高等数学': ['上册 第7版', '下册 第7版'],
      '线性代数': ['第6版', '第7版'],
    },
    '物理学': {
      '大学物理': ['第3版', '第4版'],
      '理论力学': ['第8版', '第9版'],
    },
  },
  '外国语学院': {
    '英语': {
      '综合英语': ['第1版', '第2版'],
      '英语语法': ['2020版', '2023版'],
      '英语写作': ['第3版', '第4版'],
    },
    '日语': {
      '基础日语': ['第3版', '第4版'],
      '日语语法': ['2021版', '2023版'],
    },
  },
  '艺术学院': {
    '美术学': {
      '素描基础': ['第2版', '第3版'],
      '色彩理论': ['2020版', '2022版'],
    },
    '音乐学': {
      '乐理基础': ['第5版', '第6版'],
      '视唱练耳': ['2021版', '2023版'],
    },
  },
  '法学院': {
    '法学': {
      '民法学': ['第7版', '第8版'],
      '刑法学': ['第8版', '第9版'],
      '宪法学': ['第5版', '第6版'],
    },
  },
  '医学院': {
    '临床医学': {
      '人体解剖学': ['第9版', '第10版'],
      '生理学': ['第8版', '第9版'],
      '病理学': ['第8版', '第9版'],
    },
    '护理学': {
      '基础护理学': ['第6版', '第7版'],
      '内科护理学': ['第6版', '第7版'],
    },
  },
}

export const getColleges = () => Object.keys(bookHierarchy)

export const getMajors = (college) => (college && bookHierarchy[college] ? Object.keys(bookHierarchy[college]) : [])

export const getCourses = (college, major) => {
  if (!college || !major || !bookHierarchy[college]?.[major]) return []
  return Object.keys(bookHierarchy[college][major])
}

export const getVersions = (college, major, course) => {
  if (!college || !major || !course || !bookHierarchy[college]?.[major]?.[course]) return []
  return bookHierarchy[college][major][course]
}

export const resolveHierarchyPath = (book) => {
  const parts = [book?.xueyuan, book?.zhuanye, book?.kecheng, book?.banben].filter(Boolean)
  return parts.join(' / ')
}

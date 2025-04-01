// 导出用户数据，以便其他API可以共享
import fs from 'fs';
import path from 'path';

// 默认的初始用户数据
const initialUsersData = [
  {
    id: 1,
    name: '张三',
    avatar: '/images/avatars/avatar-1.jpg',
    email: 'zhangsan@example.com',
    role: '管理员',
    status: '活跃',
    bio: '资深产品经理，擅长AI产品设计',
    website: 'https://example.com',
    location: '北京',
    promptsCount: 15,
    commentsCount: 45,
    likesCount: 230,
    registerDate: '2023-01-15',
    lastLogin: '2023-03-15 14:30',
  },
  {
    id: 2,
    name: '李四',
    avatar: '/images/avatars/avatar-2.jpg',
    email: 'lisi@example.com',
    role: '高级用户',
    status: '活跃',
    bio: 'AI应用开发者，专注于LLM应用',
    website: 'https://lisi.dev',
    location: '上海',
    promptsCount: 8,
    commentsCount: 23,
    likesCount: 120,
    registerDate: '2023-01-20',
    lastLogin: '2023-03-14 09:15',
  },
  {
    id: 3,
    name: '王五',
    avatar: '/images/avatars/avatar-3.jpg',
    email: 'wangwu@example.com',
    role: '普通用户',
    status: '活跃',
    bio: '对AI绘画有浓厚兴趣的自由艺术家',
    website: '',
    location: '杭州',
    promptsCount: 3,
    commentsCount: 15,
    likesCount: 45,
    registerDate: '2023-02-05',
    lastLogin: '2023-03-13 16:45',
  },
  {
    id: 4,
    name: '赵六',
    avatar: '/images/avatars/avatar-4.jpg',
    email: 'zhaoliu@example.com',
    role: '普通用户',
    status: '待验证',
    bio: '刚刚开始学习AI提示词工程',
    website: '',
    location: '深圳',
    promptsCount: 0,
    commentsCount: 0,
    likesCount: 0,
    registerDate: '2023-03-10',
    lastLogin: '2023-03-10 10:20',
  },
  {
    id: 5,
    name: '钱七',
    avatar: '/images/avatars/avatar-5.jpg',
    email: 'qianqi@example.com',
    role: '普通用户',
    status: '已禁用',
    bio: '内容违规，账号已被禁用',
    website: '',
    location: '广州',
    promptsCount: 2,
    commentsCount: 5,
    likesCount: 8,
    registerDate: '2023-02-15',
    lastLogin: '2023-03-01 11:30',
  },
  {
    id: 6,
    name: '孙八',
    avatar: '/images/avatars/avatar-6.jpg',
    email: 'sunba@example.com',
    role: '高级用户',
    status: '活跃',
    bio: '人工智能研究员，专注于NLP领域',
    website: 'https://sunba.ai',
    location: '成都',
    promptsCount: 12,
    commentsCount: 38,
    likesCount: 156,
    registerDate: '2023-01-05',
    lastLogin: '2023-03-15 08:45',
  },
  {
    id: 7,
    name: '周九',
    avatar: '/images/avatars/avatar-7.jpg',
    email: 'zhoujiu@example.com',
    role: '普通用户',
    status: '休眠',
    bio: '偶尔使用AI工具的学生',
    website: '',
    location: '武汉',
    promptsCount: 1,
    commentsCount: 3,
    likesCount: 5,
    registerDate: '2023-02-01',
    lastLogin: '2023-02-15 14:10',
  },
  {
    id: 8,
    name: '吴十',
    avatar: '/images/avatars/avatar-8.jpg',
    email: 'wushi@example.com',
    role: '普通用户',
    status: '活跃',
    bio: '数据科学家，热爱用AI解决问题',
    website: 'https://wushi.io',
    location: '南京',
    promptsCount: 5,
    commentsCount: 12,
    likesCount: 67,
    registerDate: '2023-02-20',
    lastLogin: '2023-03-14 19:25',
  },
  {
    id: 9,
    name: '郑十一',
    avatar: '/images/avatars/avatar-9.jpg',
    email: 'zhengshiyi@example.com',
    role: '普通用户',
    status: '活跃',
    bio: '营销专员，使用AI提升工作效率',
    website: '',
    location: '重庆',
    promptsCount: 4,
    commentsCount: 9,
    likesCount: 34,
    registerDate: '2023-02-25',
    lastLogin: '2023-03-13 12:40',
  },
  {
    id: 10,
    name: '王十二',
    avatar: '/images/avatars/avatar-10.jpg',
    email: 'wangshier@example.com',
    role: '普通用户',
    status: '待验证',
    bio: '对AI生成内容感兴趣的新用户',
    website: '',
    location: '天津',
    promptsCount: 0,
    commentsCount: 0,
    likesCount: 0,
    registerDate: '2023-03-12',
    lastLogin: '2023-03-12 15:50',
  },
  {
    id: 11,
    name: '李十三',
    avatar: '/images/avatars/avatar-11.jpg',
    email: 'lishisan@example.com',
    role: '普通用户',
    status: '活跃',
    bio: '教育工作者，探索AI在教学中的应用',
    website: 'https://edu-ai.cn',
    location: '西安',
    promptsCount: 2,
    commentsCount: 7,
    likesCount: 23,
    registerDate: '2023-03-01',
    lastLogin: '2023-03-15 10:15',
  },
  {
    id: 12,
    name: '张十四',
    avatar: '/images/avatars/avatar-12.jpg',
    email: 'zhangshisi@example.com',
    role: '高级用户',
    status: '活跃',
    bio: '创意总监，利用AI进行创意设计',
    website: 'https://zhangshisi.design',
    location: '苏州',
    promptsCount: 7,
    commentsCount: 19,
    likesCount: 128,
    registerDate: '2023-01-25',
    lastLogin: '2023-03-14 17:30',
  },
];

// 使用内存作为主要存储
let usersData = [...initialUsersData];

// 数据文件路径
const dataFilePath = path.join(process.cwd(), 'data', 'users.json');

// 尝试从文件加载数据，但不影响程序正常运行
try {
  // 确保数据目录存在
  if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
    try {
      fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
      console.log('成功创建数据目录');
    } catch (dirError) {
      console.error('创建数据目录失败，将使用内存存储:', dirError);
    }
  }

  // 尝试从文件读取数据
  if (fs.existsSync(dataFilePath)) {
    try {
      const fileData = fs.readFileSync(dataFilePath, 'utf8');
      const parsedData = JSON.parse(fileData);
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        usersData = parsedData;
        console.log('从文件加载了用户数据');
      }
    } catch (readError) {
      console.error('读取用户数据文件失败，将使用初始数据:', readError);
    }
  } else {
    // 尝试初始化文件
    try {
      fs.writeFileSync(dataFilePath, JSON.stringify(usersData, null, 2), 'utf8');
      console.log('已初始化用户数据文件');
    } catch (writeError) {
      console.error('初始化用户数据文件失败，将使用内存存储:', writeError);
    }
  }
} catch (error) {
  console.error('用户数据初始化过程中出错，将使用内存存储:', error);
}

// 保存数据到文件 - 容错实现
function saveData() {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(usersData, null, 2), 'utf8');
    console.log('用户数据已保存到文件');
    return true;
  } catch (error) {
    console.error('保存用户数据文件失败，但数据仍保留在内存中:', error);
    return false;
  }
}

export { usersData };

// 添加辅助函数来修改数据
export function updateUsersStatus(ids: number[], status: string) {
  console.log(`批量更新用户状态，ID列表:`, ids);
  console.log(`新状态: ${status}`);
  
  usersData = usersData.map(user => 
    ids.includes(user.id) ? { ...user, status } : user
  );
  
  const saveResult = saveData();
  if (!saveResult) {
    console.warn('文件保存失败，但内存数据已更新');
  }
  
  return usersData;
}

export function deleteUsers(ids: number[]) {
  console.log(`批量删除用户，ID列表:`, ids);
  const originalLength = usersData.length;
  
  usersData = usersData.filter(user => !ids.includes(user.id));
  
  const deletedCount = originalLength - usersData.length;
  console.log(`成功从内存中删除了${deletedCount}个用户`);
  
  const saveResult = saveData();
  if (!saveResult) {
    console.warn('文件保存失败，但内存数据已更新');
  }
  
  return usersData;
}

export function deleteUser(id: number) {
  console.log(`删除单个用户，ID: ${id}`);
  const originalLength = usersData.length;
  
  usersData = usersData.filter(user => user.id !== id);
  
  if (originalLength === usersData.length) {
    console.warn(`未找到ID为${id}的用户`);
    return null;
  }
  
  console.log(`成功从内存中删除ID为${id}的用户`);
  
  const saveResult = saveData();
  if (!saveResult) {
    console.warn('文件保存失败，但内存数据已更新');
  }
  
  return usersData;
}

export function updateUser(id: number, data: any) {
  console.log(`更新用户，ID: ${id}`);
  console.log('更新数据:', data);
  
  usersData = usersData.map(user => 
    user.id === id ? { ...user, ...data } : user
  );
  
  const updatedUser = usersData.find(u => u.id === id);
  
  if (!updatedUser) {
    console.warn(`更新失败，未找到ID为${id}的用户`);
    return null;
  }
  
  const saveResult = saveData();
  if (!saveResult) {
    console.warn('文件保存失败，但内存数据已更新');
  }
  
  return updatedUser;
}

export function addUser(userData: any) {
  // 生成新ID（当前最大ID+1）
  const maxId = Math.max(...usersData.map(u => u.id), 0);
  const newUser = {
    id: maxId + 1,
    registerDate: new Date().toISOString().split('T')[0], // 当前日期
    lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 19), // 当前时间
    promptsCount: 0,
    commentsCount: 0,
    likesCount: 0,
    ...userData
  };
  
  console.log('添加新用户:', newUser);
  
  usersData.push(newUser);
  
  const saveResult = saveData();
  if (!saveResult) {
    console.warn('文件保存失败，但内存数据已更新');
  }
  
  return newUser;
} 
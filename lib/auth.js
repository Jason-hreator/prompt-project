// 条件式导入fs和path模块（仅在服务器端可用）
let fs;
let path;
if (typeof window === 'undefined') {
  fs = require('fs');
  path = require('path');
}

// 用户会话存储
let currentUser = null;

// 获取用户 token（模拟实现）
export function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

// 从请求头获取用户ID
export function getUserIdFromHeader(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  // 从 token 中提取用户 ID
  // 模拟 token 格式: mock_jwt_token_{userId}
  const match = token.match(/mock_jwt_token_(\d+)/);
  return match ? match[1] : null;
}

// 检查用户是否是管理员
export async function isAdmin(userId) {
  const user = await getUserById(userId);
  return user && user.role === 'admin';
}

// 根据 ID 获取用户信息
export function getUserById(userId) {
  try {
    // 检查是否在服务器环境
    if (typeof window !== 'undefined') {
      console.error('getUserById 只能在服务器端调用');
      return null;
    }
    
    // 读取用户数据文件
    const dataDirectory = path.join(process.cwd(), 'data');
    const filePath = path.join(dataDirectory, 'users.json');
    
    // 确保目录存在
    if (!fs.existsSync(dataDirectory)) {
      fs.mkdirSync(dataDirectory, { recursive: true });
    }
    
    // 确保文件存在
    if (!fs.existsSync(filePath)) {
      // 如果文件不存在，创建一个初始文件
      const initialData = [
        {
          id: 1,
          username: "admin",
          name: "管理员",
          email: "admin@example.com",
          password: "admin123", // 在实际应用中应该使用加密密码
          role: "admin",
          permissions: {
            prompts: {
              create: true,
              delete: true,
              deleteAny: true,
              edit: true,
              editAny: true,
              review: true,
              manage: true
            },
            comments: {
              create: true,
              delete: true,
              deleteAny: true,
              manage: true
            },
            users: {
              view: true,
              delete: true,
              edit: true,
              assign: true,
              ban: true
            },
            system: {
              settings: true,
              categories: true,
              colors: true,
              analytics: true,
              logs: true
            }
          },
          createdAt: new Date().toISOString(),
          lastLogin: null
        },
        {
          id: 2,
          username: "user",
          name: "普通用户",
          email: "user@example.com",
          password: "user123", // 在实际应用中应该使用加密密码
          role: "user",
          permissions: {
            prompts: {
              create: true,
              delete: true,
              deleteAny: false,
              edit: true,
              editAny: false,
              review: false,
              manage: false
            },
            comments: {
              create: true,
              delete: true,
              deleteAny: false,
              manage: false
            },
            users: {
              view: false,
              delete: false,
              edit: false,
              assign: false,
              ban: false
            },
            system: {
              settings: false,
              categories: false,
              colors: false,
              analytics: false,
              logs: false
            }
          },
          createdAt: new Date().toISOString(),
          lastLogin: null
        }
      ];
      fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2), 'utf8');
    }
    
    // 读取用户数据
    const userData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // 查找指定用户
    const user = userData.find(user => user.id.toString() === userId.toString());
    
    if (user) {
      // 返回用户对象，但排除密码
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    
    return null;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
}

// 检查用户是否已登录
export function isLoggedIn() {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    return !!token; // 如果token存在，则认为用户已登录
  }
  return false;
}

// 获取当前登录用户信息
export function getCurrentUser() {
  if (typeof window !== 'undefined') {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }
  return null;
}

// 检查用户是否为管理员
export const hasRole = (role, user = null) => {
  // 在浏览器环境中执行
  if (typeof window !== 'undefined') {
    try {
      // 如果没有传入用户，则获取当前用户
      const currentUser = user || getCurrentUser();
      if (!currentUser) return false;
      
      // 检查用户角色
      if (role === 'admin' && currentUser.role === 'admin') {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('角色检查失败:', error);
      return false;
    }
  }
  
  // 服务端环境中，通过其他方式检查（API请求时）
  return false;
};

// 检查用户是否具有特定权限
export const hasPermission = (permission, user = null) => {
  // 在浏览器环境中执行
  if (typeof window !== 'undefined') {
    try {
      // 如果没有传入用户，则获取当前用户
      const currentUser = user || getCurrentUser();
      if (!currentUser) return false;
      
      // 如果是管理员，默认拥有所有权限
      if (currentUser.role === 'admin') {
        return true;
      }
      
      // 检查特定权限
      const [category, action] = permission.split('.');
      return currentUser.permissions?.[category]?.[action] === true;
    } catch (error) {
      console.error('权限检查失败:', error);
      return false;
    }
  }
  
  // 服务端环境中，通过其他方式检查（API请求时）
  return false;
};

// 检查当前用户是否可以访问管理员页面
export const canAccessAdminPage = () => {
  try {
    if (typeof window === 'undefined') return false;
    
    if (!isLoggedIn()) return false;
    
    const currentUser = getCurrentUser();
    if (!currentUser) return false;
    
    // 只有管理员可以访问管理页面
    return currentUser.role === 'admin';
  } catch (error) {
    console.error('管理页面访问权限检查失败:', error);
    return false;
  }
};

// 设置登录状态
export function setLogin(userData, token) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    currentUser = userData;
  }
}

// 登出
export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;
  }
}

// 验证用户凭据(模拟实现)
export async function verifyCredentials(email, password) {
  try {
    // 检查是否在服务器环境
    if (typeof window !== 'undefined') {
      console.error('verifyCredentials 只能在服务器端调用');
      return { success: false, error: "此功能仅在服务器端可用" };
    }
    
    // 读取用户数据文件
    const dataDirectory = path.join(process.cwd(), 'data');
    const filePath = path.join(dataDirectory, 'users.json');
    
    // 确保目录和文件存在
    if (!fs.existsSync(dataDirectory)) {
      fs.mkdirSync(dataDirectory, { recursive: true });
    }
    
    if (!fs.existsSync(filePath)) {
      // 创建初始用户数据
      const initialData = [
        {
          id: 1,
          username: "admin",
          name: "管理员",
          email: "admin@example.com",
          password: "admin123", // 实际应用中应使用加密密码
          role: "admin",
          permissions: {
            prompts: {
              create: true,
              delete: true,
              deleteAny: true,
              edit: true,
              editAny: true,
              review: true,
              manage: true
            },
            comments: {
              create: true,
              delete: true,
              deleteAny: true,
              manage: true
            },
            users: {
              view: true,
              delete: true,
              edit: true,
              assign: true,
              ban: true
            },
            system: {
              settings: true,
              categories: true,
              colors: true,
              analytics: true,
              logs: true
            }
          },
          createdAt: new Date().toISOString(),
          lastLogin: null
        },
        {
          id: 2,
          username: "user",
          name: "普通用户",
          email: "user@example.com",
          password: "user123", // 实际应用中应使用加密密码
          role: "user",
          permissions: {
            prompts: {
              create: true,
              delete: true,
              deleteAny: false,
              edit: true,
              editAny: false,
              review: false,
              manage: false
            },
            comments: {
              create: true,
              delete: true,
              deleteAny: false,
              manage: false
            },
            users: {
              view: false,
              delete: false,
              edit: false,
              assign: false,
              ban: false
            },
            system: {
              settings: false,
              categories: false,
              colors: false,
              analytics: false,
              logs: false
            }
          },
          createdAt: new Date().toISOString(),
          lastLogin: null
        }
      ];
      fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2), 'utf8');
    }
    
    // 读取用户数据
    const userData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // 查找匹配的用户
    const user = userData.find(user => 
      user.email === email && user.password === password
    );
    
    if (user) {
      // 更新用户登录时间
      const updatedUsers = userData.map(u => {
        if (u.id === user.id) {
          return { ...u, lastLogin: new Date().toISOString() };
        }
        return u;
      });
      
      fs.writeFileSync(filePath, JSON.stringify(updatedUsers, null, 2), 'utf8');
      
      // 返回用户对象，但排除密码
      const { password: pass, ...userWithoutPassword } = user;
      
      // 生成模拟token
      const token = `mock_jwt_token_${user.id}`;
      
      return {
        success: true,
        user: userWithoutPassword,
        token
      };
    }
    
    return {
      success: false,
      error: "邮箱或密码不正确"
    };
  } catch (error) {
    console.error('验证用户凭据失败:', error);
    return {
      success: false,
      error: "验证失败，请稍后重试"
    };
  }
} 
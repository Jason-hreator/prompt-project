import { supabase } from './supabaseClient';

// 用户相关API
export async function getUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*');
  
  if (error) {
    console.error('获取用户列表失败:', error);
    return [];
  }
  
  return data || [];
}

export async function getUserById(id) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`获取用户 ${id} 失败:`, error);
    return null;
  }
  
  return data;
}

export async function updateUser(id, userData) {
  const { data, error } = await supabase
    .from('users')
    .update(userData)
    .eq('id', id);
  
  if (error) {
    console.error(`更新用户 ${id} 失败:`, error);
    return false;
  }
  
  return true;
}

// 提示词相关API
export async function getPrompts() {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .select(`
        *,
        user:user_id (id, name, avatar),
        category (id, name)
      `);
    
    if (error) {
      console.error('获取提示词列表失败:', error);
      return [];
    }
    
    return data.map(prompt => ({
      ...prompt,
      userId: prompt.user_id,
      author: prompt.user
    })) || [];
  } catch (err) {
    console.error('获取提示词列表出错:', err);
    return [];
  }
}

export async function getPromptById(id) {
  try {
    console.log(`尝试获取提示词 ${id} 详情`);
    const { data, error } = await supabase
      .from('prompts')
      .select(`
        *,
        user:user_id (id, name, avatar)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`获取提示词 ${id} 失败:`, error);
      return null;
    }
    
    if (!data) {
      console.log(`未找到ID为 ${id} 的提示词`);
      return null;
    }
    
    // 处理作者信息
    let authorInfo;
    
    if (data.user) {
      authorInfo = {
        id: data.user.id,
        name: data.user.name || '用户_' + data.user.id,
        avatar: data.user.avatar
      };
    } else if (data.user_id) {
      // 如果只有用户ID，创建一个基本的作者对象
      authorInfo = {
        id: data.user_id,
        name: '用户_' + data.user_id
      };
    } else {
      // 如果没有作者信息，使用默认值
      authorInfo = '未知作者';
    }
    
    console.log(`提示词 ${id} 的作者信息:`, authorInfo);
    
    // 格式化数据，使其与现有代码兼容
    return {
      ...data,
      userId: data.user_id,
      author: authorInfo,
      date: data.date || data.created_at
    };
  } catch (err) {
    console.error(`获取提示词 ${id} 时发生错误:`, err);
    return null;
  }
}

export async function createPrompt(promptData) {
  try {
    console.log('正在创建提示词，数据:', promptData);
    
    // 确保使用Supabase的数据结构
    const dataToInsert = {
      title: promptData.title,
      content: promptData.content,
      description: promptData.description || '',
      category: promptData.category || '创意生成型',
      model: promptData.model || 'ChatGPT',
      user_id: promptData.user_id,
      status: promptData.status || '待审核',
      created_at: promptData.date || new Date().toISOString(),
      likes: promptData.likes || 0,
      is_featured: promptData.is_featured || false
    };
    
    const { data, error } = await supabase
      .from('prompts')
      .insert([dataToInsert])
      .select();
  
    if (error) {
      console.error('创建提示词失败:', error);
      return null;
    }
    
    console.log('提示词创建成功:', data?.[0]);
    return data?.[0] || null;
  } catch (error) {
    console.error('创建提示词时出错:', error);
    return null;
  }
}

export async function updatePrompt(id, promptData) {
  const { error } = await supabase
    .from('prompts')
    .update(promptData)
    .eq('id', id);
  
  if (error) {
    console.error(`更新提示词 ${id} 失败:`, error);
    return false;
  }
  
  return true;
}

export async function deletePrompt(id) {
  const { error } = await supabase
    .from('prompts')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error(`删除提示词 ${id} 失败:`, error);
    return false;
  }
  
  return true;
}

// 获取精选提示词
export async function getFeaturedPrompts() {
  const { data, error } = await supabase
    .from('prompts')
    .select(`
      *,
      user:user_id (id, name, avatar),
      category (id, name)
    `)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (error) {
    console.error('获取精选提示词失败:', error);
    return [];
  }
  
  return data || [];
}

// 评论相关API
export async function getCommentsByPromptId(promptId) {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      user:user_id (id, name, avatar)
    `)
    .eq('prompt_id', promptId);
  
  if (error) {
    console.error(`获取提示词 ${promptId} 的评论失败:`, error);
    return [];
  }
  
  return data.map(comment => ({
    ...comment,
    userId: comment.user_id,
    promptId: comment.prompt_id,
    user: comment.user
  })) || [];
}

export async function createComment(commentData) {
  const { data, error } = await supabase
    .from('comments')
    .insert([{
      prompt_id: commentData.promptId,
      user_id: commentData.userId,
      content: commentData.content,
      date: new Date().toISOString()
    }])
    .select();
  
  if (error) {
    console.error('创建评论失败:', error);
    return null;
  }
  
  return data?.[0] || null;
}

// 点赞相关API
export async function getUserLikes(userId) {
  const { data, error } = await supabase
    .from('likes')
    .select('prompt_id')
    .eq('user_id', userId);
  
  if (error) {
    console.error(`获取用户 ${userId} 的点赞列表失败:`, error);
    return [];
  }
  
  return data.map(like => like.prompt_id) || [];
}

export async function toggleLike(userId, promptId) {
  // 先检查是否已点赞
  const { data: existingLike } = await supabase
    .from('likes')
    .select('*')
    .eq('user_id', userId)
    .eq('prompt_id', promptId)
    .single();
  
  if (existingLike) {
    // 如果已点赞，则取消点赞
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', userId)
      .eq('prompt_id', promptId);
    
    if (error) {
      console.error(`取消点赞失败 ${promptId}:`, error);
      return false;
    }
    
    // 更新提示词的点赞数量
    await supabase
      .from('prompts')
      .update({ likes: supabase.sql('likes - 1') })
      .eq('id', promptId);
    
    return false; // 返回false表示取消点赞
  } else {
    // 如果未点赞，则添加点赞
    const { error } = await supabase
      .from('likes')
      .insert([{
        user_id: userId,
        prompt_id: promptId,
        created_at: new Date().toISOString()
      }]);
    
    if (error) {
      console.error(`点赞失败 ${promptId}:`, error);
      return false;
    }
    
    // 更新提示词的点赞数量
    await supabase
      .from('prompts')
      .update({ likes: supabase.sql('likes + 1') })
      .eq('id', promptId);
    
    return true; // 返回true表示点赞成功
  }
}

// 分类相关API
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('获取分类列表失败:', error);
    
    // 默认分类数据作为备选
    return [
      { id: 1, name: '创意生成型', icon: '/icons/creative.svg' },
      { id: 2, name: '学习辅助型', icon: '/icons/learning.svg' },
      { id: 3, name: '工作效率型', icon: '/icons/productivity.svg' },
      { id: 4, name: '编程开发型', icon: '/icons/coding.svg' },
      { id: 5, name: '生活助手型', icon: '/icons/lifestyle.svg' }
    ];
  }
  
  return data || [];
}

// 根据用户ID获取提示词列表
export async function getPromptsByUserId(userId) {
  const { data, error } = await supabase
    .from('prompts')
    .select(`
      *,
      user:user_id (id, name, avatar),
      category (id, name)
    `)
    .eq('user_id', userId);
  
  if (error) {
    console.error(`获取用户 ${userId} 的提示词列表失败:`, error);
    return [];
  }
  
  return data.map(prompt => ({
    ...prompt,
    userId: prompt.user_id,
    author: prompt.user,
    date: prompt.date || prompt.created_at
  })) || [];
}
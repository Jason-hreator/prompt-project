const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tzsmhrvusihuoqbifmpc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6c21ocnZ1c2lodW9xYmlmbXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0MDQxMDAsImV4cCI6MjA1Nzk4MDEwMH0.K6emfisOYmQfbChpheYAFQjYS01o-UY0nMYacN_H8nM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateUsers() {
  try {
    const usersPath = path.join(process.cwd(), 'data', 'users.json');
    if (!fs.existsSync(usersPath)) {
      console.log('No users data found');
      return;
    }
    
    const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    
    // 对每个用户进行处理，处理可能的字段不匹配问题
    const processedUsers = usersData.map(user => ({
      id: user.id,
      username: user.username || user.name, // 确保username字段存在
      name: user.name,
      email: user.email,
      password: user.password || 'password123', // 默认密码
      role: user.role || 'user',
      status: user.status || '活跃',
      avatar: user.avatar || '/avatars/default.png',
      bio: user.bio || '',
      website: user.website || '',
      location: user.location || '',
      prompts_count: user.promptsCount || 0,
      comments_count: user.commentsCount || 0,
      likes_count: user.likesCount || 0,
      register_date: user.registerDate || new Date().toISOString(),
      last_login: user.lastLogin || new Date().toISOString()
    }));
    
    // 使用upsert而非insert，避免主键冲突
    const { data, error } = await supabase
      .from('users')
      .upsert(processedUsers, { onConflict: 'id' });
    
    if (error) {
      console.error('Error migrating users:', error);
    } else {
      console.log(`Migrated ${usersData.length} users successfully`);
    }
  } catch (error) {
    console.error('Migration error:', error);
  }
}

async function migratePrompts() {
  try {
    const promptsPath = path.join(process.cwd(), 'data', 'prompts.json');
    if (!fs.existsSync(promptsPath)) {
      console.log('No prompts data found');
      return;
    }
    
    const promptsData = JSON.parse(fs.readFileSync(promptsPath, 'utf8'));
    
    // 处理提示词数据
    const processedPrompts = promptsData.map(prompt => {
      // 处理author字段，转换为user_id
      let userId = null;
      if (typeof prompt.author === 'object' && prompt.author.id) {
        userId = prompt.author.id;
      } else if (prompt.userId) {
        userId = prompt.userId;
      }
      
      return {
        id: prompt.id,
        title: prompt.title,
        content: prompt.content,
        description: prompt.description || '',
        category: prompt.category || '通用',
        model: prompt.model || 'GPT-4',
        user_id: userId,
        status: prompt.status || '待审核',
        date: prompt.date || new Date().toISOString(),
        likes: prompt.likes || 0,
        reviewed_by: prompt.reviewedBy || null,
        reviewed_at: prompt.reviewedAt || null
      };
    });
    
    const { data, error } = await supabase
      .from('prompts')
      .upsert(processedPrompts, { onConflict: 'id' });
    
    if (error) {
      console.error('Error migrating prompts:', error);
    } else {
      console.log(`Migrated ${promptsData.length} prompts successfully`);
    }
  } catch (error) {
    console.error('Migration error:', error);
  }
}

async function migrateComments() {
  try {
    const commentsPath = path.join(process.cwd(), 'data', 'comments.json');
    if (!fs.existsSync(commentsPath)) {
      console.log('No comments data found');
      return;
    }
    
    const commentsData = JSON.parse(fs.readFileSync(commentsPath, 'utf8'));
    
    // 处理评论数据
    const processedComments = commentsData.map(comment => ({
      id: comment.id,
      prompt_id: comment.promptId,
      user_id: comment.userId,
      content: comment.content,
      date: comment.date || new Date().toISOString(),
      likes: comment.likes || 0
    }));
    
    const { data, error } = await supabase
      .from('comments')
      .upsert(processedComments, { onConflict: 'id' });
    
    if (error) {
      console.error('Error migrating comments:', error);
    } else {
      console.log(`Migrated ${commentsData.length} comments successfully`);
    }
  } catch (error) {
    console.error('Migration error:', error);
  }
}

async function migrateLikes() {
  try {
    const likesPath = path.join(process.cwd(), 'data', 'user-likes.json');
    if (!fs.existsSync(likesPath)) {
      console.log('No user likes data found');
      return;
    }
    
    const likesData = JSON.parse(fs.readFileSync(likesPath, 'utf8'));
    const processedLikes = [];
    
    // 处理用户点赞数据
    // 格式可能是 { "userId": ["promptId1", "promptId2"] }
    Object.entries(likesData).forEach(([userId, promptIds]) => {
      if (Array.isArray(promptIds)) {
        promptIds.forEach(promptId => {
          processedLikes.push({
            user_id: parseInt(userId),
            prompt_id: parseInt(promptId),
            created_at: new Date().toISOString()
          });
        });
      }
    });
    
    if (processedLikes.length > 0) {
      const { data, error } = await supabase
        .from('likes')
        .upsert(processedLikes, { onConflict: ['user_id', 'prompt_id'] });
      
      if (error) {
        console.error('Error migrating likes:', error);
      } else {
        console.log(`Migrated ${processedLikes.length} likes successfully`);
      }
    } else {
      console.log('No likes to migrate');
    }
  } catch (error) {
    console.error('Migration error:', error);
  }
}

async function main() {
  // 按顺序迁移数据，确保外键依赖关系
  await migrateUsers();
  await migratePrompts();
  await migrateComments();
  await migrateLikes();
  console.log('Migration completed');
}

main(); 
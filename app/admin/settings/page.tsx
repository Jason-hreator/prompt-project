"use client";

import { useState } from 'react';
import Link from 'next/link';

// 设置分类
const settingCategories = [
  { id: 'general', name: '基本设置' },
  { id: 'registration', name: '注册设置' },
  { id: 'content', name: '内容设置' },
  { id: 'email', name: '邮件设置' },
  { id: 'api', name: 'API设置' },
];

// 设置项类型
interface Setting {
  id: string;
  name: string;
  description: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'toggle' | 'color';
  value: string | number | boolean;
  options?: { value: string; label: string }[];
  category: string;
}

// 模拟设置数据
const settingsData: Setting[] = [
  // 基本设置
  {
    id: 'site_name',
    name: '网站名称',
    description: '显示在浏览器标题栏和网站页面上的名称',
    type: 'text',
    value: '提示精灵',
    category: 'general',
  },
  {
    id: 'site_description',
    name: '网站描述',
    description: '用于SEO和分享链接的网站简短描述',
    type: 'textarea',
    value: '提示精灵是一个分享和发现AI提示词的平台，帮助用户更高效地使用AI工具。',
    category: 'general',
  },
  {
    id: 'logo_url',
    name: 'Logo URL',
    description: '网站Logo的URL地址',
    type: 'text',
    value: '/images/logo.png',
    category: 'general',
  },
  {
    id: 'favicon_url',
    name: 'Favicon URL',
    description: '网站图标的URL地址',
    type: 'text',
    value: '/favicon.ico',
    category: 'general',
  },
  {
    id: 'primary_color',
    name: '主题色',
    description: '网站的主要颜色',
    type: 'color',
    value: '#3B82F6',
    category: 'general',
  },
  
  // 注册设置
  {
    id: 'allow_registration',
    name: '允许注册',
    description: '是否允许新用户注册',
    type: 'toggle',
    value: true,
    category: 'registration',
  },
  {
    id: 'require_email_verification',
    name: '需要邮箱验证',
    description: '新用户注册后是否需要验证邮箱',
    type: 'toggle',
    value: true,
    category: 'registration',
  },
  {
    id: 'default_user_role',
    name: '默认用户角色',
    description: '新用户注册后的默认角色',
    type: 'select',
    value: 'user',
    options: [
      { value: 'user', label: '普通用户' },
      { value: 'premium', label: '高级用户' },
    ],
    category: 'registration',
  },
  {
    id: 'min_password_length',
    name: '最小密码长度',
    description: '用户密码的最小长度要求',
    type: 'number',
    value: 8,
    category: 'registration',
  },
  
  // 内容设置
  {
    id: 'content_moderation',
    name: '内容审核',
    description: '是否对新提交的内容进行审核',
    type: 'toggle',
    value: true,
    category: 'content',
  },
  {
    id: 'allow_comments',
    name: '允许评论',
    description: '是否允许用户对提示词发表评论',
    type: 'toggle',
    value: true,
    category: 'content',
  },
  {
    id: 'max_prompts_per_day',
    name: '每日提交限制',
    description: '普通用户每天可以提交的提示词数量',
    type: 'number',
    value: 5,
    category: 'content',
  },
  {
    id: 'max_prompt_length',
    name: '提示词最大长度',
    description: '提示词内容的最大字符数',
    type: 'number',
    value: 5000,
    category: 'content',
  },
  
  // 邮件设置
  {
    id: 'smtp_host',
    name: 'SMTP服务器',
    description: '用于发送邮件的SMTP服务器地址',
    type: 'text',
    value: 'smtp.example.com',
    category: 'email',
  },
  {
    id: 'smtp_port',
    name: 'SMTP端口',
    description: 'SMTP服务器端口',
    type: 'number',
    value: 587,
    category: 'email',
  },
  {
    id: 'smtp_username',
    name: 'SMTP用户名',
    description: 'SMTP服务器用户名',
    type: 'text',
    value: 'noreply@example.com',
    category: 'email',
  },
  {
    id: 'smtp_password',
    name: 'SMTP密码',
    description: 'SMTP服务器密码',
    type: 'text',
    value: '********',
    category: 'email',
  },
  {
    id: 'email_from',
    name: '发件人地址',
    description: '发送邮件的地址',
    type: 'text',
    value: 'noreply@example.com',
    category: 'email',
  },
  
  // API设置
  {
    id: 'enable_api',
    name: '启用API',
    description: '是否启用API访问',
    type: 'toggle',
    value: true,
    category: 'api',
  },
  {
    id: 'api_rate_limit',
    name: 'API速率限制',
    description: '每分钟允许的API请求数',
    type: 'number',
    value: 60,
    category: 'api',
  },
  {
    id: 'api_token_expiry',
    name: 'API令牌过期时间',
    description: 'API令牌的过期时间（天）',
    type: 'number',
    value: 30,
    category: 'api',
  },
];

export default function SettingsPage() {
  const [activeCategory, setActiveCategory] = useState('general');
  const [settings, setSettings] = useState<Setting[]>(settingsData);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // 过滤当前分类的设置项
  const filteredSettings = settings.filter(setting => setting.category === activeCategory);

  // 处理设置项变更
  const handleSettingChange = (id: string, value: string | number | boolean) => {
    const updatedSettings = settings.map(setting => {
      if (setting.id === id) {
        return { ...setting, value };
      }
      return setting;
    });
    
    setSettings(updatedSettings);
  };

  // 保存设置
  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveMessage({
        type: 'success',
        text: '设置已成功保存'
      });
    } catch (err) {
      setSaveMessage({
        type: 'error',
        text: '保存失败，请重试'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // 重置设置
  const handleResetSettings = () => {
    if (!confirm('确定要重置所有设置吗？此操作无法撤销。')) {
      return;
    }
    
    setSettings(settingsData);
  };

  // 渲染设置项输入控件
  const renderSettingInput = (setting: Setting) => {
    switch (setting.type) {
      case 'text':
        return (
          <input
            type="text"
            id={setting.id}
            value={setting.value as string}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
      case 'textarea':
        return (
          <textarea
            id={setting.id}
            value={setting.value as string}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        );
      case 'number':
        return (
          <input
            type="number"
            id={setting.id}
            value={setting.value as number}
            onChange={(e) => handleSettingChange(setting.id, Number(e.target.value))}
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
      case 'select':
        return (
          <select
            id={setting.id}
            value={setting.value as string}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {setting.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case 'toggle':
        return (
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={setting.value as boolean}
              onChange={(e) => handleSettingChange(setting.id, e.target.checked)}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        );
      case 'color':
        return (
          <div className="flex items-center">
            <input
              type="color"
              id={setting.id}
              value={setting.value as string}
              onChange={(e) => handleSettingChange(setting.id, e.target.value)}
              className="w-10 h-10 border-0 p-0"
            />
            <input
              type="text"
              value={setting.value as string}
              onChange={(e) => handleSettingChange(setting.id, e.target.value)}
              className="ml-2 w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">系统设置</h1>
          <p className="text-gray-600">管理网站的全局设置</p>
        </div>
        <div className="mt-4 sm:mt-0 space-x-2">
          <button
            onClick={handleResetSettings}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            重置设置
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md ${
              isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
          >
            {isSaving ? '保存中...' : '保存设置'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 设置分类 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-medium">设置分类</h2>
            </div>
            <div className="p-4">
              <ul className="space-y-2">
                {settingCategories.map(category => (
                  <li key={category.id}>
                    <button
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full text-left px-4 py-3 rounded-md ${
                        activeCategory === category.id
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      {category.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 设置项 */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-medium">
                {settingCategories.find(c => c.id === activeCategory)?.name}
              </h2>
            </div>
            <div className="p-6">
              {saveMessage && (
                <div className={`p-4 rounded-lg mb-6 ${
                  saveMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                  {saveMessage.text}
                </div>
              )}

              <div className="space-y-6">
                {filteredSettings.map(setting => (
                  <div key={setting.id} className="border-b border-gray-100 pb-6 last:border-0">
                    <div className="mb-2">
                      <label htmlFor={setting.id} className="block text-sm font-medium text-gray-700">
                        {setting.name}
                      </label>
                      <p className="text-xs text-gray-500">{setting.description}</p>
                    </div>
                    {renderSettingInput(setting)}
                  </div>
                ))}
              </div>

              {filteredSettings.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-gray-500">该分类下没有设置项</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
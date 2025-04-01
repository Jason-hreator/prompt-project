"use client";

import React, { useState } from 'react';

// 定义语言接口
interface Language {
  id: string;
  name: string;
  nativeName: string;
  code: string;
  isActive: boolean;
  completionPercentage: number;
  lastUpdated: string;
}

// 模拟语言数据
const mockLanguages: Language[] = [
  {
    id: '1',
    name: 'English',
    nativeName: 'English',
    code: 'en',
    isActive: true,
    completionPercentage: 100,
    lastUpdated: '2023-12-15'
  },
  {
    id: '2',
    name: 'Chinese (Simplified)',
    nativeName: '简体中文',
    code: 'zh-CN',
    isActive: true,
    completionPercentage: 92,
    lastUpdated: '2023-12-10'
  },
  {
    id: '3',
    name: 'Spanish',
    nativeName: 'Español',
    code: 'es',
    isActive: true,
    completionPercentage: 85,
    lastUpdated: '2023-11-28'
  },
  {
    id: '4',
    name: 'Japanese',
    nativeName: '日本語',
    code: 'ja',
    isActive: true,
    completionPercentage: 68,
    lastUpdated: '2023-11-05'
  }
];

// 语言管理组件
const LanguageManagement: React.FC = () => {
  const [languages] = useState<Language[]>(mockLanguages);
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <input
            type="text"
            placeholder="搜索语言..."
            className="border rounded px-4 py-2"
          />
        </div>
        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          添加语言
        </button>
      </div>

      <div className="border rounded overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left p-3">语言</th>
              <th className="text-left p-3">代码</th>
              <th className="text-left p-3">状态</th>
              <th className="text-left p-3">完成度</th>
              <th className="text-left p-3">最后更新</th>
              <th className="text-right p-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {languages.map((language) => (
              <tr key={language.id} className="border-t">
                <td className="p-3">
                  <div>
                    <div className="font-medium">{language.name}</div>
                    <div className="text-sm text-gray-500">{language.nativeName}</div>
                  </div>
                </td>
                <td className="p-3">{language.code}</td>
                <td className="p-3">
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={language.isActive} className="sr-only peer" />
                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </td>
                <td className="p-3">
                  <div className="w-full space-y-1">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${language.completionPercentage}%` }}></div>
                    </div>
                    <div className="text-xs text-gray-500">{language.completionPercentage}%</div>
                  </div>
                </td>
                <td className="p-3">{language.lastUpdated}</td>
                <td className="p-3 text-right">
                  <button className="text-gray-500 hover:text-blue-500 mx-1">编辑</button>
                  {language.code !== 'en' && (
                    <button className="text-gray-500 hover:text-red-500 mx-1">删除</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 翻译管理组件
const TranslationManagement: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="p-4 border rounded bg-yellow-50">
        <p className="text-yellow-800">
          翻译管理功能正在开发中，即将推出！
        </p>
      </div>
    </div>
  );
};

// 国际化设置组件
const I18nSettingsPanel: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="p-4 border rounded bg-yellow-50">
        <p className="text-yellow-800">
          国际化设置功能正在开发中，即将推出！
        </p>
      </div>
    </div>
  );
};

// 主页面组件
export default function LocalizationPage() {
  const [activeTab, setActiveTab] = useState('languages');

  return (
    <div className="container mx-auto py-6 space-y-6 px-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">多语言和国际化</h1>
          <p className="text-gray-500">
            管理网站的多语言支持和国际化设置
          </p>
        </div>
      </div>

      <div className="border-b">
        <div className="flex space-x-4">
          <button 
            className={`py-2 px-4 border-b-2 ${activeTab === 'languages' ? 'border-blue-500 text-blue-500' : 'border-transparent'}`}
            onClick={() => setActiveTab('languages')}
          >
            语言管理
          </button>
          <button 
            className={`py-2 px-4 border-b-2 ${activeTab === 'translations' ? 'border-blue-500 text-blue-500' : 'border-transparent'}`}
            onClick={() => setActiveTab('translations')}
          >
            翻译管理
          </button>
          <button 
            className={`py-2 px-4 border-b-2 ${activeTab === 'settings' ? 'border-blue-500 text-blue-500' : 'border-transparent'}`}
            onClick={() => setActiveTab('settings')}
          >
            国际化设置
          </button>
        </div>
      </div>

      <div className="mt-6">
        {activeTab === 'languages' && <LanguageManagement />}
        {activeTab === 'translations' && <TranslationManagement />}
        {activeTab === 'settings' && <I18nSettingsPanel />}
      </div>
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function PromptDetail() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`请帮我撰写一封专业的商业邮件，根据以下信息：

1. 收件人角色：[收件人职位/角色]
2. 邮件目的：[目的]
3. 关键信息点：
   - [要点1]
   - [要点2]
   - [要点3]
4. 语气要求：[例如：正式、友好、直接、谨慎]
5. 特殊要求：[可选]

请生成包含适当问候语、正文和结束语的完整邮件。`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300 transition-colors flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回首页
          </Link>
        </div>

        <div className="relative">
          {/* 装饰元素 */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600 opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-600 opacity-10 rounded-full blur-3xl"></div>
          
          <div className="relative bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden backdrop-blur-sm">
            {/* 顶部装饰条 */}
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-white">专业邮件撰写助手</h1>
                <span className="px-3 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded-full">ChatGPT</span>
              </div>
              
              <div className="mb-8">
                <p className="text-gray-300 leading-relaxed">这个提示词可以帮助你撰写各种场景下的专业邮件，包括商业往来、客户沟通、团队协作等。只需提供基本信息和关键点，AI将生成一封结构清晰、语言专业的邮件草稿。</p>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <h2 className="text-xl font-semibold text-white">提示词内容</h2>
                    <div className="ml-auto flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span className="text-xs text-gray-400">4572 次使用</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="text-xs text-gray-400">458 次点赞</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900/50 border border-gray-700 rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between bg-gray-800/70 px-4 py-2 border-b border-gray-700">
                      <div className="flex space-x-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <div className="text-xs text-gray-400">prompt.txt</div>
                      <div></div>
                    </div>
                    <pre className="p-4 text-gray-300 font-mono text-sm whitespace-pre-wrap">
                      请帮我撰写一封专业的商业邮件，根据以下信息：

1. 收件人角色：[收件人职位/角色]
2. 邮件目的：[目的]
3. 关键信息点：
   - [要点1]
   - [要点2]
   - [要点3]
4. 语气要求：[例如：正式、友好、直接、谨慎]
5. 特殊要求：[可选]

请生成包含适当问候语、正文和结束语的完整邮件。
                    </pre>
                    <div className="p-4 border-t border-gray-700">
                      <button
                        onClick={copyToClipboard}
                        className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                          copied 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          {copied ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                          )}
                        </svg>
                        {copied ? '已复制' : '复制提示词'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-white">使用说明</h2>
                  <div className="bg-blue-900/20 border-l-4 border-blue-500 rounded-lg p-4">
                    <ul className="list-disc list-inside space-y-2 text-gray-300">
                      <li>填写所有方括号中的信息，根据实际需求提供详细内容</li>
                      <li>可以根据具体场景调整关键信息点的数量</li>
                      <li>如需更正式的语言，可在特殊要求中注明</li>
                      <li>生成邮件后，根据实际情况调整细节</li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">评论</h2>
                    <div className="text-sm text-gray-400">3 条评论</div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          职
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium text-white">职场新人</h3>
                            <span className="text-sm text-gray-400">2024-01-10</span>
                          </div>
                          <p className="text-gray-300">太有用了！这个提示词帮我生成了一封完美的客户沟通邮件，得到了积极的回应。</p>
                          <div className="mt-3 flex items-center text-sm text-gray-400">
                            <button className="flex items-center hover:text-blue-400">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                              </svg>
                              赞同 (24)
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          市
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium text-white">市场经理</h3>
                            <span className="text-sm text-gray-400">2024-01-25</span>
                          </div>
                          <p className="text-gray-300">我用这个提示词撰写了团队周报邮件，节省了大量时间，而且质量比我自己写的还好！</p>
                          <div className="mt-3 flex items-center text-sm text-gray-400">
                            <button className="flex items-center hover:text-blue-400">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                              </svg>
                              赞同 (16)
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                          销
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium text-white">销售总监</h3>
                            <span className="text-sm text-gray-400">2024-02-05</span>
                          </div>
                          <p className="text-gray-300">建议在关键信息点中增加一项"预期结果"，这样生成的邮件会更有说服力。</p>
                          <div className="mt-3 flex items-center text-sm text-gray-400">
                            <button className="flex items-center hover:text-blue-400">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                              </svg>
                              赞同 (31)
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button className="w-full py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-300 transition-colors">
                    添加评论
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-8 border-t border-gray-700 bg-gray-800/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">相关提示词</h2>
                <a href="#" className="text-sm text-blue-400 hover:text-blue-300">查看更多</a>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="group bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/20">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors">会议纪要生成器</h3>
                      <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">ChatGPT</span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">快速生成专业的会议纪要，记录关键讨论点和后续行动项。</p>
                    <a href="#" className="text-blue-400 hover:text-blue-300 text-sm font-medium inline-flex items-center">
                      查看详情
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </div>
                
                <div className="group bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/20">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors">商业提案模板</h3>
                      <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">ChatGPT</span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">创建结构化的商业提案，包含价值主张和详细实施计划。</p>
                    <a href="#" className="text-blue-400 hover:text-blue-300 text-sm font-medium inline-flex items-center">
                      查看详情
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
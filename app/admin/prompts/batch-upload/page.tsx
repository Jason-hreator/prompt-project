"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function BatchUploadPage() {
  const [uploadType, setUploadType] = useState<'json' | 'csv' | 'manual'>('manual');
  const [jsonData, setJsonData] = useState('');
  const [csvData, setCsvData] = useState('');
  const [uploadStatus, setUploadStatus] = useState<{
    success: boolean;
    message: string;
    count: number;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  
  // 自由上传表单数据
  const [manualForm, setManualForm] = useState({
    title: '',
    content: '',
    category: '',
    model: '',
    description: '',
    instructions: ''
  });
  
  // 表单字段选项
  const categoryOptions = ['效率提升型', '创意生成型', '解决问题型', '知识学习型', '决策辅助型', '内容优化型'];
  const modelOptions = ['ChatGPT', 'Claude', 'Midjourney', 'DALL-E', 'Stable Diffusion', 'Bard', 'LLaMA'];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        
        if (uploadType === 'json') {
          setJsonData(content);
          // 尝试解析JSON以验证格式
          JSON.parse(content);
          setErrors([]);
        } else {
          setCsvData(content);
          // 简单验证CSV格式
          const lines = content.split('\n');
          if (lines.length < 2) {
            setErrors(['CSV文件至少需要包含标题行和一行数据']);
          } else {
            setErrors([]);
          }
        }
      } catch (error) {
        setErrors([`文件解析错误: ${error instanceof Error ? error.message : '未知错误'}`]);
      }
    };

    if (uploadType === 'json') {
      reader.readAsText(file);
    } else {
      reader.readAsText(file);
    }
  };
  
  // 处理自由上传表单变化
  const handleManualInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setManualForm({
      ...manualForm,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setErrors([]);
    
    try {
      let promptsToUpload = [];
      let validationErrors: string[] = [];

      if (uploadType === 'json') {
        const prompts = JSON.parse(jsonData);
        
        // 验证JSON数据格式
        if (!Array.isArray(prompts)) {
          throw new Error('数据格式错误：应为提示词对象数组');
        }

        // 验证每个提示词对象，放宽要求，只要求提示词内容是必填的
        prompts.forEach((prompt, index) => {
          if (!prompt.promptText && !prompt.content) {
            validationErrors.push(`第${index + 1}项缺少提示词内容`);
          }
        });

        if (validationErrors.length > 0) {
          setErrors(validationErrors);
          setIsUploading(false);
          return;
        }

        // 转换数据格式
        promptsToUpload = prompts.map(prompt => ({
          title: prompt.title || '未命名提示词',
          content: prompt.promptText || prompt.content,
          category: prompt.category || '未分类',
          model: prompt.model || 'ChatGPT',
          description: prompt.description || '',
          instructions: prompt.instructions || '',
          status: '待审核'
        }));
      } else if (uploadType === 'csv') {
        // 处理CSV数据
        const lines = csvData.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        
        // 验证CSV标题
        const contentHeaderIndex = headers.findIndex(h => h === 'promptText' || h === 'content');
        if (contentHeaderIndex === -1) {
          validationErrors.push('CSV缺少必要的列: promptText 或 content');
        }

        if (validationErrors.length > 0) {
          setErrors(validationErrors);
          setIsUploading(false);
          return;
        }

        // 解析每行数据
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length !== headers.length) {
            validationErrors.push(`第${i}行的列数与标题行不匹配`);
            continue;
          }

          const rowData: Record<string, string> = {};
          headers.forEach((header, index) => {
            rowData[header] = values[index];
          });

          // 检查是否有提示词内容
          if (!rowData.promptText && !rowData.content) {
            validationErrors.push(`第${i}行缺少提示词内容`);
          }
          
          if (validationErrors.length === 0) {
            promptsToUpload.push({
              title: rowData.title || '未命名提示词',
              content: rowData.promptText || rowData.content,
              category: rowData.category || '未分类',
              model: rowData.model || 'ChatGPT',
              description: rowData.description || '',
              instructions: rowData.instructions || '',
              status: '待审核'
            });
          }
        }
      } else if (uploadType === 'manual') {
        // 处理自由上传表单
        if (!manualForm.content) {
          validationErrors.push('提示词内容是必填项');
        }
        
        if (validationErrors.length > 0) {
          setErrors(validationErrors);
          setIsUploading(false);
          return;
        }
        
        promptsToUpload = [{
          title: manualForm.title || '未命名提示词',
          content: manualForm.content,
          category: manualForm.category || '未分类',
          model: manualForm.model || 'ChatGPT',
          description: manualForm.description || '',
          instructions: manualForm.instructions || '',
          status: '待审核'
        }];
      }

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setIsUploading(false);
        return;
      }

      // 将数据发送到API进行处理
      console.log('准备上传提示词:', promptsToUpload);
      
      // 调用API上传提示词
      const response = await fetch('/api/admin/prompts/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompts: promptsToUpload
        }),
      });
      
      const result = await response.json();
      console.log('上传API响应:', result);
      
      if (result.success) {
        setUploadStatus({
          success: true,
          message: result.message || "上传成功！提示词已进入待审核状态。",
          count: result.data.uploadedCount
        });
        
        // 如果有错误，显示错误信息
        if (result.data.errorCount > 0) {
          setErrors(result.data.errors || ['部分提示词上传失败']);
        }
        
        // 清空表单
        if (uploadType === 'manual') {
          setManualForm({
            title: '',
            content: '',
            category: '',
            model: '',
            description: '',
            instructions: ''
          });
        } else if (uploadType === 'json') {
          setJsonData('');
        } else {
          setCsvData('');
        }
      } else {
        throw new Error(result.error || '上传失败');
      }
    } catch (error) {
      setUploadStatus({
        success: false,
        message: `上传失败: ${error instanceof Error ? error.message : '未知错误'}`,
        count: 0
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">上传提示词</h1>
          <p className="text-gray-600">通过自由输入或批量导入添加提示词</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link 
            href="/admin/prompts" 
            className="text-blue-600 hover:text-blue-800"
          >
            返回提示词列表
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="p-6">
          <div className="mb-6">
            <div className="flex border-b border-gray-200">
              <button
                className={`py-2 px-4 font-medium ${
                  uploadType === 'manual'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setUploadType('manual')}
              >
                自由上传
              </button>
              <button
                className={`py-2 px-4 font-medium ${
                  uploadType === 'json'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setUploadType('json')}
              >
                JSON批量上传
              </button>
              <button
                className={`py-2 px-4 font-medium ${
                  uploadType === 'csv'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setUploadType('csv')}
              >
                CSV批量上传
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {uploadType === 'manual' ? (
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    提示词标题
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={manualForm.title}
                    onChange={handleManualInputChange}
                    placeholder="提供一个描述性的标题"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                    提示词内容 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    value={manualForm.content}
                    onChange={handleManualInputChange}
                    placeholder="输入提示词的完整内容"
                    rows={6}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                      分类
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={manualForm.category}
                      onChange={handleManualInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">选择分类</option>
                      {categoryOptions.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                      AI模型
                    </label>
                    <select
                      id="model"
                      name="model"
                      value={manualForm.model}
                      onChange={handleManualInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">选择AI模型</option>
                      {modelOptions.map((model) => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    描述
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={manualForm.description}
                    onChange={handleManualInputChange}
                    placeholder="简要描述这个提示词的用途和特点"
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-1">
                    使用说明
                  </label>
                  <textarea
                    id="instructions"
                    name="instructions"
                    value={manualForm.instructions}
                    onChange={handleManualInputChange}
                    placeholder="如何使用这个提示词的详细说明"
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
                    上传{uploadType.toUpperCase()}文件 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    id="file-upload"
                    accept={uploadType === 'json' ? '.json' : '.csv'}
                    onChange={handleFileUpload}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-gray-500 text-sm mt-1">
                    请上传包含提示词数据的{uploadType.toUpperCase()}文件
                  </p>
                </div>

                <div className="mb-6">
                  <label htmlFor="data-preview" className="block text-sm font-medium text-gray-700 mb-2">
                    数据预览
                  </label>
                  <textarea
                    id="data-preview"
                    value={uploadType === 'json' ? jsonData : csvData}
                    onChange={(e) => uploadType === 'json' ? setJsonData(e.target.value) : setCsvData(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={10}
                    placeholder={uploadType === 'json' 
                      ? '[{"title": "提示词标题", "content": "提示词内容", "category": "分类", "model": "AI模型", "description": "描述", "instructions": "使用说明"}]'
                      : 'title,content,category,model,description,instructions\n提示词标题,提示词内容,分类,AI模型,描述,使用说明'
                    }
                  ></textarea>
                </div>
              </>
            )}

            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
                <h3 className="font-medium mb-2">验证错误</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium mb-2 text-blue-800">数据格式说明</h3>
              {uploadType === 'manual' ? (
                <p className="text-sm text-blue-700">
                  自由上传模式下，您可以直接输入提示词内容。只有提示词内容是必填项，其他字段为可选。上传后的提示词将进入待审核状态。
                </p>
              ) : uploadType === 'json' ? (
                <div>
                  <p className="text-sm text-blue-700 mb-2">
                    JSON文件应包含一个提示词对象数组，格式如下：
                  </p>
                  <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                    <li>title: 提示词标题</li>
                    <li>content 或 promptText: 提示词内容 (必填)</li>
                    <li>category: 提示词分类</li>
                    <li>model: 适用AI模型</li>
                    <li>description: 提示词描述</li>
                    <li>instructions: 使用说明</li>
                  </ul>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-blue-700 mb-2">
                    CSV文件格式要求：
                  </p>
                  <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                    <li>title: 提示词标题</li>
                    <li>content 或 promptText: 提示词内容 (必填)</li>
                    <li>category: 提示词分类</li>
                    <li>model: 适用AI模型</li>
                    <li>description: 提示词描述</li>
                    <li>instructions: 使用说明</li>
                  </ul>
                </div>
              )}
            </div>

            {uploadStatus && (
              <div className={`p-4 rounded-lg mb-6 ${uploadStatus.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                <p className="font-medium">{uploadStatus.message}</p>
                {uploadStatus.success && (
                  <p className="mt-1">成功上传了 {uploadStatus.count} 个提示词</p>
                )}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isUploading || (uploadType === 'manual' ? !manualForm.content : uploadType === 'json' ? !jsonData : !csvData) || errors.length > 0}
                className={`px-4 py-2 bg-blue-600 text-white rounded-md ${
                  isUploading || (uploadType === 'manual' ? !manualForm.content : uploadType === 'json' ? !jsonData : !csvData) || errors.length > 0
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-blue-700'
                }`}
              >
                {isUploading ? '上传中...' : '上传提示词'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">示例格式</h2>
          {uploadType === 'manual' ? (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">自由上传示例</h3>
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-medium">标题:</span> 专业邮件撰写助手
              </p>
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-medium">内容:</span> 你是一位专业的商务邮件撰写专家。请根据以下信息撰写一封正式的商务邮件：
                <br />
                主题：[邮件主题]<br />
                收件人：[收件人姓名和职位]<br />
                目的：[邮件目的]<br />
                关键点：[需要包含的要点，用逗号分隔]<br />
                语气：[正式/友好/紧急]<br />
                <br />
                请确保邮件语言专业、简洁明了，并包含适当的问候语和结束语。
              </p>
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-medium">分类:</span> 效率提升型
              </p>
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-medium">AI模型:</span> ChatGPT
              </p>
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-medium">描述:</span> 输入主题和关键点，生成专业的商业邮件，适合各种职场场景。
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">使用说明:</span> 替换方括号中的内容，根据实际需求填写相应信息。语气可选择'正式'、'友好'或'紧急'。
              </p>
            </div>
          ) : uploadType === 'json' ? (
            <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
{`[
  {
    "title": "专业邮件撰写助手",
    "content": "你是一位专业的商务邮件撰写专家。请根据以下信息撰写一封正式的商务邮件：\\n\\n主题：[邮件主题]\\n收件人：[收件人姓名和职位]\\n目的：[邮件目的]\\n关键点：[需要包含的要点，用逗号分隔]\\n语气：[正式/友好/紧急]\\n\\n请确保邮件语言专业、简洁明了，并包含适当的问候语和结束语。",
    "category": "效率提升型",
    "model": "ChatGPT",
    "description": "输入主题和关键点，生成专业的商业邮件，适合各种职场场景。",
    "instructions": "替换方括号中的内容，根据实际需求填写相应信息。语气可选择'正式'、'友好'或'紧急'。"
  },
  {
    "title": "科幻风格人物肖像",
    "content": "创建一个未来科幻风格的[性别]人物肖像，具有以下特点：\\n- 背景：[背景描述]\\n- 服装：[服装描述]\\n- 光效：[光效描述]\\n- 姿势：[姿势描述]\\n- 风格参考：[风格参考]\\n\\n使用鲜明的霓虹色彩，高对比度，未来感十足的设计元素。",
    "category": "创意生成型",
    "model": "Midjourney",
    "description": "生成具有未来科技感的人物肖像，包含详细的光效和背景元素。",
    "instructions": "替换方括号中的内容。性别可选择'男性'或'女性'。背景描述可以是'赛博朋克城市'、'太空站'等。服装描述如'未来战士装甲'。"
  }
]`}
            </pre>
          ) : (
            <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
{`title,content,category,model,description,instructions
专业邮件撰写助手,"你是一位专业的商务邮件撰写专家。请根据以下信息撰写一封正式的商务邮件：

主题：[邮件主题]
收件人：[收件人姓名和职位]
目的：[邮件目的]
关键点：[需要包含的要点，用逗号分隔]
语气：[正式/友好/紧急]

请确保邮件语言专业、简洁明了，并包含适当的问候语和结束语。",效率提升型,ChatGPT,输入主题和关键点，生成专业的商业邮件，适合各种职场场景。,"替换方括号中的内容，根据实际需求填写相应信息。语气可选择'正式'、'友好'或'紧急'。"
科幻风格人物肖像,"创建一个未来科幻风格的[性别]人物肖像，具有以下特点：
- 背景：[背景描述]
- 服装：[服装描述]
- 光效：[光效描述]
- 姿势：[姿势描述]
- 风格参考：[风格参考]

使用鲜明的霓虹色彩，高对比度，未来感十足的设计元素。",创意生成型,Midjourney,生成具有未来科技感的人物肖像，包含详细的光效和背景元素。,"替换方括号中的内容。性别可选择'男性'或'女性'。背景描述可以是'赛博朋克城市'、'太空站'等。服装描述如'未来战士装甲'。"`}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
} 
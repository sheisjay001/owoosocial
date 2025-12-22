import { useState } from 'react';
import axios from 'axios';
import { Loader2, Copy, RefreshCw, Calendar, Image as ImageIcon, Globe, Hash, List, Type, MessageSquare } from 'lucide-react';

const tools = [
  { id: 'caption-variations', name: 'Caption Generator', icon: MessageSquare, desc: 'Generate multiple caption styles' },
  { id: 'hashtags', name: 'Hashtag Recommender', icon: Hash, desc: 'Get relevant hashtags for your niche' },
  { id: 'calendar', name: 'Content Calendar', icon: Calendar, desc: 'Plan your weekly/monthly content' },
  { id: 'rewriter', name: 'Post Rewriter', icon: RefreshCw, desc: 'Optimize and improve your drafts' },
  { id: 'carousel', name: 'Carousel Ideas', icon: List, desc: 'Generate slide-by-slide educational content' },
  { id: 'translator', name: 'Translator', icon: Globe, desc: 'Translate captions to other languages' },
  { id: 'image-caption', name: 'Image to Caption', icon: ImageIcon, desc: 'Generate captions from image URLs' },
];

export default function AITools() {
  const [activeTool, setActiveTool] = useState('caption-variations');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({});

  const handleToolChange = (toolId) => {
    setActiveTool(toolId);
    setResult(null);
    setFormData({});
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const endpoints = {
      'caption-variations': '/api/ai/generate-captions',
      'hashtags': '/api/ai/generate-hashtags',
      'calendar': '/api/ai/generate-calendar',
      'rewriter': '/api/ai/rewrite-post',
      'carousel': '/api/ai/generate-carousel',
      'translator': '/api/ai/translate',
      'image-caption': '/api/ai/image-to-caption',
    };

    try {
      const token = localStorage.getItem('authToken');
      const { data } = await axios.post(endpoints[activeTool], formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult(data.data);
    } catch (error) {
      console.error('AI Tool Error:', error);
      alert('Failed to generate content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    switch (activeTool) {
      case 'caption-variations':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
              <input type="text" name="topic" required className="w-full border rounded-md p-2" onChange={handleInputChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
              <select name="platform" className="w-full border rounded-md p-2" onChange={handleInputChange}>
                <option value="Instagram">Instagram</option>
                <option value="Twitter">Twitter</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Facebook">Facebook</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand Context</label>
              <textarea name="brandDescription" className="w-full border rounded-md p-2" onChange={handleInputChange} />
            </div>
          </>
        );
      case 'hashtags':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
              <input type="text" name="topic" required className="w-full border rounded-md p-2" onChange={handleInputChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Niche</label>
              <input type="text" name="niche" placeholder="e.g. Tech, Beauty, Fitness" className="w-full border rounded-md p-2" onChange={handleInputChange} />
            </div>
          </>
        );
      case 'calendar':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timeframe</label>
              <select name="timeframe" className="w-full border rounded-md p-2" onChange={handleInputChange}>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Goals</label>
              <input type="text" name="goals" placeholder="e.g. Brand Awareness, Sales" className="w-full border rounded-md p-2" onChange={handleInputChange} />
            </div>
          </>
        );
      case 'rewriter':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Draft Text</label>
              <textarea name="draft" required rows="5" className="w-full border rounded-md p-2" onChange={handleInputChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Goal</label>
              <input type="text" name="goal" placeholder="e.g. Make it punchier, Improve grammar" className="w-full border rounded-md p-2" onChange={handleInputChange} />
            </div>
          </>
        );
      case 'carousel':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
              <input type="text" name="topic" required className="w-full border rounded-md p-2" onChange={handleInputChange} />
            </div>
          </>
        );
      case 'translator':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
              <textarea name="caption" required rows="4" className="w-full border rounded-md p-2" onChange={handleInputChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Language</label>
              <input type="text" name="language" placeholder="e.g. French, Spanish, Arabic" required className="w-full border rounded-md p-2" onChange={handleInputChange} />
            </div>
          </>
        );
      case 'image-caption':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input type="url" name="imageUrl" placeholder="https://..." required className="w-full border rounded-md p-2" onChange={handleInputChange} />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const renderResult = () => {
    if (!result) return null;

    if (activeTool === 'caption-variations') {
      return (
        <div className="space-y-4">
          {Object.entries(result).map(([style, text]) => (
            <div key={style} className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold capitalize text-blue-600">{style}</span>
                <button onClick={() => copyToClipboard(text)} className="text-gray-400 hover:text-gray-600"><Copy className="w-4 h-4" /></button>
              </div>
              <p className="text-gray-800 whitespace-pre-wrap">{text}</p>
            </div>
          ))}
        </div>
      );
    }

    if (activeTool === 'hashtags') {
      return (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="flex flex-wrap gap-2">
            {result.hashtags?.map((tag, idx) => (
              <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">{tag}</span>
            ))}
          </div>
          <button onClick={() => copyToClipboard(result.hashtags.join(' '))} className="mt-4 text-sm text-blue-600 hover:underline">Copy All</button>
        </div>
      );
    }

    if (activeTool === 'calendar') {
      return (
        <div className="space-y-4">
          {result.calendar?.map((item, idx) => (
            <div key={idx} className="bg-white border rounded-lg p-3 shadow-sm">
              <div className="flex justify-between">
                <span className="font-bold text-gray-800">{item.day}</span>
                <span className="text-xs bg-gray-200 px-2 py-1 rounded">{item.format}</span>
              </div>
              <p className="text-sm font-medium mt-1">{item.topic}</p>
              <p className="text-xs text-gray-500 mt-1">{item.caption_idea}</p>
            </div>
          ))}
        </div>
      );
    }

    if (activeTool === 'rewriter') {
      return (
        <div className="space-y-4">
          <div className="bg-red-50 p-3 rounded border border-red-100">
            <h4 className="text-xs font-bold text-red-800 uppercase mb-1">Original</h4>
            <p className="text-sm text-gray-700">{result.original}</p>
          </div>
          <div className="bg-green-50 p-3 rounded border border-green-100">
            <h4 className="text-xs font-bold text-green-800 uppercase mb-1">Optimized</h4>
            <p className="text-sm text-gray-800">{result.optimized}</p>
            <button onClick={() => copyToClipboard(result.optimized)} className="mt-2 text-xs text-green-700 hover:underline">Copy Optimized</button>
          </div>
          {result.improvements && (
            <ul className="list-disc list-inside text-xs text-gray-500">
              {result.improvements.map((imp, i) => <li key={i}>{imp}</li>)}
            </ul>
          )}
        </div>
      );
    }

    if (activeTool === 'carousel') {
      return (
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-bold text-lg mb-4">{result.title}</h3>
          <div className="space-y-3">
            {result.slides?.map((slide, idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <span className="bg-blue-100 text-blue-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                  {slide.slide}
                </span>
                <p className="text-sm text-gray-700">{slide.content}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeTool === 'translator' || activeTool === 'image-caption') {
       // Both return similar structures roughly
       return (
         <div className="bg-gray-50 p-4 rounded-lg border">
           <p className="text-gray-800 whitespace-pre-wrap">{result.translated || result.caption}</p>
           {result.hashtags && (
              <div className="mt-2 flex flex-wrap gap-2">
                {result.hashtags.map((tag, idx) => (
                  <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-1 rounded">{tag}</span>
                ))}
              </div>
           )}
           <button onClick={() => copyToClipboard(result.translated || result.caption)} className="mt-3 text-sm text-blue-600 hover:underline">Copy</button>
         </div>
       );
    }

    return <pre className="text-xs overflow-auto">{JSON.stringify(result, null, 2)}</pre>;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI Social Media Tools</h1>
        <p className="text-gray-500 mt-2">Specialized tools to boost your content game.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="space-y-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => handleToolChange(tool.id)}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                  activeTool === tool.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-transparent hover:border-gray-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <div>
                  <div className="font-medium text-sm">{tool.name}</div>
                  <div className={`text-xs ${activeTool === tool.id ? 'text-blue-100' : 'text-gray-400'}`}>{tool.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border p-6 min-h-[500px]">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              {tools.find(t => t.id === activeTool)?.name}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Input Section */}
              <div className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {renderForm()}
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}
                  </button>
                </form>
              </div>

              {/* Output Section */}
              <div className="border-l pl-8 border-gray-100">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Results</h3>
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <p>AI is thinking...</p>
                  </div>
                ) : result ? (
                  renderResult()
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-300 border-2 border-dashed rounded-lg">
                    <p>Result will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

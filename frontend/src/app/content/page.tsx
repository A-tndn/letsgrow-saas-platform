import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { api } from '../lib/api';
import { 
  Sparkles, 
  Copy,
  Send,
  Calendar,
  Hash,
  Type,
  Zap,
  RefreshCw,
  MessageCircle,
  Clock,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Platform {
  id: string;
  name: string;
  max_text_length: number;
}

interface SocialAccount {
  id: number;
  platform: string;
  platform_display_name: string;
  username: string;
  status: string;
  is_active: boolean;
}

interface GeneratedContent {
  text: string;
  hashtags: string[];
  character_count: number;
  platform_limit: number;
}

export default function ContentGenerationPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [customText, setCustomText] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  const { user, logout } = useAuth();

  useEffect(() => {
    fetchPlatforms();
    fetchSocialAccounts();
  }, []);

  const fetchPlatforms = async () => {
    try {
      const response = await api.get('/social/platforms');
      if (response.data.success) {
        setPlatforms(response.data.platforms);
        if (response.data.platforms.length > 0) {
          setSelectedPlatform(response.data.platforms[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch platforms:', error);
    }
  };

  const fetchSocialAccounts = async () => {
    try {
      const response = await api.get('/social/accounts');
      if (response.data.success) {
        const activeAccounts = response.data.accounts.filter((acc: SocialAccount) => acc.is_active);
        setSocialAccounts(activeAccounts);
        if (activeAccounts.length > 0) {
          setSelectedAccount(activeAccounts[0].id.toString());
        }
      }
    } catch (error) {
      console.error('Failed to fetch social accounts:', error);
    }
  };

  const generateContent = async () => {
    if (!selectedPlatform || !topic.trim()) {
      toast.error('Please select a platform and enter a topic');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await api.post('/social/generate-content', {
        platform: selectedPlatform,
        topic: topic.trim(),
        tone,
        length
      });

      if (response.data.success) {
        setGeneratedContent(response.data.content);
        setCustomText(response.data.content.text);
        toast.success('Content generated successfully! ✨');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  const schedulePost = async () => {
    if (!selectedAccount || !customText.trim()) {
      toast.error('Please select an account and enter content');
      return;
    }

    setIsScheduling(true);

    try {
      let scheduledAt = null;
      if (scheduledDate && scheduledTime) {
        scheduledAt = `${scheduledDate}T${scheduledTime}:00Z`;
      }

      const response = await api.post('/social/posts', {
        social_account_id: parseInt(selectedAccount),
        text_content: customText,
        hashtags: generatedContent?.hashtags || [],
        scheduled_at: scheduledAt
      });

      if (response.data.success) {
        if (scheduledAt) {
          toast.success('Post scheduled successfully! 📅');
        } else {
          toast.success('Post saved as draft! 📝');
        }

        // Reset form
        setTopic('');
        setCustomText('');
        setGeneratedContent(null);
        setScheduledDate('');
        setScheduledTime('');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to schedule post');
    } finally {
      setIsScheduling(false);
    }
  };

  const copyToClipboard = () => {
    if (customText) {
      navigator.clipboard.writeText(customText);
      toast.success('Content copied to clipboard! 📋');
    }
  };

  const getCharacterCount = () => {
    return customText.length;
  };

  const getCharacterLimit = () => {
    if (!selectedPlatform || platforms.length === 0) return 280;
    const platform = platforms.find(p => p.id === selectedPlatform);
    return platform?.max_text_length || 280;
  };

  const isOverLimit = () => {
    return getCharacterCount() > getCharacterLimit();
  };

  const selectedAccountData = socialAccounts.find(acc => acc.id.toString() === selectedAccount);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link href="/" className="text-2xl font-bold text-indigo-600">
                  LetsGrow
                </Link>
                <span className="ml-4 text-gray-500">Content Generator</span>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/social-accounts"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Social Accounts
                </Link>
                <span className="text-gray-600">Welcome, {user?.first_name}!</span>
                <button
                  onClick={logout}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <Sparkles className="h-8 w-8 text-indigo-600 mr-3" />
              AI Content Generator
            </h1>
            <p className="text-gray-600">
              Generate engaging social media content with AI, then schedule or post immediately.
            </p>
          </div>

          {socialAccounts.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <p className="text-yellow-800">
                You need to connect social media accounts first. 
                <Link href="/social-accounts" className="ml-2 font-medium underline hover:no-underline">
                  Connect accounts →
                </Link>
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Content Generation Form */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Zap className="h-5 w-5 text-indigo-600 mr-2" />
                Generate Content
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform
                  </label>
                  <select
                    value={selectedPlatform}
                    onChange={(e) => setSelectedPlatform(e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {platforms.map((platform) => (
                      <option key={platform.id} value={platform.id}>
                        {platform.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Topic or Idea
                  </label>
                  <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    rows={3}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., 'productivity tips for entrepreneurs', 'latest trends in AI', 'benefits of remote work'"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tone
                    </label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="professional">Professional</option>
                      <option value="casual">Casual</option>
                      <option value="enthusiastic">Enthusiastic</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Length
                    </label>
                    <select
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="short">Short</option>
                      <option value="medium">Medium</option>
                      <option value="long">Long</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={generateContent}
                  disabled={isGenerating || !topic.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Content
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Content Preview & Scheduling */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Type className="h-5 w-5 text-indigo-600 mr-2" />
                Content Preview
              </h2>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Post Content
                    </label>
                    <button
                      onClick={copyToClipboard}
                      disabled={!customText}
                      className="inline-flex items-center px-2 py-1 text-xs text-gray-600 hover:text-gray-900 disabled:opacity-50"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </button>
                  </div>
                  <textarea
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    rows={6}
                    className={`w-full border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                      isOverLimit() ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Generated content will appear here, or write your own..."
                  />
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-xs ${isOverLimit() ? 'text-red-600' : 'text-gray-500'}`}>
                      {getCharacterCount()}/{getCharacterLimit()} characters
                    </span>
                    {isOverLimit() && (
                      <span className="text-xs text-red-600">Over limit!</span>
                    )}
                  </div>
                </div>

                {generatedContent?.hashtags && generatedContent.hashtags.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Suggested Hashtags
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {generatedContent.hashtags.map((hashtag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                          <Hash className="h-3 w-3 mr-1" />
                          {hashtag.replace('#', '')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Post to Account
                  </label>
                  <select
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={socialAccounts.length === 0}
                  >
                    <option value="">Select account</option>
                    {socialAccounts.map((account) => (
                      <option key={account.id} value={account.id.toString()}>
                        {account.platform_display_name} - @{account.username}
                      </option>
                    ))}
                  </select>
                  {selectedAccountData && (
                    <p className="text-xs text-gray-500 mt-1">
                      Status: {selectedAccountData.status}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Schedule Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Schedule Time
                    </label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={schedulePost}
                    disabled={isScheduling || !customText.trim() || !selectedAccount || isOverLimit()}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isScheduling ? (
                      <>
                        <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                        Scheduling...
                      </>
                    ) : scheduledDate && scheduledTime ? (
                      <>
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Post
                      </>
                    ) : (
                      <>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Save as Draft
                      </>
                    )}
                  </button>
                </div>

                {scheduledDate && scheduledTime && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-sm text-blue-800">
                        Will be posted on {new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Content Generation Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <Sparkles className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900">Be Specific</h4>
                <p className="text-sm text-gray-600">
                  More specific topics generate better, more targeted content
                </p>
              </div>
              <div className="text-center">
                <Hash className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900">Use Hashtags</h4>
                <p className="text-sm text-gray-600">
                  AI suggests relevant hashtags to increase your reach
                </p>
              </div>
              <div className="text-center">
                <Calendar className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900">Schedule Smart</h4>
                <p className="text-sm text-gray-600">
                  Schedule posts for optimal engagement times
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

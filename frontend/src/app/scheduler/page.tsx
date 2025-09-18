import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { api } from '../lib/api';
import { 
  Calendar, 
  Clock,
  Edit,
  Trash2,
  Send,
  Eye,
  RefreshCw,
  MessageCircle,
  Hash,
  User,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface SocialPost {
  id: number;
  social_account: {
    id: number;
    platform: string;
    platform_display_name: string;
    username: string;
  };
  text_content: string;
  hashtags: string[];
  mentions: string[];
  scheduled_at: string | null;
  posted_at: string | null;
  status: string;
  error_message: string | null;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  engagement_rate: number;
  is_scheduled: boolean;
  is_posted: boolean;
  created_at: string;
}

export default function PostSchedulerPage() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<SocialPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    text_content: '',
    scheduled_at: ''
  });

  const { user, logout } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [posts, statusFilter, searchQuery]);

  const fetchPosts = async () => {
    try {
      const response = await api.get('/social/posts', {
        params: { limit: 50 }
      });
      if (response.data.success) {
        setPosts(response.data.posts);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  const filterPosts = () => {
    let filtered = posts;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(post => post.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(post =>
        post.text_content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.social_account.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPosts(filtered);
  };

  const handleEditPost = (post: SocialPost) => {
    setSelectedPost(post);
    setEditForm({
      text_content: post.text_content,
      scheduled_at: post.scheduled_at 
        ? new Date(post.scheduled_at).toISOString().slice(0, 16)
        : ''
    });
    setShowEditModal(true);
  };

  const handleUpdatePost = async () => {
    if (!selectedPost) return;

    try {
      const response = await api.put(`/social/posts/${selectedPost.id}`, {
        text_content: editForm.text_content,
        scheduled_at: editForm.scheduled_at ? editForm.scheduled_at + ':00Z' : null
      });

      if (response.data.success) {
        toast.success('Post updated successfully!');
        await fetchPosts();
        setShowEditModal(false);
        setSelectedPost(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update post');
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const response = await api.delete(`/social/posts/${postId}`);
      if (response.data.success) {
        toast.success('Post deleted successfully');
        await fetchPosts();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete post');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'posted': return CheckCircle;
      case 'scheduled': return Clock;
      case 'draft': return Edit;
      case 'failed': return XCircle;
      default: return AlertCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'posted': return 'text-green-600 bg-green-100';
      case 'scheduled': return 'text-blue-600 bg-blue-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const getStatusCounts = () => {
    return {
      all: posts.length,
      draft: posts.filter(p => p.status === 'draft').length,
      scheduled: posts.filter(p => p.status === 'scheduled').length,
      posted: posts.filter(p => p.status === 'posted').length,
      failed: posts.filter(p => p.status === 'failed').length
    };
  };

  const statusCounts = getStatusCounts();

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading posts...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

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
                <span className="ml-4 text-gray-500">Post Scheduler</span>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  href="/content"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Create Content
                </Link>
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <Calendar className="h-8 w-8 text-indigo-600 mr-3" />
              Post Scheduler
            </h1>
            <p className="text-gray-600">
              Manage your scheduled posts and track their performance.
            </p>
          </div>

          {/* Status Filters */}
          <div className="bg-white rounded-lg shadow-sm border mb-6">
            <div className="p-4">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'all', label: 'All Posts', count: statusCounts.all },
                    { key: 'draft', label: 'Drafts', count: statusCounts.draft },
                    { key: 'scheduled', label: 'Scheduled', count: statusCounts.scheduled },
                    { key: 'posted', label: 'Posted', count: statusCounts.posted },
                    { key: 'failed', label: 'Failed', count: statusCounts.failed }
                  ].map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => setStatusFilter(filter.key)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        statusFilter === filter.key
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {filter.label} ({filter.count})
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    onClick={fetchPosts}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Posts List */}
          <div className="bg-white rounded-lg shadow-sm border">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No posts found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {posts.length === 0 
                    ? "Start by creating your first post."
                    : "Try adjusting your filters or search query."
                  }
                </p>
                <div className="mt-6">
                  <Link
                    href="/content"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Create New Post
                  </Link>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredPosts.map((post) => {
                  const StatusIcon = getStatusIcon(post.status);

                  return (
                    <div key={post.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {post.status}
                            </span>
                            <span className="text-sm text-gray-600">
                              {post.social_account.platform_display_name} - @{post.social_account.username}
                            </span>
                          </div>

                          <p className="text-gray-900 mb-2">
                            {truncateText(post.text_content)}
                          </p>

                          {post.hashtags && post.hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {post.hashtags.slice(0, 3).map((hashtag, index) => (
                                <span key={index} className="inline-flex items-center text-xs text-indigo-600">
                                  <Hash className="h-3 w-3 mr-1" />
                                  {hashtag.replace('#', '')}
                                </span>
                              ))}
                              {post.hashtags.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{post.hashtags.length - 3} more
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {post.scheduled_at && (
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                Scheduled for {formatDate(post.scheduled_at)}
                              </div>
                            )}
                            {post.posted_at && (
                              <div className="flex items-center">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Posted {formatDate(post.posted_at)}
                              </div>
                            )}
                            <span>Created {formatDate(post.created_at)}</span>
                          </div>

                          {post.is_posted && (
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                              <span className="flex items-center">
                                ❤️ {post.likes_count}
                              </span>
                              <span className="flex items-center">
                                💬 {post.comments_count}
                              </span>
                              <span className="flex items-center">
                                🔄 {post.shares_count}
                              </span>
                              {post.engagement_rate > 0 && (
                                <span className="text-green-600 font-medium">
                                  {post.engagement_rate}% engagement
                                </span>
                              )}
                            </div>
                          )}

                          {post.error_message && (
                            <div className="mt-2 text-sm text-red-600">
                              Error: {post.error_message}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          {post.status !== 'posted' && (
                            <button
                              onClick={() => handleEditPost(post)}
                              className="inline-flex items-center p-2 text-gray-400 hover:text-gray-600"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="inline-flex items-center p-2 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Edit Post Modal */}
        {showEditModal && selectedPost && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Edit Post
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Post Content
                      </label>
                      <textarea
                        value={editForm.text_content}
                        onChange={(e) => setEditForm(prev => ({ ...prev, text_content: e.target.value }))}
                        rows={6}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Scheduled Time (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={editForm.scheduled_at}
                        onChange={(e) => setEditForm(prev => ({ ...prev, scheduled_at: e.target.value }))}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div className="text-sm text-gray-500">
                      Platform: {selectedPost.social_account.platform_display_name} - @{selectedPost.social_account.username}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    onClick={handleUpdatePost}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Update Post
                  </button>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedPost(null);
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

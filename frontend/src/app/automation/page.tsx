import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { api } from '../lib/api';
import { 
  Settings, 
  Play,
  Pause,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Activity,
  TrendingUp,
  Clock,
  Zap,
  Target,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger_type: string;
  trigger_conditions: any;
  action_type: string;
  action_parameters: any;
  is_active: boolean;
  created_at: string;
  execution_count: number;
  success_rate: number;
  last_executed: string | null;
}

interface AutomationStats {
  total_rules: number;
  active_rules: number;
  total_executions: number;
  executions_24h: number;
  is_running: boolean;
  success_rate: number;
}

interface RuleTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  trigger_type: string;
  action_type: string;
  template: any;
}

export default function AutomationDashboardPage() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [stats, setStats] = useState<AutomationStats | null>(null);
  const [templates, setTemplates] = useState<RuleTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<RuleTemplate | null>(null);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    trigger_type: 'time_based',
    action_type: 'create_post'
  });

  const { user, logout } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchRules(),
        fetchStats(),
        fetchTemplates()
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRules = async () => {
    try {
      const response = await api.get('/automation/rules');
      if (response.data.success) {
        setRules(response.data.rules);
      }
    } catch (error) {
      console.error('Failed to fetch automation rules:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/automation/status');
      if (response.data.success) {
        setStats(response.data.automation_stats);
      }
    } catch (error) {
      console.error('Failed to fetch automation stats:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/automation/templates');
      if (response.data.success) {
        setTemplates(response.data.templates);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const handleToggleAutomation = async () => {
    if (!stats) return;

    try {
      const endpoint = stats.is_running ? '/automation/stop' : '/automation/start';
      const response = await api.post(endpoint);

      if (response.data.success) {
        toast.success(response.data.message);
        await fetchStats();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to toggle automation');
    }
  };

  const handleToggleRule = async (ruleId: string) => {
    try {
      const response = await api.post(`/automation/rules/${ruleId}/toggle`);
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchRules();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to toggle rule');
    }
  };

  const handleDeleteRule = async (ruleId: string, ruleName: string) => {
    if (!confirm(`Are you sure you want to delete "${ruleName}"?`)) {
      return;
    }

    try {
      const response = await api.delete(`/automation/rules/${ruleId}`);
      if (response.data.success) {
        toast.success('Rule deleted successfully');
        await fetchRules();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete rule');
    }
  };

  const handleCreateFromTemplate = (template: RuleTemplate) => {
    setSelectedTemplate(template);
    setCreateForm({
      name: template.name,
      description: template.description,
      trigger_type: template.trigger_type,
      action_type: template.action_type
    });
    setShowCreateModal(true);
  };

  const handleCreateRule = async () => {
    if (!createForm.name.trim()) {
      toast.error('Please enter a rule name');
      return;
    }

    try {
      const ruleData = {
        name: createForm.name,
        description: createForm.description,
        trigger_type: createForm.trigger_type,
        action_type: createForm.action_type,
        trigger_conditions: selectedTemplate?.template.trigger_conditions || {},
        action_parameters: selectedTemplate?.template.action_parameters || {}
      };

      const response = await api.post('/automation/rules', ruleData);
      if (response.data.success) {
        toast.success('Automation rule created successfully! 🎉');
        setShowCreateModal(false);
        setSelectedTemplate(null);
        setCreateForm({ name: '', description: '', trigger_type: 'time_based', action_type: 'create_post' });
        await fetchRules();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create rule');
    }
  };

  const getTriggerTypeLabel = (type: string) => {
    const labels = {
      time_based: 'Time Based',
      engagement_based: 'Engagement Based',
      trending_topic: 'Trending Topic',
      follower_milestone: 'Follower Milestone',
      content_performance: 'Content Performance'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getActionTypeLabel = (type: string) => {
    const labels = {
      create_post: 'Create Post',
      schedule_post: 'Schedule Post',
      engage_with_content: 'Engage with Content',
      follow_users: 'Follow Users',
      analyze_performance: 'Analyze Performance'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatusIcon = (isActive: boolean, successRate: number) => {
    if (!isActive) return XCircle;
    if (successRate >= 90) return CheckCircle;
    if (successRate >= 70) return AlertCircle;
    return XCircle;
  };

  const getStatusColor = (isActive: boolean, successRate: number) => {
    if (!isActive) return 'text-gray-500';
    if (successRate >= 90) return 'text-green-500';
    if (successRate >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading automation dashboard...</p>
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
                <span className="ml-4 text-gray-500">Automation</span>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/content"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Content
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                  <Zap className="h-8 w-8 text-indigo-600 mr-3" />
                  Automation Dashboard
                </h1>
                <p className="text-gray-600">
                  Manage your AI-powered automation rules and monitor performance.
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Rule
                </button>
                <button
                  onClick={handleToggleAutomation}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${
                    stats?.is_running
                      ? 'text-red-700 bg-red-100 hover:bg-red-200'
                      : 'text-green-700 bg-green-100 hover:bg-green-200'
                  }`}
                >
                  {stats?.is_running ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Stop Automation
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Start Automation
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <Settings className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Rules</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_rules}</p>
                    <p className="text-sm text-gray-600">{stats.active_rules} active</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <Activity className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Executions</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_executions}</p>
                    <p className="text-sm text-gray-600">{stats.executions_24h} today</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Success Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.success_rate.toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    stats.is_running ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {stats.is_running ? (
                      <Play className="h-5 w-5 text-green-600" />
                    ) : (
                      <Pause className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className={`text-2xl font-bold ${stats.is_running ? 'text-green-600' : 'text-gray-600'}`}>
                      {stats.is_running ? 'Running' : 'Stopped'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Automation Rules */}
          <div className="bg-white rounded-lg shadow-sm border mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Automation Rules ({rules.length})
                </h2>
                <button
                  onClick={fetchRules}
                  className="inline-flex items-center p-2 text-gray-400 hover:text-gray-600"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {rules.length === 0 ? (
                <div className="text-center py-12">
                  <Settings className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No automation rules</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating your first automation rule.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Rule
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {rules.map((rule) => {
                    const StatusIcon = getStatusIcon(rule.is_active, rule.success_rate);
                    const statusColor = getStatusColor(rule.is_active, rule.success_rate);

                    return (
                      <div key={rule.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <StatusIcon className={`h-5 w-5 ${statusColor}`} />
                              <h3 className="text-lg font-semibold text-gray-900">{rule.name}</h3>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                rule.is_active 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {rule.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>

                            <p className="text-gray-600 mb-3">{rule.description}</p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="font-medium text-gray-900">Trigger</p>
                                <p className="text-gray-600">{getTriggerTypeLabel(rule.trigger_type)}</p>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Action</p>
                                <p className="text-gray-600">{getActionTypeLabel(rule.action_type)}</p>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Executions</p>
                                <p className="text-gray-600">{rule.execution_count}</p>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Success Rate</p>
                                <p className="text-gray-600">{rule.success_rate.toFixed(1)}%</p>
                              </div>
                            </div>

                            {rule.last_executed && (
                              <p className="text-xs text-gray-500 mt-2">
                                Last executed: {new Date(rule.last_executed).toLocaleString()}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => handleToggleRule(rule.id)}
                              className="inline-flex items-center p-2 text-gray-400 hover:text-gray-600"
                              title={rule.is_active ? 'Deactivate' : 'Activate'}
                            >
                              {rule.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </button>
                            <button
                              className="inline-flex items-center p-2 text-gray-400 hover:text-gray-600"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteRule(rule.id, rule.name)}
                              className="inline-flex items-center p-2 text-gray-400 hover:text-red-600"
                              title="Delete"
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

          {/* Rule Templates */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Rule Templates
              </h2>
              <p className="text-sm text-gray-600">
                Quick start with pre-built automation templates.
              </p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 cursor-pointer">
                    <div className="flex items-center mb-3">
                      <Target className="h-6 w-6 text-indigo-600 mr-2" />
                      <div>
                        <h3 className="font-medium text-gray-900">{template.name}</h3>
                        <p className="text-xs text-indigo-600">{template.category}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                    <button
                      onClick={() => handleCreateFromTemplate(template)}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded text-sm font-medium"
                    >
                      Use Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Create Rule Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {selectedTemplate ? `Create Rule from Template: ${selectedTemplate.name}` : 'Create Automation Rule'}
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rule Name *
                      </label>
                      <input
                        type="text"
                        value={createForm.name}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter rule name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={createForm.description}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Describe what this rule does"
                      />
                    </div>

                    {selectedTemplate && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                          <strong>Template:</strong> {selectedTemplate.description}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          Trigger: {getTriggerTypeLabel(selectedTemplate.trigger_type)} • 
                          Action: {getActionTypeLabel(selectedTemplate.action_type)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    onClick={handleCreateRule}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Create Rule
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setSelectedTemplate(null);
                      setCreateForm({ name: '', description: '', trigger_type: 'time_based', action_type: 'create_post' });
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

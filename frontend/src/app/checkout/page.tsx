import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import { Loader2, Check, CreditCard, Shield, ArrowLeft } from 'lucide-react';
import { ProtectedRoute } from '../components/ProtectedRoute';

interface Plan {
  id: string;
  name: string;
  monthly_price: number;
  yearly_price: number;
  features: {
    social_accounts: number;
    ai_posts_per_month: number;
    team_members: number;
    support_level: string;
    analytics: string;
    automation: string;
  };
  savings_yearly: number;
}

export default function CheckoutPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const planParam = searchParams?.get('plan');
    const cycleParam = searchParams?.get('cycle') as 'monthly' | 'yearly';

    if (cycleParam && ['monthly', 'yearly'].includes(cycleParam)) {
      setBillingCycle(cycleParam);
    }

    fetchPlans(planParam);
  }, [searchParams]);

  const fetchPlans = async (selectedPlanId?: string | null) => {
    try {
      const response = await api.get('/billing/plans');
      if (response.data.success) {
        setPlans(response.data.plans);

        // Auto-select plan if specified in URL
        if (selectedPlanId) {
          const plan = response.data.plans.find((p: Plan) => p.id === selectedPlanId);
          if (plan) {
            setSelectedPlan(plan);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      setError('Failed to load pricing plans');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
  };

  const handleCheckout = async () => {
    if (!selectedPlan) {
      setError('Please select a plan');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const response = await api.post('/billing/create-checkout-session', {
        plan_id: selectedPlan.id,
        billing_cycle: billingCycle
      });

      if (response.data.success) {
        if (response.data.demo_mode) {
          // Demo mode - redirect to dashboard
          router.push(response.data.redirect_url);
        } else {
          // Redirect to Stripe Checkout
          window.location.href = response.data.checkout_url;
        }
      } else {
        setError(response.data.error || 'Checkout failed');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      setError(error.response?.data?.error || 'Checkout failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const getPrice = (plan: Plan) => {
    return billingCycle === 'yearly' ? plan.yearly_price : plan.monthly_price;
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600" />
            <p className="mt-2 text-gray-600">Loading checkout...</p>
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
              <Link href="/" className="text-2xl font-bold text-indigo-600">
                LetsGrow
              </Link>
              <div className="flex items-center space-x-4">
                <Link
                  href="/pricing"
                  className="flex items-center text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Pricing
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">
              Complete Your Subscription
            </h1>
            <p className="mt-2 text-gray-600">
              Welcome {user?.first_name}! Choose your plan to get started.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Plan Selection */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Choose Your Plan
              </h2>

              {/* Billing Toggle */}
              <div className="mb-6 flex justify-center">
                <div className="relative bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`relative py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      billingCycle === 'monthly'
                        ? 'bg-white text-gray-900 shadow'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle('yearly')}
                    className={`relative py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      billingCycle === 'yearly'
                        ? 'bg-white text-gray-900 shadow'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Yearly
                    <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Save 20%
                    </span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => handleSelectPlan(plan)}
                    className={`cursor-pointer border rounded-lg p-4 transition-all ${
                      selectedPlan?.id === plan.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className={`w-4 h-4 rounded-full border-2 mr-3 ${
                            selectedPlan?.id === plan.id
                              ? 'border-indigo-500 bg-indigo-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {selectedPlan?.id === plan.id && (
                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{plan.name}</h3>
                          <p className="text-sm text-gray-500">
                            {plan.features.social_accounts === -1 ? 'Unlimited' : plan.features.social_accounts} accounts, 
                            {plan.features.ai_posts_per_month === -1 ? ' unlimited' : ` ${plan.features.ai_posts_per_month}`} posts/month
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          ${getPrice(plan)}
                        </p>
                        <p className="text-sm text-gray-500">
                          /{billingCycle === 'monthly' ? 'month' : 'year'}
                        </p>
                        {billingCycle === 'yearly' && (
                          <p className="text-xs text-green-600 font-medium">
                            Save ${plan.savings_yearly * 12}/year
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                {selectedPlan ? (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          LetsGrow {selectedPlan.name}
                        </h3>
                        <p className="text-sm text-gray-500 capitalize">
                          {billingCycle} billing
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          ${getPrice(selectedPlan)}
                        </p>
                        <p className="text-sm text-gray-500">
                          /{billingCycle === 'monthly' ? 'month' : 'year'}
                        </p>
                      </div>
                    </div>

                    <div className="border-t pt-4 mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">What's included:</h4>
                      <ul className="space-y-2">
                        <li className="flex items-center text-sm text-gray-600">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          {selectedPlan.features.social_accounts === -1 ? 'Unlimited' : selectedPlan.features.social_accounts} social media accounts
                        </li>
                        <li className="flex items-center text-sm text-gray-600">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          {selectedPlan.features.ai_posts_per_month === -1 ? 'Unlimited' : selectedPlan.features.ai_posts_per_month.toLocaleString()} AI posts/month
                        </li>
                        <li className="flex items-center text-sm text-gray-600">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          {selectedPlan.features.analytics} analytics
                        </li>
                        <li className="flex items-center text-sm text-gray-600">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          {selectedPlan.features.support_level} support
                        </li>
                      </ul>
                    </div>

                    {billingCycle === 'yearly' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-green-700 font-medium">
                          🎉 You're saving ${selectedPlan.savings_yearly * 12} with yearly billing!
                        </p>
                      </div>
                    )}

                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                      </div>
                    )}

                    <button
                      onClick={handleCheckout}
                      disabled={isProcessing}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Continue to Payment
                        </>
                      )}
                    </button>

                    <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
                      <Shield className="h-4 w-4 mr-1" />
                      Secure payment powered by Stripe
                    </div>
                  </>
                ) : (
                  <div className="text-center text-gray-500">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Please select a plan to continue</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500 mb-4">
              Trusted by thousands of creators and businesses worldwide
            </p>
            <div className="flex justify-center space-x-8 text-gray-400">
              <div className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                <span className="text-sm">SSL Encrypted</span>
              </div>
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                <span className="text-sm">Secure Payments</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 mr-2" />
                <span className="text-sm">14-Day Free Trial</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

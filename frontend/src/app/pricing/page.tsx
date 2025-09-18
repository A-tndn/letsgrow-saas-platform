import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, Zap, Crown, Building2, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 19,
    description: 'Perfect for individual creators getting started',
    features: [
      '5 social media accounts',
      '1,000 AI-generated posts/month',
      'Basic analytics and reports',
      'Email support',
      'Content scheduling',
      'Basic automation rules'
    ],
    limitations: [
      'Limited integrations',
      'Standard support response time'
    ],
    popular: false,
    icon: Zap,
    color: 'indigo'
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 49,
    description: 'Ideal for growing businesses and agencies',
    features: [
      '15 social media accounts',
      '5,000 AI-generated posts/month',
      'Advanced analytics and weekly reports',
      'Growth bot automation',
      'Personal content analysis',
      'Priority support',
      'Team collaboration (up to 3 users)',
      'Custom branding',
      'Advanced scheduling'
    ],
    limitations: [],
    popular: true,
    icon: Crown,
    color: 'purple'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    description: 'For large teams and agencies with custom needs',
    features: [
      'Unlimited social accounts',
      'Unlimited AI-generated content',
      'Custom integrations and API access',
      'White-label options',
      'Dedicated account manager',
      'Custom training and onboarding',
      'Advanced team management',
      'SLA guarantees',
      'Custom reporting'
    ],
    limitations: [],
    popular: false,
    icon: Building2,
    color: 'emerald'
  }
];

const faqs = [
  {
    question: 'Can I change my plan anytime?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and billing is prorated.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, MasterCard, American Express) and PayPal through our secure Stripe integration.'
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes! All plans come with a 14-day free trial. No credit card required to start.'
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Absolutely. You can cancel your subscription at any time from your account settings. No cancellation fees.'
  },
  {
    question: 'What happens to my data if I cancel?',
    answer: 'Your data remains accessible for 30 days after cancellation, giving you time to export or reactivate your account.'
  },
  {
    question: 'Do you offer custom enterprise plans?',
    answer: 'Yes, we can create custom plans for large organizations with specific needs. Contact our sales team for details.'
  }
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  const getColorClasses = (color: string) => {
    const colors = {
      indigo: {
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        text: 'text-indigo-600',
        button: 'bg-indigo-600 hover:bg-indigo-700',
        icon: 'text-indigo-500'
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-600',
        button: 'bg-purple-600 hover:bg-purple-700',
        icon: 'text-purple-500'
      },
      emerald: {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-600',
        button: 'bg-emerald-600 hover:bg-emerald-700',
        icon: 'text-emerald-500'
      }
    };
    return colors[color as keyof typeof colors] || colors.indigo;
  };

  const handleSelectPlan = async (planId: string) => {
    setIsLoading(planId);

    try {
      if (!isAuthenticated) {
        // Store selected plan and redirect to register
        localStorage.setItem('selected_plan', planId);
        router.push('/register');
        return;
      }

      // If user is authenticated, redirect to checkout
      router.push(`/checkout?plan=${planId}&cycle=${billingCycle}`);
    } catch (error) {
      console.error('Plan selection error:', error);
    } finally {
      setIsLoading(null);
    }
  };

  const getPrice = (basePrice: number) => {
    if (billingCycle === 'yearly') {
      return Math.round(basePrice * 0.8); // 20% discount for yearly
    }
    return basePrice;
  };

  return (
    <div className="bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              LetsGrow
            </Link>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Choose Your Growth Plan
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Scale your social media presence with AI-powered automation. Start your free trial today.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="mt-8 flex justify-center">
          <div className="relative bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`relative py-2 px-6 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`relative py-2 px-6 rounded-md text-sm font-medium transition-colors ${
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

        {/* Pricing Cards */}
        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
          {plans.map((plan) => {
            const colors = getColorClasses(plan.color);
            const IconComponent = plan.icon;
            const price = getPrice(plan.price);

            return (
              <div
                key={plan.id}
                className={`relative border rounded-lg shadow-sm divide-y divide-gray-200 ${
                  plan.popular
                    ? 'border-purple-500 shadow-lg scale-105'
                    : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center">
                    <IconComponent className={`h-8 w-8 ${colors.icon}`} />
                    <h2 className="ml-3 text-2xl font-bold text-gray-900">{plan.name}</h2>
                  </div>

                  <p className="mt-4 text-gray-500">{plan.description}</p>

                  <p className="mt-8">
                    <span className="text-4xl font-extrabold text-gray-900">${price}</span>
                    <span className="text-base font-medium text-gray-500">
                      /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  </p>

                  {billingCycle === 'yearly' && (
                    <p className="text-sm text-green-600 font-medium">
                      Save ${(plan.price - price) * 12}/year
                    </p>
                  )}

                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isLoading === plan.id}
                    className={`mt-8 w-full ${colors.button} text-white py-3 px-4 rounded-md font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
                  >
                    {isLoading === plan.id ? (
                      'Loading...'
                    ) : (
                      <>
                        {isAuthenticated ? 'Choose Plan' : 'Start Free Trial'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>

                <div className="px-6 pt-6 pb-8">
                  <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">
                    What's included
                  </h3>
                  <ul className="mt-6 space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex space-x-3">
                        <Check className="flex-shrink-0 h-5 w-5 text-green-500" aria-hidden="true" />
                        <span className="text-sm text-gray-500">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Features Comparison */}
        <div className="mt-16">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Compare Plans
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Choose the perfect plan for your social media growth needs
            </p>
          </div>

          <div className="mt-12 overflow-hidden">
            <div className="bg-gray-50 p-8 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900">All Plans Include</h3>
                  <ul className="mt-4 space-y-2 text-sm text-gray-600">
                    <li>✓ AI-powered content generation</li>
                    <li>✓ Multi-platform scheduling</li>
                    <li>✓ Analytics and insights</li>
                    <li>✓ Mobile app access</li>
                    <li>✓ 14-day free trial</li>
                  </ul>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900">Professional & Enterprise</h3>
                  <ul className="mt-4 space-y-2 text-sm text-gray-600">
                    <li>✓ Advanced automation</li>
                    <li>✓ Team collaboration</li>
                    <li>✓ Priority support</li>
                    <li>✓ Custom branding</li>
                    <li>✓ Advanced analytics</li>
                  </ul>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900">Enterprise Only</h3>
                  <ul className="mt-4 space-y-2 text-sm text-gray-600">
                    <li>✓ White-label options</li>
                    <li>✓ Custom integrations</li>
                    <li>✓ Dedicated support</li>
                    <li>✓ SLA guarantees</li>
                    <li>✓ Custom training</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="mt-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-indigo-700 rounded-lg">
          <div className="px-6 py-12 text-center">
            <h2 className="text-3xl font-extrabold text-white">
              Ready to grow your social media?
            </h2>
            <p className="mt-4 text-xl text-indigo-100">
              Start your free trial today. No credit card required.
            </p>
            <div className="mt-8">
              <Link
                href="/register"
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 transition-colors"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

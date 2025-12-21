import { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, CreditCard, Zap, Shield } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const plans = [
  {
    id: 'free',
    name: 'Starter',
    price: 0,
    features: ['3 Social Profiles', '10 AI Posts/mo', 'Basic Analytics', 'No Podcast Support']
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '9,999',
    features: ['Unlimited Social Profiles', 'Unlimited AI Posts', 'Advanced Analytics', 'Podcast Management', 'Newsletter Automation'],
    recommended: true
  },
  {
    id: 'agency',
    name: 'Agency',
    price: '19,999',
    features: ['Everything in Pro', 'White-label Reports', 'Multi-Brand Support', 'Priority Support', 'Team Collaboration']
  }
];

export default function Billing() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchSubscription();
    checkSuccess();
  }, [searchParams]);

  const checkSuccess = async () => {
    const sessionId = searchParams.get('session_id');
    const plan = searchParams.get('plan');
    if (sessionId && plan) {
      try {
        const token = localStorage.getItem('authToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.post('/api/payments/upgrade', { plan }, config);
        alert(`Successfully upgraded to ${plan.toUpperCase()} plan!`);
        // Remove params from url without reload
        window.history.replaceState({}, '', '/settings');
        fetchSubscription();
      } catch (error) {
        console.error('Error confirming upgrade:', error);
      }
    }
  };

  const fetchSubscription = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get('/api/payments/subscription', config);
      setSubscription(response.data.data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId) => {
    try {
      if (planId === 'free') return; // Cannot downgrade automatically in this mock
      
      const token = localStorage.getItem('authToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.post('/api/payments/create-checkout-session', { planId }, config);
      // In real app, window.location.href = response.data.url;
      // For mock, we manually redirect to success URL provided by backend
      window.location.href = response.data.url; 
    } catch (error) {
      console.error('Error initiating checkout:', error);
      alert('Failed to start checkout');
    }
  };

  if (loading) return <div>Loading billing info...</div>;

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Current Subscription</h2>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="font-semibold text-lg capitalize">{subscription?.plan} Plan</p>
            <p className="text-sm text-gray-500">
              Status: <span className="text-green-600 font-medium capitalize">{subscription?.status}</span>
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={`relative bg-white rounded-lg border p-6 flex flex-col ${
                plan.recommended ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50' : 'border-gray-200'
              }`}
            >
              {plan.recommended && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Recommended
                </div>
              )}
              
              <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
              <div className="mt-2 mb-4">
                <span className="text-3xl font-bold">{plan.id === 'free' ? '$' : '₦'}{plan.price}</span>
                <span className="text-gray-500">/month</span>
              </div>
              
              <ul className="space-y-3 mb-6 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={subscription?.plan === plan.id}
                className={`w-full py-2 rounded-md font-medium transition-colors ${
                  subscription?.plan === plan.id
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {subscription?.plan === plan.id ? 'Current Plan' : 'Upgrade'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

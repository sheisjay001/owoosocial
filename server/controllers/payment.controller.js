const Subscription = require('../models/Subscription');
const axios = require('axios');

// Mock in-memory store
let mockSubscriptions = [];

// Get current subscription
exports.getSubscription = async (req, res) => {
  try {
    const userId = 'mock-user-123'; // Hardcoded for MVP
    let subscription;

    try {
      subscription = await Subscription.findOne({ userId });
    } catch (dbError) {
        subscription = mockSubscriptions.find(s => s.userId === userId);
    }

    if (!subscription) {
      // Create default free plan if not exists
      const defaultSub = {
        userId,
        plan: 'free',
        status: 'active',
        currentPeriodEnd: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        createdAt: new Date()
      };
      
      try {
         subscription = await Subscription.create(defaultSub);
      } catch (e) {
         subscription = { ...defaultSub, _id: Date.now().toString() };
         mockSubscriptions.push(subscription);
      }
    }

    res.status(200).json({ success: true, data: subscription });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create Checkout Session (Paystack)
exports.createCheckoutSession = async (req, res) => {
  try {
    const { planId, email, amount } = req.body; // planId: 'pro' or 'agency', amount in kobo (NGN * 100)
    
    // Default amount if not provided (fallback)
    // Pro: $29 -> ~45,000 NGN (approx) -> 4500000 kobo
    // Agency: $99 -> ~150,000 NGN -> 15000000 kobo
    // Using simple conversion or fixed Naira prices for Paystack context
    let paystackAmount = amount;
    if (!paystackAmount) {
        if (planId === 'pro') paystackAmount = 9999 * 100; // 9,999 NGN
        if (planId === 'agency') paystackAmount = 19999 * 100; // 19,999 NGN
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    
    // Check if key is real or mock
    const isMock = !paystackSecretKey || paystackSecretKey.includes('YOUR_') || paystackSecretKey === 'mock-key';

    if (isMock) {
        console.log('Using Mock Paystack Response');
        return res.status(200).json({ 
            success: true, 
            url: `http://localhost:5173/billing/success?reference=mock_${Date.now()}&plan=${planId}` 
        });
    }

    // Real Paystack Initialization
    const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
            email: email || 'user@example.com',
            amount: paystackAmount,
            plan: planId === 'pro' ? process.env.PAYSTACK_PLAN_PRO : process.env.PAYSTACK_PLAN_AGENCY, // Optional: if using Paystack Plans
            callback_url: `http://localhost:5173/billing/success?plan=${planId}`,
            metadata: {
                planId,
                userId: 'mock-user-123'
            }
        },
        {
            headers: {
                Authorization: `Bearer ${paystackSecretKey}`,
                'Content-Type': 'application/json'
            }
        }
    );

    res.status(200).json({ success: true, url: response.data.data.authorization_url });

  } catch (error) {
    console.error('Paystack Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ success: false, error: 'Payment initialization failed' });
  }
};

// Webhook handler or Verify Transaction
exports.verifyTransaction = async (req, res) => {
    try {
        const { reference, plan } = req.body;
        const userId = 'mock-user-123';

        const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
        const isMock = !paystackSecretKey || paystackSecretKey.includes('YOUR_');

        let isValid = false;

        if (isMock || reference.startsWith('mock_')) {
            isValid = true;
        } else {
            // Verify with Paystack
            try {
                const response = await axios.get(
                    `https://api.paystack.co/transaction/verify/${reference}`,
                    {
                        headers: { Authorization: `Bearer ${paystackSecretKey}` }
                    }
                );
                if (response.data.data.status === 'success') {
                    isValid = true;
                }
            } catch (err) {
                console.error('Verification Error:', err);
                isValid = false;
            }
        }

        if (isValid) {
             // Update subscription
             const newPlan = plan.includes('agency') ? 'agency' : 'pro';
             let subscription;
             
             try {
                 subscription = await Subscription.findOneAndUpdate(
                     { userId },
                     { plan: newPlan, status: 'active', currentPeriodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)) },
                     { new: true, upsert: true }
                 );
             } catch (dbError) {
                 const index = mockSubscriptions.findIndex(s => s.userId === userId);
                 if (index !== -1) {
                     mockSubscriptions[index].plan = newPlan;
                     subscription = mockSubscriptions[index];
                 } else {
                     subscription = {
                         userId,
                         plan: newPlan,
                         status: 'active',
                         createdAt: new Date(),
                         _id: Date.now().toString()
                     };
                     mockSubscriptions.push(subscription);
                 }
             }

             return res.status(200).json({ success: true, data: subscription });
        } else {
            return res.status(400).json({ success: false, message: 'Transaction verification failed' });
        }

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Legacy support (can point to verifyTransaction or be removed)
exports.upgradeSubscription = exports.verifyTransaction;

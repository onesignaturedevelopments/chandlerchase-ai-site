const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const packages = {
  starter: { name: 'Starter', price: 99700 }, // $997 in cents
  launchpad: { name: 'Launchpad', price: 299700 }, // $2,997 in cents
  autopilot: { name: 'Autopilot', price: 750000 } // $7,500 in cents
};

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { package: packageType, email, name, phone } = req.body;

    // Validate package
    if (!packageType || !packages[packageType]) {
      return res.status(400).json({ error: 'Invalid package type' });
    }

    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name required' });
    }

    const pkg = packages[packageType];

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: pkg.price, // Amount in cents
      currency: 'usd',
      description: `Chandler Chase AI - ${pkg.name} Package`,
      metadata: {
        package: packageType,
        email: email,
        name: name,
        phone: phone || 'not provided'
      },
      receipt_email: email,
      statement_descriptor: 'CHANDLER CHASE AI'
    });

    // Return client secret to frontend
    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('Stripe error:', error);
    return res.status(500).json({
      error: error.message || 'Payment processing failed'
    });
  }
}

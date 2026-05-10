import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const DIRECTUS_URL = process.env.VITE_DIRECTUS_URL || 'http://localhost:8055';
const APP_URL = process.env.VITE_APP_URL || 'http://localhost:5173';

// Need the raw body for Stripe webhook signature verification
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    const userId = session.metadata.user_id;
    const courseId = session.metadata.course_id;

    if (!userId || !courseId) {
      console.error('Missing metadata in checkout session');
      return res.status(400).send('Missing metadata');
    }

    try {
      // Create or update course_access in Directus
      // We will need an admin token to perform this, or a system token
      const DIRECTUS_ADMIN_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;
      if (!DIRECTUS_ADMIN_TOKEN) {
        throw new Error('DIRECTUS_ADMIN_TOKEN is missing');
      }

      // First check if an existing request exists
      const existingReq = await fetch(`${DIRECTUS_URL}/items/course_access?filter[course_id][_eq]=${courseId}&filter[user_id][_eq]=${userId}`, {
        headers: { Authorization: `Bearer ${DIRECTUS_ADMIN_TOKEN}` }
      });
      const existingRes = await existingReq.json();
      const records = existingRes.data || [];

      if (records.length > 0) {
        const recordId = records[0].id;
        await fetch(`${DIRECTUS_URL}/items/course_access/${recordId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${DIRECTUS_ADMIN_TOKEN}`
          },
          body: JSON.stringify({
            status: 'active',
            access_type: 'payment',
            granted_at: new Date().toISOString(),
            stripe_session_id: session.id,
            stripe_payment_intent_id: session.payment_intent,
            amount_paid: session.amount_total / 100,
            currency: session.currency
          })
        });
      } else {
        await fetch(`${DIRECTUS_URL}/items/course_access`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${DIRECTUS_ADMIN_TOKEN}`
          },
          body: JSON.stringify({
            user_id: userId,
            course_id: courseId,
            status: 'active',
            access_type: 'payment',
            granted_at: new Date().toISOString(),
            requested_at: new Date().toISOString(),
            stripe_session_id: session.id,
            stripe_payment_intent_id: session.payment_intent,
            amount_paid: session.amount_total / 100,
            currency: session.currency
          })
        });
      }
      
      console.log(`Granted access to user ${userId} for course ${courseId}`);
    } catch (err) {
      console.error('Failed to update Directus:', err);
      return res.status(500).send('Failed to update access');
    }
  }

  res.json({ received: true });
});

// Middleware for parsing JSON for other routes
app.use(express.json());
app.use(cors());

app.post('/api/create-checkout-session', async (req, res) => {
  const { courseId, userId, token } = req.body; // In production, verify JWT token instead of taking userId from body

  if (!courseId || !userId) {
    return res.status(400).json({ error: 'Missing courseId or userId' });
  }

  try {
    // Verify course info from Directus
    const dReq = await fetch(`${DIRECTUS_URL}/items/courses/${courseId}?fields=id,title,slug,is_paid,price,currency,cover_image`);
    const dRes = await dReq.json();
    const course = dRes.data;

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    if (!course.is_paid) {
      return res.status(400).json({ error: 'Course is not paid' });
    }

    const price = parseFloat(course.price);
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ error: 'Invalid course price' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: course.currency?.toLowerCase() || 'eur',
            product_data: {
              name: course.title,
              images: course.cover_image ? [`${DIRECTUS_URL}/assets/${course.cover_image}`] : [],
            },
            unit_amount: Math.round(price * 100), // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${APP_URL}/courses/${course.slug}?payment=success`,
      cancel_url: `${APP_URL}/courses/${course.slug}?payment=cancelled`,
      metadata: {
        course_id: course.id,
        user_id: userId
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

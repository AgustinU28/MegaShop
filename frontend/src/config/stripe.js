// frontend/src/config/stripe.js
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51Rn4cPBrGiQP3bCZvAhCQVLiKLMKHdp8gmKm8WM9H5iHUnlzEtnTxqvHJNQ4W1wqGN8WptRHgDU9G6Tgokn2uWj00RJP0MnHH');

export default stripePromise;
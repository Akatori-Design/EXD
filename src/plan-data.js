// Membership plans (Manage Membership Figma 2121-2540). "pro" is shown as Premier.
export const ORDER = ['basic', 'plus', 'pro'];

export const PLANS = {
  basic: {
    name: 'Basic',
    for: 'For the new artist',
    price: 'Free',
    star: '✦',
    color: '#f0643c',
    features: ['Deliver to Social Media', 'Limited DSP Release', 'Take 90% of royalties'],
  },
  plus: {
    name: 'Plus',
    for: 'For the rising artist',
    price: '$19.99',
    star: '★',
    color: '#b36bf0',
    features: ['Includes all benefits from Basic', 'Brand yourself with Creative tools', 'Take 90% of royalties', 'Advanced analytics insights'],
    // what you give up when leaving this tier (Cancel Plan, Figma 2140-1661)
    loses: ['Premium tools to brand & promote yourself.', 'Advanced analytics insights'],
  },
  pro: {
    name: 'Premier',
    for: 'For the breakout artist',
    price: '$49.99',
    star: '✷',
    color: '#6ff0e0',
    features: ['Includes all benefits from Plus', 'Unlimited DSP Release', 'Youtube Monetization', 'Exclusive Brand/Sync Deals'],
    loses: ['Unlimited release to DSPs.', 'YouTube Monetization', 'Exclusive Brand/Sync Deals'],
  },
};

export const SUBSCRIBED_SINCE = 'Aug 17, 2022';
export const PERIOD_END = 'August 5, 2024';

export function currentPlan() {
  try {
    const p = localStorage.getItem('exd-plan');
    if (p && PLANS[p]) return p;
  } catch {}
  return 'pro';
}

export function setPlan(p) {
  try {
    localStorage.setItem('exd-plan', p);
  } catch {}
}

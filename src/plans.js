// Settings › Account membership card: shows the plan chosen on /plan.html (kept in localStorage).
import { currentPlan, PLANS } from './plan-data.js';

const plan = PLANS[currentPlan()];
const name = document.getElementById('plan-name');
if (name) name.textContent = `EXD ${plan.name}`;
const amount = document.getElementById('plan-amount');
if (amount) amount.textContent = plan.price === 'Free' ? 'Free' : `${plan.price} / year`;

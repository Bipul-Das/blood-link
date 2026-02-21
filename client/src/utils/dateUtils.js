/**
 * Calculates blood donation eligibility based on a 90-day interval.
 * @param {string|Date} lastDonationDate - The date of the last donation.
 * @returns {Object} - { isEligible, daysRemaining, nextEligibleDate }
 */
export const calculateEligibility = (lastDonationDate) => {
  // 1. If never donated, they are eligible immediately
  if (!lastDonationDate) {
    return {
      isEligible: true,
      daysRemaining: 0,
      nextEligibleDate: new Date().toDateString(),
    };
  }

  const lastDate = new Date(lastDonationDate);
  const today = new Date();
  
  // 2. Calculate difference in milliseconds
  const diffTime = Math.abs(today - lastDate);
  // Convert to days (1000ms * 60s * 60m * 24h)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const MIN_INTERVAL_DAYS = 90;

  // 3. Logic Check
  if (diffDays >= MIN_INTERVAL_DAYS) {
    return {
      isEligible: true,
      daysRemaining: 0,
      nextEligibleDate: today.toDateString(),
    };
  } else {
    // Calculate when they can donate next
    const remaining = MIN_INTERVAL_DAYS - diffDays;
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + MIN_INTERVAL_DAYS);
    
    return {
      isEligible: false,
      daysRemaining: remaining,
      nextEligibleDate: nextDate.toDateString(),
    };
  }
};
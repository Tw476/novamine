export const ONE_DAY = 86400000

// BASE DAILY RATE SYSTEM
export const getBaseMiningRate = () => {
  return 0.5
}

// ACTIVE REFERRAL BONUS SYSTEM
export const getActiveReferralBonus = (activeReferrals: number) => {
  return activeReferrals * 0.005
}

// FINAL DAILY REWARD
export const calculateDailyMiningReward = (
  activeReferrals: number,
  boost: boolean
) => {
  const base = getBaseMiningRate()
  const referralBonus = getActiveReferralBonus(activeReferrals)

  const total = base + referralBonus

  return boost ? total * 2 : total
}

// PER SECOND REWARD (FOR LIVE MINING)
export const getMiningRewardPerSecond = (
  activeReferrals: number,
  boost: boolean
) => {
  const daily = calculateDailyMiningReward(activeReferrals, boost)

  return daily / 86400
}
export const getMiningReward = (
  activeReferrals: number,
  boost: boolean
) => {
  const baseRate = 0.5 + activeReferrals * 0.005
  const multiplier = boost ? 2 : 1

  return (baseRate / 86400) * multiplier
}
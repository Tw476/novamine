export const generateReferralCode = (uid: string) => {
  return uid.slice(0, 6).toUpperCase()
}

export const generateReferralLink = (uid: string) => {
  const code = generateReferralCode(uid)

  return `${typeof window !== "undefined" ? window.location.origin : ""}/auth?ref=${code}`
}
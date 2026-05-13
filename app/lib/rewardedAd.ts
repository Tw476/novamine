export function showRewardedAd(): Promise<boolean> {
  return new Promise((resolve) => {

    // Simulated ad flow for now
    // (we will replace with real SDK later)

    const adWindow = window.open(
      "https://example.com",
      "_blank",
      "width=400,height=600"
    )

    // Simulate user watching ad
    setTimeout(() => {
      if (adWindow) adWindow.close()
      resolve(true)
    }, 5000)
  })
}

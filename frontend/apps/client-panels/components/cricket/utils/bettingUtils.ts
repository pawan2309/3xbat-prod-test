import { BetSlipModal } from '../types/cricket.types'

export const handleOddsClick = (
  odd: any, 
  section: any, 
  market: any, 
  setBetSlipModal: (modal: BetSlipModal) => void
) => {
  const teamName = section.nat || 'Unknown Team'
  const rate = odd.odds || '0.00'
  const mode = odd.oname?.toLowerCase().includes('lay') ? 'LAGAI' : 'KHAI'
  const oddType = odd.oname || 'UNKNOWN'
  const marketName = market.mname || 'UNKNOWN'

  setBetSlipModal({
    isOpen: true,
    team: teamName,
    rate: rate,
    mode: mode,
    oddType: oddType,
    marketName: marketName
  })
}

export const closeBetSlipModal = (setBetSlipModal: (modal: BetSlipModal) => void) => {
  setBetSlipModal({
    isOpen: false,
    team: '',
    rate: '',
    mode: '',
    oddType: '',
    marketName: ''
  })
}

export const handleBetAmountClick = (
  amount: number,
  setBetAmount: (amount: number) => void
) => {
  setBetAmount(amount)
}

export const handlePlaceBet = async (
  betSlipModal: BetSlipModal,
  betAmount: number,
  userId?: string
) => {
  try {
    console.log('Placing bet:', {
      team: betSlipModal.team,
      rate: betSlipModal.rate,
      mode: betSlipModal.mode,
      amount: betAmount,
      market: betSlipModal.marketName
    })

    if (!userId) {
      console.error('User ID is required to place a bet')
      alert('User authentication required to place bet')
      return
    }

    // Prepare bet data - only include serializable data
    const betData = {
      userId,
      marketName: betSlipModal.marketName,
      odds: parseFloat(betSlipModal.rate),
      stake: betAmount
      // matchId and marketId are optional and will be set to null by the backend
    }

    console.log('Sending bet data:', betData)

    // Send bet to backend API
    const response = await fetch('/api/betting/place', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(betData)
    })

    const result = await response.json()

    if (result.success) {
      console.log('Bet placed successfully:', result.data)
      alert(`Bet placed successfully! Bet ID: ${result.data.betId} (${result.data.betType})`)
      return true // Return success status
    } else {
      console.error('Failed to place bet:', result.message)
      alert(`Failed to place bet: ${result.message}`)
      return false
    }

  } catch (error) {
    console.error('Error placing bet:', error)
    alert('Error placing bet. Please try again.')
    return false
  }
}

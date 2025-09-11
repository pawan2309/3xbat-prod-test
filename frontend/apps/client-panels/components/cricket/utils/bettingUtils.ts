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
  setBetAmount: (amount: number) => void,
  setBetSlipTimer: (timer: number) => void
) => {
  setBetAmount(amount)
  setBetSlipTimer(10)
}

export const handlePlaceBet = (
  betSlipModal: BetSlipModal,
  betAmount: number,
  closeBetSlipModal: () => void
) => {
  console.log('Placing bet:', {
    team: betSlipModal.team,
    rate: betSlipModal.rate,
    mode: betSlipModal.mode,
    amount: betAmount,
    market: betSlipModal.marketName
  })
  
  // Here you would typically send the bet to your backend API
  // For now, we'll just close the modal
  closeBetSlipModal()
}

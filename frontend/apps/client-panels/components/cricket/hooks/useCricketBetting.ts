import { useEffect, useState } from 'react'
import { BetSlipModal } from '../types/cricket.types'
import { handleOddsClick, closeBetSlipModal, handleBetAmountClick, handlePlaceBet } from '../utils/bettingUtils'

export const useCricketBetting = () => {
  const [betSlipModal, setBetSlipModal] = useState<BetSlipModal>({
    isOpen: false,
    team: '',
    rate: '',
    mode: '',
    oddType: '',
    marketName: ''
  })
  const [betAmount, setBetAmount] = useState<number>(0)
  const [betSlipTimer, setBetSlipTimer] = useState<number>(10)

  // Timer countdown for bet slip
  useEffect(() => {
    if (!betSlipModal.isOpen) return

    const timer = setInterval(() => {
      setBetSlipTimer(prev => {
        if (prev <= 1) {
          closeBetSlipModal(setBetSlipModal)
          return 10
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [betSlipModal.isOpen])

  // Reset timer when bet amount changes
  const handleBetAmountChange = (amount: number) => {
    setBetAmount(amount)
    setBetSlipTimer(10)
  }

  // Handle odds click with modal opening
  const onOddsClick = (odd: any, section: any, market: any) => {
    handleOddsClick(odd, section, market, setBetSlipModal)
  }

  // Close bet slip modal
  const onCloseBetSlipModal = () => {
    closeBetSlipModal(setBetSlipModal)
  }

  // Handle bet amount button click
  const onBetAmountClick = (amount: number) => {
    handleBetAmountClick(amount, setBetAmount, setBetSlipTimer)
  }

  // Handle place bet
  const onPlaceBet = () => {
    handlePlaceBet(betSlipModal, betAmount, onCloseBetSlipModal)
  }

  return {
    betSlipModal,
    betAmount,
    betSlipTimer,
    setBetAmount: handleBetAmountChange,
    onOddsClick,
    onCloseBetSlipModal,
    onBetAmountClick,
    onPlaceBet
  }
}

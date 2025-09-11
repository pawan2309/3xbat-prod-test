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

  // Reset timer when modal opens
  useEffect(() => {
    if (betSlipModal.isOpen) {
      setBetSlipTimer(10)
    }
  }, [betSlipModal.isOpen])

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

  // Handle bet amount change (no timer reset)
  const handleBetAmountChange = (amount: number) => {
    setBetAmount(amount)
  }

  // Handle odds click with modal opening
  const onOddsClick = (odd: any, section: any, market: any) => {
    handleOddsClick(odd, section, market, setBetSlipModal)
    // Reset timer to 10 seconds when bet slip opens
    setBetSlipTimer(10)
  }

  // Close bet slip modal
  const onCloseBetSlipModal = () => {
    closeBetSlipModal(setBetSlipModal)
  }

  // Handle bet amount button click
  const onBetAmountClick = (amount: number) => {
    handleBetAmountClick(amount, setBetAmount)
  }

  // Handle place bet
  const onPlaceBet = async () => {
    // Use default userId for testing
    const effectiveUserId = 'demo-user'
    const success = await handlePlaceBet(betSlipModal, betAmount, effectiveUserId)
    
    // Close modal if bet was placed successfully
    if (success) {
      onCloseBetSlipModal()
    }
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

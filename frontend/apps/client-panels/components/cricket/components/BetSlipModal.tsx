import React from 'react'
import { BetSlipModal as BetSlipModalType } from '../types/cricket.types'

interface BetSlipModalProps {
  betSlipModal: BetSlipModalType
  betAmount: number
  betSlipTimer: number
  onClose: () => void
  onBetAmountClick: (amount: number) => void
  onBetAmountChange: (amount: number) => void
  onPlaceBet: () => void
}

export default function BetSlipModal({
  betSlipModal,
  betAmount,
  betSlipTimer,
  onClose,
  onBetAmountClick,
  onBetAmountChange,
  onPlaceBet
}: BetSlipModalProps) {
  if (!betSlipModal.isOpen) return null

  const betAmounts = [100, 500, 1000, 2000, 5000, 10000, 25000, 50000, 100000, 200000, 300000, 500000]

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[#c9e3ff] w-full max-w-[720px] rounded-md shadow-lg overflow-hidden text-[#212042]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-blue-200 flex justify-between items-center p-4 text-sm font-semibold text-gray-800">
          <div className="flex flex-col justify-center items-center flex-2">
            <div className="text-[12px] font-extrabold">TEAM</div>
            <div className="text-base font-extrabold">{betSlipModal.team}</div>
          </div>
          <div className="flex flex-col justify-center items-center flex-1">
            <div className="text-[12px] font-extrabold">RATE</div>
            <div className="text-base font-extrabold">{betSlipModal.rate}</div>
          </div>
          <div className="flex flex-col justify-center items-center flex-1">
            <div className="text-[12px] font-extrabold">MODE</div>
            <div className="text-base font-extrabold">{betSlipModal.mode}</div>
          </div>
        </div>

        {/* Bet Amount Selection */}
        <div className="bg-blue-300 grid grid-cols-3 justify-center items-center gap-4 p-4">
          {betAmounts.map((amount) => (
            <button
              key={amount}
              className={`py-1 rounded-full text-sm flex justify-center items-center w-full font-semibold transition-colors ${
                betAmount === amount 
                  ? 'bg-[#2a2d4c] text-white' 
                  : 'bg-[#4a4d6c] text-white hover:bg-[#2a2d4c]'
              }`}
              onClick={() => onBetAmountClick(amount)}
            >
              {amount.toLocaleString()}
            </button>
          ))}
        </div>

        {/* Input Field */}
        <div className="flex items-center px-4 py-3 bg-blue-300">
          <input
            type="number"
            placeholder="AMOUNT"
            value={betAmount || ''}
            onChange={(e) => {
              onBetAmountChange(Number(e.target.value) || 0)
            }}
            className="flex-grow border-2 border-white rounded-sm px-3 py-2 text-sm focus:outline-none text-black bg-white"
          />
          <span className={`px-4 py-2 -ml-1 rounded-r-md text-[16px] font-medium ${
            betSlipTimer <= 3 
              ? 'bg-red-600 text-white animate-pulse' 
              : 'bg-black text-white'
          }`}>
            {betSlipTimer}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex">
          <button
            onClick={onClose}
            className="flex-1 bg-[#e53422] text-white py-3 text-sm font-extrabold hover:bg-[#c42a1a] transition-colors"
          >
            CANCEL
          </button>
          <button 
            onClick={onPlaceBet}
            className="flex-1 bg-green-600 text-white py-3 text-sm font-extrabold hover:bg-green-700 transition-colors"
          >
            PLACEBET
          </button>
        </div>
      </div>
    </div>
  )
}

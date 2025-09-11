export interface Match {
  gmid: number
  ename: string
  stime: string
  iplay: boolean
  tv: boolean
  bm: boolean
  f: boolean
  f1: boolean
  iscc: number
  mid: number
  mname: string
  status: string
  rc: number
  gscode: number
  oid: number
  m: number
  gtype: string
  section: any[]
  beventId?: string
  bmarketId?: string
  brunners: any[]
}

export interface CricketPageContentProps {
  initialExpandedMatch?: string | number | null
  initialShowScore?: boolean
  autoExpandEventId?: string
}

export interface BetSlipModal {
  isOpen: boolean
  team: string
  rate: string
  mode: string
  oddType: string
  marketName: string
}

export interface OddsData {
  mname: string
  section?: any[]
  selections?: any[]
  gstatus?: string
  mstatus?: string
}

export interface ColumnHeaders {
  lay: string
  back: string
}

export interface ScorecardData {
  [key: string]: any
}

export interface WebSocketData {
  data: any
  success?: boolean
  timestamp?: string
}

export interface Margin {
    equity: Equity;
    commodity: Commodity;
}

interface Available {
    adhoc_margin: number;
    cash: number;
    opening_balance: number;
    live_balance: number;
    collateral: number;
    intraday_payin: number;
}

interface Utilized {
    debits: number;
    exposure: number;
    m2m_realised: number;
    m2m_unrealised: number;
    option_premium: number;
    payout: number;
    span: number;
    holding_sales: number;
    turnover: number;
    liquid_collateral: number;
    stock_collateral: number;
}

interface Equity {
    enabled: boolean;
    net: number;
    available: Available;
    utilized: Utilized;
}

interface Commodity {
    enabled: boolean;
    net: number;
    available: Available;
    utilized: Utilized;
}

export interface HoldingAnalysis {
    symbol: string
    currentValue: number
    weight: number // 0-1
    return1Y: number // percentage
    volatility: number // annualized vol %
    beta: number
    gainLossPct: number // total gain/loss %
}

export interface PortfolioMetrics {
    totalValue: number
    portfolioReturn1Y: number
    concentrationIndex: number // HHI
    diversificationScore: number // 0-100
    weightedVolatility: number
    weightedBeta: number
    riskScore: number // 0-100
    riskLevel: "Basso" | "Medio" | "Alto"
}

export interface Recommendation {
    type: "warning" | "risk" | "alert" | "info"
    message: string
}

/**
 * Calculates standard deviation of daily returns (annualized)
 */
export const calculateVolatility = (historicalPrices: number[]): number => {
    if (!historicalPrices || historicalPrices.length < 2) return 0;

    // Calculate daily returns: (Price_t - Price_t-1) / Price_t-1
    const returns: number[] = [];
    for (let i = 1; i < historicalPrices.length; i++) {
        const prev = historicalPrices[i - 1];
        const curr = historicalPrices[i];
        if (prev > 0) {
            returns.push((curr - prev) / prev);
        }
    }

    if (returns.length === 0) return 0;

    // Calculate Mean Return
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;

    // Calculate Variance
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;

    // Daily Std Dev
    const stdDevDaily = Math.sqrt(variance);

    // Annualize (sqrt(252))
    return stdDevDaily * Math.sqrt(252) * 100;
}


export const analyzePortfolio = (
    holdings: { symbol: string, quantity: number, buyPrice: number, currentPrice: number, beta: number, historical: number[] }[]
): { metrics: PortfolioMetrics, recommendations: Recommendation[] } => {

    let totalValue = 0;
    const analysis: HoldingAnalysis[] = [];

    // Analyze each holding
    holdings.forEach(h => {
        const value = h.quantity * h.currentPrice;
        totalValue += value;

        const cost = h.quantity * h.buyPrice;
        const gainLossPct = cost > 0 ? ((value - cost) / cost) * 100 : 0;

        // Calculate 1Y Return (approx using first and last price of historical if available, assuming historical is 1Y)
        // If historical array is ordered old -> new
        let ret1Y = 0;
        if (h.historical.length > 0) {
            const startPrice = h.historical[0];
            if (startPrice > 0) {
                ret1Y = ((h.currentPrice - startPrice) / startPrice) * 100;
            }
        }

        const vol = calculateVolatility(h.historical);

        analysis.push({
            symbol: h.symbol,
            currentValue: value,
            weight: 0, // calculate later
            return1Y: ret1Y,
            volatility: vol,
            beta: h.beta || 1.0,
            gainLossPct
        });
    });

    if (totalValue === 0) {
        return {
            metrics: {
                totalValue: 0, portfolioReturn1Y: 0, concentrationIndex: 0, diversificationScore: 0,
                weightedVolatility: 0, weightedBeta: 0, riskScore: 0, riskLevel: 'Basso'
            },
            recommendations: []
        };
    }

    // Calculate weights and portfolio aggregates
    let weightedRet = 0;
    let weightedVol = 0;
    let weightedBeta = 0;
    let hhi = 0; // Herfindahl-Hirschman Index

    analysis.forEach(a => {
        a.weight = a.currentValue / totalValue;

        weightedRet += a.weight * a.return1Y;
        weightedVol += a.weight * a.volatility;
        weightedBeta += a.weight * a.beta;

        hhi += Math.pow(a.weight, 2);
    });

    // Risk Score Calculation
    // Logic from python: min(100, weighted_volatility * 2)
    // Note: Volatility is usually 15-30%. So 30 * 2 = 60. 
    // If Vol 50% (High), Score 100.
    const riskScore = Math.min(100, weightedVol * 2);

    let riskLevel: "Basso" | "Medio" | "Alto" = "Basso";
    if (riskScore > 30) riskLevel = "Medio";
    if (riskScore > 60) riskLevel = "Alto";

    const metrics: PortfolioMetrics = {
        totalValue,
        portfolioReturn1Y: weightedRet,
        concentrationIndex: hhi,
        diversificationScore: (1 - hhi) * 100,
        weightedVolatility: weightedVol,
        weightedBeta: weightedBeta,
        riskScore,
        riskLevel
    };

    // Generate Recommendations
    const recommendations: Recommendation[] = [];

    // 1. Concentration Warning
    analysis.forEach(a => {
        if (analysis.length > 1 && a.weight > 0.4) {
            recommendations.push({
                type: "warning",
                message: `${a.symbol} rappresenta il ${(a.weight * 100).toFixed(1)}% del portfolio. Considera di diversificare.`
            });
        }
    });

    // 2. High Risk Warning
    if (metrics.riskLevel === "Alto") {
        recommendations.push({
            type: "risk",
            message: "Il portfolio presenta alta volatilità. Considera di bilanciare con asset meno volatili (obbligazioni, etf, dividend stocks)."
        });
    }

    // 3. Loss Alert
    analysis.forEach(a => {
        if (a.gainLossPct < -20) {
            recommendations.push({
                type: "alert",
                message: `${a.symbol} è in perdita del ${Math.abs(a.gainLossPct).toFixed(1)}%. Valuta se mantenere la posizione (stop-loss).`
            });
        }
    });

    // 4. Diversification Check
    if (metrics.diversificationScore < 40 && analysis.length > 1) {
        recommendations.push({
            type: "info",
            message: "Il punteggio di diversificazione è basso. Aggiungi asset decorrelati."
        });
    }

    return { metrics, recommendations };
}

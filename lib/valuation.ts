export const calculateDCF = (
    fcfCurrent: number,
    fcfGrowth: number, // percentage 0-100
    wacc: number, // percentage 0-100
    terminalGrowth: number, // percentage 0-100
    years: number = 5,
    cash: number,
    debt: number,
    shares: number
) => {
    if (shares === 0) return 0;

    const growthRate = fcfGrowth / 100;
    const discountRate = wacc / 100;
    const terminalRate = terminalGrowth / 100;

    let enterpriseValue = 0;
    let projectedFCF = fcfCurrent;

    // Calculate PV of explicit period
    for (let i = 1; i <= years; i++) {
        projectedFCF = projectedFCF * (1 + growthRate);
        enterpriseValue += projectedFCF / Math.pow(1 + discountRate, i);
    }

    // Calculate Terminal Value
    const terminalValue = (projectedFCF * (1 + terminalRate)) / (discountRate - terminalRate);
    const pvTerminalValue = terminalValue / Math.pow(1 + discountRate, years);

    enterpriseValue += pvTerminalValue;

    const equityValue = enterpriseValue + cash - debt;
    return equityValue / shares;
}

export const calculateGrahamNumber = (eps: number, bvps: number) => {
    if (eps < 0 || bvps < 0) return 0;
    return Math.sqrt(22.5 * eps * bvps);
}

export const calculateDDM = (divPerShare: number, growthRate: number, discountRate: number) => {
    const r = discountRate / 100;
    const g = growthRate / 100;
    if (r <= g) return 0; // Invalid model if growth > discount
    const nextDiv = divPerShare * (1 + g);
    return nextDiv / (r - g);
}

export const calculatePEMultipleValuation = (eps: number, historicalPE: number) => {
    return eps * historicalPE;
}

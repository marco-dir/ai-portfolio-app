const fs = require('fs');
const path = require('path');

// Hardcoded for debugging
const SHEET_ID = '1cGXPRbrhanUTeEQPklLK8j_rJzG_4XAjAZmVUPcrRQc';
const GIDS = ['0', '1613026528'];

async function debugSheet() {
    for (const GID of GIDS) {
        console.log(`\nChecking GID: ${GID}`);
        const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

        try {
            const response = await fetch(csvUrl);
            if (!response.ok) {
                console.log(`Failed to fetch GID ${GID}: ${response.statusText}`);
                continue;
            }

            const text = await response.text();
            const lines = text.split('\n');
            console.log(`Total lines: ${lines.length}`);

            const targets = ['META', 'NFLX', 'NETFLIX', 'FACEBOOK', 'FB'];

            lines.forEach((line, index) => {
                const row = line.split(',');
                // Check if any cell matches our targets
                const found = row.some(cell => {
                    if (!cell) return false;
                    const cellUpper = cell.toUpperCase();
                    return targets.some(t => cellUpper.includes(t));
                });

                if (found) {
                    console.log(`[GID ${GID}] Found match at Row ${index + 1}: ${line}`);
                }
            });

        } catch (e) {
            console.error(e);
        }
    }
}

debugSheet();

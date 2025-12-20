const GID = '141458487';
const SHEET_IDS = [
    { name: 'Diramco', id: '1D_hPCrPfAMxq6hvfclIuGI-6ti3ZmR39JCIv_CbI-Lc' },
    { name: 'Aggressive', id: '1lPjBmL0g2Og_L1IJ36vvOmYSO5vg6bMjNYpp9j580TE' }
];

async function checkSheet(name, id) {
    const url = `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${GID}`;
    console.log(`Checking ${name}...`);
    try {
        const res = await fetch(url);
        if (res.ok) {
            console.log(`SUCCESS [${name}]: ${res.status}`);
            const text = await res.text();
            console.log(text.slice(0, 200));
            return true;
        } else {
            console.log(`FAILED [${name}]: ${res.status}`);
            return false;
        }
    } catch (err) {
        console.error(`ERROR [${name}]:`, err);
        return false;
    }
}

(async () => {
    for (const sheet of SHEET_IDS) {
        await checkSheet(sheet.name, sheet.id);
    }
})();


import { getDividends } from "../lib/fmp"
import fs from "fs"
import path from "path"

const envPath = path.resolve(__dirname, "../.env")
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf8")
    envConfig.split("\n").forEach(line => {
        const [key, value] = line.split("=")
        if (key && value) {
            process.env[key.trim()] = value.trim().replace(/"/g, "")
        }
    })
}

async function main() {
    // Dynamic import to ensure env is loaded first
    const { getDividends } = await import("../lib/fmp")

    const symbol = "AAPL"
    console.log(`Checking dividends for ${symbol}...`)

    const data = await getDividends(symbol)
    if (data && data.historical && data.historical.length > 0) {
        console.log("First dividend entry:", data.historical[0])
        // Check first 5 entries
        console.log("First 5 entries:", data.historical.slice(0, 5))
    } else {
        console.log("No dividend data found.")
    }
}

main()

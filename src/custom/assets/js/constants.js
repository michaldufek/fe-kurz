import i18n from "@/i18n"

// base URLs
const baseUrlLocal = "http://localhost"
const baseUrlDev = "https://dev.analyticalplatform.com"
const baseUrlProd = process.env.NODE_ENV === 'production' ? window.location.origin : baseUrlDev
// const baseUrl = baseUrlLocal
// const baseUrl = baseUrlDev
const baseUrl = baseUrlProd

// URLs parts
const APIPartUrl = baseUrl + "/api"
const optPartUrl = APIPartUrl + "/optimization"
const dwhPartUrl = APIPartUrl + "/datawarehouse"
const sweepPartUrl = "/Sweep"
const requestPartUrl = "Request"
const SPPartUrl = APIPartUrl + "/sp"
const PLminiPartUrl = "pl2"
const PLPartUrl = APIPartUrl + "/" + PLminiPartUrl
const livedeplPartUrl = APIPartUrl + "/livedepl"
const tickerPartUrl = "/Ticker"
const patternPartUrl = "/Pattern"
const gwPartUrl = "/Gateway"
const resultPartUrl = "Result"
const alertPartUrl = "/Alert"
const searchPartUrl = "?search="
const reportPartUrl = APIPartUrl + "/xreport"
const statsPartUrl = reportPartUrl + "/last_report"
const chartPartUrl = reportPartUrl + "/compute"
const mfPartUrl = "/mf"
const uvxyPartUrl = "/uvxy"

// other
const perfResults = "research.patternLab.backtestPatterns.performanceResults"


export default {
    // maximum number of rows shown in fancy tables
    maxRows: 20, // to-do: use some pagination or More... button for all rows

    defaultUnit: i18n.t('research.patternLab.units')[0],        // will not translate during runtime !!!

    colors: {
        tradeEntry: 'blue',
        tradeStopLoss: 'yellow',
        tradeExit: 'darkred'
    },
    
    intervals: { 
        // interval for realoading charts and tables data from sources
        dataReload: 1000 * 60 * 10, // 10 minutes 

        // interval for checking whether we should play some orderStatus change sound
        minute: 1000 * 60, // minute

        // time of shaking of login forms if unsuccessful
        shake: 500, // half second

        // time of effect of login forms showing
        loginShow: 230,

        // time of checking whether Backtest patterns backtests are done
        seconds3: 1000 * 3, // 3 seconds,

        // time of downloading optimization results
        featEngReload: 1000 * 5 // 5 seconds
    },    

    urls: {
        liveDepl: {
            gateway: {
                start: livedeplPartUrl + gwPartUrl + "Start/",
                stop: livedeplPartUrl + gwPartUrl + "Stop/",
                status: livedeplPartUrl + gwPartUrl + "Status/",
                logs: livedeplPartUrl + gwPartUrl + "Logs/"
            },
            strategy: {
                deploy: livedeplPartUrl + "/StrategyDeploy/",
                stop: livedeplPartUrl + "/StrategyStop/"
            },
            tradeLog: livedeplPartUrl + "/TradeLog/",
            report: livedeplPartUrl + "/Report/",
            liquidate: livedeplPartUrl + "/Liquidate/"
        },

        tickerSP: {
            base : SPPartUrl + tickerPartUrl,
            stock: SPPartUrl + tickerPartUrl + "OHLC?ticker="
        },

        patternLab: {
            abbreviation: PLminiPartUrl,
            asset: PLPartUrl + tickerPartUrl + searchPartUrl,
            pattern: PLPartUrl + patternPartUrl + searchPartUrl,
            chart: PLPartUrl + "/HistoryData/",
            patternsHistory: PLPartUrl + patternPartUrl + "Tests",
            backtestPatterns: {
                results: PLPartUrl + patternPartUrl + resultPartUrl + "s",
                status: PLPartUrl + patternPartUrl  + resultPartUrl + "s" + "Status"
            },
            alert: PLPartUrl + alertPartUrl + "/",
            alerts: PLPartUrl + alertPartUrl + "s"
        },

        featEng: {
            sweepRequest: optPartUrl + sweepPartUrl + requestPartUrl + "/"
        },

        datawarehouse: {
            result: dwhPartUrl + "/" + resultPartUrl + "/",
            results: dwhPartUrl + "/" + resultPartUrl + "s",
        },

        auth: baseUrl + "/rest-auth",
        reserved: baseUrl + "/api/reserved",

        stats: {
            "MF Report": statsPartUrl + mfPartUrl,
            "UVXY Report": statsPartUrl + uvxyPartUrl
        },

        chart: {
            "MF Report": chartPartUrl + mfPartUrl, 
            "UVXY Report": chartPartUrl + uvxyPartUrl
        }
    },

    storeKeys: {
        assetsPatternsPicker: 'research.patternLab.AssetsPatternsPicker',
        backtestPatterns: 'research.patternLab.backtestPatterns'
    },

    translationKeys: {
        performanceResults: perfResults,
        patterns: perfResults + '.patterns',
        trades: perfResults + '.trades',
        performanceMetrics: perfResults + '.performanceMetrics',
        chart: perfResults + '.chart',
        IBLogin: 'login.IB'
    },

    strings: {
        errors: {
            networkError: "Network Error",
            CSRF: "CSRF Failed: CSRF token missing or incorrect."
        },
        etc: "...",
        all: "all",
        bullish: "Bullish",
        bearish: "Bearish"
    }
}
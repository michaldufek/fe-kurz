import i18n from "@/i18n"
import constants from './constants';

export default { 
    // statistics
    cagr(equity, nrOfQuarters) {
        // cagr = (df['equity'].iloc[-1] / df['equity'].iloc[0]) ** (1 / (time_span.days/365)) - 1
        return Math.pow(equity[equity.length - 1] / equity[0], 1 / (nrOfQuarters / 4)) - 1
    },

    ytd(data, nrOfQuarters) {
        // ytd = (this_year['equity'].iloc[-1] / this_year['equity'].iloc[0]) * 100 - 100
        let last_equity = this.last_quarters_equity(data, nrOfQuarters)
        return last_equity.length ? (last_equity[last_equity.length - 1] / last_equity[0]) * 100 - 100 : 0
    },

    maxDD(data, nrOfQuarters) {
        // maxdd = ((df['equity'] - df['equity'].cummax()) / df['equity']).min() * 100
        let last_equity = this.last_quarters_equity(data, nrOfQuarters)
        return last_equity.length ? Math.min(...last_equity.map((val,ind) => (val - Math.max(...last_equity.slice(0, ind + 1))) / val)) * 100 : 0
    },

    last_quarters_equity(data, nr) {
        // this_year = df[df['time'] > dt.datetime(now.year, 1, 1)]
        let now = new Date(Date.now())
        let monthBefore = now.getMonth() - (nr * 3)
        let yearBefore = now.getFullYear() - (monthBefore < 0 ? 1 : 0)        
        let timeFiltered = data.time.filter(dt => new Date(dt) >= new Date(yearBefore, monthBefore < 0 ? 12 + monthBefore : monthBefore, now.getDate()))
        return data.equity.slice(data.equity.length - timeFiltered.length, data.equity.length)
    },

    // agregators
    sortAggregator(oldRows, newRows, sortCl) {
        return oldRows.concat(newRows).sort((row1, row2) => {
          // sort in descending order by dateTime
          if (row1[sortCl] > row2[sortCl]) return -1;
          if (row1[sortCl] < row2[sortCl]) return 1;
          /* else */ return 0;
        })
    },

    weightedAverageAggregator(oldRows, newRows, weight, lastRowNoAverage=true) {
        // average values at same place
        let rows = []
        let firstTime = !oldRows.length || !newRows.length

        let allRows = firstTime ? oldRows.concat(newRows) : oldRows
        let rowNr = 0

        allRows.forEach(oldRow => {
            let aggRow = {}
            
            for (const [key, oldVal] of Object.entries(oldRow)) {
                if (typeof oldVal === "boolean") {
                    var newVal = oldVal
                } else {
                if (!oldVal) {
                    continue
                }

                if (oldVal instanceof Number || typeof oldVal === 'number') {
                        newVal = oldVal
                } else {
                    // split because in portfolio card it is in '<statisticName>: <number>' format
                    var sep = ': '
                    var oldValSplitted = oldVal.split(sep)

                    newVal = oldValSplitted[oldValSplitted.length - 1]
                }

                if (!isNaN(Number(newVal))) {
                    // final weighted average of old and new value
                    let noAverage = !(lastRowNoAverage && rowNr === allRows.length - 1)
                    let newWeight = noAverage ? weight : 1

                    newVal = ((firstTime ? newWeight : 1) * Number(newVal))
                                + (firstTime
                                    ? 0
                                    : (newWeight * ((oldValSplitted && oldValSplitted.length > 1) 
                                                    ? Number(newRows[rowNr][key].split(sep)[1]) 
                                                    : newRows[rowNr][key]))
                                    )
                    if (noAverage && !firstTime) {  
                        // it's probably Equity outstanding statistic                          
                        newVal /= 2
                    }
                }
                
                if (oldValSplitted && oldValSplitted.length > 1) {
                    newVal = [ oldValSplitted[0], newVal ].join(sep)
                } 
                }

                aggRow[key] = newVal
            }

            rows.push(aggRow)
            rowNr++
        })

        return rows
    },
    createTradesRow(rows, datum, base) {
        let rowNr = 0

        Object.keys(datum.output.trades.pnl).forEach(_ => 
            rows.push([
                rowNr + 1,    // #                    
                base.symbol,    // Asset                    
                base.pattern,    // Pattern
                datum.direction,   // Direction
                'Entry price',   // Entry price
                'Exit price',   // Exit price
                this.formatDateTime(datum.output.trades.start[rowNr]),   // Entry time
                this.formatDateTime(datum.output.trades.finish[rowNr]),   // Exit time
                'Amount',   // Amount
                datum.output.trades.pnl[rowNr++]   // PnL
            ])
        )
    },
    createPerfMetricsRow(rows, datum, base) {
        rows.push([
            base.symbol,    // Asset
            base.pattern,    // Pattern
            Object.keys(datum.output.trades.pnl).length,   // # of trades
            `${datum.initial_capital} ${constants.defaultUnit}`,   // Initial capital
            `${datum.initial_capital + datum.output.stats["Cummulative pnl final"]} ${constants.defaultUnit}`,   // End capital
            `${datum.output.stats["Cummulative pnl final"]} ${constants.defaultUnit}`,    // Cummulative PnL final
            datum.output.stats["cagr"] ?? '-',    // CAGR
            datum.output.stats["Sharpe ratio"],  // Sharpe ratio
            `${datum.profit_take_value} ${datum.profit_take_unit}`,   // PT
            `${datum.stop_loss_value} ${datum.stop_loss_unit}`,   // SL
            datum.output.stats["Avg. trade net profit per trade"],  // Average trade
            datum.output.stats["Max drawdown strategy"]  // Max drawdown strategy
        ])
    },

    // date-time types formatting    
    pad(nr) {
        return String(nr).length < 2 ? "0" + nr : nr
    },

    formatDate(dt, delimiter="-") {
        // returns RRRR<delimiter>MM<delimiter>DD format
        if (dt) {
            let newDt = new Date(dt)
            return newDt.getFullYear() + delimiter + this.pad(Number(newDt.getMonth() + 1)) + delimiter + this.pad(newDt.getDate())
        }
    },

    deformatDate(date) {
        // for RRRRMMDD formatted inputs
        // returns new Date() format
        return date !== null ? new Date(date.substring(0,4), Number(date.substring(4,6)) - 1, date.substring(6,8)) : null
    },

    formatDateTime(dt) {
        // returns RRRR-MM-DD HH:MM:SS formatted date from string of type YYYY-MM-DDTHH:MM:SS
        let newDt = new Date(dt)
        return this.formatDate(newDt) + " " + this.pad(newDt.getHours()) + ":" + this.pad(newDt.getMinutes()) + ":" + this.pad(newDt.getSeconds())
    },

    formatDateOnly(date) {
        // for RRRRMMDD formatted inputs
        // returns in RRRR-M-D format
        return date ? (date.substring(0,4) + "-" + date.substring(4,6) + "-" + date.substring(6,8)) : null
    },

    formatDateTimes(datetimes) {
        // formatDatetime on array
        let newDatetimes = []
        datetimes.forEach(dt => {
          newDatetimes.push(this.formatDateTime(dt))
        })
        return newDatetimes
    },

    // convertors
    convertTimeframe(timeframe) {
        let index = i18n.t('research.patternLab.timeframes').indexOf(timeframe)
        return index > -1 ? index + 1 : -1
    },

    convertDirection(nr) {
        return !nr ? nr : (nr > 0 ? constants.strings.bullish : constants.strings.bearish)
    },

    // query & urls methods
    mapStrategyFromRow(row, map=true) {
        // map Patterns table row to API structure
        let data = {}
        let clNr = 1    // 0th is Name - no need to map
        let columns = i18n.t(constants.translationKeys.patterns + '.columns')

        let val = (map && row.get(columns[clNr].toLowerCase())) || (!map && row[columns[clNr].toLowerCase()])
        if (val) {
            data['start_date'] = val // From
        }
        clNr++

        val = (map && row.get(columns[clNr].toLowerCase())) || (!map && row[columns[clNr].toLowerCase()])
        if (val) {
            data['finish_date'] = val    // To
        }
        clNr++

        val = (map && row.get(columns[clNr].toLowerCase())) || (!map && row[columns[clNr].toLowerCase()])
        if (val) {
            data['time_frame'] = i18n.t('research.patternLab.timeframes').indexOf(val) + 1    // Time frame    // it's a big mystery why BE indexes from 1
        }

        val = (map && row.get('assetId')) || (!map && row['assetId'])
        data['asset'] = val   // Asset

        val = (map && row.get('patternId')) || (!map && row['patternId'])
        data['pattern'] = val  // Pattern
        clNr += 3

        val = (map && row.get(columns[clNr].toLowerCase())) || (!map && row[columns[clNr].toLowerCase()])
        if (val) {
            data['initial_capital'] = val.split(' ')[0]
        }
        clNr += 2

        val = (map && row.get(columns[clNr].toLowerCase())) || (!map && row[columns[clNr].toLowerCase()])
        if (val) {
            let profit_take = val.split(' ')
            data['profit_take_value'] = profit_take[0]
            data['profit_take_unit'] = profit_take[1]
        }
        clNr++

        val = (map && row.get(columns[clNr].toLowerCase())) || (!map && row[columns[clNr].toLowerCase()])
        if (val) {
            let stop_loss = val.split(' ')
            data['stop_loss_value'] =  stop_loss[0]
            data['stop_loss_unit'] =  stop_loss[1]
        }
        clNr++

        val = (map && row.get(columns[clNr].toLowerCase())) || (!map && row[columns[clNr].toLowerCase()])
        if (val) {
            data['ma_filter_period'] = val.split(' ')[0]
        }
        clNr++

        val = (map && row.get(columns[clNr].toLowerCase())) || (!map && row[columns[clNr].toLowerCase()])
        let directions = i18n.t('research.patternLab.backtestPatterns.entryRules.directions')
        data['direction'] = Object.keys(directions)[Object.values(directions).indexOf(val)]

        val = (map && row.get('fixed_amount')) || (!map && row['fixed_amount'])
        if (val) {
            data['fixed_amount'] = val  // Risk
        }

        return data
    },
    getPatternLabQueryData(assets, patterns, timeframe, startDate, finishDate) {
        let data = {}

        data['symbols'] = assets.map(sa => sa.symbol)
        data['patterns'] = patterns.map(sp => sp.id)        
        data['timeframe'] = this.convertTimeframe(timeframe)

        if (startDate) {
            data['start_date'] = startDate
        }
        if (finishDate) {
            data['finish_date'] = finishDate
        }
        
        return data
    },
    encodeQueryData(data) {
        const ret = [];
        for (let d in data) {
            if (data[d] !== null && data[d] !== undefined) {
                ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
            }
        }
        return "?" + ret.join('&');
    },
    getPatternLabChartUrl(asset, timeframe, range=null) {
        return constants.urls.patternLab.chart + this.encodeRouteParams([ asset.id, this.convertTimeframe(timeframe) ]) + this.encodeQueryData(range)
    },
    getPatternLabHistoryUrl(assets, patterns, timeframe, startDate, finishDate) {
        return assets.length && patterns.length
                ? [ constants.urls.patternLab.patternsHistory + this.encodeQueryData(this.getPatternLabQueryData(assets, patterns, timeframe, this.formatDateOnly(startDate), this.formatDateOnly(finishDate))) ]
                : []
    },
    encodeRouteParams(data) {
        return data.join('/');
    },

    // store methods
    getAssetsPatternsPickerData(store) {
        let data = store.getItem(constants.storeKeys.assetsPatternsPicker)
        if (data) {
            return {
                timeframe: i18n.t('research.patternLab.timeframes')[data.timeframe ? data.timeframe : 0],
                range: {
                    from: data.range && data.range.from ? data.range.from : null,
                    to: data.range && data.range.to ? data.range.to : null
                },
                
                // assets
                selectedAssets: data.selectedAssets ? data.selectedAssets : [],
                checkedAssets: data.checkedAssets ? data.checkedAssets : (data.selectedAssets ? data.selectedAssets : []),
                checkedAsset: data.checkedAsset ? data.checkedAsset : (data.checkedAssets && data.checkedAssets.length ? data.checkedAssets[0] : null),

                // patterns
                selectedPatterns: data.selectedPatterns ? data.selectedPatterns : [],
                checkedPatterns: data.checkedPatterns ? data.checkedPatterns : [],
                checkedAllPatterns: data.checkedAllPatterns
            }
        }
    },
    updateStore(store, key, value, storeKey=constants.storeKeys.assetsPatternsPicker) {
        let storeData = store.getItem(storeKey)
        if (!storeData) {
            storeData = {}
        }
        storeData[key] = value
        store.setItem(storeKey, storeData)
    },
    updateStoreBacktests(store, key, value, storeKey=constants.storeKeys.assetsPatternsPicker) {
        this.updateStore(store, key, value.map(row => {
            let newRow = new Map(row)

            let timeframeKey = i18n.t(constants.translationKeys.patterns + '.columns')[3].toLowerCase()
            let directionKey = i18n.t(constants.translationKeys.patterns + '.columns')[11].toLowerCase()
            newRow.set(directionKey, Object.values(i18n.t('research.patternLab.backtestPatterns.entryRules.directions')).indexOf(row.get(directionKey)))
            newRow.set(timeframeKey, i18n.t('research.patternLab.timeframes').indexOf(row.get(timeframeKey)))

            return Array.from(newRow.values())
        }), storeKey)    // cannot store language dependent keys
    },
    getStoredBacktests(data) {
        let bts = []

        if (data.backtests) {
            data.backtests.forEach(bt => {
                let row = new Map()
                let clNr = 0                

                row.set('btId', bt[clNr++])
                row.set('assetId', bt[clNr++])
                row.set('patternId', bt[clNr++])

                // add columns values from translations
                let cls = i18n.t(constants.translationKeys.patterns + '.columns')
                cls.forEach(column => { 
                    if (column) { 
                        row.set(column.toLowerCase(), bt[clNr++]) 
                    } 
                })
                
                let timeframeKey = cls[3].toLowerCase()
                let directionKey = cls[11].toLowerCase()
                row.set(directionKey, Object.values(i18n.t('research.patternLab.backtestPatterns.entryRules.directions'))[row.get(directionKey)])
                row.set(timeframeKey, i18n.t('research.patternLab.timeframes')[row.get(timeframeKey)])

                row.set('fixed_amount', bt[15])     // Risk

                bts.push(row)
            })
        }

        return bts
    },
    getBacktestsNames(store, storeKey, updateKey) {             
        let data = store.getItem(constants.storeKeys.backtestPatterns)
        let backtestsNames = []
        let selectedBacktest = null

        if (data) {
          var loading = data.loading
          
          this.getStoredBacktests(data).forEach(bt => backtestsNames.push({ id: bt.get('btId'), name: bt.get(i18n.t(constants.translationKeys.patterns + '.columns')[0].toLowerCase()) }))

          data = store.getItem(storeKey)
          if (data && 'selectedBacktest' in data && backtestsNames.map(bn => bn.name).includes(data.selectedBacktest.name)) {
            selectedBacktest = data.selectedBacktest 
          }
          if (!selectedBacktest && backtestsNames.length) {
            selectedBacktest = backtestsNames[0]
          }

          updateKey++
        } else {
          loading = false
        }

        return { backtestsNames, loading, selectedBacktest, updateKey }
    },

    // pluralizer
    pluralize(nr, translationKey) {
        let nrsKey = translationKey + 's'

        if (nr === 0) {
            return i18n.t(nrsKey)
        }
        if (nr === 1) {
            return i18n.t(translationKey)
        }
        if (nr < 5) {
            return i18n.t(nrsKey + 'To4')
        } else {
            return i18n.t(nrsKey)
        }
    },
    objectEmpty(obj) {
        return Object.keys(obj).length === 0 && obj.constructor === Object
    },

    getDefaultPrName(btId) {
        return 'pr_' + btId
    },

    getBacktestPatternsTableBase(datum, store, btsColumns) {
        let name = this.getDefaultPrName(datum.id)
        let symbol = datum.ticker
        let pattern = datum.pattern

        let data = store.getItem(constants.storeKeys.backtestPatterns)
        if (data) {
            let backtests = this.getStoredBacktests(data)
            if (backtests) {
                let names = backtests.filter(bt => bt.get('btId') === datum.id)
                if (names.length) {
                    name = names[0].get(btsColumns[0].toLowerCase())
                }
                let symbols = backtests.filter(bt => bt.get('assetId') === datum.ticker)
                if (symbols.length) {
                    symbol = symbols[0].get(btsColumns[4].toLowerCase())
                }                
                let patterns = backtests.filter(bt => bt.get('patternId') === datum.pattern)
                if (patterns.length) {
                    pattern = patterns[0].get(btsColumns[5].toLowerCase())
                }                    
            }
        }

        return { name:name, symbol:symbol, pattern:pattern }
    },

    // global filters
    roundToFixed(value) {
        if (!value || Number.isInteger(value)) {
            return value
        }

        // rounds to 2 mantissa places
        return value ? ((value instanceof Number || typeof value === 'number')
                        ? value.toFixed(2)
                        : [
                            isNaN(Number(value.split(' ')[0])) ? value.split(' ')[0] : Number(value.split(' ')[0]).toFixed(2),
                            value.split(' ')[1].replace(new RegExp('&nbsp;', "g"), ' ')
                          ].concat(value.split(' ').slice(2, value.split(' ').lenght)).join(' '))
                    : value
    },
    
    chartUpdateTsText(ts, loading) {
        // returns RRRR-M-D H:M:S like formatted text for chart (if not loading)
        if (loading) {
            return null
        }

        if (ts) {            
            let newDt = new Date(ts)
            return i18n.t('chartUpdatedPrefix') + ' ' + newDt.getFullYear() + "-" + Number(newDt.getMonth() + 1) + "-" + newDt.getDate() + " " + newDt.getHours() + ":" + newDt.getMinutes() + ":" + newDt.getSeconds()
        }

        return i18n.t('chartNeverUpdated')
    },

    // others
    isNumber(val) {
        return val instanceof Number || typeof val === 'number'
    },

    notifyAudio(self, element, type, msg) {
        element.play();

        self.$notify({
          type: type, 
          message: msg
        })
    },

    setInterval(self, name, routine, interval = constants.intervals.minute) {
        routine()
    
        if (self[name]) {
            clearInterval(self[name])
        }

        self[name] = setInterval(() => {
            routine()
        }, interval )
    }
}
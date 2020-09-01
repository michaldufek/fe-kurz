<template>
  <nav class="navbar navbar-expand-lg navbar-absolute navbar-transparent">
    <div class="container-fluid">
      <div class="navbar-wrapper">
        <div style="margin-top: -40px;">
          <router-link class="navbar-brand" to="/research/patternLab/backtestPatterns/performanceResults/patterns">{{$t(perfResultsKey + ".patterns.title")}}</router-link>
          <router-link class="navbar-brand" to="/research/patternLab/backtestPatterns/performanceResults/trades">{{$t(perfResultsKey + ".trades.title")}}</router-link>
          <router-link class="navbar-brand" to="/research/patternLab/backtestPatterns/performanceResults/performanceMetrics">{{$t(perfResultsKey + ".performanceMetrics.title")}}</router-link>
          <router-link class="navbar-brand" to="/research/patternLab/backtestPatterns/performanceResults/chart">{{$t(perfResultsKey + ".chart.title")}}</router-link>

          <base-button native-type="submit" type="secondary" size="sm" @click="exportClick">{{ $t('research.patternLab.backtestPatterns.export') }}</base-button>
        </div>
      </div>
    </div>
  </nav>
</template>
<script>
  import XLSX from 'xlsx/xlsx';
  import constants from '@/custom/assets/js/constants'
  import helper from '@/custom/assets/js/helper';


  export default {
    data() {
      return {
        perfResultsKey: constants.translationKeys.performanceResults
      }
    },

    methods: {
      exportClick() {
        let sheets = []
        let sheetKeys = [ constants.translationKeys.patterns, constants.translationKeys.trades, constants.translationKeys.performanceMetrics ]
        let sheetKeysDone = []

        sheetKeys.forEach(sheetKey => {
          let sheet = { name: this.$t(sheetKey + '.title'), columns: [], data: [] }

          // create columns objects
          let columns = this.$t(sheetKey + '.columns')
          columns.forEach(column => sheet.columns.push({ label: column, field: column.toLowerCase() }))

          // create data objects
          if (sheetKey === constants.translationKeys.patterns) {
            let data = this.$store.getItem(constants.storeKeys.backtestPatterns)
            if (data) {
              this.createData(helper.getStoredBacktests(data), sheet, columns)             
            }

            sheets.push(sheet)
            sheetKeysDone.push(sheetKey)
          } else {
            this.$http
            .get(constants.urls.patternLab.backtestPatterns.results)
            .then(response => {
              let rows = []

              response.data.forEach(datum => {
                let base = helper.getBacktestPatternsTableBase(datum, this.$store, this.$t(constants.translationKeys.patterns + '.columns'))

                if (datum.error) {
                    console.log(`${this.$t(this.perfResultsKey + '.problemsPrefix')} '${base.name}' ${this.$t(this.perfResultsKey + '.problemsSuffix')}: ${datum.msg} `)
                } else {
                  if (sheetKey === constants.translationKeys.trades) {
                    helper.createTradesRow(rows, datum, base)
                  } else if (sheetKey === constants.translationKeys.performanceMetrics) {    
                    helper.createPerfMetricsRow(rows, datum, base)
                  }
                }
              })

              this.createData(rows, sheet, columns)             
            })
            .catch(error => {
              console.log(error);
              if (error.message === constants.strings.errors.networkError) {
                helper.notifyAudio(this, document.getElementById('connectionLost'), 'danger', this.$t('notifications.beConnectionLost') + '(' + this.title + ' ' + this.$t('table') + ')')
              }
            })
            .finally(() => {
              sheets.push(sheet)
              sheetKeysDone.push(sheetKey)
  
              if (sheetKeys.sort().join(',') === sheetKeysDone.sort().join(',')) {  // arrays are same, ie.we are finished
                this.exportExcel(sheets)
              }
            })            
          }
        })
      },
      createData(oldRows, sheet, columns) {
        oldRows.forEach(oldRow => {
          let row = {}
          let clNr = 0
          columns.forEach(column => {
            row[column.toLowerCase()] = oldRow instanceof Map ? oldRow.get(column.toLowerCase()) : oldRow[clNr]
            clNr++
          })
          sheet.data.push(row)
        })
      },

      exportExcel(sheets) {
        // Inspired by https://github.com/t-chatoyan/vue-excel-xlsx - functionality of export to multiple sheets was added.
        let wb = XLSX.utils.book_new()                

        sheets.forEach(sheet => {
          if (sheet.columns.length === 0 || sheet.data.length === 0){
            console.log(`Columns or data of sheet '${sheet.name}' missing! Sheet skipped.`);
          } else {
            let createXLSLFormatObj = [];
            let newXlsHeader = [];
            sheet.columns.forEach(value => {
                newXlsHeader.push(value.label);
            });

            createXLSLFormatObj.push(newXlsHeader);
            sheet.data.forEach(value => {
                let innerRowData = [];
                sheet.columns.forEach(val => {
                    if (val.dataFormat && typeof val.dataFormat === 'function') {
                        innerRowData.push(val.dataFormat(value[val.field]));
                    } else {
                        innerRowData.push(value[val.field]);
                    }
                });
                createXLSLFormatObj.push(innerRowData);
            });                    

            let ws_name = sheet.name;
            
            let ws = XLSX.utils.aoa_to_sheet(createXLSLFormatObj);
            XLSX.utils.book_append_sheet(wb, ws, ws_name);
          }
        })

        XLSX.writeFile(wb, this.$t('research.patternLab.backtestPatterns.title') + ".xlsx");
      }
    }
  };
</script>
<style>
</style>
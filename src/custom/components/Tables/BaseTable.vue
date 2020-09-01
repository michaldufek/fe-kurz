<template>
  <table class="table tablesorter tableflow" :class="tableClass">
    <thead :class="theadClasses">
    <tr>
      <slot name="columns">
        <th v-for="column in columns" 
            :key="column"
            :title="headerTitle"
            @dblclick="filter(column)"
            @keyup.esc="cancelFilter"
            :class="{ 'interactive': sortable || filterable, 'checkbox': filterable && column in filtering && checkboxColumns.includes(column), 'notCheckbox': !(filterable && column in filtering && checkboxColumns.includes(column)) }" >
            <b @click="sort(column)">{{column}}</b>&nbsp;<i v-if="column in sorting" :class="[ sorting[column] === 'asc' ? 'tim-icons icon-minimal-up' : 'tim-icons icon-minimal-down' ]"></i>
            <base-input v-show="filterable && column in filtering && !checkboxColumns.includes(column)" placeholder="Filter" v-model="filterText" style="min-width: 75px" />
            <base-checkbox v-show="filterable && column in filtering && checkboxColumns.includes(column)" v-model="filterChecked" />
        </th>
      </slot>
    </tr>
    </thead>
    <tbody :class="tbodyClasses">
    <tr v-for="(item, rowIndex) in sortedFilteredData" 
        :key="rowIndex"
        :title="clickable ? (selectedRow === rowIndex ? $t('titles.showPatternCancel') : $t('titles.showPattern')) : ''"
        :class="{ 'selected': clickable && selectedRow === rowIndex }"
        @dblclick="select(rowIndex)" >
        <!-- fix not showing clickable title -->
      <slot :row="item">
        <td v-for="(column, clIndex) in columns"
            :key="clIndex"
            v-if="hasValue(item, column)"
            :title="valueTitle(item, rowIndex, clIndex, column)"
            @dblclick="edit(item, rowIndex, clIndex, column)"
            @keyup.enter="finishEdit(rowIndex, column)" 
            @keyup.esc="editing = null"            
            :class="{ 'interactive': (editable || clickable) && !(saveable && clIndex === columns.length - 1), 'checkbox': checkboxColumns.includes(column), 'notCheckbox': !checkboxColumns.includes(column) }" >
              <!-- :data-name="column"     -->
              <base-button v-if="saveable && clIndex === columns.length - 1 && allowSave && !(savedRows.includes(item.btId))" @click="save(item)" type="secondary" size="sm" fill>{{ $t('research.save') }}</base-button>
              <p v-else-if="saveable && clIndex === columns.length - 1 && allowSave && savedRows.includes(item.btId)">{{ $t('research.saved') }}</p>
              <input type="checkbox" v-else-if="checkboxColumns.includes(column)" v-model="item[column.toLowerCase()]" @change="check(item)" />
              <base-input v-else-if="isEditing(rowIndex, column)" v-model="editText" style="min-width: 75px" />
              <p v-else>{{ itemValue(item, column) | toFixed2 }}</p>
            </td>
      </slot>
    </tr>
    </tbody>
  </table>
</template>
<script>
  import helper from '@/custom/assets/js/helper'
  
  export default {
    name: 'base-table',

    props: {
      columns: {
        type: Array,
        default: () => [],
        description: "Table columns"
      },
      checkboxColumns: {
        type: Array,
        default: () => [],
        description: "Columns that are checkboxes"
      },
      data: {
        type: Array,
        default: () => [],
        description: "Table data"
      },
      titles: {
        type: Object,
        default: () => {},
        description: "Table data values descriptions"
      },
      type: {
        type: String, // striped | hover
        default: "",
        description: "Whether table is striped or hover type"
      },
      sortable: {
        type: Boolean,
        description: "Whether columns can be sorted by header click"
      },
      filterable: {
        type: Boolean,
        description: "Whether columns can be filtered by header double-click"
      },
      editable: {
        type: Boolean,
        description: "Whether values can be directly edited by double-click"
      },
      clickable: {
        type: Boolean,
        description: "Whether rows can be double-clicked for some action"
      },
      saveable: {
        type: Boolean,
        description: "Whether rows have Save button at last column (to do emit Save action)"
      },
      allowSave: {
        type: Boolean,
        description: "Whether rows can use Save button functionality" // ie. backtest was run and row has result ID
      },
      savedRows: {
        type: Array,
        default: () => [],
        description: "Table rows that are already saved"
      },
      theadClasses: {
        type: String,
        default: '',
        description: "<thead> css classes"
      },
      tbodyClasses: {
        type: String,
        default: '',
        description: "<tbody> css classes"
      }
    },

    data() {
      return {
        sorting: {},

        filtering: {},
        filterText: null,
        filterChecked: false,

        editing: null,
        editText: null,

        selectedRow: -1
      }
    },

    computed: {
      sortedFilteredData() {
        let data = this.data.map(row => row instanceof Map ? Object.fromEntries(row) : row)     // because Patterns (backtests) table is Array of Maps

        if (!helper.objectEmpty(this.filtering)) {
          data = this.filterData(data)
        }
        if (!helper.objectEmpty(this.sorting)) {
          this.sortData(data)
        }

        if (this.saveable) {
          data.forEach(row => row[""] = "")
          this.columns.push("");          
        }
        
        return data
      },

      tableClass() {
        return this.type && `table-${this.type}`;
      },

      headerTitle() {
        let title = ''

        if (this.sortable) {
          title += this.$t('titles.sort')
        }
        if (this.filterable) {
          title += ' ' + (helper.objectEmpty(this.filtering) ? this.$t('titles.filter') : this.$t('titles.filterCancel'))
        }

        return title
      }
    },

    filters: {
      toFixed2(nr) {
        if (!nr || Number.isInteger(nr) || typeof nr === "boolean") {
          return nr
        }

        if (helper.isNumber(nr)) {
          return nr.toFixed(2)
        }

        // split because in portfolio card it is in '<statisticName>: <number>' format
        let sep = ': '
        let nrSplitted = nr.split(sep)
        let nrIndex = nrSplitted.length - 1
        
        nrSplitted[nrIndex] = nrSplitted[nrIndex].split(' ').length === 1 && isNaN(Number(nrSplitted[nrIndex]))
                              ? nrSplitted[nrIndex]
                              : helper.roundToFixed(!isNaN(Number(nrSplitted[nrIndex])) ? Number(nrSplitted[nrIndex]) : nrSplitted[nrIndex])
        return nrSplitted.join(sep)
      }
    },

    methods: {
      sortData(data) {
        data = data.sort((row1,row2) => {        
          let column = Object.keys(this.sorting)[0]          
          let order = Object.values(this.sorting)[0]
          let item1AsNr = Number(String(row1[column.toLowerCase()]).split(' ')[0])
          let item2AsNr = Number(String(row2[column.toLowerCase()]).split(' ')[0])

          return isNaN(item1AsNr)   // ie.is String
                  ? (order === 'asc' 
                    ? String(row1[column.toLowerCase()]).localeCompare(String(row2[column.toLowerCase()])) 
                    : String(row2[column.toLowerCase()]).localeCompare(String(row1[column.toLowerCase()])))
                  : (order === 'asc' 
                    ? item1AsNr - item2AsNr
                    : item2AsNr - item1AsNr)
        })
      },
      filterData(data) {
        let column = Object.keys(this.filtering)[0]

        return data.filter(row => (column in this.filtering && 
                                  ((this.filterText && String(row[column.toLowerCase()]).toLowerCase().includes(this.filterText.toLowerCase()))
                                   || (this.checkboxColumns.includes(column) && this.filterChecked === row[column.toLowerCase()])))
                                  || !(column in this.filtering) 
                                  || (!this.checkboxColumns.includes(column) && !this.filterText)
                          )
      },

      sort(column) {  // to-do: sort by multiple columns?
        if (this.sortable) {
          let origOrder = this.sorting[column]
          this.sorting = {} 
          if (origOrder !== 'desc') {
            this.sorting[column] = origOrder === 'asc' ? 'desc' : 'asc'
          }          
        }
      },
      filter(column) {
        if (Object.keys(this.filtering)[0] !== column) {    // only if it's not the same column
          this.cancelFilter()  
          this.filtering[column] = true
        }
      },
      cancelFilter() {
        this.filtering = {}
        this.filterText = null
        this.filterChecked = false
      },

      edit(item, rowIndex, clIndex, column) { 
        if (this.saveable && clIndex === this.columns.length - 1) {
          return
        }

        let val = this.itemValue(item, column)   
        
        let del = ' '
        if (column === 'Name') {  // special case for Backtest - patterns table
          del += '('
        }
        this.editText = val ? ((!isNaN(Number(val)) ? String(val) : val).split(del)[0]) : ''
        this.editing = [rowIndex, column]
      },
      finishEdit(rowIndex, column) {
        this.$emit('edited', {
          position: [rowIndex, column],    // to-do: probably bug - after sort  this returns sorted (new) index, store has unsorted (different) index
          value: this.editText})
        this.editing = null
      },
      isEditing(rowIndex, column) {
        return this.editable && this.editing && this.editing[0] === rowIndex && this.editing[1] === column
      },   
      
      save(item) {
        this.$emit('saved', item)
      },

      check(item) {
        this.$emit('checked', item)
      },

      select(rowIndex) {
        this.selectedRow = this.selectedRow === rowIndex ? -1 : rowIndex  
        this.$emit('selected', this.selectedRow)
      },

      hasValue(item, column) {
        return item[column.toLowerCase()] !== "undefined";
      },
      itemValue(item, column) {
        return item[column.toLowerCase()];
      },

      valueTitle(item, rowIndex, clIndex, column) {
        if (this.saveable && clIndex === this.columns.length - 1) {
          return this.$t('titles.save2dataWarehouse')
        }

        let suffix = this.editable ? ' ' + (this.isEditing(rowIndex, column) ? this.$t('titles.editCancel') : this.$t('titles.edit')) : ''
        let value = this.itemValue(item, column)

        if (!value || !(typeof value === 'string' || value instanceof String) || !this.titles) {
          return suffix
        }

        // split because in portfolio card it is in '<statisticName>: <number>' format
        return this.titles[value.split(': ')[0].toLowerCase()] + suffix
      }
    },

    watch: {
      filterText(val) {
        let filterCl = null

        Object.keys(this.filtering).forEach(cl => { 
          if (this.filtering[cl]) {
            filterCl = cl
          } 
        })
        this.$emit('filtered', { column: filterCl, filter: val })        
      }
    }
  }
</script>
<style>
.interactive {
  cursor: pointer
}

.notCheckbox {
  text-align: right;
  white-space: pre-wrap
}

.checkbox {
  text-align: center
}

.selected {
  background-color: darkslategrey
}
</style>
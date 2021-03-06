// importing the modified version of Chart object.
import Chart from './fin/index';

export function generateChart(chartId, chartType) {
  return {
    render: function render(createElement) {
      return createElement('div', {
        style: this.styles,
        class: this.cssClasses,
      }, [createElement('canvas', {
        attrs: {
          id: this.chartId,
          width: this.width,
          height: this.height,
        },
        ref: 'canvas',
      })]);
    },
    props: {
      chartId: {
        default: chartId,
        type: String,
      },
      width: {
        default: 400,
        type: Number,
      },
      height: {
        default: 400,
        type: Number,
      },
      cssClasses: {
        type: String,
        default: '',
      },
      styles: {
        type: Object,
      },
      plugins: {
        type: Array,
        default: function _default() {
          return [];
        },
      },
    },
    data: function data() {
      return {
        _chart: null,
        _plugins: this.plugins,
      };
    },
    methods: {
      addPlugin: function addPlugin(plugin) {
        this.$data._plugins.push(plugin);
      },
      generateLegend: function generateLegend() {
        if (this.$data._chart) {
          return this.$data._chart.generateLegend();
        }
      },
      renderChart: function renderChart(data, options) {
        if (this.$data._chart) this.$data._chart.destroy();
        this.$data._chart = new Chart(this.$refs.canvas.getContext('2d'), {
          type: chartType,
          data,
          options,
          plugins: this.$data._plugins,
        });
      },
    },
    beforeDestroy: function beforeDestroy() {
      if (this.$data._chart) {
        this.$data._chart.destroy();
      }
    },
  };
}

export var Candlestick = generateChart('candlestick-chart', 'candlestick');
export var Ohlc = generateChart('ohlc-chart', 'ohlc');
export var Bar = generateChart('bar-chart', 'bar');
export var HorizontalBar = generateChart('horizontalbar-chart', 'horizontalBar');
export var Doughnut = generateChart('doughnut-chart', 'doughnut');
export var Line = generateChart('line-chart', 'line');
export var Pie = generateChart('pie-chart', 'pie');
export var PolarArea = generateChart('polar-chart', 'polarArea');
export var Radar = generateChart('radar-chart', 'radar');
export var Bubble = generateChart('bubble-chart', 'bubble');
export var Scatter = generateChart('scatter-chart', 'scatter');
export default {
  Candlestick,
  Ohlc,
  Bar,
  HorizontalBar,
  Doughnut,
  Line,
  Pie,
  PolarArea,
  Radar,
  Bubble,
  Scatter,
};

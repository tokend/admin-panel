<template>
  <div class="price-chart"></div>
</template>

<script>
import { AssetPair } from '../../models/AssetPair'
import * as d3Array from 'd3-array'
import * as d3Selection from 'd3-selection'
import * as d3Scale from 'd3-scale'
import * as d3Axis from 'd3-axis'
import * as d3Shape from 'd3-shape'
import * as d3Transition from 'd3-transition'
import * as d3Ease from 'd3-ease'
import * as d3Format from 'd3-format'

import moment from 'moment'
const d3 = Object.assign({}, d3Array, d3Selection, d3Axis, d3Shape, d3Scale, d3Transition, d3Ease, d3Format)

const CLASS_NAME = 'price-chart'
const DECIMAL_PRECISION = 4
const LARGE_NUMBER_PRECISION = 2

export default {
  name: CLASS_NAME,
  data () {
    return {
      assetCode: ''
    }
  },

  props: ['priceHistory', 'scale', 'assetPair'],

  watch: {
    'priceHistory' () { this.render() },
    'scale' () { this.render() },
    'assetPair' () { this.render() }
  },

  mounted (...args) {
    this.render()
    window.addEventListener('resize', this.render)
  },

  beforeDestroy () {
    window.removeEventListener('resize', this.render)
  },

  computed: {

  },

  methods: {
    clear () {
      d3.select(`svg.${CLASS_NAME}`).remove()
    },

    getDimensions (el) {
      const parentElement = el.parentElement
      return {
        width: parentElement.clientWidth,
        height: parentElement.clientHeight < 250
          ? 250
          : parentElement.clientHeight
      }
    },

    getMaxAndMinValues (data) {
      const arr = data.map(item => +item.value)
      const max = Math.max(...arr)
      const min = Math.min(...arr)
      return { max, min }
    },

    getMaxAndMinDates (data) {
      const max = data.reduce((acc, { time: cur }) => cur > acc ? cur : acc, 0)
      const min = data.reduce((acc, { time: cur }) => cur < acc ? cur : acc, max)
      return { max, min }
    },

    prettifyNumber (number) {
      if (number < 1e3) {
        return d3.format(`.${DECIMAL_PRECISION}f`)(number)
      } else {
        return d3.formatPrefix(`.${LARGE_NUMBER_PRECISION}`, number)(number)
      }
    },

    formatMoney (amount) {
      const symbol = ({
        'USD': '$',
        'SUN': 'SUN'
      })[this.assetCode]

      const moneyFormats = {
        'en': ({ value, symbol }) => `${value} ${this.assetCode}`
      }

      return moneyFormats['en']({ value: this.prettifyNumber(amount), symbol })
    },

    normalizeData (data) {
      return data
        .map(item => ({
          time: moment(item.timestamp).toDate(),
          value: +item.value
        }))
        .sort(function (a, b) { return a.time - b.time })
    },

    extractQuoteAsset (pair) {
      return new AssetPair(pair).toObject().quote
    },

    // Y axis helpers

    genYTickValues (data) {
      const { min, max } = this.getMaxAndMinValues(data)
      const average = min + ((max - min) / 2)
      const gap = max > min ? (max - average) * 0.66 : 0.5

      return [
        average - gap,
        average,
        average + gap
      ]
    },

    genYMaxTickWidth (data) {
      const ticks = this.genYTickValues(data)
      const maxTickLength = ticks.reduce((acc, cur) => {
        const len = this.formatMoney(cur).length
        return acc < len ? len : acc
      }, 0)
      return maxTickLength * 10 + 5
    },

    genYDomain (data) {
      const ticks = this.genYTickValues(data)
      const minTick = ticks[0]
      const maxTick = ticks[ticks.length - 1]
      const padding = (maxTick - minTick) * 0.29
      const domain = [minTick - padding, maxTick + padding]
      return domain
    },

    // X axis helpers

    genXTickValues (data, width = 0) {
      let result

      const { max, min } = this.getMaxAndMinDates(data)
      const average = min.getTime() + ((max - min) / 2)
      const gap = max > min
        ? (max - average) * 0.333333
        : 3600 * 1000 // an hour

      if (width > 600) {
        result = [
          new Date(average - gap * 3),
          new Date(average - gap),
          new Date(average + gap),
          new Date(average + gap * 3)
        ]
      } else {
        result = [
          new Date(average - gap * 3),
          new Date(average + gap * 3)
        ]
      }

      return result
    },

    genXAxisFormatter (data) {
      const { max, min } = this.getMaxAndMinDates(data)
      const diff = max - min
      const day = 24 * 3600 * 1000
      const week = day * 7

      let formatter
      if (diff < 2 * day) {
        formatter = (d) => {
          const date = moment(d)
          const format = 'DD/MM HH:mm'
          return date.minutes() < 30 // round the date
            ? date.startOf('hour').format(format)
            : date.add(1, 'hours').startOf('hour').format(format)
        }
      } else if (diff < week) {
        formatter = (d) => moment(d).format('ddd DD/MM')
      } else if (diff < week * 2) {
        formatter = (d) => moment(d).format('DD/MM')
      } else {
        formatter = (d) => moment(d).format('DD/MM/YYYY')
      }
      return formatter
    },

    genXDomain (data) {
      return this.genXTickValues(data)
    },

    // render

    render () {
      this.clear(this.$el)
      this.assetCode = this.extractQuoteAsset(this.assetPair)

      // Setup the data
      const scale = this.scale
      const data = this.normalizeData(this.priceHistory[scale])

      if (!data || !data[0]) return

      // Setup svg
      const margin = {
        top: 20,
        right: 5,
        bottom: 30,
        left: this.genYMaxTickWidth(data)
      }
      const dimensions = this.getDimensions(this.$el)
      const width = dimensions.width - margin.right - margin.left
      const height = dimensions.height - margin.top - margin.bottom

      const viewWidth = width + margin.right + margin.left
      const viewHeight = height + margin.top + margin.bottom
      const svg = d3.select(this.$el)
        .append('svg')
        .attr('width', '100%')
        .attr('viewBox', `0 0 ${viewWidth} ${viewHeight}`)
        .attr('preserveAspectRatio', 'xMinYMin')
        .attr('class', CLASS_NAME)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)

      // Define domains
      const y = d3.scaleLinear()
        .range([height, 0])
        .domain(this.genYDomain(data))

      const x = d3.scaleTime()
        .range([0, width])
        .domain(this.genXDomain(data))

      // Render x-axis
      const xAxis = d3.axisBottom(x)
        .tickValues(this.genXTickValues(data, width))
        .tickFormat(this.genXAxisFormatter(data))
        .tickSize(8)
        .tickPadding(4)

      svg.append('g')
        .attr('class', `${CLASS_NAME}__x-axis`)
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis)

      // Render y-axis
      const yAxis = d3.axisLeft(y)
        .tickValues(this.genYTickValues(data))
        .tickFormat((d) => this.formatMoney(d))
        .tickSizeInner(-(width + margin.right))
        .tickSizeOuter(0)
        .tickPadding(25)

      svg.append('g')
        .attr('class', `${CLASS_NAME}__y-axis`)
        .call(yAxis)
        .selectAll('line')

      // Render the line
      const line = d3.line()
        .x((d) => x(d.time))
        .y((d) => y(d.value))
        .curve(d3.curveStepAfter)

      const path = svg.append('path')
        .attr('class', `${CLASS_NAME}__line`)
        .attr('d', line(data))

      const totalLength = path.node().getTotalLength()

      path
        .attr('stroke-dasharray', totalLength + ' ' + totalLength)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(500)
        .ease(d3.easeLinear)
        .attr('stroke-dashoffset', 0)

      // Render Tip
      const tip = svg.append('g')
        .attr('class', `${CLASS_NAME}__tip`)

      tip.append('line')
        .attr('class', `${CLASS_NAME}__tip-line`)
        .attr('x1', 0)
        .attr('y1', 15)
        .attr('x2', 0)
        .attr('y2', height)

      const tipCircle = tip.append('circle')
        .attr('class', `${CLASS_NAME}__tip-circle`)
        .attr('cx', 0)
        .attr('r', 5)

      const tipTextBox = tip.append('g')

      tipTextBox.append('rect')
        .attr('class', `${CLASS_NAME}__tip-text-box`)
        .attr('width', 120)
        .attr('height', 55)
        .attr('transform', 'translate(-60, -38)')
        .attr('rx', 3)
        .attr('ry', 3)

      const tipPriceText = tipTextBox.append('text')
        .attr('class', `${CLASS_NAME}__tip-text-price`)
        .attr('text-anchor', 'middle')
        .attr('y', -15)

      const tipTimeText = tipTextBox.append('text')
        .attr('class', `${CLASS_NAME}__tip-text-time`)
        .attr('text-anchor', 'middle')
        .attr('y', 5)

      const motionCaptureArea = svg.append('rect')
        .attr('class', `${CLASS_NAME}__tip-motion-capture-area`)
        .attr('width', width)
        .attr('height', height)

      function showTip () {
        tip.classed(`${CLASS_NAME}__tip--show`, true)
      }

      function moveTip () {
        tip.classed(`${CLASS_NAME}__tip--hidden`, false)
        const x0 = x.invert(d3.mouse(svg.node())[0])
        const bisectDate = d3.bisector(d => d.time).left
        const bisectIndex = bisectDate(data, x0, 1)
        const d0 = data[bisectIndex - 1]
        const d1 = data[bisectIndex]
        const nearestPoint = x0 - d0.time > d1.time - x0 ? d1 : d0
        // Change text of the tooltip
        tipPriceText.text(this.formatMoney(nearestPoint.value))
        tipTimeText.text(moment(nearestPoint.time).format('MM/DD/YYYY hh:mm a'))

        // Change X position of the tip
        tip.attr('transform', `translate(${x(nearestPoint.time)})`)

        // Change Y position of the circle
        tipCircle.attr('cy', y(nearestPoint.value))
      }

      function hideTip () {
        tip.classed(`${CLASS_NAME}__tip--show`, false)
      }

      motionCaptureArea.on('mouseenter', () => showTip.call(this))
      motionCaptureArea.on('touchstart', () => showTip.call(this))
      motionCaptureArea.on('mousemove', () => moveTip.call(this))
      motionCaptureArea.on('touchmove', () => moveTip.call(this))
      motionCaptureArea.on('mouseout', () => hideTip.call(this))
      motionCaptureArea.on('touchend', () => hideTip.call(this))

      tip.classed(`${CLASS_NAME}__tip--hidden`, true)
    }
  }
}
</script>

<style lang="scss">
@import "../../../../../assets/scss/colors";

$color-line: $color-active;
$color-ticks: $color-text;
$color-text: $color-text;
$fs-root: 1.6rem;
$fs-tip: 1.2rem;

.price-chart,
.price-chart svg {
  @media (min-width: 767px) {
    min-height: 200px;
  }
  transition: 0.2s;
}

svg.price-chart {
  display: block;
  overflow: visible;

  * {
    font-family: inherit;
  }

  & > g {
    overflow: hidden;
  }
}

.price-chart__line {
  fill: none;
  stroke-width: 2px;
  stroke: $color-line;
  stroke-linecap: round;
}

.price-chart__x-axis {
  & > .tick {
    &:first-of-type {
      text-anchor: start;
    }

    &:last-of-type {
      text-anchor: end;
    }

    &:only-of-type {
      text-anchor: middle;
    }
  }

  text {
    font-size: $fs-root;
    fill: $color-ticks;
  }

  & > .domain {
    display: none;
  }
}

.price-chart__y-axis {
  & > .tick {
    & > text {
      font-size: $fs-root;
      fill: $color-ticks;
    }

    & > line {
      stroke-dasharray: 3 3;
      stroke: $color-ticks;
      opacity: 0.15;
    }
  }

  & > .domain {
    display: none;
  }
}

.price-chart__tip {
  transition: opacity 0.2s;
  opacity: 0;
  &--show {
    opacity: 1;
  }
  &--hidden {
    opacity: 0 !important;
  }
}
.price-chart__tip-line {
  stroke-width: 1px;
  stroke: $color-line;
}

.price-chart__tip-circle {
  stroke-width: 2px;
  fill: $color-line;
}

.price-chart__tip-text-box {
  fill: white;
  stroke: $color-line;
  stroke-width: 1px;
}

.price-chart__tip-text-price {
  font-size: $fs-root;
  fill: $color-text;
  font-weight: 800;
}

.price-chart__tip-text-time {
  font-size: $fs-tip;
  fill: $color-text;
}

.price-chart__tip-motion-capture-area {
  opacity: 0;
}
</style>

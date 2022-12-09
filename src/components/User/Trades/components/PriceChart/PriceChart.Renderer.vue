<template>
  <div class="price-chart" />
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

import { DateUtil } from '@/utils/date.util'
const d3 = Object.assign(
  {},
  d3Array,
  d3Selection,
  d3Axis,
  d3Shape,
  d3Scale,
  d3Transition,
  d3Ease,
  d3Format
)

const CLASS_NAME = 'price-chart'
const DECIMAL_PRECISION = 4
const LARGE_NUMBER_PRECISION = 2

export default {
  name: CLASS_NAME,

  props: {
    priceHistory: { type: Object, required: true },
    scale: { type: String, required: true },
    assetPair: { type: String, required: true },
  },

  data () {
    return {
      assetCode: '',
      x: '',
      y: '',
      isFirstRender: '',
      svg: '',
      xAxis: '',
      yAxis: '',
      animationDuration: 500,
      isAnimating: false,
    }
  },

  computed: {
    data () {
      return this.normalizeData(this.priceHistory[this.scale])
    },
  },

  watch: {
    'priceHistory' () { this.update() },
    'scale' () { this.update() },
    'assetPair' () { this.update() },
  },

  mounted (...args) {
    this.init()
    window.addEventListener('resize', this.init)
  },

  beforeDestroy () {
    window.removeEventListener('resize', this.init)
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
          : parentElement.clientHeight,
      }
    },

    getMaxAndMinValues (data) {
      const arr = data.map(item => +item.value)
      const max = Math.max(...arr)
      const min = Math.min(...arr)
      return { max, min }
    },

    getMaxAndMinDates (data) {
      const max = data
        .reduce((acc, { time: cur }) => cur > acc ? cur : acc, 0)
      const min = data
        .reduce((acc, { time: cur }) => cur < acc ? cur : acc, max)

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
      })[this.assetCode]

      const moneyFormats = {
        'en': ({ value, symbol }) => `${value} ${this.assetCode}`,
      }

      return moneyFormats['en']({ value: this.prettifyNumber(amount), symbol })
    },

    normalizeData (data) {
      return data
        .map(item => ({
          time: DateUtil.toDate(item.timestamp),
          value: +item.value,
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
        average + gap,
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
          new Date(average + gap * 3),
        ]
      } else {
        result = [
          new Date(average - gap * 3),
          new Date(average + gap * 3),
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
          const date = DateUtil.date(d)
          const format = 'DD/MM HH:mm'
          if (date.minute() < 30) {
            return DateUtil.format(DateUtil.startOf('hour', date), format)
          } else {
            return DateUtil.format(
              DateUtil.startOf('hour',
                DateUtil.add(date, 1, 'hours')
              ),
              format
            )
          }
        }
      } else if (diff < week) {
        formatter = (d) => DateUtil.format(d, 'ddd DD/MM')
      } else if (diff < week * 2) {
        formatter = (d) => DateUtil.format(d, 'DD/MM')
      } else {
        formatter = (d) => DateUtil.format(d, 'DD/MM/YYYY')
      }
      return formatter
    },

    genXDomain (data) {
      return this.genXTickValues(data)
    },

    init () {
      this.isFirstRender = true
      this.clear(this.$el)
      this.assetCode = this.extractQuoteAsset(this.assetPair)

      if (!this.data || !this.data[0]) return

      // Setup svg
      const margin = {
        top: 20,
        right: 5,
        bottom: 30,
        left: this.genYMaxTickWidth(this.data),
      }
      const dimensions = this.getDimensions(this.$el)
      this.width = dimensions.width - margin.right - margin.left
      this.height = dimensions.height - margin.top - margin.bottom

      const viewWidth = this.width + margin.right + margin.left
      const viewHeight = this.height + margin.top + margin.bottom

      this.svg = d3.select(this.$el)
        .append('svg')
        .attr('width', '100%')
        .attr('viewBox', `0 0 ${viewWidth} ${viewHeight}`)
        .attr('preserveAspectRatio', 'xMinYMin')
        .attr('class', CLASS_NAME)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)

      this.y = d3.scaleLinear().range([this.height, 0])

      this.x = d3.scaleTime().range([0, this.width])

      // Render x-axis
      this.xAxis = d3.axisBottom(this.x)
        .tickFormat(this.genXAxisFormatter(this.data))
        .tickSize(8)
        .tickPadding(4)

      // Render y-axis
      this.yAxis = d3.axisLeft(this.y)
        .tickFormat((d) => this.formatMoney(d))
        .tickSizeInner(-(this.width + margin.right))
        .tickSizeOuter(0)
        .tickPadding(25)

      this.svg.append('g')
        .attr('class', `${CLASS_NAME}__x-axis`)
        .attr('transform', `translate(0, ${this.height})`)

      this.svg.append('g')
        .attr('class', `${CLASS_NAME}__y-axis`)

      this.update()
    },

    update () {
      this.isAnimating = true
      const line = d3.line()
        .x((d) => this.x(d.time))
        .y((d) => this.y(d.value))
        .curve(d3.curveStepAfter)
      const priceChartSvg = d3.select(`svg.${CLASS_NAME}`)
      priceChartSvg.classed(`${CLASS_NAME}--overflow-hidden`, true)
      // Define domains
      this.y.domain(this.genYDomain(this.data))
      this.x.domain(this.genXDomain(this.data))

      this.xAxis
        .tickValues(this.genXTickValues(this.data, this.width))

      this.yAxis
        .tickValues(this.genYTickValues(this.data))

      // Update the X axis
      this.svg.selectAll(`.${CLASS_NAME}__x-axis`)
        .transition()
        .duration(this.animationDuration)
        .call(this.xAxis)

      // Update the Y axis
      this.svg.selectAll(`.${CLASS_NAME}__y-axis`)
        .transition()
        .duration(this.animationDuration)
        .call(this.yAxis)

      if (this.isFirstRender) {
        const path = this.svg.append('path')
          .attr('class', `${CLASS_NAME}__line`)
          .attr('d', line(this.data))

        const totalLength = path.node().getTotalLength()

        path
          .attr('stroke-dasharray', totalLength + ' ' + totalLength)
          .attr('stroke-dashoffset', totalLength)
          .transition()
          .duration(this.animationDuration)
          .ease(d3.easeLinear)
          .attr('stroke-dashoffset', 0)

        this.isFirstRender = false
      } else {
        // Update the line
        let path = this.svg.selectAll(`.${CLASS_NAME}__line`)
          .attr('stroke-dasharray', null)
          .attr('stroke-dashoffset', null)
          .attr('stroke-dashoffset', null)
          .data([this.data])

        path = path
          .enter()
          .append('path')
          .attr('class', `${CLASS_NAME}__line`)
          .merge(path)

        path.transition()
          .duration(this.animationDuration)
          .attr('d', line)
      }

      // Render Tip
      const tip = this.svg.append('g')
        .attr('class', `${CLASS_NAME}__tip`)

      tip.append('line')
        .attr('class', `${CLASS_NAME}__tip-line`)
        .attr('x1', 0)
        .attr('y1', 15)
        .attr('x2', 0)
        .attr('y2', this.height)

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

      const motionCaptureArea = this.svg.append('rect')
        .attr('class', `${CLASS_NAME}__tip-motion-capture-area`)
        .attr('width', this.width)
        .attr('height', this.height)

      function showTip () {
        tip.classed(`${CLASS_NAME}__tip--show`, true)
      }

      function moveTip () {
        if (!this.isAnimating) {
          tip.classed(`${CLASS_NAME}__tip--hidden`, false)
        }
        const x0 = this.x.invert(d3.mouse(this.svg.node())[0])
        const bisectDate = d3.bisector(d => d.time).left
        const bisectIndex = bisectDate(this.data, x0, 1)
        const d0 = this.data[bisectIndex - 1]
        const d1 = this.data[bisectIndex]
        const nearestPoint = x0 - d0.time > d1.time - x0 ? d1 : d0
        // Change text of the tooltip
        tipPriceText.text(this.formatMoney(nearestPoint.value))
        tipTimeText.text(DateUtil.format(nearestPoint.time, 'MM/DD/YYYY hh:mm a'))

        // Change X position of the tip
        tip.attr('transform', `translate(${this.x(nearestPoint.time)})`)

        // Change Y position of the circle
        tipCircle.attr('cy', this.y(nearestPoint.value))
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
      setTimeout(() => {
        this.isAnimating = false
        priceChartSvg.classed(`${CLASS_NAME}--overflow-hidden`, false)
      }, this.animationDuration)
    },
  },
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

  &--overflow-hidden {
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

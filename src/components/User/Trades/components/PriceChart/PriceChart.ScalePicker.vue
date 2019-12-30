<template>
  <div class="scale-picker">
    <button
      class="scale-picker__btn"
      @click="$emit('input', tabs.hour)"
      :class="{ selected: value === tabs.hour }"
      :disabled="isPending"
    >
      {{ "price-chart-scale-picker.btn-hour" | globalize }}
    </button>

    <button
      class="scale-picker__btn"
      @click="$emit('input', tabs.day)"
      :class="{ selected: value === tabs.day }"
      :disabled="isPending"
    >
      {{ "price-chart-scale-picker.btn-day" | globalize }}
    </button>

    <button
      class="scale-picker__btn"
      @click="$emit('input', tabs.month)"
      :class="{ selected: value === tabs.month }"
      :disabled="isPending"
    >
      {{ "price-chart-scale-picker.btn-month" | globalize }}
    </button>

    <button
      class="scale-picker__btn"
      @click="$emit('input', tabs.year)"
      :class="{ selected: value === tabs.year }"
      :disabled="isPending"
    >
      {{ "price-chart-scale-picker.btn-year" | globalize }}
    </button>
  </div>
</template>

<script>
export default {
  props: {
    value: { type: String, required: true },
    isPending: { type: Boolean, default: false },
  },

  data () {
    return {
      tabs: {
        hour: 'hour',
        day: 'day',
        week: 'week',
        month: 'month',
        year: 'year',
        all: 'all',
      },
    }
  },
}
</script>

<style lang="scss" scoped>
@import "../../../../../assets/scss/colors";

.scale-picker {
  border-bottom: 0.1rem solid lighten($color-unfocused, 40%);
  display: flex;
  justify-content: flex-end;
  margin-bottom: 3rem;
}

.scale-picker__btn {
  font-size: 1.6rem;
  padding: 1rem 1.5rem;
  margin: 0 1rem;
  cursor: pointer;
  letter-spacing: 0.005em;
  position: relative;
  text-transform: uppercase;

  &:after {
    background: transparent;
    bottom: -0.1rem;
    content: "";
    display: block;
    height: 0.2rem;
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    transition: width 0.25s ease, background-color 0.25s ease;
    width: 0;
  }

  &.selected {
    &:after {
      background: $color-active;
      width: 100%;
    }
  }
}
</style>

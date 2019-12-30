/**
 * Wijmo Vue interop module.
 */
import Vue from 'vue'

var wijmo;
(function (wijmo) {
  var vue;
  (function (vue) {
    // get an array with a control's properties and events
    function getProps(ctlClass, extraProps) {
      // start with 'special' members
      var p = ['control', 'initialized'];
      // add properties and events on this class and all ancestors
      for (var proto = ctlClass.prototype; proto != Object.prototype; proto = Object.getPrototypeOf(proto)) {
        var props = Object.getOwnPropertyNames(proto);
        for (var i = 0; i < props.length; i++) {
          var prop = props[i], pd = Object.getOwnPropertyDescriptor(proto, prop), eventRaiser = prop.match(/^on[A-Z]/);
          if (pd.set || eventRaiser) {
            if (eventRaiser) {
              prop = prop[2].toLowerCase() + prop.substr(3);
            }
            if (p.indexOf(prop) < 0 && !prop.match(/disabled|required/)) {
              p.push(prop);
            }
          }
        }
      }
      // add extra properties
      if (extraProps) {
        Array.prototype.push.apply(p, extraProps);
      }
      // done
      return p;
    }
    vue.getProps = getProps;
    // initialize control properties from component, add watchers to keep the control in sync
    function initialize(component, control) {
      // hook up event handlers
      for (var prop in component._props) {
        if (control[prop] instanceof wijmo.Event) {
          var event = control[prop];
          // fire component event handler
          if (wijmo.isFunction(component[prop])) {
            event.addHandler(component[prop], control);
          }
          // update property 'xxx' in response to 'xxxChanged' event
          var m = prop.match(/(\w+)Changed/);
          if (m && m.length) {
            prop = m[1];
            if (control[prop] != null && component[prop] != null) {
              event.addHandler(_update.bind({
                component: component,
                control: control,
                prop: prop
              }));
            }
          }
        }
      }
      // initialize properties (after setting up event handlers)
      for (var prop in component._props) {
        if (!(control[prop] instanceof wijmo.Event) && component[prop] != null) {
          control[prop] = component[prop];
          component.$watch(prop, _watch.bind({ control: control, prop: prop }));
        }
      }
      // set 'control' pseudo-property so it's accessible to parent component
      if (component.control && component.$parent) {
        component.$parent[component.control] = control;
      }
      // invoke 'initialized' event
      if (wijmo.isFunction(component.initialized)) {
        component.initialized(control);
      }
      // update control property to match component changes
      function _watch(newValue) {
        this.control[this.prop] = newValue;
      }
      function _update() {
        this.component[this.prop] = this.control[this.prop];
      }
    }
    vue.initialize = initialize;
    // copy properties from an object to another
    function copy(dst, src) {
      for (var key in src) {
        if (key in dst && wijmo.isPrimitive(src[key])) {
          dst[key] = src[key];
        }
      }
    }
    vue.copy = copy;
    // get the name of an object from the constructor
    function getClassName(obj) {
      var m = obj.constructor ? obj.constructor.toString().match(/function\s+(\w+)/) : null;
      return (m && m.length) ? m[1] : null;
    }
    vue.getClassName = getClassName;
    ;
  })(vue = wijmo.vue || (wijmo.vue = {}));
})(wijmo || (wijmo = {}));
// ** wijmo.input components
Vue.component('wj-auto-complete', {
  template: '<div/>',
  props: wijmo.vue.getProps(wijmo.input.AutoComplete),
  attached: function () {
    wijmo.vue.initialize(this, new wijmo.input.AutoComplete(this.$el));
  }
});
Vue.component('wj-calendar', {
  template: '<div/>',
  props: wijmo.vue.getProps(wijmo.input.Calendar),
  attached: function () {
    wijmo.vue.initialize(this, new wijmo.input.Calendar(this.$el));
  }
});
Vue.component('wj-color-picker', {
  template: '<div/>',
  props: wijmo.vue.getProps(wijmo.input.ColorPicker),
  attached: function () {
    wijmo.vue.initialize(this, new wijmo.input.ColorPicker(this.$el));
  }
});
Vue.component('wj-combo-box', {
  template: '<div/>',
  props: wijmo.vue.getProps(wijmo.input.ComboBox),
  attached: function () {
    wijmo.vue.initialize(this, new wijmo.input.ComboBox(this.$el));
  }
});
Vue.component('wj-input-color', {
  template: '<div/>',
  props: wijmo.vue.getProps(wijmo.input.InputColor),
  attached: function () {
    wijmo.vue.initialize(this, new wijmo.input.InputColor(this.$el));
  }
});
Vue.component('wj-input-date', {
  template: '<div/>',
  props: wijmo.vue.getProps(wijmo.input.InputDate),
  attached: function () {
    wijmo.vue.initialize(this, new wijmo.input.InputDate(this.$el));
  }
});
Vue.component('wj-input-date-time', {
  template: '<div/>',
  props: wijmo.vue.getProps(wijmo.input.InputDateTime),
  attached: function () {
    wijmo.vue.initialize(this, new wijmo.input.InputDateTime(this.$el));
  }
});
Vue.component('wj-input-mask', {
  template: '<div/>',
  props: wijmo.vue.getProps(wijmo.input.InputMask),
  attached: function () {
    wijmo.vue.initialize(this, new wijmo.input.InputMask(this.$el));
  }
});
Vue.component('wj-input-number', {
  template: '<div/>',
  props: wijmo.vue.getProps(wijmo.input.InputNumber),
  attached: function () {
    wijmo.vue.initialize(this, new wijmo.input.InputNumber(this.$el));
  }
});
Vue.component('wj-input-time', {
  template: '<div/>',
  props: wijmo.vue.getProps(wijmo.input.InputTime),
  attached: function () {
    wijmo.vue.initialize(this, new wijmo.input.InputTime(this.$el));
  }
});
Vue.component('wj-list-box', {
  template: '<div/>',
  props: wijmo.vue.getProps(wijmo.input.ListBox),
  attached: function () {
    wijmo.vue.initialize(this, new wijmo.input.ListBox(this.$el));
  }
});
Vue.component('wj-multi-select', {
  template: '<div/>',
  props: wijmo.vue.getProps(wijmo.input.MultiSelect),
  attached: function () {
    wijmo.vue.initialize(this, new wijmo.input.MultiSelect(this.$el));
  }
});
Vue.component('wj-popup', {
  template: '<div><slot/></div>',
  props: wijmo.vue.getProps(wijmo.input.Popup),
  attached: function () {
    wijmo.vue.initialize(this, new wijmo.input.Popup(this.$el));
  }
});
// ** wijmo.grid components
Vue.component('wj-flex-grid', {
  template: '<div><slot/></div>',
  props: wijmo.vue.getProps(wijmo.grid.FlexGrid),
  attached: function () {
    var ctl = new wijmo.grid.FlexGrid(this.$el, {
      autoGenerateColumns: this.$children.length == 0
    });
    wijmo.vue.initialize(this, ctl);
  }
});
Vue.component('wj-flex-grid-column', {
  template: '<div/>',
  props: wijmo.vue.getProps(wijmo.grid.Column),
  attached: function () {
    var grid = wijmo.Control.getControl(this.$parent.$el), col = new wijmo.grid.Column();
    wijmo.vue.initialize(this, col);
    grid.columns.push(col);
    this.$parent.$el.removeChild(this.$el);
  }
});
// ** wijmo.chart components
Vue.component('wj-flex-chart', {
  template: '<div><slot/></div>',
  props: wijmo.vue.getProps(wijmo.chart.FlexChart),
  attached: function () {
    wijmo.vue.initialize(this, new wijmo.chart.FlexChart(this.$el));
  }
});
Vue.component('wj-flex-chart-series', {
  template: '<div/>',
  props: wijmo.vue.getProps(wijmo.chart.Series),
  attached: function () {
    var chart = wijmo.Control.getControl(this.$parent.$el), series = new wijmo.chart.Series();
    wijmo.vue.initialize(this, series);
    chart.series.push(series);
    this.$parent.$el.removeChild(this.$el);
  }
});
// ** wijmo.gauge components
Vue.component('wj-radial-gauge', {
  template: '<div><slot/></div>',
  props: wijmo.vue.getProps(wijmo.gauge.RadialGauge),
  attached: function () {
    wijmo.vue.initialize(this, new wijmo.gauge.RadialGauge(this.$el));
  }
});
Vue.component('wj-linear-gauge', {
  template: '<div><slot/></div>',
  props: wijmo.vue.getProps(wijmo.gauge.LinearGauge),
  attached: function () {
    wijmo.vue.initialize(this, new wijmo.gauge.LinearGauge(this.$el));
  }
});
Vue.component('wj-range', {
  template: '<div/>',
  props: wijmo.vue.getProps(wijmo.gauge.Range, ['wjProperty']),
  attached: function () {
    var gauge = wijmo.Control.getControl(this.$parent.$el), rng = gauge[this.wjProperty];
    if (rng) {
      wijmo.vue.copy(rng, this);
    }
    else {
      rng = new wijmo.gauge.Range();
      wijmo.vue.initialize(this, rng);
      gauge.ranges.push(rng);
    }
    this.$parent.$el.removeChild(this.$el);
  }
});
//# sourceMappingURL=wijmo.vue.js.map

import { Tabs, Tab } from 'vue-tabs-component'
import './tabs.scss'

Tabs.props.cacheLifetime.default = 0
Tabs.props.options.default = function () { return { useUrlFragment: false } }

export { Tabs, Tab }

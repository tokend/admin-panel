export default {
  environment: process.env.NODE_ENV,
  ignoreErrors: [
    // Random plugins/extensions
    'top.GLOBALS',
    'originalCreateNotification',
    'canvas.contentDocument',
    'atomicFindClose',
    'fb_xd_fragment',
    'bmi_SafeAddOnload',
    'EBCallBackMessageReceived',
    '/[Vue warn]:.*'
  ],
  ignoreUrls: [
    // Chrome extensions
    /extensions\//i,
    /^chrome:\/\//i
  ]
}

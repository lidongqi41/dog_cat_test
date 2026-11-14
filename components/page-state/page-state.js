Component({
  properties: {
    status: {
      type: String,
      value: 'empty'
    },
    text: {
      type: String,
      value: ''
    },
    retryable: {
      type: Boolean,
      value: true
    }
  },

  methods: {
    onRetry() {
      this.triggerEvent('retry')
    }
  }
})
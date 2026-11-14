const COLORS = ['#07c160', '#1a73e8', '#f2994a', '#9b51e0', '#eb5757', '#2d9cdb']

function colorOf(name) {
  const text = String(name || '')
  let sum = 0
  for (let index = 0; index < text.length; index += 1) {
    sum += text.charCodeAt(index)
  }
  return COLORS[sum % COLORS.length]
}

Component({
  properties: {
    src: {
      type: String,
      value: ''
    },
    name: {
      type: String,
      value: '',
      observer: '_sync'
    },
    size: {
      type: Number,
      value: 96
    }
  },

  data: {
    initial: '?',
    color: '#07c160'
  },

  lifetimes: {
    attached() {
      this._sync(this.data.name)
    }
  },

  methods: {
    _sync(name) {
      const text = String(name || '').trim()
      this.setData({
        initial: text ? text.slice(0, 1) : '?',
        color: colorOf(text)
      })
    }
  }
})
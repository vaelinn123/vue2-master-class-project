<template>
  <span :title="timestamp | humanFriendlyDate">{{
    timestamp | diffForHumans
  }}</span>
</template>
<script>
// moment is very large due to included locale utilities, if you do not need them it is better to use
// date fns or moment-mini
import moment from 'moment'
export default {
  props: {
    timestamp: {
      required: true,
      type: Number
    }
  },
  filters: {
    humanFriendlyDate(date) {
      return moment.unix(date).format('MMMM Do YYYY, h:mm:ss a')
    },
    diffForHumans(date) {
      return moment.unix(date).fromNow()
    }
  }
}
</script>
<template>
  <div v-if="asyncDataStatus_ready" class="col-full push-top">
    <h1>
      Create new thread in <i>{{ forum.name }}</i>
    </h1>
    <ThreadEditor ref="editor" @save="save" @cancel="cancel" />
  </div>
</template>

<script>
import ThreadEditor from '@/components/ThreadEditor'
import { mapActions } from 'vuex'
import asyncDataStatus from '@/mixins/asyncDataStatus'

export default {
  mixins: [asyncDataStatus],
  components: {
    ThreadEditor
  },
  data() {
    return {
      saved: false
    }
  },
  props: {
    forumId: {
      type: String,
      required: true
    }
  },
  computed: {
    forum() {
      return this.$store.state.forums[this.forumId]
    },
    hasUnsavedChanges() {
      return (
        (this.$refs.editor.form.title || this.$refs.editor.form.text) &&
        !this.saved
      )
    }
  },
  methods: {
    ...mapActions(['createThread', 'fetchForum']),
    async save({ title, text }) {
      const thread = await this.createThread({
        forumId: this.forum['.key'],
        title,
        text
      })
      this.saved = true
      this.$router.push({
        name: 'ThreadShow',
        params: { id: thread['.key'] }
      })
    },
    cancel() {
      this.$router.push({ name: 'Forum', params: { id: this.forum['.key'] } })
    }
  },
  created() {
    this.fetchForum({ id: this.forumId }).then(() => {
      this.asyncDataStatus_fetched()
    })
  },
  beforeRouteLeave(to, from, next) {
    if (this.hasUnsavedChanges) {
      const confirmed = window.confirm(
        'Are you sure you want to leave? Unsaved changes will be lost'
      )
      if (confirmed) {
        next()
      } else {
        next(false)
      }
    } else {
      next()
    }
  }
}
</script>

<style scoped>
</style>
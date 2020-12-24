<template>
  <form @submit.prevent="save">
    <div class="form-group">
      <textarea
        name=""
        id=""
        cols="30"
        rows="10"
        class="form-input"
        v-model="text"
      ></textarea>
    </div>
    <div class="form-actions">
      <button vi-f="isUpdate" @click.prevent="cancel" class="btn btn-ghost">
        Cancel
      </button>
      <button class="btn-blue">
        {{ isUpdate ? 'Update' : 'Submit post' }}
      </button>
    </div>
  </form>
</template>
<script>
export default {
  props: {
    threadId: {
      required: false
    },
    post: {
      type: Object
    }
  },
  computed: {
    isUpdate() {
      return !!this.post
    }
  },
  data() {
    return {
      text: this.post ? this.post.text : ''
    }
  },
  methods: {
    async save() {
      const post = await this.persist()
      this.$emit('save', { post })
    },
    cancel() {
      this.$emit('cancel')
    },
    async create() {
      const post = {
        text: this.text,
        threadId: this.threadId
      }
      this.text = ''

      return this.$store.dispatch('createPost', post)
    },
    async update() {
      const payload = {
        id: this.post['.key'],
        text: this.text
      }
      return this.$store.dispatch('updatePost', payload)
    },
    async persist() {
      this.isUpdate ? await this.update() : await this.create()
    }
  }
}
</script>
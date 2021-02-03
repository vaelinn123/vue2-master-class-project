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
import { mapActions } from 'vuex'
export default {
  props: {
    threadId: {
      required: false
    },
    post: {
      type: Object,
      validator: (obj) => {
        const keyIsValid = typeof obj['.key'] === 'string'
        const textIsValid = typeof obj.text === 'string'
        const valid = keyIsValid && textIsValid
        if (!keyIsValid) {
          console.error('Invalid type for post key, must be a string')
        }
        if (!textIsValid) {
          console.error('Invalid type for post text, must be a string')
        }
        return valid
      }
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
    ...mapActions('posts', ['createPost', 'updatePost']),
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

      return this.createPost(post)
    },
    async update() {
      const payload = {
        id: this.post['.key'],
        text: this.text
      }
      return this.updatePost(payload)
    },
    async persist() {
      this.isUpdate ? await this.update() : await this.create()
    }
  }
}
</script>
<template>
  <div v-if="thread && user" class="col-large push-top">
    <h1>
      {{ thread.title }}
      <router-link
        :to="{ name: 'ThreadEdit', id: this.id }"
        class="btn-green btn-small"
        tag="button"
      >
        Edit ThreadList</router-link
      >
    </h1>
    <p>
      By <a href="#" class="link-unstyled">{{ user.name }}</a
      >, <AppDate :timestamp="thread.publishedAt" />.
      <span
        style="float: right; margin-top: 2px"
        class="hide-mobile text-faded text-small"
        >{{ replyCount }} replies by {{ contributorsCount }} contributors</span
      >
    </p>
    <PostList :posts="posts" />
    <PostEditor :threadId="id" />
  </div>
</template>

<script>
import PostList from '@/components/PostList'
import PostEditor from '@/components/PostEditor'
import { countObjectProperties } from '@/utils'

export default {
  components: {
    PostList,
    PostEditor
  },
  props: {
    id: {
      required: true,
      type: String
    }
  },
  computed: {
    thread() {
      return this.$store.state.threads[this.id]
    },
    replyCount() {
      return this.$store.getters.threadRepliesCount(this.thread['.key'])
    },
    user() {
      return this.$store.state.users[this.thread.userId]
    },
    contributorsCount() {
      return countObjectProperties(this.thread.contributors)
    },
    posts() {
      const postIds = Object.values(this.thread.posts)
      return Object.values(this.$store.state.posts).filter((post) =>
        postIds.includes(post['.key'])
      )
    }
  },
  async created() {
    this.$store.dispatch('fetchThread', { id: this.id }).then((thread) => {
      this.$store.dispatch('fetchUser', { id: thread.userId })
      Object.keys(thread.posts).forEach((postId) => {
        this.$store.dispatch('fetchPost', { id: postId }).then((post) => {
          this.$store.dispatch('fetchUser', { id: post.userId })
        })
      })
    })
  }
}
</script>
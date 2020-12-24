import Vue from 'vue'
import Vuex from 'vuex'
import sourceData from '@/data'
Vue.use(Vuex)

export default new Vuex.Store({
  state: { ...sourceData, authId: 'VXjpr2WHa8Ux4Bnggym8QFLdv5C3' },
  getters: {
    authUser(state) {
      return state.users[state.authId]
    }
  },
  actions: {
    async createPost({ commit, state }, post) {
      const postId = 'greatPost' + Math.random()
      post['.key'] = postId
      post.userId = state.authId
      post.publishedAt = Math.floor(Date.now() / 1000)
      commit('setPost', { post, postId })
      commit('appendPostToThread', { threadId: post.threadId, postId })
      commit('appendPostToUser', { userId: state.authId, postId })
      return state.posts[postId]
    },
    async createThread({ state, commit, dispatch }, { text, title, forumId }) {
      const threadId = 'greatThread' + Math.random()
      const userId = state.authId
      const publishedAt = Math.floor(Date.now() / 1000)

      const thread = {
        '.key': threadId,
        forumId,
        title,
        publishedAt,
        userId
      }
      commit('setThread', { thread, threadId })
      commit('appendThreadToForum', { forumId, threadId })
      commit('appendThreadToUser', { userId, threadId })
      const post = await dispatch('createPost', { text, threadId })
      commit('setThread', {
        thread: { ...thread, firstPostId: post['.key'] },
        threadId
      })
      return state.threads[threadId]
    },
    updateUser({ commit }, user) {
      commit('setUser', { userId: user['.key'], user })
    },
    async updateThread({ state, commit, dispatch }, { title, text, id }) {
      const thread = state.threads[id]
      const newThread = { ...thread, title }
      commit('setThread', { thread: newThread, threadId: id })
      await dispatch('updatePost', { id: thread.firstPostId, text })
      return newThread
    },
    async updatePost({ state, commit }, { id, text }) {
      const post = state.posts[id]
      commit('setPost', {
        postId: id,
        post: {
          ...post,
          text,
          edited: { at: Math.floor(Date.now() / 1000), by: state.authid }
        }
      })
      return post
    }
  },
  mutations: {
    setPost(state, { post, postId }) {
      Vue.set(state.posts, postId, post)
    },
    setThread(state, { thread, threadId }) {
      Vue.set(state.threads, threadId, thread)
    },
    setUser(state, { user, userId }) {
      Vue.set(state.users, userId, user)
    },
    appendPostToThread(state, { postId, threadId }) {
      const thread = state.threads[threadId]
      if (!thread.posts) {
        Vue.set(thread, 'posts', {})
      }
      Vue.set(thread.posts, postId, postId)
    },
    appendPostToUser(state, { postId, userId }) {
      const user = state.users[userId]
      if (!user.posts) {
        Vue.set(user, 'posts', {})
      }
      Vue.set(user.posts, postId, postId)
    },
    appendThreadToForum(state, { threadId, forumId }) {
      const forum = state.forums[forumId]
      if (!forum.threads) {
        Vue.set(forum, 'threads', {})
      }
      Vue.set(forum.threads, threadId, threadId)
    },
    appendThreadToUser(state, { threadId, userId }) {
      const user = state.users[userId]
      if (!user.threads) {
        Vue.set(user, 'threads', {})
      }
      Vue.set(user.threads, threadId, threadId)
    }
  }
})

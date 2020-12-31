import Vue from 'vue'
import Vuex from 'vuex'
import firebase from 'firebase'
import { countObjectProperties } from '@/utils'
Vue.use(Vuex)

const makeAppendChildToParentMutation = ({ parent, child }) => (
  state,
  { childId, parentId }
) => {
  const resource = state[parent][parentId]
  if (!resource[child]) {
    Vue.set(resource, child, {})
  }
  Vue.set(resource[child], childId, childId)
}

export default new Vuex.Store({
  state: {
    categories: {},
    forums: {},
    threads: {},
    posts: {},
    users: {},
    authId: 'VXjpr2WHa8Ux4Bnggym8QFLdv5C3'
  },
  getters: {
    authUser(state) {
      // return state.users[state.authId]
      return {}
    },
    userPostsCount: state => id => countObjectProperties(state.users[id].posts),
    userThreadsCount: state => id =>
      countObjectProperties(state.users[id].threads),
    threadRepliesCount: state => id =>
      countObjectProperties(state.threads[id].posts) - 1
  },
  actions: {
    async createPost({ commit, state }, post) {
      const postId = 'greatPost' + Math.random()
      post['.key'] = postId
      post.userId = state.authId
      post.publishedAt = Math.floor(Date.now() / 1000)
      commit('setPost', { post, postId })
      commit('appendPostToThread', { parentId: post.threadId, childId: postId })
      commit('appendPostToUser', { parentId: state.authId, childId: postId })
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
      commit('appendThreadToForum', { parentId: forumId, childId: threadId })
      commit('appendThreadToUser', { parentId: userId, childId: threadId })
      const post = await dispatch('createPost', { text, threadId })
      commit('setThread', {
        thread: { ...thread, firstPostId: post['.key'] },
        threadId
      })
      return state.threads[threadId]
    },
    async fetchThread({ state, commit }, { id }) {
      // fetch thread
      return new Promise((resolve, reject) => {
        firebase
          .database()
          .ref('threads')
          .child(id)
          .once('value', snapshot => {
            const thread = snapshot.val()
            commit('setThread', {
              threadId: snapshot.key,
              thread: { ...thread, '.key': snapshot.key }
            })
            resolve(state.threads[id])
          })
      })
    },
    async fetchPost({ state, commit }, { id }) {
      return new Promise((resolve, reject) => {
        firebase
          .database()
          .ref('posts')
          .child(id)
          .once('value', snapshot => {
            const post = snapshot.val()
            commit('setPost', {
              postId: snapshot.key,
              post: { ...post, '.key': snapshot.key }
            })
            resolve(state.posts[id])
          })
      })
    },
    async fetchUser({ state, commit }, { id }) {
      return new Promise((resolve, reject) => {
        // fetch user
        firebase
          .database()
          .ref('users')
          .child(id)
          .once('value', snapshot => {
            const user = snapshot.val()
            commit('setUser', {
              userId: snapshot.key,
              user: { ...user, '.key': snapshot.key }
            })
            resolve(state.users[id])
          })
      })
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
    appendPostToThread: makeAppendChildToParentMutation({
      parent: 'threads',
      child: 'posts'
    }),
    appendPostToUser: makeAppendChildToParentMutation({
      parent: 'users',
      child: 'posts'
    }),
    appendThreadToForum: makeAppendChildToParentMutation({
      parent: 'forums',
      child: 'threads'
    }),
    appendThreadToUser: makeAppendChildToParentMutation({
      parent: 'users',
      child: 'threads'
    })
  }
})

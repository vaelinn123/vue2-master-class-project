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
    async fetchThread({ dispatch }, { id }) {
      return dispatch('fetchResource', { resource: 'threads', id })
    },
    async fetchPost({ dispatch }, { id }) {
      return dispatch('fetchResource', { resource: 'posts', id })
    },
    async fetchForum({ dispatch }, { id }) {
      return dispatch('fetchResource', { resource: 'forums', id })
    },
    async fetchCategory({ dispatch }, { id }) {
      return dispatch('fetchResource', { resource: 'categories', id })
    },
    async fetchUser({ dispatch }, { id }) {
      return dispatch('fetchResource', { resource: 'users', id })
    },
    async fetchPosts({ dispatch }, { ids }) {
      return dispatch('fetchResources', { resource: 'posts', ids })
    },
    async fetchThreads({ dispatch }, { ids }) {
      return dispatch('fetchResources', { resource: 'threads', ids })
    },
    async fetchCategories({ dispatch }, { ids }) {
      return dispatch('fetchResources', { resource: 'categories', ids })
    },
    async fetchUsers({ dispatch }, { ids }) {
      return dispatch('fetchResources', { resource: 'users', ids })
    },
    async fetchForums({ dispatch }, { ids }) {
      return dispatch('fetchResources', { resource: 'forums', ids })
    },
    async fetchResource({ state, commit }, { id, resource }) {
      return new Promise((resolve, reject) => {
        firebase
          .database()
          .ref(resource)
          .child(id)
          .once('value', snapshot => {
            commit('setItem', {
              id: snapshot.key,
              item: snapshot.val(),
              resource
            })
            resolve(state[resource][id])
          })
      })
    },
    fetchAllCategories({ state, commig }) {
      return new Promise((resolve, reject) => {
        firebase
          .database()
          .ref('categories')
          .once('value', snapshot => {
            const categoriesObject = snapshot.val()
            Object.keys(categoriesObject).forEach(categoryId => {
              const category = categoriesObject[categoryId]
              this.commit('setItem', {
                resource: 'categories',
                id: categoryId,
                item: category
              })
            })
            resolve(Object.values(state.categories))
          })
      })
    },
    fetchResources({ dispatch }, { ids, resource }) {
      ids = Array.isArray(ids) ? ids : Object.keys(ids)
      return Promise.all(
        ids.map(id => dispatch('fetchResource', { id, resource }))
      )
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
    setItem(state, { item, id, resource }) {
      item['.key'] = id
      Vue.set(state[resource], id, item)
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

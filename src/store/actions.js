import firebase from 'firebase'

export default {
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
  fetchThread: ({ dispatch }, { id }) =>
    dispatch('fetchResource', { resource: 'threads', id }),
  fetchPost: ({ dispatch }, { id }) =>
    dispatch('fetchResource', { resource: 'posts', id }),
  fetchForum: ({ dispatch }, { id }) =>
    dispatch('fetchResource', { resource: 'forums', id }),
  fetchCategory: ({ dispatch }, { id }) =>
    dispatch('fetchResource', { resource: 'categories', id }),
  fetchUser: ({ dispatch }, { id }) =>
    dispatch('fetchResource', { resource: 'users', id }),
  fetchPosts: ({ dispatch }, { ids }) =>
    dispatch('fetchResources', { resource: 'posts', ids }),
  fetchThreads: ({ dispatch }, { ids }) =>
    dispatch('fetchResources', { resource: 'threads', ids }),
  fetchCategories: ({ dispatch }, { ids }) =>
    dispatch('fetchResources', { resource: 'categories', ids }),
  fetchUsers: ({ dispatch }, { ids }) =>
    dispatch('fetchResources', { resource: 'users', ids }),
  fetchForums: ({ dispatch }, { ids }) =>
    dispatch('fetchResources', { resource: 'forums', ids }),
  fetchResource({ state, commit }, { id, resource }) {
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
}
import firebase from 'firebase'

export default {
  async createPost({ commit, state }, post) {
    const postId = firebase
      .database()
      .ref('posts')
      .push().key

    post.userId = state.authId
    post.publishedAt = Math.floor(Date.now() / 1000)

    const updates = {}
    updates[`posts/${postId}`] = post
    updates[`threads/${post.threadId}/posts/${postId}`] = postId
    updates[`users/${post.userId}/posts/${postId}`] = postId
    firebase
      .database()
      .ref()
      .update(updates)
      .then(() => {
        commit('setItem', { resource: 'posts', item: post, id: postId })
        commit('appendPostToThread', {
          parentId: post.threadId,
          childId: postId
        })
        commit('appendPostToUser', { parentId: post.userId, childId: postId })
        return Promise.resolve(state.posts[postId])
      })
  },
  async createThread({ state, commit, dispatch }, { text, title, forumId }) {
    return new Promise((resolve, reject) => {
      const threadId = firebase
        .database()
        .ref('threads')
        .push().key
      const postId = firebase
        .database()
        .ref('posts')
        .push().key
      const userId = state.authId
      const publishedAt = Math.floor(Date.now() / 1000)

      const thread = {
        title,
        forumId,
        publishedAt,
        userId,
        firstPostId: postId,
        posts: {}
      }
      thread.posts[postId] = postId
      const post = { text, publishedAt, threadId, userId }

      const updates = {}
      updates[`threads/${threadId}`] = thread
      updates[`forums/${forumId}/threads/${threadId}`] = threadId
      updates[`users/${userId}/threads/${threadId}`] = threadId

      updates[`posts/${postId}`] = post
      updates[`users/${userId}/posts/${postId}`] = postId
      firebase
        .database()
        .ref()
        .update(updates)
        .then(() => {
          // update thread
          commit('setItem', { resource: 'threads', id: threadId, item: thread })
          commit('appendThreadToForum', {
            parentId: forumId,
            childId: threadId
          })
          commit('appendThreadToUser', { parentId: userId, childId: threadId })
          // update post
          commit('setItem', { resource: 'posts', item: post, id: postId })
          commit('appendPostToThread', {
            parentId: post.threadId,
            childId: postId
          })
          commit('appendPostToUser', { parentId: post.userId, childId: postId })

          resolve(state.threads[threadId])
        })
    })
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
    console.log('FetchResource called with id : ', id)
    console.log('FetchResource called with resource: ', resource)
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

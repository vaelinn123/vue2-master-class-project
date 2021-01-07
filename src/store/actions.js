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
    updates[`threads/${post.threadId}/contributors/${post.userId}`] =
      post.userId
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
        commit('appendContributorToThread', {
          parentId: post.threadId,
          childId: post.userId
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
  createUser({ state, commit }, { email, name, username, avatar = null }) {
    return new Promise((resolve, reject) => {
      const registeredAt = Math.floor(Date.now() / 1000)
      const usernameLower = username.toLowerCase()
      const emailLower = email.toLowerCase()
      const user = {
        name,
        avatar,
        registeredAt,
        username,
        usernameLower,
        email: emailLower
      }
      const userId = firebase
        .database()
        .ref('users')
        .push().key
      firebase
        .database()
        .ref('users')
        .child(userId)
        .set(user)
        .then(() => {
          commit('setItem', { item: user, resource: 'users', id: userId })
          resolve(state.users[userId])
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
    const post = state.posts[thread.firstPostId]
    const edited = { at: Math.floor(Date.now() / 1000), by: state.authId }

    const updates = {}
    updates[`posts/${thread.firstPostId}/text`] = text
    updates[`posts/${thread.firstPostId}/edited`] = edited
    updates[`threads/${id}/title`] = title
    firebase
      .database()
      .ref()
      .update(updates)
      .then(() => {
        commit('setThread', { thread: { ...thread, title }, threadId: id })
        commit('setPost', {
          postId: thread.firstPostId,
          post: {
            ...post,
            text,
            edited
          }
        })
        return post
      })
  },
  async updatePost({ state, commit }, { id, text }) {
    const post = state.posts[id]
    const edited = { at: Math.floor(Date.now() / 1000), by: state.authId }

    const updates = { text, edited }
    firebase
      .database()
      .ref('posts')
      .child(id)
      .update(updates)
      .then(() => {
        commit('setPost', {
          postId: id,
          post: {
            ...post,
            text,
            edited
          }
        })
        return post
      })
  }
}

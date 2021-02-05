<template>
  <div class="flex-grid justify-center">
    <div class="col-2">
      <form @submit.prevent="register" class="card card-form">
        <h1 class="text-center">Register</h1>

        <div class="form-group">
          <label for="name">Full Name</label>
          <input
            @blur="$v.form.name.$touch()"
            v-model="form.name"
            id="name"
            type="text"
            class="form-input"
          />
          <template v-if="$v.form.name.$error">
            <span v-if="!$v.form.name.required" class="form-error"
              >This field is required</span
            >
          </template>
        </div>

        <div class="form-group">
          <label for="username">Username</label>
          <input
            @blur="$v.form.username.$touch()"
            v-model="form.username"
            id="username"
            type="text"
            class="form-input"
          />
          <template v-if="$v.form.username.$error">
            <span v-if="!$v.form.username.required" class="form-error"
              >This field is required</span
            >
          </template>
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            @blur="$v.form.email.$touch()"
            v-model="form.email"
            id="email"
            type="email"
            class="form-input"
          />
          <template v-if="$v.form.email.$error">
            <span v-if="!$v.form.email.required" class="form-error"
              >This field is required</span
            >
          </template>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            @blur="$v.form.password.$touch()"
            v-model="form.password"
            id="password"
            type="password"
            class="form-input"
          />
          <template v-if="$v.form.password.$error">
            <span v-if="!$v.form.password.required" class="form-error"
              >This field is required</span
            >
            <span v-if="!$v.form.password.minLength" class="form-error"
              >Password must be at least 6 characters in length</span
            >
          </template>
        </div>

        <div class="form-group">
          <label for="avatar">Avatar</label>
          <input
            @blur="$v.form.avatar.$touch()"
            v-model="form.avatar"
            id="avatar"
            type="text"
            class="form-input"
          />
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-blue btn-block">Register</button>
        </div>
      </form>
      <div class="text-center push-top">
        <button @click="registerWithGoogle" class="btn-red btn-xsmall">
          <i class="fa fa-google fa-btn"></i>Sign up with Google
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { required, email, minLength } from 'vuelidate/lib/validators'
export default {
  data() {
    return {
      form: {
        name: null,
        username: null,
        email: null,
        password: null,
        avatar: null
      }
    }
  },
  validations: {
    form: {
      name: { required },
      username: { required },
      email: { required, email },
      password: { required, minLength: minLength(6) },
      avatar: {}
    }
  },
  methods: {
    register() {
      this.$v.form.$touch()
      if (this.$v.form.$invalid) {
        return
      }
      this.$store
        .dispatch('auth/registerUserWithEmailAndPassword', this.form)
        .then(() => this.successRedirect())
    },
    registerWithGoogle() {
      this.$store
        .dispatch('auth/signInWithGoogle')
        .then(() => this.successRedirect())
    },
    successRedirect() {
      const redirectTo = this.$route.query.redirectTo || { name: 'Home' }
      this.$router.push(redirectTo)
    }
  },
  created() {
    this.$emit('ready')
  }
}
</script>

<style scoped>
</style>
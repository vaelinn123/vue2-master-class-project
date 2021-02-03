<template>
  <div v-if="asyncDataStatus_ready" class="col-full">
    <h1>{{ category.name }}</h1>
    <CategoryListItem :category="category" />
  </div>
</template>

<script>
import CategoryListItem from '@/components/CategoryListItem'
import { mapActions } from 'vuex'
import asyncDataStatus from '@/mixins/asyncDataStatus'

export default {
  mixins: [asyncDataStatus],
  components: {
    CategoryListItem
  },
  props: {
    id: {
      required: true,
      type: String
    }
  },
  computed: {
    category() {
      return this.$store.state.categories.items[this.id]
    },
    forums() {
      return Object.values(this.$store.state.forums).filter(
        (thread) => thread.categoryId === this.id
      )
    }
  },
  methods: {
    ...mapActions('categories', ['fetchCategory', 'fetchForums']),
    ...mapActions('forums', ['fetchForums'])
  },
  created() {
    this.fetchCategory({ id: this.id }).then((category) => {
      this.fetchForums({ ids: category.forums }).then(() => {
        this.asyncDataStatus_fetched()
      })
    })
  }
}
</script>
<style scoped>
.category-wrapper {
  width: 100%;
}
</style>
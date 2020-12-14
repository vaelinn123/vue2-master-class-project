<template>
  <div class="col-full">
    <h1>{{ category.name }}</h1>
    <CategoryListItem :category="category" />
  </div>
</template>

<script>
import CategoryListItem from '@/components/CategoryListItem'

export default {
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
      return this.$store.state.categories[this.id]
    },
    forums() {
      return Object.values(this.$store.state.forums).filter(
        (thread) => thread.categoryId === this.id
      )
    }
  }
}
</script>
<style scoped>
.category-wrapper {
  width: 100%;
}
</style>
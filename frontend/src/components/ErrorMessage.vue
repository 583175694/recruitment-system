<template>
  <div v-if="hasError" class="error-message">{{ errorMessage }}</div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'ErrorMessage',
  props: {
    errors: {
      type: Object,
      required: true
    },
    field: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const hasError = computed(() => {
      if (!props.errors) return false;
      if (!props.errors[props.field]) return false;
      if (Array.isArray(props.errors[props.field]) && props.errors[props.field].length === 0) return false;
      return true;
    });

    const errorMessage = computed(() => {
      if (!hasError.value) return '';
      
      const error = props.errors[props.field];
      if (Array.isArray(error) && error.length > 0) {
        return error[0];
      } else if (typeof error === 'string') {
        return error;
      }
      return '';
    });

    return {
      hasError,
      errorMessage
    };
  }
});
</script>

<style scoped>
.error-message {
  color: var(--el-color-danger);
  font-size: 12px;
  margin-top: 4px;
}
</style> 
<template>
  <div v-if="modelValue" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium">选择图标</h3>
        <button @click="$emit('update:modelValue', false)" class="text-gray-500 hover:text-gray-700">
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>
      <div class="grid grid-cols-6 gap-4">
        <button
            v-for="icon in icons"
            :key="icon.name"
            @click="selectIcon(icon)"
            class="p-3 hover:bg-gray-100 rounded-lg flex items-center justify-center"
        >
          <component :is="icon.component" class="w-6 h-6" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { XMarkIcon } from '@heroicons/vue/24/outline'
import {
  AcademicCapIcon,
  BeakerIcon,
  BookOpenIcon,
  BriefcaseIcon,
  CalculatorIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'select'])

const icons = [
  { name: 'academic-cap', component: AcademicCapIcon },
  { name: 'beaker', component: BeakerIcon },
  { name: 'book-open', component: BookOpenIcon },
  { name: 'briefcase', component: BriefcaseIcon },
  { name: 'calculator', component: CalculatorIcon }
]

const selectIcon = (icon) => {
  emit('select', icon)
  emit('update:modelValue', false)
}
</script>

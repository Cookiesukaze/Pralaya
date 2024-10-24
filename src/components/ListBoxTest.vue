<template>
  <Listbox v-model="selectedRegion" >
    <ListboxButton class=" w-[230px] h-[44px] text-[#999] outline-[#fff] flex items-center justify-between text-16 text-left bg-[#fff] px-[20px] rounded-[4px] border-[1px] border-solid border-[#e6e6e6]">
      {{ selectedRegion?.name || '请选择' }}

      <i class="block w-[16px] h-[16px] bg-[url(~/assets/pull.png)] bg-no-repeat bg-cover"></i>
    </ListboxButton>
    <ListboxOptions class="w-[230px] text-16 text-left bg-[#fff] rounded-[4px] border-[1px] shadow-[0px_3px_16px_2px_#e6e6e6]">
      <ListboxOption
          v-for="item in regions"
          :key="item.id"
          :value="item"
          :disabled="item.unavailable"
          as="template"
          v-slot="{ active, selected }"
      >
        <li
            :class="{
            'bg-[#f7f8fa] text-[#006aff]': active,
            'bg-white text-[#333333]': !active,
          }"
            class="h-[44px] leading-[44px] pl-[20px] cursor-pointer"
        >

          {{ item.name }}
        </li>
      </ListboxOption>
    </ListboxOptions>
  </Listbox>
</template>

<script setup>
import { ref } from 'vue'
import {

  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue'

const regions = [
  { id: 1, name: '北京', unavailable: false },
  { id: 2, name: '上海', unavailable: false },
  { id: 3, name: '广州', unavailable: false },
  { id: 4, name: '深圳', unavailable: false },
  { id: 5, name: '香港', unavailable: false },
  { id: 5, name: '澳门', unavailable: false },
]
const selectedRegion = ref()
</script>

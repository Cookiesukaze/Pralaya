<template>

  <MainPage></MainPage>
<!--  <div class="card">-->
<!--    <button type="button" @click="count++">count is {{ count }}</button>-->
<!--    <p>-->
<!--      中文文字也实施效果-->
<!--      <code>components/HelloWorld.vue</code> to test HMR-->
<!--    </p>-->
<!--  </div>-->

<!--  <p v-if="IPData">-->
<!--    IP Data: {{ IPData.ip }}-->
<!--  </p>-->

<!--  <p v-else>-->
<!--    Loading IP data...-->
<!--  </p>-->

<!--  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>-->
<!--  <div class="read-the-docs">中文文字也实施效果</div>-->

<!--  <div class="w-34 h-12">-->
<!--    <div>tailwind</div>-->
<!--    <div>tailwind</div>-->
<!--    <div>tailwind</div>-->
<!--  </div>-->

<!--  <div class="h-20"></div>-->
<!--  <ListBoxTest ></ListBoxTest>-->

<!--  <div class="h-20"></div>-->
<!--  <FileSystemGraph ></FileSystemGraph>-->

</template>


<script setup>
import { ref, onMounted } from 'vue'
import {getAllGraph, getIP} from '../api/method.js'

import MainPage from "./MainPage.vue";

// const count = ref(0)
// const IPData = ref(null)
// const allGraphData = ref(null)

// const fetchIP = async () => {
//   try {
//     const response = await getIP()
//     IPData.value = response.data
//     console.log('IP获取:', IPData.value)
//   } catch (error) {
//     console.error('IP获取出错:', error)
//   }
// }
//
// const fetchAllGraph = async () => {
//   try {
//     const response = await getAllGraph()
//     allGraphData.value = response.data
//     console.log('图获取:', allGraphData.value)
//   } catch (error) {
//     console.error('图获取出错:', error)
//   }
// }

onMounted(() => {
  // fetchIP()
  // fetchAllGraph()
})
</script>



<style scoped>
.read-the-docs {
  color: #888;
}
</style>

<template>
    <div>
     <AppHeader/>
  </div>
  <div style="display: flex;flex-direction: row;width: 100%;height: 100%;">
      <div >
      <Aside/>

    </div>
    
  <div style="width: 100%; height: 100%;">
   <router-view></router-view>
  </div>
  </div>
</template>

<script setup >
// 导入 AppHeader 组件
import AppHeader from "@/components/AppHeader.vue";
import Aside from "@/components/Aside.vue";
import Threedmap from "./views/threedmap.vue";

</script>


<style scoped> 
 </style>

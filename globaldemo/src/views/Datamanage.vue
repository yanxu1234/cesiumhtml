<template>
  <div >
    <div width="100%">
      <el-menu class="el-menu-demo" mode="horizontal">
        <el-menu-item index="1" @click="this.$router.push('/Home')">航迹数据</el-menu-item>
        <el-menu-item index="2" @click="this.$router.push('/radar')">雷达数据</el-menu-item>
        <el-menu-item index="3" @click="this.$router.push('/satellite')">卫星数据</el-menu-item>
        <el-menu-item index="4" @click="this.$router.push('/echarts')">图表分析</el-menu-item>
      </el-menu>
    </div>
    <div >
      <router-view></router-view>
    </div>
  </div>
</template>



<script>

</script>
<template>
  <div style="width: 150px; height: 100%;">
    <el-row class="tac">
    <el-col :span="24">
      <el-menu
      style="min-height: 572px; overflow-y: scroll;max-height: 572px;"
        active-text-color="#ffd04b"
        background-color="#545c64"
        class="el-menu-vertical-demo"
        default-active="3"
        text-color="#fff"
        :default-openeds="['1']"
        @open="handleOpen"
        @close="handleClose"
      >
        <el-sub-menu index="0">
          <template #title>
            <!-- <el-icon><location /></el-icon> -->
             <el-icon> <Place /></el-icon>
            <span>标注</span>
          </template>
          <el-menu-item-group title="Group One">
            <el-menu-item index="0-1" @click="showpoint"><el-icon><CaretRight /></el-icon>点</el-menu-item>
            <el-menu-item index="0-2"><el-icon><CaretRight /></el-icon>线</el-menu-item>
            <el-menu-item index="0-3"><el-icon><CaretRight /></el-icon>多边形</el-menu-item>
            <el-menu-item index="0-4"><el-icon><CaretRight /></el-icon>圆形</el-menu-item>
            <el-menu-item index="0-5" @click="showrectangle"><el-icon><CaretRight /></el-icon>矩形</el-menu-item>
          </el-menu-item-group>
          <!-- <el-menu-item-group title="Group Two">
            <el-menu-item index="1-3">item three</el-menu-item>
          </el-menu-item-group>
          <el-sub-menu index="1-4">
            <template #title>item four</template>
            <el-menu-item index="1-4-1">item one</el-menu-item>
          </el-sub-menu> -->
        </el-sub-menu>

        <el-sub-menu index="1">
          <template #title><el-icon><Position /></el-icon>
            <span>测量</span>
          </template>
          <el-menu-item-group title="Group One">
            <el-menu-item index="1-1"><el-icon><CaretRight /></el-icon>距离</el-menu-item>
            <el-menu-item index="1-2"><el-icon><CaretRight /></el-icon>面积</el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>
    

        <el-menu-item index="3"  @click="this.$router.push('/threedmap')">
          <el-icon><VideoCameraFilled /></el-icon>
          <span>三维态势</span>
        </el-menu-item>

         <el-sub-menu index="4" default-opened>
          <template #title><el-icon><icon-menu/></el-icon>
            <span>实体</span>
          </template>
          <el-menu-item-group title="Group One" >
            <el-menu-item index="4-1" @click="showplane" >
              <el-icon><CaretRight /></el-icon>飞机</el-menu-item>
            <el-menu-item index="4-2" @click="showmissile"><el-icon><CaretRight /></el-icon>导弹</el-menu-item>
            <el-menu-item index="4-3" @click="showradar"><el-icon><CaretRight /></el-icon>雷达</el-menu-item>
            <el-menu-item index="4-4" @click="showtank"><el-icon><CaretRight /></el-icon>坦克</el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>

        <el-menu-item index="5">
          <el-icon><Moon /></el-icon>
          <span>静态目标</span>
        </el-menu-item>

        <el-menu-item index="6">
          <el-icon><Sunny /></el-icon>
          <span>动态目标</span>
        </el-menu-item>

        <el-menu-item index="7">
         <el-icon><Orange /></el-icon>
          <span>雷达波束</span>
        </el-menu-item>
        
        <el-menu-item index="/test"  @click="this.$router.push('/Home')">
         <el-icon><Orange /></el-icon>
          <span>数据管理</span>
        </el-menu-item>
      </el-menu>
    </el-col>
  </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref ,nextTick,computed} from 'vue';
import store from '../stores/store.js';


// 访问状态
const isCreatingMenuItem = computed(() => store.state.isCreatingMenuItem);
// 更新状态
function updateIsCreatingMenuItem(value) {
 store.commit('setIsCreatingMenuItem', value);
}

let isMissile = false;   //图标信号量
let isRadar = false;
let isTank = false;
let isPlaneCursor = false;
import {
  Document,
  Menu as IconMenu,
  Location,
  Setting,
} from "@element-plus/icons-vue";
const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath);
};
const handleClose = (key: string, keyPath: string[])=> {
  console.log(key, keyPath);
};



function showpoint() {
  updateIsCreatingMenuItem(1);
console.log(isCreatingMenuItem)
}
function showplane() {

  if (isPlaneCursor) {
    // 如果当前光标状态为飞机光标，则切换回正常鼠标
    document.body.style.cursor = 'auto';
    updateIsCreatingMenuItem(-1);
    console.log(isCreatingMenuItem)

  } else {
    updateIsCreatingMenuItem(41);
    // 如果当前光标状态为正常鼠标，则设置为飞机光标
    const img = new Image();
    img.src = '/plane.png';
    img.onload = () => {
      const width = 24;
      const height = Math.round((width / img.width) * img.height);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error("Could not get 2D context.");
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      document.body.style.cursor = `url(${canvas.toDataURL()}), auto`;
    };
  }
  // 切换光标状态
  isPlaneCursor = !isPlaneCursor;
}

function showmissile() {
  if (isMissile) {
    // 如果当前光标状态为导弹光标，则切换回正常鼠标
    document.body.style.cursor = 'auto';
    updateIsCreatingMenuItem(-1);
    // console.log(isCreatingMenuItem)
  } else {
    updateIsCreatingMenuItem(42);
    // 如果当前光标状态为正常鼠标，则设置为飞机光标
    const img = new Image();
    img.src = '/missile.png';
    img.onload = () => {
      const width = 30;
      const height = Math.round((width / img.width) * img.height);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error("Could not get 2D context.");
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      document.body.style.cursor = `url(${canvas.toDataURL()}), auto`;
    };
  }
  // 切换光标状态
  isMissile = !isMissile;
}

function showradar() { 
  if (isRadar) {
    // 如果当前光标状态为雷达光标，则切换回正常鼠标
    document.body.style.cursor = 'auto';
    updateIsCreatingMenuItem(-1);
    // console.log(isCreatingMenuItem)

  } else {
    updateIsCreatingMenuItem(43);
    const img = new Image();
    img.src = '/radar.png';
    img.onload = () => {
      const width = 30;
      const height = Math.round((width / img.width) * img.height);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error("Could not get 2D context.");
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      document.body.style.cursor = `url(${canvas.toDataURL()}), auto`;
    };
  }
  // 切换光标状态
  isRadar = !isRadar;
}
function showtank() { 
  if (isTank) {
    // 如果当前光标状态为坦克光标，则切换回正常鼠标
    document.body.style.cursor = 'auto';
    updateIsCreatingMenuItem(-1);
    // console.log(isCreatingMenuItem)
  } else {
    updateIsCreatingMenuItem(44);
    const img = new Image();
    img.src = '/tank.png';
    img.onload = () => {
      const width = 30;
      const height = Math.round((width / img.width) * img.height);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error("Could not get 2D context.");
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      document.body.style.cursor = `url(${canvas.toDataURL()}), auto`;
    };
  }
  // 切换光标状态
  isTank = !isTank;
}
    
function showrectangle() {
  updateIsCreatingMenuItem(5);
}

</script>

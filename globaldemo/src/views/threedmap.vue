<template>
   
  <div style="margin: 10px 5px; width: 100%; height: 100%">
    <el-button type="primary" @click="showFlightPath">显示飞机轨迹</el-button>
    <el-button type="primary" @click="hideFlightPath">隐藏飞机轨迹</el-button>
    <el-button type="primary" @click="showChinaEdge">显示中国边界</el-button>
    <el-button type="primary" @click="hideChinaEdge">隐藏中国边界</el-button>
    <el-button type="primary" @click="change2D">二维显示</el-button>
    <el-button type="primary" @click="change3D">三维显示</el-button>
    <el-button type="primary" @click="clear">一键清除</el-button>
    <el-button type="primary" @click="loadsatellite">加载卫星</el-button>
    <!-- <el-button type="primary" @call-function="test">测试</el-button> -->
    
    <!-- <el-button id="editbtn" type="primary" @click="updateradar">更改雷达参数</el-button> -->
    <!-- <el-button type="primary" @click="dialogFormVisible = true">更改雷达参数</el-button> -->

      <el-dialog v-model="dialogFormVisible" title="雷达参数" width="600" style="background-color: #f0f0f0;">
    <el-form :model="form">
     <el-row>
  <el-col :span="24">
    <el-form :model="form" :label-width="formLabelWidth" inline>
      <el-form-item label="经度" :label-width=60>
        <el-input v-model="form.longitude" autocomplete="off" style="width: 80px;"/>
      </el-form-item>
      <el-form-item label="纬度" :label-width=60>
        <el-input v-model="form.latitude" autocomplete="off" style="width: 80px;"/>
      </el-form-item>
      <el-form-item label="高度" :label-width=60>
        <el-input v-model="form.altitude" autocomplete="off" style="width: 80px;"/>
      </el-form-item>
    </el-form>
  </el-col>
</el-row>
     <el-row>
  <el-col :span="24">
    <el-form :model="form" :label-width="formLabelWidth" inline>
      <el-form-item label="偏航角" :label-width=60>
        <el-input v-model="form.heading" autocomplete="off" style="width: 80px;"/>
      </el-form-item>
      <el-form-item label="俯仰角" :label-width=60>
        <el-input v-model="form.pitch" autocomplete="off" style="width: 80px;"/>
      </el-form-item>
      <el-form-item label="翻滚角" :label-width=60>
        <el-input v-model="form.roll" autocomplete="off" style="width: 80px;"/>
      </el-form-item>
    </el-form>
  </el-col>
</el-row>
<el-row>
  <el-col :span="24">
    <el-form :model="form" :label-width="formLabelWidth" inline>
      <el-form-item label="内部半径m" :label-width=120>
        <el-input v-model="form.innerradius" autocomplete="off" style="width: 80px;"/>
      </el-form-item>
      <el-form-item label="外部半径m" :label-width=120>
        <el-input v-model="form.outradius" autocomplete="off" style="width: 80px;"/>
      </el-form-item>
    </el-form>
  </el-col>
</el-row>
<el-row>
  <el-col :span="24">
    <el-form :model="form" :label-width="formLabelWidth" inline>
      <el-form-item label="最小钟面角" :label-width=120>
        <el-input v-model="form.miniclock" autocomplete="off" style="width: 80px;"/>
      </el-form-item>
      <el-form-item label="最大钟面角" :label-width=120>
        <el-input v-model="form.maxclock" autocomplete="off" style="width: 80px;"/>
      </el-form-item>
    </el-form>
  </el-col>
</el-row>
<el-row>
  <el-col :span="24">
    <el-form :model="form" :label-width="formLabelWidth" inline>
      <el-form-item label="最小锥角" :label-width=120>
        <el-input v-model="form.minicone" autocomplete="off" style="width: 80px;"/>
      </el-form-item>
      <el-form-item label="最大锥角" :label-width=120>
        <el-input v-model="form.maxcone" autocomplete="off" style="width: 80px;"/>
      </el-form-item>
    </el-form>
  </el-col>
</el-row>
    <el-form-item label="材质颜色" :label-width=120>
      <el-select v-model="form.color" placeholder="请选择颜色">
        <el-option label="红色" value="#ff0000"></el-option>
        <el-option label="黄色" value="#ffff00"></el-option>
        <el-option label="白色" value="#ffffff"></el-option>
        <el-option label="蓝色" value="#0000ff"></el-option>
        <el-option label="紫色" value="#800080"></el-option>
      </el-select>
    </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="() => { confirm(true); dialogFormVisible = false; }"> 确认 </el-button>
      </div>
    </template>
  </el-dialog>
   
  </div>
  <div
    id="cesiumContainer"
    style="height: 522px; width: 100%; position: relative; z-index: 1"
  >
  <div> <div id="planeinfo" style="position: absolute; z-index: 10"></div></div>
 
    <div id="cesiumtooltip" style="position: absolute; z-index: 99999"></div>
    <!-- <div id="planerouteinfo " style="position: absolute; z-index: 99999;;">111111 </div> -->
  </div>

</template>

<script setup>
import * as Cesium from "cesium";
import * as satellite from 'satellite.js';
import moment from 'moment';
import julian from 'julian';

import { ref, onMounted, computed, watch,reactive } from "vue";
import CustomLine from "../stores/PolylineTrailLinkMaterialProperty.js";
import store from "../stores/store.js";
import Entitys from '../stores/entitys.js';

import StraightArrow from '../stores/StraightArrow';
import AttackArrow from '../stores/AttackArrow';
import PincerArrow from '../stores/PincerArrow';

import eventBus from '../stores/eventBus.js';


// 访问状态
const isCreatingMenuItem = computed(() => store.state.isCreatingMenuItem);
const viewer = ref(null); // 定义viewer为响应式数据
const sceneMode = ref(Cesium.SceneMode.SCENE3D); // 定义为响应式变量

const line = ref(null); // 响应式的飞行路径实例
const plane = ref(null); // 响应式的飞机实例
const chinaDataSource = ref(null); // 响应式的中国数据源实例
const satellitedata = ref(null);
const labelprovince = ref([]); //省份标签实例

const points = ref([]);//存储点实体数组
const lines = ref([]);//存储线实体数组
const polygons = ref([]);//存储多边形实体数组
const circles = ref([]);//存储圆实体数组
const rectangles= ref([]);//存储矩形实体数组
const labelsen = ref([]);//存储label
const plottingObj = reactive({
  straightArrow: null,
  attackArrow: null,
  pincerArrow: null,
  straightDrawArr: [],
  attackDrawArr: [],
  pincerDrawArr: [],
});

const planes = ref([]); //存储飞机实体数组
const missiles = ref([]);//存储导弹实体数组
const radarsicon= ref([]);//存储雷达图标实体数组
const  tanks= ref([]);//存储坦克实体数组

const radars = ref([]);//存储雷达实体
const radaricon = ref(null); //存储雷达图标实例
// 定义事件类型和处理函数
const handleArr = ref([]);//实体加载事件响应数组
const entitys = ref([]);
const _resultTip = ref([]);

//tle卫星

let tleData = ref([]);

let scale = 1;
var drawingRectangle = false;
var startPosition;
var endPosition;

// const dialogTableVisible = ref(false)
const dialogFormVisible = ref(false)
const formLabelWidth = '600px'

const form = reactive({//雷达参数对话框
  longitude:0.0,
  latitude: 0.0,
  altitude:0.0,
  heading: 0.0,
  pitch: 0.0,
  roll: 0.0,
  innerradius: 0.0,
  outradius: 0.0,
  miniclock: 0.0,
  maxclock: 0.0,
  minicone: 0.0,
  maxcone: 0.0,
  color: '',

})


onMounted(() => {
  initializeCesium();
  eventBus.on("updateradar", () => {
    showradardialog();
  });
 eventBus.on("showsatellite", () => {
    loadsatellite();
  });
  watch(isCreatingMenuItem, (newVal) => {
    if (newVal === -1) {
      if(handleArr.value.length > 0){
            for(let i in handleArr.value) handleArr.value[i].destroy();
            handleArr.value = [];
        }
    }
    else if (newVal === 1) {
      // 移除所有事件监听器
     if(handleArr.value.length > 0){
            for(let i in handleArr.value) handleArr.value[i].destroy();
            handleArr.value = [];
        }
     onMouseClick01()
    }
    else if (newVal === 2) {
      // 移除所有事件监听器
     if(handleArr.value.length > 0){
            for(let i in handleArr.value) handleArr.value[i].destroy();
            handleArr.value = [];
        }
     onMouseClick02()
    }
    else if (newVal === 3) {
      // 移除所有事件监听器
     if(handleArr.value.length > 0){
            for(let i in handleArr.value) handleArr.value[i].destroy();
            handleArr.value = [];
        }
     onMouseClick03()
    }
    else if (newVal === 4) {
      // 移除所有事件监听器
     if(handleArr.value.length > 0){
            for(let i in handleArr.value) handleArr.value[i].destroy();
            handleArr.value = [];
        }
     onMouseClick04()
    }
    else if (newVal === 5) {
      // 移除所有事件监听器
     if(handleArr.value.length > 0){
            for(let i in handleArr.value) handleArr.value[i].destroy();
            handleArr.value = [];
        }
     onMouseClick05()
    }
    else if (newVal === 6) {
      // 移除所有事件监听器
     if(handleArr.value.length > 0){
            for(let i in handleArr.value) handleArr.value[i].destroy();
            handleArr.value = [];
        }
     onMouseClick06()
    }
     else if (newVal === 7) {
      // 移除所有事件监听器
     if(handleArr.value.length > 0){
            for(let i in handleArr.value) handleArr.value[i].destroy();
            handleArr.value = [];
        }
     onMouseClick07()
    }
     else if (newVal ===8) {
      // 移除所有事件监听器
     if(handleArr.value.length > 0){
            for(let i in handleArr.value) handleArr.value[i].destroy();
            handleArr.value = [];
        }
     onMouseClick08()
    }
    else if (newVal === 11) {
      // 移除所有事件监听器
     if(handleArr.value.length > 0){
            for(let i in handleArr.value) handleArr.value[i].destroy();
            handleArr.value = [];
        }
     onMouseClick11()
    }
    else if (newVal === 12) {
      // 移除所有事件监听器
     if(handleArr.value.length > 0){
            for(let i in handleArr.value) handleArr.value[i].destroy();
            handleArr.value = [];
        }
     onMouseClick12()
    }
    else if (newVal === 41) {
      // 移除所有事件监听器
       if(handleArr.value.length > 0){
            for(let i in handleArr.value) handleArr.value[i].destroy();
            handleArr.value = [];
        }
      onMouseClick41();
    }
     else if (newVal === 42) {
      // 移除所有事件监听器
      if(handleArr.value.length > 0){
            for(let i in handleArr.value) handleArr.value[i].destroy();
            handleArr.value = [];
        }
      onMouseClick42();
    }
    else if (newVal === 43) {
      // 移除所有事件监听器
      if(handleArr.value.length > 0){
            for(let i in handleArr.value) handleArr.value[i].destroy();
            handleArr.value = [];
        }
      onMouseClick43();
    }
    else if (newVal === 44) {
      // 移除所有事件监听器
      if(handleArr.value.length > 0){
            for(let i in handleArr.value) handleArr.value[i].destroy();
            handleArr.value = [];
        }
      onMouseClick44();
    }
    else {
    if(handleArr.value.length > 0){
            for(let i in handleArr.value) handleArr.value[i].destroy();
            handleArr.value = [];
        }
    }
  });
  const iframe = document.getElementsByClassName("cesium-infoBox-iframe")[0]; // 获取iframe dom元素
  iframe.setAttribute(
    "sandbox",
    "allow-same-origin allow-scripts allow-popups allow-forms"
  );
  iframe.setAttribute("src", "");
});



function initializeCesium() {
  // cesium token
  Cesium.Ion.defaultAccessToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4MmJjMmQ1Ni1lNTJmLTRiNjktYTRhMy1lZGI1Njg2OWU1ZGMiLCJpZCI6MTY1NzQxLCJpYXQiOjE2OTQ0MjE2ODZ9.AmKJ9S0AVl4vrP268s5PUedS6p4sefERY5rtl33pmwA";

  viewer.value = new Cesium.Viewer("cesiumContainer", {
    ifnoBox: false,
    sceneMode: sceneMode.value, // 将场景模式设置为三维
    //  terrainProvider: Cesium.WorldTerrain({        //开启在线地形
    //   requestWaterMask: true,                           //指示客户端是否应从服务器请求额外的照明信息
    //   requestVertexNormals: true                        //指示客户端是否应从服务器请求每个瓷砖水面具
    // })
    // geocoder: true,
    //     //房子图标，视角返回初始位置
    homeButton: true,
    //     //经纬网图标，选择视角的模式，有三种：3D，2D，哥伦布视图（2.5D)
    sceneModePicker: false,
    //     //地图图标，图层选择器，选择要显示的地图服务和地形服务
    baseLayerPicker: false,
    //     //问号图标，导航帮助按钮，显示默认的地图控制帮助
    navigationHelpButton: false,
    //     //动画器件，显示当前时间，允许跳转特定时间
    animation: true,
    //     //时间轴
    shouldAnimate: true,
    selectionIndicator: false, 
    timeline: true,
    //     //全屏图标，全屏按钮
    fullscreenButton: false,
    //     //虚拟现实
    //     vrButton: false,
    //     //阴影
    //     shadows: false,
    //     //展示数据版权属性
    CreditsDisplay: false,
  });
  //去除版权信息
  viewer.value._cesiumWidget._creditContainer.style.display = "none";
  
  entitys.value = new Entitys(viewer.value);
  _resultTip.value=entitys.value.createMsgTip();
  // viewer.value.dataSources.add(
  //   Cesium.CzmlDataSource.load("../SampleData/simple.czml")
  // );

  if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
    //判断是否支持图像渲染像素化处理
    viewer.resolutionScale = window.devicePixelRatio;
  }
  //开启抗锯齿
  viewer.value.scene.fxaa = true;
  viewer.value.scene.postProcessStages.fxaa.enabled = true;

  for (let lang = -180; lang <= 180; lang += 45) {
    let text = "";
    if (lang === 0) {
      text = "0";
    }
    text += lang === 0 ? "" : "" + lang + "°";
    if (lang === -180) {
      text = "180°";
    }
    if (lang === 180) {
      text = "180°";
    }
    viewer.value.entities.add({
      position: Cesium.Cartesian3.fromDegrees(lang, 0),
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray([
          lang,
          -90,
          lang,
          0,
          lang,
          90,
        ]),
        width: 0.5,
        material: Cesium.Color.WHITE.withAlpha(0.2),
      },
      label: {
        text: text,
        verticalOrigin: Cesium.VerticalOrigin.TOP,
        font: "12px sans-serif",
        fillColor: Cesium.Color.WHITE,
      },
    });
  }

  //纬度
  let langS = [];
  for (let lang = -180; lang <= 180; lang += 5) {
    langS.push(lang);
  } //每隔10读绘制一条纬度线和纬度标注

  for (let lat = -80; lat <= 80; lat += 20) {
    let text = "";
    text += "" + lat + "°";
    if (lat === 0) {
      text = "";
    }

    viewer.value.entities.add({
      position: Cesium.Cartesian3.fromDegrees(0, lat),
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray(
          langS
            .map((long) => {
              return [long, lat].join(",");
            })
            .join(",")
            .split(",")
            .map((item) => Number(item))
        ),
        width: 0.5,
        material: Cesium.Color.WHITE.withAlpha(0.2),
      },
      label: {
        text: text,
        font: "12px sans-serif",
        fillColor: Cesium.Color.WHITE,
      },
    });
  }
  // // 将摄像机定位到合肥
  viewer.value.scene.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(117.283043, 31.861191, 6070050),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-90),
      roll: 0,
    },
  });

  // 抛物飞线效果
  parabolaFlowInit(viewer.value);
  //  边界实例
  chinaDataSource.value = new Cesium.GeoJsonDataSource("ChinaDataSource");
  viewer.value.dataSources.add(chinaDataSource.value);
  fetch("/china.json")
    .then((response) => response.json())
    .then((jsonData) => {
      chinaDataSource.value.load(jsonData, {
        stroke: Cesium.Color.RED,
        fill: Cesium.Color.TRANSPARENT,
        strokeWidth: 2,
      });
      // 设置初始显示状态为隐藏
      chinaDataSource.value.show = false;
      // 显示省会实例
      const provinceData = [
        {
          province: "辽宁省",
          capital: "沈阳市",
          longitude: 123.429092,
          latitude: 41.796768,
        },
        {
          province: "吉林省",
          capital: "长春市",
          longitude: 125.324501,
          latitude: 43.886841,
        },
        {
          province: "黑龙江省",
          capital: "哈尔滨市",
          longitude: 126.642464,
          latitude: 45.756966,
        },
        {
          province: "北京市",
          capital: "北京",
          longitude: 116.405289,
          latitude: 39.904987,
        },
        {
          province: "天津市",
          capital: "天津",
          longitude: 117.190186,
          latitude: 39.125595,
        },
        {
          province: "内蒙古自治区",
          capital: "呼和浩特市",
          longitude: 111.75199,
          latitude: 40.84149,
        },
        {
          province: "宁夏回族自治区",
          capital: "银川市",
          longitude: 106.23248,
          latitude: 38.48644,
        },
        {
          province: "山西省",
          capital: "太原市",
          longitude: 112.549248,
          latitude: 37.857014,
        },
        {
          province: "河北省",
          capital: "石家庄市",
          longitude: 114.502464,
          latitude: 38.045475,
        },
        {
          province: "山东省",
          capital: "济南市",
          longitude: 117.000923,
          latitude: 36.675808,
        },
        {
          province: "河南省",
          capital: "郑州市",
          longitude: 113.665413,
          latitude: 34.757977,
        },
        {
          province: "陕西省",
          capital: "西安市",
          longitude: 108.948021,
          latitude: 34.263161,
        },
        {
          province: "湖北省",
          capital: "武汉市",
          longitude: 114.298569,
          latitude: 30.584354,
        },
        {
          province: "江苏省",
          capital: "南京市",
          longitude: 118.76741,
          latitude: 32.041546,
        },
        {
          province: "安徽省",
          capital: "合肥市",
          longitude: 117.283043,
          latitude: 31.861191,
        },
        {
          province: "上海市",
          capital: "上海",
          longitude: 121.472641,
          latitude: 31.231707,
        },
        {
          province: "湖南省",
          capital: "长沙市",
          longitude: 112.982277,
          latitude: 28.19409,
        },
        {
          province: "江西省",
          capital: "南昌市",
          longitude: 115.892151,
          latitude: 28.676493,
        },
        {
          province: "浙江省",
          capital: "杭州市",
          longitude: 120.15358,
          latitude: 30.287458,
        },
        {
          province: "福建省",
          capital: "福州市",
          longitude: 119.306236,
          latitude: 26.075302,
        },
        {
          province: "广东省",
          capital: "广州市",
          longitude: 113.28064,
          latitude: 23.125177,
        },
        {
          province: "台湾省",
          capital: "台北市",
          longitude: 121.520076,
          latitude: 25.030724,
        },
        {
          province: "海南省",
          capital: "海口市",
          longitude: 110.19989,
          latitude: 20.04422,
        },
        {
          province: "广西壮族自治区",
          capital: "南宁市",
          longitude: 108.320007,
          latitude: 22.82402,
        },
        {
          province: "重庆市",
          capital: "重庆",
          longitude: 106.504959,
          latitude: 29.533155,
        },
        {
          province: "云南省",
          capital: "昆明市",
          longitude: 102.71225,
          latitude: 25.040609,
        },
        {
          province: "贵州省",
          capital: "贵阳市",
          longitude: 106.713478,
          latitude: 26.578342,
        },
        {
          province: "四川省",
          capital: "成都市",
          longitude: 104.065735,
          latitude: 30.659462,
        },
        {
          province: "甘肃省",
          capital: "兰州市",
          longitude: 103.83417,
          latitude: 36.06138,
        },
        {
          province: "青海省",
          capital: "西宁市",
          longitude: 101.77782,
          latitude: 36.61729,
        },
        {
          province: "西藏自治区",
          capital: "拉萨市",
          longitude: 91.1145,
          latitude: 29.64415,
        },
        {
          province: "新疆维吾尔自治区",
          capital: "乌鲁木齐市",
          longitude: 87.61688,
          latitude: 43.82663,
        },
        {
          province: "香港特别行政区",
          capital: "香港",
          longitude: 114.16546,
          latitude: 22.27534,
        },
        {
          province: "澳门特别行政区",
          capital: "澳门",
          longitude: 113.54913,
          latitude: 22.19875,
        },
      ];
      for (let i = 0, l = provinceData.length; i < l; i++) {
        let item = provinceData[i];
        const newlabel = viewer.value.entities.add({
          position: Cesium.Cartesian3.fromDegrees(
            item.longitude,
            item.latitude
          ),
          show: false,
          label: {
            text: item.capital,
            font: "10px sans-serif",
            fillColor: Cesium.Color.BLACK,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 1,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            pixelOffset: new Cesium.Cartesian2(0, -20), // 调整标签位置
          },
        });
        labelprovince.value.push(newlabel);
      }
    })

    .catch((error) => {
      console.error("Failed to load China geojson.", error);
    });

}

/*
根据卫星显示的起始时间，终止时间，tle轨道两行数得出czml文件，时间为js的Date对象，tles为对象数组，对象格式为
{
name：xx，
tle1：xx，
tle2：xx
}
*/
function tles2czml(startTime, endTime, tles) {
  // 计算起始时间和终止时间相隔的分钟数
  let minsInDuration = (endTime.getTime() - startTime.getTime()) / 60000; //mins
  //设置为开始时间
  let initialTime = moment(startTime.toISOString()).toISOString();
  //设置为结束时间
  endTime = moment(endTime.toISOString()).toISOString();
  // 初始化czml数据，创建场景信息
  let tempCZML = [];
  tempCZML.push({
    id: "document",
    name: "CZML Point - Time Dynamic",
    version: "1.0",
    clock: {
      interval: `${initialTime}/${endTime}`,
      multiplier: 1,
      range: "LOOP_STOP",
      step: "SYSTEM_CLOCK",//SYSTEM_CLOCK_MULTIPLIER
    },
  });

  // 处理每一个sat
  for (let no = 0; no < tles.length; no++) {
    if (!tles[no].name) {
      console.log("请输入第" + no + 1 + "个卫星的名称");
      return;
    }
    if (!tles[no].tle1) {
      console.log("请输入第" + no + 1 + "个卫星的第一个两行数");
      return;
    }
    if (!tles[no].tle2) {
      console.log("请输入第" + no + 1 + "个卫星的第二个两行数");
      return;
    }
    let sat_name = tles[no].name;
    // 保存位置信息
    let res = [];
    let satrec;
    satrec = satellite.twoline2satrec(tles[no].tle1, tles[no].tle2);
    console.log(satrec);
    //satrec.no：以弧度/分钟为单位的平均运动，一天有1440分钟，一弧度是0.159155圈
    // to go from RAD/DAY -> REV/DAY: rad * 1440 * 0.159155
    //to go from REV/PER DAY to MINS/REV -> 1440/RevPerDay
    let totalIntervalsInDay = satrec.no * 1440 * 0.159155; //1440 = min && 0.159155 = 1turn
    // 获得运行一圈的分钟数
    let minsPerInterval = 1440 / totalIntervalsInDay; // mins for 1 revolution around earth
    // intervalTime 取结束时间 格式为2008-09-20T12:25:40.104Z
    let intervalTime = endTime;

    let leadIntervalArray = [];
    let trailIntervalArray = [];
    console.log("Setting intervals...");
    // 注意：这里之所以要倒过来求leadInterval和trailInterval是因为如果正着求，很有可能在终止时刻卫星并没有运行完一圈，导致轨道只显示一半
    for (let i = minsInDuration; i >= 0; i -= minsPerInterval) {
      if (i <= minsPerInterval) {
        // intial interval
        let currentOrbitalInterval = {
          interval: `${initialTime}/${intervalTime}`,
          epoch: `${initialTime}`,
          number: [0, minsPerInterval * 60, minsPerInterval * 60, 0],
        };
        let currTrail = {
          interval: `${initialTime}/${intervalTime}`,
          epoch: `${initialTime}`,
          number: [0, 0, minsPerInterval * 60, minsPerInterval * 60],
        };
        leadIntervalArray.push(currentOrbitalInterval);
        trailIntervalArray.push(currTrail);
      } else {
        //not initial so make intervals
        let previousIntervalTime = moment(intervalTime)
          .add(-minsPerInterval, "m")
          .toISOString();
        let currentOrbitalInterval = {
          interval: `${previousIntervalTime}/${intervalTime}`,
          epoch: `${previousIntervalTime}`,
          number: [0, minsPerInterval * 60, minsPerInterval * 60, 0],
        };
        let currTrail = {
          interval: `${previousIntervalTime}/${intervalTime}`,
          epoch: `${previousIntervalTime}`,
          number: [0, 0, minsPerInterval * 60, minsPerInterval * 60],
        };
        intervalTime = moment(intervalTime)
          .add(-minsPerInterval, "m")
          .toISOString();
        leadIntervalArray.push(currentOrbitalInterval);
        trailIntervalArray.push(currTrail);
      }
    }
    // Seconds between current time and epoch time
    let sec = (startTime - julian.toDate(satrec.jdsatepoch)) / 1000;
    console.log(startTime, julian.toDate(satrec.jdsatepoch), sec);
    for (let i = sec; i <= sec + minsInDuration * 60; i+=60) {
      //每60秒计算一个位置信息，最后采用拉格朗日插值法处理数据
      // 根据当前时间距tle两行数历元时刻的分钟数，计算当前卫星位置和速度
      let positionAndVelocity = satellite.sgp4(satrec, i * 0.0166667); // 0.0166667min = 1sec
      // 地惯坐标系
      // console.log(positionAndVelocity);
      let positionEci = positionAndVelocity.position ;
      // console.log(positionEci);
      positionEci.x = positionEci.x * 1000;
      positionEci.y = positionEci.y * 1000;
      positionEci.z = positionEci.z * 1000;
      // let velocityEci = positionAndVelocity.velocity;
      // velocityEci.x = velocityEci.x * 1000;
      // velocityEci.y = velocityEci.y * 1000;
      // velocityEci.z = velocityEci.z * 1000;

      res.push(i - sec, positionEci.x, positionEci.y, positionEci.z);
    }
    let initialCZMLProps = {
      id: `${sat_name}`,
      name: `${sat_name}`,
      availability: `${initialTime}/${endTime}`,
      label: {
        fillColor: {
          rgba: [255, 0, 255, 255],
        },
        font: "11pt Lucida Console",
        horizontalOrigin: "LEFT",
        outlineColor: {
          rgba: [0, 0, 0, 255],
        },
        outlineWidth: 2,
        pixelOffset: {
          cartesian2: [12, 0],
        },
        show: true,
        style: "FILL_AND_OUTLINE",
        text: `${sat_name}`,
        verticalOrigin: "CENTER",
      },
      path: {
        show: [
          {
            interval: `${initialTime}/${endTime}`,
            boolean: true,
          },
        ],
        width: 3,
        material: {
          solidColor: {
            color: {
              rgba: [
                // 随机生成轨道颜色
                Math.floor(255 * Math.random(0, 1)),
                Math.floor(255 * Math.random(0, 1)),
                Math.floor(255 * Math.random(0, 1)),
                255,
              ],
            },
          },
        },
        resolution: 120,
        // The time ahead of the animation time, in seconds, to show the path.
        leadTime: leadIntervalArray,
        // The time behind the animation time, in seconds, to show the
        trailTime: trailIntervalArray,
      },
      model: {
        show: true,
        gltf: "../public/model/satellite.glb",
        minimumPixelSize: 50,
      },
      position: {
        // 采用拉格朗日插值法
        interpolationAlgorithm: "LAGRANGE",
        // 1为线性插值，2为平方插值
        interpolationDegree: 2,
        // 参考坐标系，地惯坐标系
        referenceFrame: "INERTIAL",
        epoch: `${initialTime}`,
        cartesian: res,
      },
    };
    tempCZML.push(initialCZMLProps);
    console.log(tempCZML);
  }
  return tempCZML;
}

function parabolaFlowInit(_viewer) {
  let _center = [113.9236839, 22.528061];
  let _positions = [[130.8236839, 40.528061]];

  _positions.forEach((item) => {
    let _siglePositions = parabola(_center, item, 1000000);

    // 创建流动抛物线
    const tempOne = new CustomLine((callback) => {
      const roadMaterial = new callback.Spriteline1MaterialProperty(
        2000,
        "/flowline.png"
      );
      // 创建流动线对象
      const polyline = new Cesium.Entity({
        polyline: new Cesium.PolylineGraphics({
          material: roadMaterial,
          // 线宽
          width: new Cesium.ConstantProperty(1),
          arcType: Cesium.ArcType.GEODESIC,
          // positions道路经过的坐标点集合
          positions: _siglePositions,
        }),
      });

      //抛物线飞机贴图
      const entity1 = _viewer.entities.add({
        id: '批次111',
        pickable:true,
        show: true,
        position: Cesium.Cartesian3.fromDegrees(113.9236839, 22.528061),
        billboard: {
          image: "/plane.png", // 设置贴图路径
          scale: 0.2,
        },
        label: {
          text: '批号111',
          show:true,
          font: '12px sans-serif',
          style:Cesium.LabelStyle.FILL_AND_OUTLINE,
          fillColor: Cesium.Color.RED,
          outlineWidth: 20,
          outlineColor:Cesium.Color.YELLOW,
          pixelOffset: new Cesium.Cartesian2(0, -20),
        }
      });

      // 创建飞机批次信息框
  var planetooltip = document.createElement("div");
      planeinfo.appendChild(planetooltip);
  // 鼠标点击事件处理程序
  var handlerplaneinfo = new Cesium.ScreenSpaceEventHandler(_viewer.canvas); 
  handlerplaneinfo.setInputAction(function (click) {
      var pickedObject = _viewer.scene.pick(click.position);
  if (Cesium.defined(pickedObject) && pickedObject.id) {
    // 在这里编写点击事件的处理逻辑
           // 设置信息框的内容
      planetooltip.innerHTML =
      "批次: " + pickedObject.id.id + "<br>高度: " + pickedObject.id.id+"<br>时间：123"+"<br>起点：合肥";
    // planetooltip.innerHTML = "11111111111";
    // console.log("Label 被点击了！");
      planetooltip.style.display = "block";
    } else {
      // 隐藏信息框
      planetooltip.style.display = "none";
  }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      _viewer.entities.add(polyline);
    });

  });



  // 创建经度纬度信息框
  var tooltip = document.createElement("div");
  cesiumtooltip.appendChild(tooltip);
  var myDiv = document.getElementById("cesiumtooltip");
  // 鼠标移动事件处理程序
  var handlerlonglat = new Cesium.ScreenSpaceEventHandler(_viewer.scene.canvas); //经纬度
  // var handlerplaneroute = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);//航迹
  handlerlonglat.setInputAction(function (movement) {
    // 获取鼠标位置
    var position = movement.endPosition;
    // 将鼠标位置转换为地理坐标
    var cartesian = _viewer.camera.pickEllipsoid(
      position,
      _viewer.scene.globe.ellipsoid
    );
    if (cartesian) {
      // 将地理坐标转换为地理经纬度
      var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      var longitude = Cesium.Math.toDegrees(cartographic.longitude);
      var latitude = Cesium.Math.toDegrees(cartographic.latitude);

      // 设置信息框的内容
      tooltip.innerHTML =
        "经度: " + longitude.toFixed(6) + "<br>纬度: " + latitude.toFixed(6);

      // 设置信息框的位置
      // myDiv.style.left = position.x + "px";
      // myDiv.style.top = position.y - tooltip.offsetHeight + "px";

      // 显示信息框
      tooltip.style.display = "block";
    } else {
      // 隐藏信息框
      tooltip.style.display = "none";
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  function parabola(startPosition, endPosition, height = 0, count = 50000) {
    //小bug 有重线 不重又无法接到地面
    //方程 y=-(4h/L^2)*x^2+h h:顶点高度 L：横纵间距较大者
    let result = [];
    height = Math.max(+height, 100);
    count = Math.max(+count, 50000);
    let diffLon = Math.abs(startPosition[0] - endPosition[0]);
    let diffLat = Math.abs(startPosition[1] - endPosition[1]);
    let L = Math.max(diffLon, diffLat);
    let dlt = L / count;
    if (diffLon > diffLat) {
      //base on lon
      let delLat = (endPosition[1] - startPosition[1]) / count;
      if (startPosition[0] - endPosition[0] > 0) {
        dlt = -dlt;
      }
      for (let i = 0; i < count; i++) {
        let h =
          height -
          (Math.pow(-0.5 * L + Math.abs(dlt) * i, 2) * 4 * height) /
            Math.pow(L, 2);
        let lon = startPosition[0] + dlt * i;
        let lat = startPosition[1] + delLat * i;
        let point = new Cesium.Cartesian3.fromDegrees(lon, lat, h);
        result.push(point);
      }
    } else {
      //base on lat
      let delLon = (endPosition[0] - startPosition[0]) / count;
      if (startPosition[1] - endPosition[1] > 0) {
        dlt = -dlt;
      }
      for (let i = 1; i < count; i++) {
        let h =
          height -
          (Math.pow(-0.5 * L + Math.abs(dlt) * i, 2) * 4 * height) /
            Math.pow(L, 2);
        let lon = startPosition[0] + delLon * i;
        let lat = startPosition[1] + dlt * i;
        let point = new Cesium.Cartesian3.fromDegrees(lon, lat, h);
        result.push(point);
      }
    }
    return result;
  }
}

function showPlaneglb() {
  plane.value.model.show = true;
}
function hidePlaneglb() {
  plane.value.model.show = false;
}
function showFlightPath() {
  line.value.show = true;
}
function hideFlightPath() {
  line.value.show = false;
}
function showChinaEdge() {
  chinaDataSource.value.show = true;
  labelprovince.value.forEach((label) => {
    label.show = true;
  });
}
function hideChinaEdge() {
  chinaDataSource.value.show = false;
  labelprovince.value.forEach((label) => {
    label.show = false;
  });
}
function change2D() {
  sceneMode.value = Cesium.SceneMode.SCENE3D; // 切换为2维场景模式
  viewer.value.scene.morphTo2D(1);
}
function change3D() {
  sceneMode.value = Cesium.SceneMode.SCENE2D; // 切换为三维场景模式
  viewer.value.scene.morphTo3D(1);
}
function confirm() {

// 在需要的时候，将参数转换为number类型
form.longitude = convertToNumber(form.longitude);
form.latitude = convertToNumber(form.latitude);
form.altitude = convertToNumber(form.altitude);
form.heading = convertToNumber(form.heading);
form.pitch = convertToNumber(form.pitch);
form.roll = convertToNumber(form.roll);
form.innerradius = convertToNumber(form.innerradius);
form.outradius = convertToNumber(form.outradius);
form.miniclock = convertToNumber(form.miniclock);
form.maxclock = convertToNumber(form.maxclock);
form.minicone = convertToNumber(form.minicone);
form.maxcone = convertToNumber(form.maxcone);
   var targetPosition = Cesium.Cartesian3.fromDegrees(
    form.longitude,
    form.latitude,
    form.altitude
  );
  const radar=viewer.value.entities.add({
    name: "雷达四凌锥体",
    position: targetPosition,
    billboard: {
      image: "/radar.png", // 设置贴图路径
      scale: 0.03,
    },
    orientation: Cesium.Transforms.headingPitchRollQuaternion(
      targetPosition,
      new Cesium.HeadingPitchRoll(
        Cesium.Math.toRadians(form.heading),
        Cesium.Math.toRadians(form.pitch),
        form.roll
      )
    ),
    ellipsoid: {
      radii: new Cesium.Cartesian3(form.outradius, form.outradius, form.outradius),
      innerRadii: new Cesium.Cartesian3(form.innerradius, form.innerradius, form.innerradius),
      minimumClock: Cesium.Math.toRadians(-form.miniclock),
      maximumClock: Cesium.Math.toRadians(-form.maxclock),
      minimumCone: Cesium.Math.toRadians(form.minicone),
      maximumCone: Cesium.Math.toRadians(form.maxcone),
      material: Cesium.Color.fromCssColorString(form.color).withAlpha(0.1),
      outline: true,
    },
  });
  radars.value.push(radar);

}
function onMouseClick01() {
  var handle01 = new Cesium.ScreenSpaceEventHandler(viewer.value.canvas); 
  handleArr.value.push(handle01);
  handle01.setInputAction((movement) => {
    var intersection =viewer.value.scene.camera.pickEllipsoid(movement.position, viewer.value.scene.globe.ellipsoid);
      if (intersection) {
    // 获取交点的地理坐标
    const cartographic =
      viewer.value.scene.globe.ellipsoid.cartesianToCartographic(intersection);
    const longitude = Cesium.Math.toDegrees(cartographic.longitude);
    const latitude = Cesium.Math.toDegrees(cartographic.latitude);
    const altitude = viewer.value.scene.globe.getHeight(cartographic);

    // 更新点位置
    const newPointPosition = Cesium.Cartesian3.fromDegrees(
      longitude,
      latitude,
      altitude
    );
    
    const newPoint = viewer.value.entities.add({
      position: newPointPosition,
      // point: {
      // pixelSize: 10,
      // color: Cesium.Color.RED,
      // },
      label: {
      text: '经度:' + longitude.toFixed(6) + '°\n纬度:' + latitude.toFixed(6) + '°\n高度:' + -altitude.toFixed(3) + 'm',
        font: '12px sans-serif',
      //  style:Cesium.LabelStyle.FILL_AND_OUTLINE,
        // fillColor: new Cesium.Color(1, 0, 0) ,// 红色
      showBackground: true,//显示背景颜色	
      backgroundColor:Cesium.Color.fromCssColorString('#24a4fe').withAlpha(0.6),
      // backgroundColor: Cesium.Color.BLACK.withAlpha(0.5), // 设置填充颜色和透明度
      pixelOffset: new Cesium.Cartesian2(0, -40)
      },
      billboard: {
      image: '/positioning.png',
      scale: 0.5
    }
    });
  
    points.value.push(newPoint);
  }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  

} //画点
function onMouseClick02() {//画线
  var PolyLinePrimitive = (function () {
            function _(positions) {
                this.options = {
                    polyline: {
                        show: true,
                        positions: [],
                        material: Cesium.Color.CHARTREUSE,
                        width: 5,
                        clampToGround: true
                    }
                }; 
                this.positions = positions;
                this._init();
            }

            _.prototype._init = function () {
                var _self = this;
                var _update = function () {
                    return _self.positions;
                };
                //实时更新polyline.positions
                this.options.polyline.positions = new Cesium.CallbackProperty(_update, false);
                lines.value.push(viewer.value.entities.add(this.options));
            };
            return _;
        })();
        var handler02 = new Cesium.ScreenSpaceEventHandler(viewer.value.scene.canvas);
        handleArr.value.push(handler02);
        var positions = [];
        var poly = undefined;
        //鼠标左键单击画点
        handler02.setInputAction(function (movement) {
            var cartesian = viewer.value.scene.camera.pickEllipsoid(movement.position, viewer.value.scene.globe.ellipsoid);
            if (positions.length == 0) {
                positions.push(cartesian.clone());
            }
            positions.push(cartesian);
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        //鼠标移动
        handler02.setInputAction((movement)=> {
            var cartesian = viewer.value.scene.camera.pickEllipsoid(movement.endPosition, viewer.value.scene.globe.ellipsoid);
            if (positions.length >= 2) {
                if (!Cesium.defined(poly)) {
                    poly = new PolyLinePrimitive(positions);
                } else {
                    if(cartesian != undefined){
                        positions.pop();
                        cartesian.y += (1 + Math.random());
                        positions.push(cartesian);
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
         handler02.setInputAction((movement)=>  {
                if(handleArr.value.length > 0){
            for(let i in handleArr.value) handleArr.value[i].destroy();
            handleArr.value = [];
        }
            }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
}

function onMouseClick03() {//画多边形
   var PolygonPrimitive = (() => {
            function _(positions) {
                this.options = {
                    name: '多边形',
                    polygon: {
                        hierarchy: [],
                        perPositionHeight: true,
                        //fill:false,
                        outline : false,
                        outlineWidth: 10.0,
                        material : Cesium.Color.fromCssColorString('#F44336').withAlpha(0.5),
                        outlineColor : Cesium.Color.CHARTREUSE,
                        clampToGround: true
                    }
                };
                this.hierarchy = positions;
                this._init();
            }

            _.prototype._init = function () {
                var _self = this;
                var _update = function () {
                    return new Cesium.PolygonHierarchy(_self.hierarchy);
                };
                //实时更新polygon.hierarchy
                this.options.polygon.hierarchy = new Cesium.CallbackProperty(_update, false);
                polygons.value.push(viewer.value.entities.add(this.options));
            };
            return _;
        })();

        var handler03 = new Cesium.ScreenSpaceEventHandler(viewer.value.scene.canvas);
        handleArr.value.push(handler03);
        var positions = [];
        var poly = undefined;

        //鼠标单击画点
        handler03.setInputAction((movement)=> {
            var cartesian = viewer.value.scene.camera.pickEllipsoid(movement.position, viewer.value.scene.globe.ellipsoid);
            if (positions.length == 0) {
                positions.push(cartesian.clone());
            }
            positions.push(cartesian);
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        //鼠标移动
        handler03.setInputAction((movement)=> {
            var cartesian = viewer.value.scene.camera.pickEllipsoid(movement.endPosition, viewer.value.scene.globe.ellipsoid);
            if (positions.length >= 2) {
                if (!Cesium.defined(poly)) {
                    poly = new PolygonPrimitive(positions);
                } else {
                    if(cartesian != undefined){
                        positions.pop();
                        cartesian.y += (1 + Math.random());
                        positions.push(cartesian);
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        //鼠标右键单击结束绘制
        handler03.setInputAction((movement) => {
             if(handleArr.value.length > 0){
            for(let i in handleArr.value) handleArr.value[i].destroy();
            handleArr.value = [];
        }
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
}
function onMouseClick04() {//画圆
            const circle= {
            points:[]
            ,rect:null
            ,entity:null
            ,r:1
        };
        var tempPosition;
        let cartographic1;
        let p;
        let tempLon;
        let tempLat;
        var handle04 = new Cesium.ScreenSpaceEventHandler(viewer.value.scene.canvas);
       if(!_resultTip.value)_resultTip.value= entitys.value.createMsgTip();
        handleArr.value.push(handle04);
        //common.handlerList.push(ShapeEventHandler);
        handle04.setInputAction((click)=> {
            tempPosition = getPointFromWindowPoint(click.position);
            //选择的点在球面上
            if(tempPosition){
                function callBackPos() {
                    if(circle.points.length == 0 )return;
                    const minlon = Cesium.Math.toDegrees(circle.points[0].longitude);
                    const minlat = Cesium.Math.toDegrees(circle.points[0].latitude);
                    const maxlon = Cesium.Math.toDegrees(circle.points[1].longitude);
                    const maxlat = Cesium.Math.toDegrees(circle.points[1].latitude);
                    const r = getFlatternDistance(minlat, minlon, maxlat, maxlon);
                    if(r){
                        return r;
                    }
                    return 1;
                };
                if(circle.points.length==0) {
                    p = click.position;
                    cartographic1 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(tempPosition);
                    if(!tempPosition)return false;
                    circle.points.push(viewer.value.scene.globe.ellipsoid.cartesianToCartographic(tempPosition));
                    circle.points.push(viewer.value.scene.globe.ellipsoid.cartesianToCartographic(tempPosition));
                    tempLon = Cesium.Math.toDegrees(cartographic1.longitude);
                    tempLat = Cesium.Math.toDegrees(cartographic1.latitude);
                   circle.entity = viewer.value.entities.add({
                        position: Cesium.Cartesian3.fromDegrees(tempLon,tempLat),
                        ellipse : {
                            semiMinorAxis : new Cesium.CallbackProperty(callBackPos, false),
                            semiMajorAxis : new Cesium.CallbackProperty(callBackPos, false),
                            //fill:false,
                            outline : false,
                            outlineWidth: 10.0,
                            outlineColor : Cesium.Color.CHARTREUSE,
                            material : Cesium.Color.fromCssColorString('#F44336').withAlpha(0.5),
                            height:1
                        }
                   });
                    circles.value.push(circle.entity);
                    
                }else{
                    var tempCircle = new Cesium.CircleOutlineGeometry({
                        center : Cesium.Cartesian3.fromDegrees(tempLon,tempLat),
                        radius : callBackPos(),
                        granularity : Math.PI / 2
                    });
                    var geometry = Cesium.CircleOutlineGeometry.createGeometry(tempCircle);
                    var float64ArrayPositionsIn = geometry.attributes.position.values;
                    var positionsIn = [].slice.call(float64ArrayPositionsIn);
                    if(handleArr.value.length > 0){
                    for(let i in handleArr.value) handleArr.value[i].destroy();
                      handleArr.value = [];
                      entitys.value.remove(_resultTip.value);
                    _resultTip.value = null;
        }
                    circles.value.push(entitys.value.createPoint(Cesium.Cartesian3.fromDegrees(tempLon,tempLat),'半径 :' +  parseFloat(callBackPos()).toFixed(2)));

                    // 将Cartesian3坐标转换为经纬度
                    var ellipsoid = Cesium.Ellipsoid.WGS84; // 使用WGS84椭球体模型
                    var positionsLLA = [];

                    for (var i = 0; i < positionsIn.length; i += 3) {
                        var cartesian = new Cesium.Cartesian3(positionsIn[i], positionsIn[i + 1], positionsIn[i + 2]);
                        var cartographic = ellipsoid.cartesianToCartographic(cartesian);
                        var lon = Cesium.Math.toDegrees(cartographic.longitude);
                        var lat = Cesium.Math.toDegrees(cartographic.latitude);
                        positionsLLA.push(lon, lat);
                  }
                  // console.log('所有圆信息', positionsIn, positionsLLA, [tempLon, tempLat], callBackPos());
                  alert(positionsIn, positionsLLA, [tempLon, tempLat], callBackPos());
                }
            }
        },Cesium.ScreenSpaceEventType.LEFT_CLICK);
        handle04.setInputAction((movement) => {
            var moveEndPosition = getPointFromWindowPoint(movement.endPosition);
          if (circle.points.length == 0) {
                entitys.value.showTip(_resultTip.value,true,moveEndPosition,'点击地图');
                return false;
          }
          entitys.value.showTip(_resultTip.value,true,moveEndPosition,'再次点击结束');
          //选择的点在球面上
          if (moveEndPosition) {
                circle.points.pop();
                circle.points.push(viewer.value.scene.globe.ellipsoid.cartesianToCartographic(moveEndPosition));
            }
        },Cesium.ScreenSpaceEventType.MOUSE_MOVE);
}
function onMouseClick05() {//画矩形
  // let _self = this;
        let pointsArr = [];
        const shape= {
            points:[],
            rect:null,
            entity:null
        };
        var tempPosition;
        var handle05 = new Cesium.ScreenSpaceEventHandler(viewer.value.scene.canvas);
        if(!_resultTip.value)if(!_resultTip.value)_resultTip.value= entitys.value.createMsgTip();
        handleArr.value.push(handle05);
        //鼠标左键单击画点
        handle05.setInputAction((click)=> {
            tempPosition = getPointFromWindowPoint(click.position);
            //选择的点在球面上
            if(tempPosition){
                if(shape.points.length==0) {
                    pointsArr.push(tempPosition);
                    let cartesian = viewer.value.scene.globe.ellipsoid.cartesianToCartographic(tempPosition);
                    shape.points.push(cartesian);
                    shape.rect=Cesium.Rectangle.fromCartographicArray(shape.points);
                    shape.rect.east+=0.000001;
                    shape.rect.north+=0.000001;
                    shape.entity= viewer.value.entities.add({
                        rectangle : {
                            coordinates :shape.rect,
                            //fill:false,
                            outline : false,
                            outlineWidth: 10.0,
                            outlineColor : Cesium.Color.CHARTREUSE,
                            material : Cesium.Color.fromCssColorString('#F44336').withAlpha(0.5),
                            height:10

                        }
                    });
                    // bufferEntity = shape.entity;
                    rectangles.value.push(shape.entity);
                }
                else{
                  if (handleArr.value.length > 0) {
                    for (let i in handleArr.value) handleArr.value[i].destroy();
                    handleArr.value = [];
                    entitys.value.remove(_resultTip.value);
                    _resultTip.value = null;
                  }
                    alert(pointsArr);
                }
            }
        },Cesium.ScreenSpaceEventType.LEFT_CLICK);
        //鼠标移动
        handle05.setInputAction((movement) => {
            if(!movement.endPosition)return false;
            let moveEndPosition = getPointFromWindowPoint(movement.endPosition);
            if(shape.points.length==0){
                entitys.value.showTip(_resultTip.value,true,moveEndPosition,'点击绘制');
                return;
            }
            //选择的点在球面上
            if(moveEndPosition){
                pointsArr[1] = moveEndPosition;
                let cartesian = viewer.value.scene.globe.ellipsoid.cartesianToCartographic(moveEndPosition);
               shape.points[1]=cartesian;
                shape.rect= Cesium.Rectangle.fromCartographicArray(shape.points);
                if(shape.rect.west==shape.rect.east)
                    shape.rect.east+=0.000001;
                if(shape.rect.south==shape.rect.north)
                    shape.rect.north+=0.000001;
                shape.entity.rectangle.coordinates = shape.rect;
                entitys.value.showTip(_resultTip.value,true,moveEndPosition,'再次点击结束');
            }
        },Cesium.ScreenSpaceEventType.MOUSE_MOVE);
}
function onMouseClick06() {//直角
   if ( !plottingObj.straightArrow) {
            plottingObj.straightArrow = new StraightArrow(viewer.value);
     plottingObj.straightArrow.startDraw();
            plottingObj.straightDrawArr.push(plottingObj.straightArrow);
  }
  //  else {
  //     for (var i = 0; i < plottingObj.straightDrawArr.length; i++) {
  //               plottingObj.straightDrawArr[i].clear();
  // }
  //           plottingObj.straightArrow = null;
  //           plottingObj.straightDrawArr = [];
  //   }   
}
function onMouseClick07() {//攻击
  if (!plottingObj.attackArrow) {
            plottingObj.attackArrow = new AttackArrow(viewer.value);
            plottingObj.attackArrow.startDraw();
           plottingObj.attackDrawArr.push(plottingObj.attackArrow);
        } 
        
}
function onMouseClick08() {//钳形
  if (!plottingObj.pincerArrow) {
            plottingObj.pincerArrow = new PincerArrow(viewer.value);
            plottingObj.pincerArrow.startDraw();
            plottingObj.pincerDrawArr.push(plottingObj.pincerArrow);
        } 
}
function onMouseClick11() {//测量距离
  var PolyLinePrimitive = (function () {
            function _(positions) {
                this.options = {
                    polyline: {
                        show: true,
                        positions: [],
                        material: Cesium.Color.DARKRED,
                        width: 3,
                        clampToGround: true
                    },
                    
                }; 
                this.positions = positions;
                this._init();
            }

            _.prototype._init = function () {
                var _self = this;
                var _update = function () {
                    return _self.positions;
                };
                //实时更新polyline.positions
                this.options.polyline.positions = new Cesium.CallbackProperty(_update, false);
                lines.value.push(viewer.value.entities.add(this.options));
    };
            _.prototype._calculateDistance = function () {
                var totalDistance = 0;
                for (var i = 1; i < this.positions.length; i++) {
                totalDistance += Cesium.Cartesian3.distance(
                this.positions[i - 1],
                this.positions[i]
          );
        }
        return totalDistance;
      };

      _.prototype._createDistanceLabel = function (distance) {
        var labels = viewer.value.entities;
        if (Cesium.defined(this.distanceLabel)) {
          labels.remove(this.distanceLabel);
        }
        this.distanceLabel = labels.add({
          position: this.positions[this.positions.length - 1],
          label: {
            text: distance.toFixed(2) + " m",
            font: "14px sans-serif",
            fillColor: Cesium.Color.YELLOW,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            pixelOffset: new Cesium.Cartesian2(0, -20),
            showBackground: true,
            backgroundColor: Cesium.Color.BLACK.withAlpha(0.7)
          }
        });
        labelsen.value.push( this.distanceLabel );
      };
            return _;
  })();
        
        var handler02 = new Cesium.ScreenSpaceEventHandler(viewer.value.scene.canvas);
        handleArr.value.push(handler02);
        var positions = [];
        var poly = undefined;

        var totalDistance = 0;
        //鼠标左键单击画点
        handler02.setInputAction(function (movement) {
            var cartesian = viewer.value.scene.camera.pickEllipsoid(movement.position, viewer.value.scene.globe.ellipsoid);
            if (positions.length == 0) {
                positions.push(cartesian.clone());
            }
            positions.push(cartesian);
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        //鼠标移动
        handler02.setInputAction((movement)=> {
            var cartesian = viewer.value.scene.camera.pickEllipsoid(movement.endPosition, viewer.value.scene.globe.ellipsoid);
            if (positions.length >= 2) {
                if (!Cesium.defined(poly)) {
                    poly = new PolyLinePrimitive(positions);
                } else {
                    if(cartesian != undefined){
                        positions.pop();
                        cartesian.y += (1 + Math.random());
                      positions.push(cartesian);

                      totalDistance = poly._calculateDistance();
                      poly._createDistanceLabel(totalDistance);
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
         handler02.setInputAction((movement)=>  {
                if(handleArr.value.length > 0){
            for(let i in handleArr.value) handleArr.value[i].destroy();
            handleArr.value = [];
        }
            }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
}
function onMouseClick12() {
  var PolygonPrimitive = (() => {
            function _(positions) {
                this.options = {
                    name: '多边形',
                    polygon: {
                        hierarchy: [],
                        perPositionHeight: true,
                        //fill:false,
                        outline : false,
                        outlineWidth: 10.0,
                        material : Cesium.Color.fromCssColorString('#03A9F4').withAlpha(0.01),
                        outlineColor : Cesium.Color.CHARTREUSE,
                        clampToGround: true
                    }
                };
                this.hierarchy = positions;
                this._init();
            }

            _.prototype._init = function () {
                var _self = this;
                var _update = function () {
                    return new Cesium.PolygonHierarchy(_self.hierarchy);
                };
                //实时更新polygon.hierarchy
                this.options.polygon.hierarchy = new Cesium.CallbackProperty(_update, false);
                polygons.value.push(viewer.value.entities.add(this.options));
            };
            return _;
        })();
   // 鼠标事件
  var handler12 = new Cesium.ScreenSpaceEventHandler(viewer.value.scene.canvas);
  handleArr.value.push(handler12);
  var positions = [];
  var tempPoints = [];
  var poly = null;
  var cartesian = null;
  handler12.setInputAction(function (movement) {
    // let ray = viewer.value.camera.getPickRay(movement.endPosition);
    cartesian = viewer.value.scene.camera.pickEllipsoid(movement.endPosition, viewer.value.scene.globe.ellipsoid);
    positions.pop(); //移除最后一个  以上一个点为结束  
    positions.push(cartesian);
    if (positions.length >= 2) {
      poly = new PolygonPrimitive(positions);
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  handler12.setInputAction(function (movement) {
    // let ray = viewer.value.camera.getPickRay(movement.position);
     cartesian = viewer.value.scene.camera.pickEllipsoid(movement.position, viewer.value.scene.globe.ellipsoid);

    if (positions.length == 0) {
      positions.push(cartesian.clone());
    }
    positions.push(cartesian);
    //在三维场景中添加点
    var cartographic = Cesium.Cartographic.fromCartesian(
      positions[positions.length - 1]
    );
    var longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
    var latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
    var heightString = cartographic.height;
    var labelText =
      "(" + longitudeString.toFixed(2) + "," + latitudeString.toFixed(2) + ")";
    tempPoints.push({
      lon: longitudeString,
      lat: latitudeString,
      hei: heightString,
    });
    const floatpoint=viewer.value.entities.add({
      name: "多边形面积",
      position: positions[positions.length - 1],
      point: {
        pixelSize: 5,
        color: Cesium.Color.RED,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
      label: {
        text: labelText,
        font: "15px sans-serif",
        fillColor: Cesium.Color.GOLD,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 2,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -10),
      },
    });
    points.value.push(floatpoint);
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  handler12.setInputAction(function (movement) {
    if (handleArr.value.length > 0) {
      for (let i in handleArr.value) handleArr.value[i].destroy();
      handleArr.value = [];
    }
    positions.pop();
    var textArea = getArea(tempPoints) + "平方公里";
   const area= viewer.value.entities.add({
      name: "多边形面积",
      position: positions[positions.length - 1],
      label: {
        text: textArea,
        font: "15px sans-serif",
        fillColor: Cesium.Color.GOLD,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 2,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(20, -50),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
   });
    labelsen.value.push(area);
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  var radiansPerDegree = Math.PI / 180.0; //角度转化为弧度(rad)
  var degreesPerRadian = 180.0 / Math.PI; //弧度转化为角度
  //计算多边形面积
  function getArea(points) {
    var res = 0;
    //拆分三角曲面
    for (var i = 0; i < points.length - 2; i++) {
      var j = (i + 1) % points.length;
      var k = (i + 2) % points.length;
      var totalAngle = Angle(points[i], points[j], points[k]);
      var dis_temp1 = distance(positions[i], positions[j]);
      var dis_temp2 = distance(positions[j], positions[k]);
      res += dis_temp1 * dis_temp2 * Math.abs(Math.sin(totalAngle));
    }
    return (res / 1000000.0).toFixed(4);
  }

  /*角度*/
  function Angle(p1, p2, p3) {
    var bearing21 = Bearing(p2, p1);
    var bearing23 = Bearing(p2, p3);
    var angle = bearing21 - bearing23;
    if (angle < 0) {
      angle += 360;
    }
    return angle;
  }
  /*方向*/
  function Bearing(from, to) {
    var lat1 = from.lat * radiansPerDegree;
    var lon1 = from.lon * radiansPerDegree;
    var lat2 = to.lat * radiansPerDegree;
    var lon2 = to.lon * radiansPerDegree;
    var angle = -Math.atan2(
      Math.sin(lon1 - lon2) * Math.cos(lat2),
      Math.cos(lat1) * Math.sin(lat2) -
        Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2)
    );
    if (angle < 0) {
      angle += Math.PI * 2.0;
    }
    angle = angle * degreesPerRadian; //角度
    return angle;
  }

  function distance(point1, point2) {
    var point1cartographic = Cesium.Cartographic.fromCartesian(point1);
    var point2cartographic = Cesium.Cartographic.fromCartesian(point2);
    /**根据经纬度计算出距离**/
    var geodesic = new Cesium.EllipsoidGeodesic();
    geodesic.setEndPoints(point1cartographic, point2cartographic);
    var s = geodesic.surfaceDistance;
    //返回两点之间的距离
    s = Math.sqrt(
      Math.pow(s, 2) +
        Math.pow(point2cartographic.height - point1cartographic.height, 2)
    );
    return s;
  }
}
function onMouseClick41() {
  var handle41 = new Cesium.ScreenSpaceEventHandler(viewer.value.canvas); 
  handleArr.value.push(handle41);
  handle41.setInputAction((movement) => {
                var intersection =viewer.value.scene.camera.pickEllipsoid(movement.position, viewer.value.scene.globe.ellipsoid);
      if (intersection) {
    // 获取交点的地理坐标
    const cartographic =
      viewer.value.scene.globe.ellipsoid.cartesianToCartographic(intersection);
    const longitude = Cesium.Math.toDegrees(cartographic.longitude);
    const latitude = Cesium.Math.toDegrees(cartographic.latitude);
    const altitude = viewer.value.scene.globe.getHeight(cartographic);

    // 更新飞机位置
    const newPlanePosition = Cesium.Cartesian3.fromDegrees(
      longitude,
      latitude,
      altitude
    );

    const newPlane = viewer.value.entities.add({
      position: newPlanePosition,
      model: {
        uri: "../public/model/Cesium_Air.glb",
        minimumPixelSize: 64,
        maximumScale: 20000,
        show: true,
      },
    });

    planes.value.push(newPlane);
  }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  
  
} //画飞机

function onMouseClick42() {  //画导弹
  var handle42= new Cesium.ScreenSpaceEventHandler(viewer.value.canvas); 
  handleArr.value.push(handle42);
  handle42.setInputAction((movement) => {
                var intersection =viewer.value.scene.camera.pickEllipsoid(movement.position, viewer.value.scene.globe.ellipsoid);
      if (intersection) {
    // 获取交点的地理坐标
    const cartographic =
      viewer.value.scene.globe.ellipsoid.cartesianToCartographic(intersection);
    const longitude = Cesium.Math.toDegrees(cartographic.longitude);
    const latitude = Cesium.Math.toDegrees(cartographic.latitude);
    const altitude = viewer.value.scene.globe.getHeight(cartographic);

    // 更新导弹位置
    const newMissilePosition = Cesium.Cartesian3.fromDegrees(
      longitude,
      latitude,
      altitude
    );
    
    const newMissile = viewer.value.entities.add({
      position: newMissilePosition,
      billboard: {
        image: '/missile.png',
        scale:0.01
      }
    });
    missiles.value.push(newMissile);
  }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}
function onMouseClick43() { //画雷达
   var handle43= new Cesium.ScreenSpaceEventHandler(viewer.value.canvas); 
  handleArr.value.push(handle43);
  handle43.setInputAction((movement) => {
                var intersection =viewer.value.scene.camera.pickEllipsoid(movement.position, viewer.value.scene.globe.ellipsoid);
      if (intersection) {
    // 获取交点的地理坐标
    const cartographic =
      viewer.value.scene.globe.ellipsoid.cartesianToCartographic(intersection);
    const longitude = Cesium.Math.toDegrees(cartographic.longitude);
    const latitude = Cesium.Math.toDegrees(cartographic.latitude);
    const altitude = viewer.value.scene.globe.getHeight(cartographic);

    // 更新导弹位置
    const newRadarPosition = Cesium.Cartesian3.fromDegrees(
      longitude,
      latitude,
      altitude
    );
    
    const newRadar = viewer.value.entities.add({
      position: newRadarPosition,
      billboard: {
        image: '/radar.png',
        scale:0.05
      }
    });
    radarsicon.value.push(newRadar);
  }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}
function onMouseClick44() { //画坦克
  var handle44= new Cesium.ScreenSpaceEventHandler(viewer.value.canvas); 
  handleArr.value.push(handle44);
  handle44.setInputAction((movement) => {
                var intersection =viewer.value.scene.camera.pickEllipsoid(movement.position, viewer.value.scene.globe.ellipsoid);
      if (intersection) {
    // 获取交点的地理坐标
    const cartographic =
      viewer.value.scene.globe.ellipsoid.cartesianToCartographic(intersection);
    const longitude = Cesium.Math.toDegrees(cartographic.longitude);
    const latitude = Cesium.Math.toDegrees(cartographic.latitude);
    const altitude = viewer.value.scene.globe.getHeight(cartographic);

    // 更新位置
    const newTankPosition = Cesium.Cartesian3.fromDegrees(
      longitude,
      latitude,
      altitude
    );
    
    const newTank = viewer.value.entities.add({
      position: newTankPosition,
      billboard: {
        image: '/tank.png',
        scale:0.05
      }
    });
    tanks.value.push(newTank);
  }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}


//清除所有实体
function clear() {
  points.value.forEach((point) => {
    viewer.value.entities.remove(point);
  });
  points.value = [];
  lines.value.forEach((line) => {
    viewer.value.entities.remove(line);
  });
  lines.value = [];
  circles.value.forEach((circle) => {
    viewer.value.entities.remove(circle);
  });
  circles.value = [];
  polygons.value.forEach((polygon) => {
    viewer.value.entities.remove(polygon);
  });
  polygons.value = [];
  rectangles.value.forEach((rectangle) => {
    viewer.value.entities.remove(rectangle);
  });
  rectangles.value = [];
   labelsen.value.forEach((label) => {
    viewer.value.entities.remove(label);
   });
  //删除箭头
  for (var i = 0; i < plottingObj.straightDrawArr.length; i++) {
                plottingObj.straightDrawArr[i].clear();
  }
  for (var i = 0; i < plottingObj.attackDrawArr.length; i++) {
                plottingObj.attackDrawArr[i].clear();
  }
  for (var i = 0; i <plottingObj.pincerDrawArr.length; i++) {
                plottingObj.pincerDrawArr[i].clear();
   }
            plottingObj.pincerArrow = null;
            plottingObj.pincerDrawArr = [];
            plottingObj.attackArrow = null;
            plottingObj.attackDrawArr = [];
            plottingObj.straightArrow = null;
            plottingObj.straightDrawArr = [];
        
  rectangles.value = [];
  planes.value.forEach((plane) => {
    viewer.value.entities.remove(plane);
  });
  planes.value = [];
 missiles.value.forEach((missile) => {
    viewer.value.entities.remove(missile);
  });
  missiles.value = [];
  radarsicon.value.forEach((radar) => {
    viewer.value.entities.remove(radar);
  });
  radarsicon.value = [];
  radars.value.forEach((radar) => {
    viewer.value.entities.remove(radar);
  });
  radars.value = [];
  tanks.value.forEach((tank) => {
    viewer.value.entities.remove(tank);
  });
  tanks.value = [];
  viewer.value.dataSources.removeAll();
}
function getPointFromWindowPoint(point){
        if(viewer.value.scene.terrainProvider.constructor.name=="EllipsoidTerrainProvider") {
            return viewer.value.camera.pickEllipsoid(point,viewer.value.scene.globe.ellipsoid);
        } else {
            var ray=viewer.value.scene.camera.getPickRay(point);
            return viewer.value.scene.globe.pick(ray,viewer.value.scene);
        }
    }
    //笛卡尔坐标系转WGS84坐标系
  function  Cartesian3_to_WGS84(point) {
        var cartesian33 = new Cesium.Cartesian3(point.x, point.y, point.z);
        var cartographic = Cesium.Cartographic.fromCartesian(cartesian33);
        var lat = Cesium.Math.toDegrees(cartographic.latitude);
        var lng = Cesium.Math.toDegrees(cartographic.longitude);
        var alt = cartographic.height;
        return {lat: lat, lng: lng, alt: alt};
    }
    //WGS84坐标系转笛卡尔坐标系
  function  WGS84_to_Cartesian3 (point) {
        var car33 = Cesium.Cartesian3.fromDegrees(point.lng, point.lat, point.alt);
        var x = car33.x;
        var y = car33.y;
        var z = car33.z;
        return {x: x, y: y, z: z};
    }

    //计算两点间距离
   function getFlatternDistance(lat1, lng1, lat2, lng2) {
        var EARTH_RADIUS = 6378137.0;    //单位M
        var PI = Math.PI;

        function getRad(d) {
            return d * PI / 180.0;
        }
        var f = getRad((lat1 + lat2) / 2);
        var g = getRad((lat1 - lat2) / 2);
        var l = getRad((lng1 - lng2) / 2);

        var sg = Math.sin(g);
        var sl = Math.sin(l);
        var sf = Math.sin(f);

        var s, c, w, r, d, h1, h2;
        var a = EARTH_RADIUS;
        var fl = 1 / 298.257;

        sg = sg * sg;
        sl = sl * sl;
        sf = sf * sf;

        s = sg * (1 - sl) + (1 - sf) * sl;
        c = (1 - sg) * (1 - sl) + sf * sl;

        w = Math.atan(Math.sqrt(s / c));
        r = Math.sqrt(s * c) / w;
        d = 2 * w * a;
        h1 = (3 * r - 1) / 2 / c;
        h2 = (3 * r + 1) / 2 / s;

        return d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg));
}

function loadsatellite() {//tle 卫星实例
  var tle = [{
    name: '007',
    tle1: '1 25544U 98067A   19156.50900463  .00003075  00000-0  59442-4 0  9992',
    tle2:'2 25544  51.6433  59.2583 0008217  16.4489 347.6017 15.51174618173442' }];
  console.log(tle[0]);
  var starttime = new Date("2024-04-03 10:15:00");
  var endtime = new Date("2024-04-30 10:15:00");

  const czml = tles2czml(starttime, endtime, tle);
  console.log(czml);
  // 加载czml数据
  let promiseData = Cesium.CzmlDataSource.load(czml);
  promiseData.then((dataSource) => {
    viewer.value.dataSources.add(dataSource);
    // viewer.value.flyTo(dataSource);
  });
}
// 示例函数，将输入的字符串值转换为数字
function convertToNumber(value) {
  return parseFloat(value);
}
function showradardialog() {
  dialogFormVisible.value = true;
}
</script>
<style>
#cesiumContainer {
  position: relative;
  z-index: 1; /* 较低的 z-index 值，确保Cesium Viewer在信息框下方 */
  /* 其他样式属性 */
}
#cesiumtooltip {
  position: absolute;
  z-index: 99999; /* 较高的 z-index 值，确保信息框位于其他元素之上 */
  /* 其他样式属性 */
  background-color: rgba(0, 0, 0, 0.8);
  right: 0;
  bottom: 0;
  color: #fff;
  padding: 10px;
  font-size: 14px;
  pointer-events: none;
  border-radius: 4px;
  /* border: 2px solid #ff0000; */
}
#planerouteinfo {
  color: #fff;
  padding: 10px;
  font-size: 14px;
  pointer-events: none;
  border-radius: 4px;
}
#planeinfo{
   position: absolute;
  z-index: 99999; /* 较高的 z-index 值，确保信息框位于其他元素之上 */
  /* 其他样式属性 */
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 10px;
  font-size: 14px;
  pointer-events: none;
  border-radius: 4px;
}
</style>

<template>
 
    <div style="margin: 10px 5px; width: 100%; height: 100%;">
    <el-button type="primary" @click="showFlightPath">显示飞机轨迹</el-button>
    <el-button  type="primary" @click="hideFlightPath">隐藏飞机轨迹</el-button>
    <el-button  type="primary" @click="showChinaEdge">显示中国边界</el-button>
    <el-button  type="primary" @click="hideChinaEdge">隐藏中国边界</el-button>
    <el-button  type="primary" @click="change2D">二维显示</el-button>
    <el-button  type="primary" @click="change3D">三维显示</el-button>
      <el-button  type="primary" @click="clearPlanes">一键清除飞机</el-button>

  </div>
  <div id="cesiumContainer" style="height: 522px; width: 100%;">
  </div>  
 
</template>

<script setup >
import * as Cesium from "cesium";
import { ref, onMounted ,computed,watch} from "vue";
 
// import { PolylineTrailLinkMaterialProperty }   from '../stores/PolylineTrailLinkMaterialProperty.js'
import store from '../stores/store.js';
// iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-popups allow-forms'); 
// 访问状态
// 访问状态
const isCreatingMenuItem= computed(() => store.state.isCreatingMenuItem);
const viewer = ref(null);  // 定义viewer为响应式数据
const sceneMode = ref(Cesium.SceneMode.SCENE3D); // 定义为响应式变量
const line = ref(null); // 响应式的飞行路径实例
const plane = ref(null); // 响应式的飞机实例
const chinaDataSource = ref(null); // 响应式的中国数据源实例
const labelprovince = ref([]);//省份标签实例
const planes = ref([]);//存储飞机实体数组
const radaricon = ref(null);//存储雷达图标实例
// 定义事件类型和处理函数
var eventTypes = ['click', 'mouseover', 'keydown'];
var eventHandlers = [onMouseClick1,onMouseClick5,onMouseClick41,onMouseClick42,onMouseClick43,onMouseClick44];
let scale = 1;
var drawingRectangle = false;
var startPosition;
var endPosition;
// const terrainProvider = new Cesium.CesiumTerrainProvider({  url: 'https://data.marsgis.cn/terrain'});
// var iframe = document.getElementsByClassName('cesium-infoBox-iframe')[0];
// iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-popups allow-forms');
// iframe.setAttribute('src', ''); //必须设置src为空 否则不会生效。
onMounted(() => {
  initializeCesium();



  watch(
    isCreatingMenuItem,
    (newVal) => {
      if (newVal === 1) {
    // 移除所有事件监听器
      for (var i = 0; i < eventHandlers.length; i++) {
      viewer.value.canvas.removeEventListener(eventTypes[0], eventHandlers[i]);
        }
      viewer.value.canvas.addEventListener("click", onMouseClick1);
  }  
      else if (newVal === 41) {
    // 移除所有事件监听器
      for (var i = 0; i < eventHandlers.length; i++) {
      viewer.value.canvas.removeEventListener(eventTypes[0], eventHandlers[i]);
        }
    viewer.value.canvas.addEventListener("click", onMouseClick41);
      } 
      else if (newVal===5) {
        for (var i = 0; i < eventHandlers.length; i++) {
      viewer.value.canvas.removeEventListener(eventTypes[0], eventHandlers[i]);
        }
    viewer.value.canvas.addEventListener("click", onMouseClick5);
      }
    else {
       for (var i = 0; i < eventHandlers.length; i++) {
      viewer.value.canvas.removeEventListener(eventTypes[0], eventHandlers[i]);
        }
    }
    },
    

  );
const iframe = document.getElementsByClassName('cesium-infoBox-iframe')[0]; // 获取iframe dom元素
iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-popups allow-forms')
iframe.setAttribute('src', '')

});

function initializeCesium(){
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
    //     homeButton: true,
    //     //经纬网图标，选择视角的模式，有三种：3D，2D，哥伦布视图（2.5D)
    //     sceneModePicker: false,
    //     //地图图标，图层选择器，选择要显示的地图服务和地形服务
    //     baseLayerPicker: false,
    //     //问号图标，导航帮助按钮，显示默认的地图控制帮助
    //     navigationHelpButton: false,
    //     //动画器件，显示当前时间，允许跳转特定时间
    //     animation: false,
    //     //时间轴
     shouldAnimate: true,
     selectionIndicator: false, // 获取当选定实体更改时引发的事件。
    //     timeline: false,
    //     //全屏图标，全屏按钮
    //     fullscreenButton: false,
    //     //虚拟现实
    //     vrButton: false,
    //     //阴影
    //     shadows: false,
    //     //展示数据版权属性
    //     CreditsDisplay: false,

  });

// viewer.value.dataSources.add(
//   Cesium.CzmlDataSource.load("../SampleData/simple.czml")
// );
  
if(Cesium.FeatureDetection.supportsImageRenderingPixelated()){//判断是否支持图像渲染像素化处理
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
for (let lang = -180; lang <=180; lang += 5) {
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
    destination: Cesium.Cartesian3.fromDegrees(117.283043,31.861191,6070050),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-90),
      roll: 0,
    },
  });



//  viewer.value.scene.globe.depthTestAgainstTerrain = true;//开启深度测试考虑了地形的高度
  // // 创建飞机轨迹
  // const positions = [
  //   Cesium.Cartesian3.fromDegrees(116.4074, 39.9042, 0),
  //   Cesium.Cartesian3.fromDegrees(-74.0059, 40.7128, 0),
  //   // 添加更多的轨迹点
  // ];
  // let LineInstanceArr = [];

  // // 定义折线几何
  // let polyline = new Cesium.PolylineGeometry({
  //   positions: positions,
  //   width: 1.0,
  //   vertexFormat: Cesium.PolylineColorAppearance.VERTEX_FORMAT,
  // });

  // var LineInstance = new Cesium.GeometryInstance({
  //   geometry: polyline,
  //   attributes: {
  //     color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.RED),
  //   },
  // });

  // LineInstanceArr.push(LineInstance);

  // // 创建飞行路径实例
  // line.value = new Cesium.Primitive({
  //   geometryInstances: LineInstanceArr,
  //   appearance: new Cesium.PolylineColorAppearance({
  //     translucent: false,
  //   }),
  //   asynchronous: false,
  //   show: false
  // });

  // viewer.value.scene.primitives.add(line.value);

  // // 将摄像机定位到飞机位置
  // viewer.value.scene.camera.flyTo({
  //   destination: Cesium.Cartesian3.fromDegrees(116.4074, 39.9042, 20070050),
  //   orientation: {
  //     heading: Cesium.Math.toRadians(0),
  //     pitch: Cesium.Math.toRadians(-90),
  //     roll: 0,
  //   },
  // });

// const redCone = viewer.value.entities.add({
//   name: "Red cone",
//   position: Cesium.Cartesian3.fromDegrees(117.283043,31.861191),
//   cylinder: {
//     length: 400000.0,
//     topRadius: 200000.0,
//     bottomRadius: 0.0,
//     material: Cesium.Color.RED.withAlpha(0.5), // 设置透明度为0.5
//   },
  // });

  
// 抛物飞线效果
parabolaFlowInit(viewer.value, 3);


  radaricon.value = viewer.value.entities.add({
    show:true,
  position: Cesium.Cartesian3.fromDegrees(117.283043,31.861191),
  billboard: {
    image: '/radar.png', // 设置贴图路径
    scale:0.03
  }
})
//  边界实例
  chinaDataSource.value= new Cesium.GeoJsonDataSource("ChinaDataSource");
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
  { province: '辽宁省', capital: '沈阳市', longitude: 123.429092, latitude: 41.796768 },
  { province: '吉林省', capital: '长春市', longitude: 125.324501, latitude: 43.886841 },
  { province: '黑龙江省', capital: '哈尔滨市', longitude: 126.642464, latitude: 45.756966 },
  { province: '北京市', capital: '北京', longitude: 116.405289, latitude: 39.904987 },
  { province: '天津市', capital: '天津', longitude: 117.190186, latitude: 39.125595 },
  { province: '内蒙古自治区', capital: '呼和浩特市', longitude: 111.751990, latitude: 40.841490 },
  { province: '宁夏回族自治区', capital: '银川市', longitude: 106.232480, latitude: 38.486440 },
  { province: '山西省', capital: '太原市', longitude: 112.549248, latitude: 37.857014 },
  { province: '河北省', capital: '石家庄市', longitude: 114.502464, latitude: 38.045475 },
  { province: '山东省', capital: '济南市', longitude: 117.000923, latitude: 36.675808 },
  { province: '河南省', capital: '郑州市', longitude: 113.665413, latitude: 34.757977 },
  { province: '陕西省', capital: '西安市', longitude: 108.948021, latitude: 34.263161 },
  { province: '湖北省', capital: '武汉市', longitude: 114.298569, latitude: 30.584354 },
  { province: '江苏省', capital: '南京市', longitude: 118.76741, latitude: 32.041546 },
  { province: '安徽省', capital: '合肥市', longitude: 117.283043, latitude: 31.861191 },
  { province: '上海市', capital: '上海', longitude: 121.472641, latitude: 31.231707 },
  { province: '湖南省', capital: '长沙市', longitude: 112.982277, latitude: 28.19409 },
  { province: '江西省', capital: '南昌市', longitude: 115.892151, latitude: 28.676493 },
  { province: '浙江省', capital: '杭州市', longitude: 120.15358, latitude: 30.287458 },
  { province: '福建省', capital: '福州市', longitude: 119.306236, latitude: 26.075302 },
  { province: '广东省', capital: '广州市', longitude: 113.28064, latitude: 23.125177 },
  { province: '台湾省', capital: '台北市', longitude: 121.5200760, latitude: 25.0307240 },
  { province: '海南省', capital: '海口市', longitude: 110.199890, latitude: 20.044220 },
  { province: '广西壮族自治区', capital: '南宁市', longitude: 108.320007, latitude: 22.82402 },
  { province: '重庆市', capital: '重庆', longitude: 106.504959, latitude: 29.533155 },
  { province: '云南省', capital: '昆明市', longitude: 102.71225, latitude: 25.040609 },
  { province: '贵州省', capital: '贵阳市', longitude: 106.713478, latitude: 26.578342 },
  { province: '四川省', capital: '成都市', longitude: 104.065735, latitude: 30.659462 },
   { province: '甘肃省', capital: '兰州市', longitude: 103.834170, latitude: 36.061380 },
  { province: '青海省', capital: '西宁市', longitude: 101.777820, latitude: 36.617290 },
  { province: '西藏自治区', capital: '拉萨市', longitude: 91.11450, latitude: 29.644150 },
  { province: '新疆维吾尔自治区', capital: '乌鲁木齐市', longitude: 87.616880, latitude: 43.826630 },
  { province: '香港特别行政区', capital: '香港', longitude: 114.165460, latitude: 22.275340 },
  { province: '澳门特别行政区', capital: '澳门', longitude: 113.549130, latitude: 22.198750 }]
for (let i = 0, l = provinceData.length; i < l; i++) {
        let item = provinceData[i];
        const newlabel=viewer.value.entities.add({
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

    

function parabolaFlowInit(_viewer, _num) {
  let _center = [113.9236839, 22.528061];
  let _positions = [
    [130.8236839, 40.528061],

  ];

  _positions.forEach((item) => {
    let _siglePositions = parabola(_center, item, 1000000);
    // 创建飞线
    // for (let i = 0; i < _num; i++) {
    //   _viewer.entities.add({
    //     polyline: {
    //       positions: _siglePositions,
    //       material: new Cesium.PolylineGlowMaterialProperty({
    //         glowPower: 0.8,
    //         color: Cesium.Color.RED.withAlpha(0.8),
    //         // time: i * 0.03, // 设置不同的时间偏移量
    //       }),
    //     },
    //   });
    // }
    // 创建轨迹线
    _viewer.entities.add({
      polyline: {
        positions: _siglePositions,
        material: new Cesium.Color(0.0, 1.0, 0.0, 0.8),
        // material: new Cesium.PolylineTrailLinkMaterialProperty(Cesium.Color.RED,'/flowline.png', 2000),
      },
    });
  });
  
  /**
   * @description: 抛物线构造函数（参考开源代码）
   * @param {*}
   * @return {*}
   */
  function parabola(startPosition, endPosition, height = 0, count = 50) {
    //方程 y=-(4h/L^2)*x^2+h h:顶点高度 L：横纵间距较大者
    let result = [];
    height = Math.max(+height, 100);
    count = Math.max(+count, 50);
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
   labelprovince.value.forEach(label => {
    label.show=true;
  });
}
function hideChinaEdge() {
  chinaDataSource.value.show = false;
   labelprovince.value.forEach(label => {
    label.show=false;
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


function onMouseClick1() {
  
   viewer.value.entities.add({
  position : Cesium.Cartesian3.fromDegrees(117.283043,31.861191,100000),
  point : {
    pixelSize : 10,
    color : Cesium.Color.RED
  },
  show:true
});//画点
}//画点

function onMouseClick41(event){  
  // 获取鼠标点击的屏幕坐标
  const mousePosition = new Cesium.Cartesian2(event.clientX/scale, event.clientY/scale);

  // // 使用相机的射线与地球表面进行拾取
  // const ray = viewer.value.camera.getPickRay(mousePosition);
  // const intersection = viewer.value.scene.globe.pick(ray, viewer.value.scene);
// 使用相机的射线与地球表面进行拾取
  const intersection = viewer.value.camera.pickEllipsoid(mousePosition, viewer.value.scene.globe.ellipsoid);
  // 如果找到有效的交点，更新飞机实体的位置并显示出来
  if (intersection) {
    // 获取交点的地理坐标
    const cartographic = viewer.value.scene.globe.ellipsoid.cartesianToCartographic(intersection);
    const longitude = Cesium.Math.toDegrees(cartographic.longitude);
    const latitude = Cesium.Math.toDegrees(cartographic.latitude);
    const altitude = viewer.value.scene.globe.getHeight(cartographic);

    // 更新飞机位置
    const newPlanePosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude);

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
}//画飞机
function onMouseClick42(event) { }
function onMouseClick43(event) { }
function onMouseClick44(event) { }

function onMouseClick5(event) { 
   viewer.value.entities.add({
  name: "Rectangle with border",
  rectangle: {
    coordinates: Cesium.Rectangle.fromDegrees(-110.0, 20.0, -80.0, 25.0),
    material: new Cesium.Color(0, 0, 0, 0), // 设置透明的填充颜色
    outline: true, // 开启边框
    outlineColor: Cesium.Color.RED, // 边框颜色
    outlineWidth: 2, // 边框宽度
    height: 0, // 将高度设置为0，禁用地形连接
  },
  });

}//画矩形


//清除所有飞机实体
function clearPlanes() {
  planes.value.forEach(plane => {
    viewer.value.entities.remove(plane);
  });
  planes.value = [];
}
</script>
<style scoped> 
 </style>

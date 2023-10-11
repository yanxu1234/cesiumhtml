
var handler2 = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

handler2.setInputAction(function (movement) {
  var cartesian = viewer.scene.pickPosition(movement.endPosition);

  if (cartesian) {
    var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    var longitude = Cesium.Math.toDegrees(cartographic.longitude);
    var latitude = Cesium.Math.toDegrees(cartographic.latitude);

    // 在此处进行贴图位置判断逻辑
    if ((longitude === 113.9236839&&latitude===22.528061) /* 贴图位置判断条件 */) {
      // 鼠标移动到贴图位置的处理逻辑
      
    }
  }
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

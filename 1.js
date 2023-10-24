// 鼠标移入自定义弹出框
handler.setInputAction(function (movement) {
  if (scene.mode !== Cesium.SceneMode.MORPHING) {
    var pickedObject = scene.pick(movement.endPosition);
    if (
      scene.pickPositionSupported &&
      Cesium.defined(pickedObject) &&
      pickedObject.id !== ""
    ) {
      TooltipDiv.showAt(movement.endPosition, "地区：" + pickedObject.id._name);
    } else {
      TooltipDiv.setVisible(false);
    }
  }
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

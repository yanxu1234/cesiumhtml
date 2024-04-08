import * as Cesium from "cesium";

export default class Entitys {
  constructor(core) {
    /**
     * 初始化
     */
    this.entitysAction = core.entities;
  }
  add(entity) {
    return this.entitysAction.add(entity);
  }
  remove(entity) {
    this.entitysAction.remove(entity);
  }
  createEntity() {
    return new Cesium.Entity();
  }
  //点
  getPoint() {
    return new Cesium.PointGraphics({
      color: Cesium.Color.GREEN,
      pixelSize: 5,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 1,
    });
  }
  //标签
  getLabel(text, offset) {
    return new Cesium.LabelGraphics({
      //文字标签
      text: text,
      font: "14px sans-serif",
      fillColor: Cesium.Color.GOLD,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      outlineWidth: 2,
      showBackground: true,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: offset == undefined ? new Cesium.Cartesian2(0, 20) : offset,
      //heightReference:Cesium.HeightReference.RELATIVE_TO_GROUND
    });
  }
  //广告牌
  getBillboard(img, width, height) {
    return new Cesium.BillboardGraphics({
      image: img == undefined ? "../img/zb.png" : img,
      width: width == undefined ? 35 : width,
      height: height == undefined ? 35 : height,
      clampToGround: true,
      // eyeOffset :new Cesium.Cartesian2(-200, 0),
      pixelOffset: new Cesium.Cartesian2(0, -20),
      //heightReference:Cesium.HeightReference.RELATIVE_TO_GROUND
    });
  }

  //创建点信息
  createPoint(cartesian, label = false, point = false, billboard = false) {
    let entity = this.createEntity();
    entity.position = cartesian;
    if (point) entity.point = this.getPoint();
    if (billboard) entity.billboard = this.getBillboard(billboard);
    if (label) entity.label = this.getLabel(label);
    let entityPoint = this.add(entity);
    return entityPoint;
  }

  /**
   * 提示信息实体
   * 控制器
   */
  createMsgTip() {
    this._resultTip = this.entitysAction.add({
      id: Cesium.createGuid(),
      label: {
        fillColor: Cesium.Color.YELLOW,
        showBackground: true,
        font: "14px monospace",
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -10),
      },
    });
    return this._resultTip;
  }
  /**
   * 提示框
   * @param {*} bShow
   * @param {*} position
   * @param {*} message
   */
  showTip(label, bShow, position, message, effectOptions) {
    label.show = bShow;
    if (bShow) {
      if (position) label.position = position;
      if (message) label.label.text = message;
      if (effectOptions) {
        for (let key in effectOptions) {
          if (label.key) {
            label.key = effectOptions[key];
          }
        }
      }
    }
  }
}

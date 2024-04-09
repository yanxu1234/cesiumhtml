import * as Cesium from 'cesium';

import Entitys from './entitys.js';
import plotPoint from '/point.png';
import mapUtils from '../mapUtils.js';

/**
 * 攻击箭头
 */
export default class {

    constructor(viewer){
        this.type = "AttackArrow";
        this.objId = Number((new Date()).getTime() + "" + Number(Math.random() * 1000).toFixed(0))
        this.viewer = viewer;
        this.pointImageUrl = plotPoint;
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        this.fillMaterial = Cesium.Color.fromCssColorString('#F44336').withAlpha(0.5);
        this.outlineMaterial = new Cesium.PolylineDashMaterialProperty({
            dashLength: 16,
            color: Cesium.Color.fromCssColorString('#0000FF').withAlpha(0.7)
        });
        this.entitys = new Entitys(viewer);
        this._resultTip = this.entitys.createMsgTip();
        this.positions = []; //控制点
        this.state = -1; //state用于区分当前的状态 0 为删除 1为添加 2为编辑
        this.floatPoint = null;
        this.arrowEntity = null;
        this.pointArr = []; //中间各点
        this.selectPoint = null;
        this.clickStep = 0; //用于控制点的移动结束
        this.modifyHandler = null;
    }
    disable () {
        this.positions = [];
        if (this.arrowEntity) {
            this.viewer.entities.remove(this.arrowEntity);
            this.arrowEntity = null;
        }
        this.state = -1;
        if (this.handler) {
            this.handler.destroy();
            this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        }
        if (this.floatPoint) {
            this.viewer.entities.remove(this.floatPoint);
            this.floatPoint = null;
        }
        if (this.selectPoint) {
            this.viewer.entities.remove(this.selectPoint);
            this.selectPoint = null;
        }
        for (var i = 0; i < this.pointArr.length; i++) {
            if (this.pointArr[i]) this.viewer.entities.remove(this.pointArr[i]);
        }
        if (this.modifyHandler) {
            this.modifyHandler.destroy();
            this.modifyHandler = null;
        }
        this.clickStep = 0;

    }
    getCatesian3FromPX(px, viewer) {
        var picks = viewer.scene.drillPick(px);
        // viewer.render();
        var cartesian;
        var isOn3dtiles = false;
        for (var i = 0; i < picks.length; i++) {
            if (picks[i] instanceof Cesium.Cesium3DTileFeature) { //模型上拾取
                isOn3dtiles = true;
            }
        }
        if (isOn3dtiles) {
            cartesian = viewer.scene.pickPosition(px);
        } else {
            var ray = viewer.camera.getPickRay(px);
            if (!ray) return null;
            cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        }
        return cartesian;
    }
    startDraw () {
        var $this = this;
        this.state = 1;
        this.handler.setInputAction((evt) => { //单机开始绘制
            var cartesian;
            cartesian = this.getCatesian3FromPX(evt.position, $this.viewer);
            if (!cartesian) return;
            // var ray = viewer.camera.getPickRay(evt.position);
            // if (!ray) return;
            // var cartesian = viewer.scene.globe.pick(ray, $this.viewer.scene);
            if ($this.positions.length == 0) {
                $this.floatPoint = $this.creatPoint(cartesian);
                $this.floatPoint.wz = -1;
            }

            // 新增判断，如果点击同一个点，则不存入数组$this.positions
            let  flag = false;
            if ($this.positions.length > 1) {
                flag = $this.positions[$this.positions.length - 2].equals(cartesian);
            }
            if (!flag) {
                $this.positions.push(cartesian);
            }
            var point = $this.creatPoint(cartesian);
            if ($this.positions.length > 2) {
                point.wz = $this.positions.length - 1; //点对应的在positions中的位置  屏蔽mouseMove里往postions添加时 未创建点
            } else {
                point.wz = $this.positions.length; //点对应的在positions中的位置
            }
            $this.pointArr.push(point);
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.handler.setInputAction((evt) => { //移动时绘制面
            // var ray = viewer.camera.getPickRay(evt.endPosition);
            // if (!ray) return;
            // var cartesian = viewer.scene.globe.pick(ray, $this.viewer.scene);
            var cartesian;
            cartesian = this.getCatesian3FromPX(evt.endPosition, $this.viewer);
            if (!cartesian) return;
            if ($this.positions.length < 2){
                $this.entitys.showTip($this._resultTip,true,cartesian,'点击地图');
                return;
            }
            $this.floatPoint.position.setValue(cartesian);
            if ($this.positions.length >= 2) {
                if (!Cesium.defined($this.arrowEntity)) {
                    $this.positions.push(cartesian);
                    $this.arrowEntity = $this.showArrowOnMap($this.positions);
                    $this.arrowEntity.objId = $this.objId;
                } else {
                    $this.positions.pop();
                    $this.positions.push(cartesian);
                }
                $this.entitys.showTip($this._resultTip,true,cartesian,'点击地图结束');
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        this.handler.setInputAction((evt) => { //右击结束绘制
            // var ray = viewer.camera.getPickRay(evt.position);
            // if (!ray) return;
            // var cartesian = viewer.scene.globe.pick(ray, $this.viewer.scene);
            var cartesian;
            cartesian = this.getCatesian3FromPX(evt.position, $this.viewer);
            if (!cartesian) return;
            for (var i = 0; i < $this.pointArr.length; i++) {
                $this.pointArr[i].show = false;
            }
            $this.floatPoint.show = false;
            $this.viewer.entities.remove($this.floatPoint);
            $this.floatPoint = null;
            var point = $this.creatPoint(cartesian);
            point.show = false;
            point.wz = $this.positions.length;
            $this.pointArr.push(point);
            $this.handler.destroy();
            $this.entitys.remove($this._resultTip);
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }
    createByData (data) { //根据传入的数据构建箭头
        this.positions = []; //控制点
        this.state = -1; //state用于区分当前的状态 0 为删除 1为添加 2为编辑
        this.floatPoint = null;
        this.pointArr = []; //中间各点
        this.selectPoint = null;
        this.clickStep = 0; //用于控制点的移动结束
        this.modifyHandler = null;
        var arr = [];
        for (var i = 0; i < data.length; i++) {
            var cart3 = Cesium.Cartesian3.fromDegrees(data[i][0], data[i][1]);
            arr.push(cart3);
        }
        this.positions = arr;
        //构建控制点
        for (var i = 0; i < this.positions.length; i++) {
            var point = this.creatPoint(this.positions[i]);
            point.show = false;
            point.wz = i + 1;
            this.pointArr.push(point);
        }
        this.arrowEntity = this.showArrowOnMap(this.positions);
        this.arrowEntity.objId = this.objId;
    }
    startModify () { //修改箭头
        this.state = 2;
        var $this = this;
        for (var i = 0; i < $this.pointArr.length; i++) {
            $this.pointArr[i].show = true;
        }
        if (!this.modifyHandler) this.modifyHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        this.modifyHandler.setInputAction((evt) => { //单机开始绘制
            var pick = $this.viewer.scene.pick(evt.position);
            if (Cesium.defined(pick) && pick.id) {
                $this.clickStep++;
                if (!pick.id.objId)
                    $this.selectPoint = pick.id;
            } else { //激活移动点之后 单机面之外 移除这个事件
                for (var i = 0; i < $this.pointArr.length; i++) {
                    $this.pointArr[i].show = false;
                }
                if ($this.floatPoint) $this.floatPoint.show = false;
                $this.state = -1;
                $this.modifyHandler.destroy();
                $this.modifyHandler = null;
            }
            if ($this.clickStep == 2) {
                $this.clickStep = 0;
                // var ray = $this.viewer.camera.getPickRay(evt.position);
                // if (!ray) return;
                // var cartesian = $this.viewer.scene.globe.pick(ray, $this.viewer.scene);
                var cartesian;
                cartesian = this.getCatesian3FromPX(evt.position, $this.viewer);
                if (!cartesian) return;
                if ($this.selectPoint) {
                    $this.selectPoint.position.setValue(cartesian);
                    $this.selectPoint = null;
                }

            };
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.modifyHandler.setInputAction((evt) => { //单机开始绘制
            // var ray = $this.viewer.camera.getPickRay(evt.endPosition);
            // if (!ray) return;
            // var cartesian = $this.viewer.scene.globe.pick(ray, $this.viewer.scene);
            var cartesian;
            cartesian = this.getCatesian3FromPX(evt.endPosition, $this.viewer);
            if (!cartesian) return;
            if ($this.selectPoint) {
                $this.selectPoint.position.setValue(cartesian);
                $this.positions[$this.selectPoint.wz - 1] = cartesian; //上方的wz用于此处辨识修改positions数组里的哪个元素
            } else {
                return;
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
    clear () { //清除绘制箭头
        this.state = 0;
        for (var i = 0; i < this.pointArr.length; i++) {
            if (this.pointArr[i]) this.viewer.entities.remove(this.pointArr[i]);
        }
        if (this.floatPoint) this.viewer.entities.remove(this.floatPoint);
        if (this.arrowEntity) this.viewer.entities.remove(this.arrowEntity);
        this.state = -1;
        if (!this.handler.isDestroyed()) {
            this.handler.destroy();
        }
    }
    getLnglats () {
        var arr = [];
        for (var i = 0; i < this.positions.length; i++) {
            var item = this.cartesianToLatlng(this.positions[i]);
            arr.push(item);
        }
        return arr;
    }
    getPositions () { //获取直角箭头中的控制点 世界坐标
        return this.positions;
    }
    creatPoint (cartesian) {
        var point = this.viewer.entities.add({
            position: cartesian,
            billboard: {
                image: this.pointImageUrl,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                //heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            }
        });
        point.attr = "editPoint";
        return point;
    }
    showArrowOnMap (positions) {
        var $this = this;
        var update = () => {
            //计算面
            if (positions.length < 3) {
                return null;
            }
            var lnglatArr = [];
            for (var i = 0; i < positions.length; i++) {
                var lnglat = $this.cartesianToLatlng(positions[i]);
                lnglatArr.push(lnglat)
            }
            var res = mapUtils.tailedAttackArrow(lnglatArr);
            var index = JSON.stringify(res.polygonalPoint).indexOf("null");
            var returnData = [];
            if (index == -1) returnData = res.polygonalPoint;
            return new Cesium.PolygonHierarchy(returnData);
        }
        return this.viewer.entities.add({
            polygon: new Cesium.PolygonGraphics({
                hierarchy: new Cesium.CallbackProperty(update, false),
                show: true,
                fill: true,
                material: $this.fillMaterial
            })
        });
    }
    cartesianToLatlng (cartesian) {
        var latlng = this.viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
        var lat = Cesium.Math.toDegrees(latlng.latitude);
        var lng = Cesium.Math.toDegrees(latlng.longitude);
        return [lng, lat];
    }
}
import * as Cesium from 'cesium';
import Entitys from './entitys.js';
import mapUtils from '../mapUtils.js';
import plotPoint from '/point.png';

/**
 * 直角箭头
 */
export default class {
    constructor(viewer){
        this.type = "StraightArrow";
        this.objId = Number((new Date()).getTime() + "" + Number(Math.random() * 1000).toFixed(0)); //用于区分多个相同箭头时
        this.viewer = viewer;
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        this.pointImageUrl = plotPoint;
        this.fillMaterial = Cesium.Color.fromCssColorString('#F44336').withAlpha(0.5);
        this.outlineMaterial = new Cesium.PolylineDashMaterialProperty({
            dashLength: 16,
            color: Cesium.Color.fromCssColorString('#0000FF').withAlpha(0.7)
        });
        this.entitys = new Entitys(viewer);
        this._resultTip = this.entitys.createMsgTip();
        this.positions = [];
        this.firstPoint = null;
        this.floatPoint = null;
        this.arrowEntity = null;
        // this.state = -1; //state用于区分当前的状态 0 为删除 1为添加 2为编辑
        this.selectPoint = null;
        this.clickStep = 0;
        this.modifyHandler = null;
    }
    disable () {
        this.positions = [];
        if (this.firstPoint) {
            this.viewer.entities.remove(this.firstPoint);
            this.firstPoint = null;
        }
        if (this.floatPoint) {
            this.viewer.entities.remove(this.floatPoint);
            this.floatPoint = null;
        }
        if (this.arrowEntity) {
            this.viewer.entities.remove(this.arrowEntity);
            this.arrowEntity = null;
        }
        // this.state = -1;
        if (this.handler) {
            this.handler.destroy();
            this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        }
        if (this.selectPoint) {
            this.viewer.entities.remove(this.selectPoint);
            this.selectPoint = null;
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
        // this.state = 1;
        this.handler.setInputAction( (evt)=> { //单机开始绘制
            // var ray = viewer.camera.getPickRay(evt.position);
            // if (!ray) return;
            // var cartesian = viewer.scene.globe.pick(ray, $this.viewer.scene);
            var cartesian;
            cartesian = this.getCatesian3FromPX(evt.position, $this.viewer);
            if (!cartesian) return;
            if ($this.positions.length == 0) {
                $this.firstPoint = $this.creatPoint(cartesian);
                $this.firstPoint.type = "firstPoint";
                $this.floatPoint = $this.creatPoint(cartesian);
                $this.floatPoint.type = "floatPoint";
                $this.positions.push(cartesian);
            }
            if ($this.positions.length == 3) {
                $this.firstPoint.show = false;
                $this.floatPoint.show = false;
                $this.handler.destroy();
                $this.entitys.remove($this._resultTip);
                $this.arrowEntity.objId = $this.objId;
                // $this.state = -1;
            }
            $this.positions.push(cartesian.clone());
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.handler.setInputAction((evt) => { //移动时绘制面
            var cartesian;
            cartesian = this.getCatesian3FromPX(evt.endPosition, $this.viewer);
            if (!cartesian) return;
            if ($this.positions.length < 2){
                $this.entitys.showTip($this._resultTip,true,cartesian,'点击地图');
                return;
            }
            // var ray = viewer.camera.getPickRay(evt.endPosition);
            // if (!ray) return;
            // var cartesian = viewer.scene.globe.pick(ray, $this.viewer.scene);
            $this.floatPoint.position.setValue(cartesian);
            if ($this.positions.length >= 2) {
                if (!Cesium.defined($this.arrowEntity)) {
                    $this.positions.push(cartesian);
                    $this.arrowEntity = $this.showArrowOnMap($this.positions);
                } else {
                    $this.positions.pop();
                    $this.positions.push(cartesian);
                }
                $this.entitys.showTip($this._resultTip,true,cartesian,'鼠标右键结束,平板长按结束');
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
    startModify () { //修改箭头
        // this.state = 2;
        this.firstPoint.show = true;
        this.floatPoint.show = true;
        var $this = this;
        this.clickStep = 0;
        if (!this.modifyHandler) this.modifyHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        this.modifyHandler.setInputAction((evt) => { //单机开始绘制
            var pick = $this.viewer.scene.pick(evt.position);
            if (Cesium.defined(pick) && pick.id) {
                $this.clickStep++;
                if (!pick.id.objId)
                    $this.selectPoint = pick.id;
            } else { //激活移动点之后 单机面之外 移除这个事件
                $this.modifyHandler.destroy();
                $this.modifyHandler = null;
                $this.firstPoint.show = false;
                $this.floatPoint.show = false;
                // $this.state = -1;
            }

            //选中点后 第二次点击 则重新定位该点
            if ($this.clickStep == 2) {
                $this.clickStep = 0;
                var cartesian;
                cartesian = this.getCatesian3FromPX(evt.position, $this.viewer);
                if (!cartesian) return;
                if ($this.selectPoint) {
                    $this.selectPoint.position.setValue(cartesian);
                    $this.selectPoint = null;
                }
            };
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.modifyHandler.setInputAction((evt) => {
            if ($this.selectPoint) {
                var cartesian;
                cartesian = this.getCatesian3FromPX(evt.endPosition, $this.viewer);
                if (!cartesian) return;
                $this.selectPoint.position.setValue(cartesian);
                if ($this.selectPoint.type == "firstPoint") {
                    $this.positions[1] = cartesian;
                }
                if ($this.selectPoint.type == "floatPoint") {
                    $this.positions[2] = cartesian;
                }
            } else {
                return;
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
    createByData (data) { //通过传入的经纬度数组 构建箭头
        // this.state = -1;
        this.positions = [];
        var arr = [];
        for (var i = 0; i < data.length; i++) {
            var cart3 = Cesium.Cartesian3.fromDegrees(data[i][0], data[i][1]);
            arr.push(cart3);
        }
        this.positions = arr;
        this.firstPoint = this.creatPoint(this.positions[1]);
        this.firstPoint.type = "firstPoint";
        this.floatPoint = this.creatPoint(this.positions[2]);
        this.floatPoint.type = "floatPoint";
        this.arrowEntity = this.showArrowOnMap(this.positions);
        this.firstPoint.show = false;
        this.floatPoint.show = false;
        this.arrowEntity.objId = this.objId;
    }
    clear () { //清除绘制箭头
        // this.state = 0;
        if (this.firstPoint) this.viewer.entities.remove(this.firstPoint);
        if (this.floatPoint) this.viewer.entities.remove(this.floatPoint);
        if (this.arrowEntity) this.viewer.entities.remove(this.arrowEntity);
        // this.state = -1;
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
    getPositions () { //获取直角箭头中的关键点
        return this.positions;
    }
    creatPoint (cartesian) {
        var point = this.viewer.entities.add({
            position: cartesian,
            billboard: {
                image: this.pointImageUrl,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                //heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                disableDepthTestDistance: Number.POSITIVE_INFINITY
            }
        });
        point.attr = "editPoint";
        return point;
    }
    showArrowOnMap (positions) {
        var $this = this;
        var update = function () {
            if (positions.length < 2) {
                return null;
            }
            var p1 = positions[1];
            var p2 = positions[2];
            var firstPoint = $this.cartesianToLatlng(p1);
            var endPoints = $this.cartesianToLatlng(p2);
            var arrow = [];
            var res = mapUtils.fineArrow([firstPoint[0], firstPoint[1]], [endPoints[0], endPoints[1]]);
            var index = JSON.stringify(res).indexOf("null");
            if (index != -1) return [];
            for(var i=0;i<res.length;i++){
                var c3 = new Cesium.Cartesian3(res[i].x,res[i].y,res[i].z);
                arrow.push(c3);
            }
            return new Cesium.PolygonHierarchy(arrow);
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
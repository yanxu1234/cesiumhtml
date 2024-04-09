import * as Cesium from 'cesium';

export const sleep = (time) => {
    return new Promise(resolve => {
        setTimeout(resolve, time)
    })
}


/**
 * 根据高度动态计算字体大小
 * @param {Cesium.Viewer} viewer 地图对象
 * @return {number} 字体大小
 */
const getTextFontSize = (viewer) => {
    const zoomLevel = viewer.camera.positionCartographic.height;
    const fontSize = 600000 / zoomLevel;

    return fontSize;
};

/**
 * 增加地图文字图层
 * @param {Cesium.Viewer} viewer 地图对象
 * @param {string} text 显示的文字
 * @param {array}  arr  经纬度
 * @return {dd} 文字实体
 */
const addFireDateText = (viewer, text, [lon, lat,]) => {
    if (!text || !viewer) {
        return;
    }

    const textEntity = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(lon, lat),
        label: {
            text,
            font: `${getTextFontSize(viewer)}px sans-serif`,
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 1,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: Cesium.VerticalOrigin.TOP,
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        },
    });

    // 监听地图的缩放事件
    viewer.scene.camera.changed.addEventListener(() => {
        textEntity.label.font = `${getTextFontSize(viewer)}px sans-serif`;
    });

    return textEntity;
};

// 下面是标绘用到的函数
const doubleArrowDefualParam = {
    type: "doublearrow",
    headHeightFactor: .25,
    headWidthFactor: .3,
    neckHeightFactor: .85,
    fixPointCount: 4,
    neckWidthFactor: .15
}
const distance = (t, o) => {
    return Math.sqrt(Math.pow(t[0] - o[0], 2) + Math.pow(t[1] - o[1], 2))
};

const wholeDistance = (t) => {
    for (var o = 0, e = 0; e < t.length - 1; e++) o += distance(t[e], t[e + 1]);
    return o
};

const getBaseLength = (t) => {
    return Math.pow(wholeDistance(t), .99)
};

/**
 * @param {string} geoserverUrl geoserver全路径
 * @returns {object} 域名以及相关参数
 */
const parseGeoserverUrl = (geoserverUrl) => {
    if (!geoserverUrl) {
        return {
            url: '',
            layerName: '',
            bbox: [],
        };
    }
    const params = new URLSearchParams(geoserverUrl);
    const url = geoserverUrl.split('?')[0];
    const layerName = params.get('layers') || '';
    const bboxStr = params.get('bbox') || '';
    let bbox = [];

    if (bboxStr) {
        bbox = bboxStr.split(',').map((item) => (Number.isNaN(Number(item)) ? 0 : Number(item)));
        bbox = bbox.filter(Boolean);
    }

    return {
        url,
        layerName,
        bbox,
    };
};

const Constants = {
    TWO_PI: 2 * Math.PI,
    HALF_PI: Math.PI / 2,
    FITTING_COUNT: 100,
    ZERO_TOLERANCE: 1e-4
}
const getAzimuth = (t, o) => {
    var e, r = Math.asin(Math.abs(o[1] - t[1]) / distance(t, o));
    return o[1] >= t[1] && o[0] >= t[0] ? e = r + Math.PI : o[1] >= t[1] && o[0] < t[0] ? e = Constants.TWO_PI - r : o[1] < t[1] && o[0] < t[0] ? e = r : o[1] < t[1] && o[0] >= t[0] && (e = Math.PI - r), e
};
const getThirdPoint = (t, o, e, r, n) => {
    var g = getAzimuth(t, o),
        i = n ? g + e : g - e,
        s = r * Math.cos(i),
        a = r * Math.sin(i);
    return [o[0] + s, o[1] + a]
};
const getArrowHeadPoints = (t, o, e) => {
    // this.type = doubleArrowDefualParam.type,
    const headHeightFactor = doubleArrowDefualParam.headHeightFactor
    const headWidthFactor = doubleArrowDefualParam.headWidthFactor
    const neckHeightFactor = doubleArrowDefualParam.neckHeightFactor
    const neckWidthFactor = doubleArrowDefualParam.neckWidthFactor
    var r = getBaseLength(t),
        n = r * headHeightFactor,
        g = t[t.length - 1],
        i = (distance(o, e), n * headWidthFactor),
        s = n * neckWidthFactor,
        a = n * neckHeightFactor,
        l = getThirdPoint(t[t.length - 2], g, 0, n, !0),
        u = getThirdPoint(t[t.length - 2], g, 0, a, !0),
        c = getThirdPoint(g, l, Constants.HALF_PI, i, !1),
        p = getThirdPoint(g, l, Constants.HALF_PI, i, !0),
        h = getThirdPoint(g, u, Constants.HALF_PI, s, !1),
        d = getThirdPoint(g, u, Constants.HALF_PI, s, !0);
    return [h, c, g, p, d];
}

const getAngleOfThreePoints = (t, o, e) => {
    var r = getAzimuth(o, t) - getAzimuth(o, e);
    return 0 > r ? r + Constants.TWO_PI : r
};

const getArrowBodyPoints = (t, o, e, r) => {
    for (var n = wholeDistance(t), g = getBaseLength(t), i = g * r, s = distance(o, e), a = (i - s) / 2, l = 0, u = [], c = [], p = 1; p < t.length - 1; p++) {
        var h = getAngleOfThreePoints(t[p - 1], t[p], t[p + 1]) / 2;
        l += distance(t[p - 1], t[p]);
        var d = (i / 2 - l / n * a) / Math.sin(h),
            f = getThirdPoint(t[p - 1], t[p], Math.PI - h, d, !0),
            E = getThirdPoint(t[p - 1], t[p], h, d, !1);
        u.push(f),
            c.push(E)
    }
    return u.concat(c)
};

const mid = (t, o) => {
    return [(t[0] + o[0]) / 2, (t[1] + o[1]) / 2]
};

const getArrowPoints = (t, o, e, r) => {
    // this.type = doubleArrowDefualParam.type,
    const headHeightFactor = doubleArrowDefualParam.headHeightFactor
    const headWidthFactor = doubleArrowDefualParam.headWidthFactor
    const neckHeightFactor = doubleArrowDefualParam.neckHeightFactor
    const neckWidthFactor = doubleArrowDefualParam.neckWidthFactor
    var n = mid(t, o),
        g = distance(n, e),
        i = getThirdPoint(e, n, 0, .3 * g, !0),
        s = getThirdPoint(e, n, 0, .5 * g, !0);
    i = getThirdPoint(n, i, Constants.HALF_PI, g / 5, r),
        s = getThirdPoint(n, s, Constants.HALF_PI, g / 4, r);
    var a = [n, i, s, e],
        l = getArrowHeadPoints(a, headHeightFactor, headWidthFactor, neckHeightFactor, neckWidthFactor),
        u = l[0],
        c = l[4],
        p = distance(t, o) / getBaseLength(a) / 2,
        h = getArrowBodyPoints(a, u, c, p),
        d = h.length,
        f = h.slice(0, d / 2),
        E = h.slice(d / 2, d);
    return f.push(u),
        E.push(c),
        f = f.reverse(),
        f.push(o),
        E = E.reverse(),
        E.push(t),
        f.reverse().concat(l, E)
}

const isClockWise = (t, o, e) => {
    return (e[1] - t[1]) * (o[0] - t[0]) > (o[1] - t[1]) * (e[0] - t[0])
};

const getFactorial = (t) => {
    if (1 >= t) return 1;
    if (2 == t) return 2;
    if (3 == t) return 6;
    if (4 == t) return 24;
    if (5 == t) return 120;
    for (var o = 1, e = 1; t >= e; e++) o *= e;
    return o
};

const getBinomialFactor = (t, o) => {
    return getFactorial(t) / (getFactorial(o) * getFactorial(t - o))
};

const getBezierPoints = (t) => {
    if (t.length <= 2) return t;
    for (var o = [], e = t.length - 1, r = 0; 1 >= r; r += .01) {
        let y;
        for (var n = y = 0, g = 0; e >= g; g++) {
            var i = getBinomialFactor(e, g),
                s = Math.pow(r, g),
                a = Math.pow(1 - r, e - g);
            n += i * s * a * t[g][0], y += i * s * a * t[g][1]
        }
        o.push([n, y])
    }
    return o.push(t[e]), o
};

const array2Dto1D = (array) => {
    var newArray = [];
    array.forEach(function (elt) {
        newArray.push(elt[0]);
        newArray.push(elt[1]);
    });
    return newArray;
}
const getTempPoint4 = (t, o, e) => {
    var r, n, g, i, s = mid(t, o),
        a = distance(s, e),
        l = getAngleOfThreePoints(t, s, e);
    return l < Constants.HALF_PI ? (n = a * Math.sin(l), g = a * Math.cos(l), i = getThirdPoint(t, s, Constants.HALF_PI, n, !1), r = getThirdPoint(s, i, Constants.HALF_PI, g, !0)) : l >= Constants.HALF_PI && l < Math.PI ? (n = a * Math.sin(Math.PI - l), g = a * Math.cos(Math.PI - l), i = getThirdPoint(t, s, Constants.HALF_PI, n, !1), r = getThirdPoint(s, i, Constants.HALF_PI, g, !1)) : l >= Math.PI && l < 1.5 * Math.PI ? (n = a * Math.sin(l - Math.PI), g = a * Math.cos(l - Math.PI), i = getThirdPoint(t, s, Constants.HALF_PI, n, !0), r = getThirdPoint(s, i, Constants.HALF_PI, g, !0)) : (n = a * Math.sin(2 * Math.PI - l), g = a * Math.cos(2 * Math.PI - l), i = getThirdPoint(t, s, Constants.HALF_PI, n, !0), r = getThirdPoint(s, i, Constants.HALF_PI, g, !1)),
        r
};
const doubleArrow = (inputPoint) => {
    let connPoint = null;
    let tempPoint4 = null;
    const points = inputPoint;
    var result = {
        controlPoint: null,
        polygonalPoint: null
    };
    //获取已经点击的坐标数
    var t = inputPoint.length;
    if (!(2 > t)) {
        if (2 == t) return inputPoint;
        var o = points[0],    //第一个点
            e = points[1],        //第二个点
            r = points[2],        //第三个点
            t = inputPoint.length; //获取已经点击的坐标数
        //下面的是移动点位后的坐标
        3 == t ? tempPoint4 = getTempPoint4(o, e, r) : tempPoint4 = points[3],
            3 == t || 4 == t ? connPoint = mid(o, e) : connPoint = points[4];
        var n, g;
        isClockWise(o, e, r) ? (n = getArrowPoints(o, connPoint, tempPoint4, !1), g = getArrowPoints(connPoint, e, r, !0)) : (n = getArrowPoints(e, connPoint, r, !1), g = getArrowPoints(connPoint, o, tempPoint4, !0));
        var i = n.length,
            s = (i - 5) / 2,
            a = n.slice(0, s),
            l = n.slice(s, s + 5),
            u = n.slice(s + 5, i),
            c = g.slice(0, s),
            p = g.slice(s, s + 5),
            h = g.slice(s + 5, i);
        c = getBezierPoints(c);
        var d = getBezierPoints(h.concat(a.slice(1)));
        u = getBezierPoints(u);
        var f = c.concat(p, d, l, u);
        var newArray = array2Dto1D(f);
        result.controlPoint = [o, e, r, tempPoint4, connPoint];
        result.polygonalPoint = Cesium.Cartesian3.fromDegreesArray(newArray);
    }
    return result;
};
var fineArrowDefualParam = {
    tailWidthFactor: 0.15,
    neckWidthFactor: 0.20,
    headWidthFactor: 0.25,
    headAngle: Math.PI / 8.5,
    neckAngle: Math.PI / 13
};

const fineArrow = (tailPoint, headerPoint) => {
    if ((tailPoint.length < 2) || (headerPoint.length < 2)) return;
    //画箭头的函数
    let tailWidthFactor = fineArrowDefualParam.tailWidthFactor;
    let neckWidthFactor = fineArrowDefualParam.neckWidthFactor;
    let headWidthFactor = fineArrowDefualParam.headWidthFactor;
    let headAngle = fineArrowDefualParam.headAngle;
    let neckAngle = fineArrowDefualParam.neckAngle;
    var o = [];
    o[0] = tailPoint;
    o[1] = headerPoint;
    var e = o[0],
        r = o[1],
        n = getBaseLength(o),
        g = n * tailWidthFactor,
        //尾部宽度因子
        i = n * neckWidthFactor,
        //脖子宽度银子
        s = n * headWidthFactor,
        //头部宽度因子
        a = getThirdPoint(r, e, Constants.HALF_PI, g, !0),
        l = getThirdPoint(r, e, Constants.HALF_PI, g, !1),
        u = getThirdPoint(e, r, headAngle, s, !1),
        c = getThirdPoint(e, r, headAngle, s, !0),
        p = getThirdPoint(e, r, neckAngle, i, !1),
        h = getThirdPoint(e, r, neckAngle, i, !0),
        d = [];
    d.push(a[0], a[1], p[0], p[1], u[0], u[1], r[0], r[1], c[0], c[1], h[0], h[1], l[0], l[1], e[0], e[1]);
    return Cesium.Cartesian3.fromDegreesArray(d);
};

const dereplication = (array) => {
    var last = array[array.length - 1];
    var change = false;
    var newArray = [];
    newArray = array.filter((i) => {
        if (i[0] != last[0] && i[1] != last[1]) {
            return i;
        }
        change = true;
    });
    if (change) newArray.push(last);
    return newArray;
};

var tailedAttackArrowDefualParam = {
    headHeightFactor: .18,
    headWidthFactor: .3,
    neckHeightFactor: .85,
    neckWidthFactor: .15,
    tailWidthFactor: .1,
    headTailFactor: .8,
    swallowTailFactor: 1
};

const getAttackArrowHeadPoints = (t, o, e, defaultParam) => {
    const headHeightFactor = defaultParam.headHeightFactor;
    const headTailFactor = defaultParam.headTailFactor;
    const headWidthFactor = defaultParam.headWidthFactor;
    const neckWidthFactor = defaultParam.neckWidthFactor;
    const neckHeightFactor = defaultParam.neckHeightFactor;
    var r = getBaseLength(t),
        n = r * headHeightFactor,
        g = t[t.length - 1];
    r = distance(g, t[t.length - 2]);
    var i = distance(o, e);
    n > i * headTailFactor && (n = i * headTailFactor);
    var s = n * headWidthFactor,
        a = n * neckWidthFactor;
    n = n > r ? r : n;
    var l = n * neckHeightFactor,
        u = getThirdPoint(t[t.length - 2], g, 0, n, !0),
        c = getThirdPoint(t[t.length - 2], g, 0, l, !0),
        p = getThirdPoint(g, u, Constants.HALF_PI, s, !1),
        h = getThirdPoint(g, u, Constants.HALF_PI, s, !0),
        d = getThirdPoint(g, c, Constants.HALF_PI, a, !1),
        f = getThirdPoint(g, c, Constants.HALF_PI, a, !0);
    return [d, p, g, h, f]
};

const getQuadricBSplineFactor = (t, o) => {
    return 0 == t ? Math.pow(o - 1, 2) / 2 : 1 == t ? (-2 * Math.pow(o, 2) + 2 * o + 1) / 2 : 2 == t ? Math.pow(o, 2) / 2 : 0
};

const getQBSplinePoints = (t) => {
    if (t.length <= 2) return t;
    var o = 2,
        e = [],
        r = t.length - o - 1;
    e.push(t[0]);
    for (var n = 0; r >= n; n++) for (var g = 0; 1 >= g; g += .05) {
        let y;
        for (var i = y = 0, s = 0; o >= s; s++) {
            var a = getQuadricBSplineFactor(s, g);
            i += a * t[n + s][0], y += a * t[n + s][1]
        }
        e.push([i, y])
    }
    return e.push(t[t.length - 1]), e
}

const getAttackArrowBodyPoints = (t, o, e, r) => {
    for (var n = wholeDistance(t), g = getBaseLength(t), i = g * r, s = distance(o, e), a = (i - s) / 2, l = 0, u = [], c = [], p = 1; p < t.length - 1; p++) {
        var h = getAngleOfThreePoints(t[p - 1], t[p], t[p + 1]) / 2;
        l += distance(t[p - 1], t[p]);
        var d = (i / 2 - l / n * a) / Math.sin(h),
            f = getThirdPoint(t[p - 1], t[p], Math.PI - h, d, !0),
            E = getThirdPoint(t[p - 1], t[p], h, d, !1);
        u.push(f),
            c.push(E)
    }
    return u.concat(c)
};

const tailedAttackArrow = (inputPoint) => {
    inputPoint = dereplication(inputPoint);
    const tailWidthFactor = tailedAttackArrowDefualParam.tailWidthFactor;
    const swallowTailFactor = tailedAttackArrowDefualParam.swallowTailFactor;
    let swallowTailPnt = tailedAttackArrowDefualParam.swallowTailPnt;
    //控制点
    var result = {
        controlPoint: null,
        polygonalPoint: null
    };
    result.controlPoint = inputPoint;
    var t = inputPoint.length;
    if (!(2 > t)) {
        if (2 == inputPoint.length) {
            result.polygonalPoint = inputPoint;
            return result;
        }
        var o = inputPoint,
            e = o[0],
            r = o[1];
        isClockWise(o[0], o[1], o[2]) && (e = o[1], r = o[0]);
        var n = mid(e, r),
            g = [n].concat(o.slice(2)),
            i = getAttackArrowHeadPoints(g, e, r, tailedAttackArrowDefualParam),
            s = i[0],
            a = i[4],
            l = distance(e, r),
            u = getBaseLength(g),
            c = u * tailWidthFactor * swallowTailFactor;
        swallowTailPnt = getThirdPoint(g[1], g[0], 0, c, !0);
        var p = l / u,
            h = getAttackArrowBodyPoints(g, s, a, p),
            t = h.length,
            d = [e].concat(h.slice(0, t / 2));
        d.push(s);
        var f = [r].concat(h.slice(t / 2, t));
        var newArray = [];
        f.push(a),
            d = getQBSplinePoints(d),
            f = getQBSplinePoints(f),
            newArray = array2Dto1D(d.concat(i, f.reverse(), [swallowTailPnt, d[0]]));
        result.polygonalPoint = Cesium.Cartesian3.fromDegreesArray(newArray);
    }
    return result;
};

export default {
    addFireDateText,
    parseGeoserverUrl,
    fineArrow,
    tailedAttackArrow,
    doubleArrow,
    sleep,
};

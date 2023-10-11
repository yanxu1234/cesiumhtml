    //绘制弧线，twoPoints：两点坐标
    function drawArcLine() {
    //a,c分别为画点时，设置的点的id，可以找到这个点并获取这两个点的经纬度。
    //封装的方法在上面直线那有
      let position = this.getPositionById("a", "c")
      const startPoint = [position[0], position[1], 0]; // 起点的经度、纬度
      const step = 40;  // 线的数量，越多则越平滑(但过多浏览器缓存也会占用越多)
      const heightProportion = 0.125; // 最高点和总距离的比值
      const dLon = (position[2] - startPoint[0]) / step;  // 经度差值
      const dLat = (position[3] - startPoint[1]) / step;  // 纬度差值
      const deltaLon = dLon * Math.abs(111000 * Math.cos(position[1]));  // 经度差(米级)
      const deltaLat = dLat * 111000;  // 纬度差(米),1纬度相差约111000米
      const endPoint = [0, 0, 0];  // 定义一个端点（后面将进行startPoint和endPoint两点画线）
      const heigh = Math.floor(step * Math.sqrt(deltaLon * deltaLon + deltaLat * deltaLat) * heightProportion);
      const x2 = (10000 * Math.sqrt(dLon * dLon + dLat * dLat)); // 小数点扩大10000倍，提高精确度
      const a = (heigh / (x2 * x2));
      function y(x, height) { return Math.floor(height - a * x * x); }
      for (let i = 1; i <= step; i++) {  // 逐“帧”画线
        endPoint[0] = startPoint[0] + dLon; // 更新end点经度
        endPoint[1] = startPoint[1] + dLat; // 更新end点纬度
        const x = x2 * (2 * i / step - 1);  // 求抛物线函数x
        endPoint[2] = y(x, heigh);  // 求end点高度
        viewer.entities.add({  // 添加静态线
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights(startPoint.concat(endPoint)),
            width: 4,
            material: new Cesium.PolylineGlowMaterialProperty({
              color: Cesium.Color.AQUA.withAlpha(0.9),
              outlineWidth: 0.3,
              glowPower: 0.3,
            })
          },
        });
        // end点变为start点
        startPoint[0] = endPoint[0];
        startPoint[1] = endPoint[1];
        startPoint[2] = endPoint[2];
      }
    }

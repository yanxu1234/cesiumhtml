import * as Cesium from 'cesium';

export default class Entitys{
    constructor(core){
        /**
         * 初始化
         */
        this.entitysAction = core.entities;
        
    }
    add(entity){
        return this.entitysAction.add(entity);
    }
    remove(entity){
        this.entitysAction.remove(entity);
    }
    /**
     * 提示信息实体
     * createMsgTip
     * showTip 控制器
     */
    createMsgTip(){
        this._resultTip = this.entitysAction.add({
			id: Cesium.createGuid(),
			label : {
				fillColor:Cesium.Color.YELLOW,
				showBackground : true,
				font : '14px monospace',
				horizontalOrigin : Cesium.HorizontalOrigin.LEFT,
				verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
				pixelOffset : new Cesium.Cartesian2(0, -10)
			}
        });
        return this._resultTip;
    }
     /**
     * 提示框
     * @param {*} bShow 
     * @param {*} position 
     * @param {*} message 
     */
    showTip(label,bShow,position,message,effectOptions){
        label.show = bShow;
        if(bShow){
            if(position)
                label.position = position;
            if(message)
                label.label.text =message;
            if(effectOptions){
                for(let key  in effectOptions){
                    if(label.key){
                        label.key=effectOptions[key];
                    }
                }
            }
        }    
    }
}
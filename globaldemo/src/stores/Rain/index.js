import * as Cesium from 'cesium'

/**
 * 
 * 封装天气场景
 * 雨天
 */
export default class Rain {
  constructor(v) {
    this.collection = v.scene.postProcessStages;
    this._rain = new Cesium.PostProcessStage({
      name: "czm_rain",
      fragmentShader: this.getFs(),
    });
    this.collection.add(this._rain);
    v.scene.skyAtmosphere.hueShift = -0.8;
    v.scene.skyAtmosphere.saturationShift = -0.7;
    v.scene.skyAtmosphere.brightnessShift = -0.33;
    v.scene.fog.density = 0.001;
    v.scene.fog.minimumBrightness = 0.8;
  }

  getFs() {
    return "uniform sampler2D colorTexture;\n\
            in vec2 v_textureCoordinates;\n\
            out vec4 FragColor;\n\
            \n\
            float hash(float x) {\n\
                return fract(sin(x * 133.3) * 13.13);\n\
            }\n\
            \n\
            void main(void) {\n\
                float time = czm_frameNumber / 60.0;\n\
                vec2 resolution = czm_viewport.zw;\n\
                \n\
                vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);\n\
                vec3 c = vec3(0.6, 0.7, 0.8);\n\
                \n\
                float a = -0.4;\n\
                float si = sin(a), co = cos(a);\n\
                uv *= mat2(co, -si, si, co);\n\
                uv *= length(uv + vec2(0, 4.9)) * 0.3 + 1.0;\n\
                \n\
                float v = 1.0 - sin(hash(floor(uv.x * 100.0)) * 2.0);\n\
                float b = clamp(abs(sin(20.0 * time * v + uv.y * (5.0 / (2.0 + v)))) - 0.95, 0.0, 1.0) * 20.0;\n\
                c *= v * b;\n\
                \n\
                FragColor = mix(texture(colorTexture, v_textureCoordinates), vec4(c, 1.0), 0.5);\n\
            }\n";
  }

  remove() {
    if (this._rain) {
      this.collection.remove(this._rain);
      if (!this._rain.isDestroyed()) {
        this._rain.destroy();
      }
    }
  }
}
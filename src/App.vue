<template>
  <div class="index_home">
    <!-- 顶部 -->
    <div class="navigation" v-if="showCharts">
      <div class="navigation_ul">
        <div class="navigation_ul_menu navigation_ul_menu_left">
          <div
            class="navigation_li"
            v-for="item in displayData.menuData1"
            @click="handleClick(item)"
            :class="item.active ? 'navigation_li_te' : ''"
            :key="item.id"
          >
            <span
              style="
                color: #fff;
                height: 100%;
                width: 100%;
                display: block;
                text-decoration: none;
              "
            >
              {{ item.name }}</span
            >
          </div>
        </div>

        <div class="navigation_main">
          <div class="navigation_name">集中运营平台</div>
        </div>

        <div class="navigation_ul_menu navigation_ul_menu_right">
          <div
            class="navigation_li navigation_li_Right"
            v-for="item in displayData.menuData2"
            @click="handleClick(item)"
            :class="item.active ? 'navigation_li_Right_te' : ''"
            :key="item.id"
          >
            <span
              style="
                color: #fff;
                height: 100%;
                width: 100%;
                display: block;
                text-decoration: none;
              "
            >
              {{ item.name }}</span
            >
          </div>
        </div>
        <div class="imgs_setting"></div>
      </div>
      <div class="navigation_left"></div>
      <div class="navigation_right">
        <div class="navigation_tips_name" ref="userName">
          <!-- 铃声 -->
          <div class="navigation_tips">
            <!-- <span>1</span> -->
          </div>
          <div class="navigation_name">root</div>
        </div>
        <div class="date" ref="timeDate">
          <div class="date_text">
            {{ displayData.nowDate }}
          </div>
          <!-- <div class="date_text">
						10:00
					</div> -->
          <!-- <div class="date_text">
						农历九月初六
					</div> -->
        </div>
      </div>
    </div>
    <!-- 左侧图表 -->
    <div class="index_left" v-if="showCharts">
      <!-- 左边 统计图 -->
      <leftBuiding></leftBuiding>
    </div>
    <!-- 右侧图表 -->
    <div class="index_right" v-if="showCharts">
      <rightBuiding></rightBuiding>
    </div>
    <!-- 地图 -->
    <div class="contengt-wrap">
      <div id="app-32-map" class="is-full"></div>
    </div>
  </div>
</template>

<script>
import Map3d from "@/utils/Map3d.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import TWEEN from "@tweenjs/tween.js";
import gsap from "gsap";
import * as THREE from "three";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { random } from "@/utils";
import useFileLoader from "@/hooks/useFileLoader.js";
import useCountry from "@/hooks/useCountry.js";
import useCoord from "@/hooks/useCoord.js";
import useConversionStandardData from "@/hooks/useConversionStandardData.js";
import useMapMarkedLightPillar from "@/hooks/map/useMapMarkedLightPillar";
import useSequenceFrameAnimate from "@/hooks/useSequenceFrameAnimate";
import useCSS2DRender from "@/hooks/useCSS2DRender";

import leftBuiding from "./components/left/leftBuiding.vue";
import rightBuiding from "./components/right/rightBuiding.vue";

let centerXY = [14.114129, 7.550339]; // 地图的中心点，这个值会变更(取渲染出的3D地图的中心坐标)
const ADCODE = [
  {
    adcode: 500101,
    name: "万州区",
    centroid: [108.380246, 30.807807],
    markSite: [108.406819, 30.704054], //标记点位置
    labelSite: [108.406819, 30.704054], //文本标签位置
    status: 0, // 预留
    topColor: "#0f1214", // 顶部颜色
    sideColor: "#4e8da2", // 侧边颜色
    markSize: 80,
  },
  {
    adcode: 500102,
    name: "涪陵区",
    center: [107.394905, 29.703652],
    centroid: [107.334026, 29.658582],
    markSite: [107.334026, 29.658582],
    labelSite: [107.334026, 29.658582],
    status: 0,
    topColor: "#0f1214",
    sideColor: "#4e8da2",
    markSize: 80,
  },
  {
    adcode: 500103,
    name: "渝中区",
    center: [106.56288, 29.556742],
    centroid: [106.540387, 29.549305],
    markSite: [106.540387, 29.549305],
    labelSite: [106.540387, 29.549305],
    status: 0,
    topColor: "#0f1214",
    sideColor: "#4e8da2",
    markSize: 80,
  },
  {
    adcode: 500104,
    name: "大渡口区",
    center: [106.48613, 29.481002],
    centroid: [106.458637, 29.417574],
    markSite: [106.458637, 29.417574],
    labelSite: [106.458637, 29.417574],
    status: 0,
    topColor: "#0f1214",
    sideColor: "#4e8da2",
    markSize: 80,
  },
  {
    adcode: 500105,
    name: "江北区",
    center: [106.532844, 29.575352],
    centroid: [106.707043, 29.613282],
    markSite: [106.707043, 29.613282],
    labelSite: [106.707043, 29.613282],
    status: 0,
    topColor: "#0f1214",
    sideColor: "#4e8da2",
    markSize: 80,
  },
  {
    adcode: 500106,
    name: "沙坪坝区",
    center: [106.4542, 29.541224],
    centroid: [106.368248, 29.624462],
    markSite: [106.368248, 29.624462],
    labelSite: [106.368248, 29.624462],
    status: 0,
    topColor: "#0f1214",
    sideColor: "#4e8da2",
    markSize: 80,
  },
  {
    adcode: 500107,
    name: "九龙坡区",
    center: [106.480989, 29.523492],
    centroid: [106.364401, 29.428501],
    markSite: [106.364401, 29.428501],
    labelSite: [106.364401, 29.428501],
    status: 0,
    topColor: "#0f1214",
    sideColor: "#4e8da2",
    markSize: 80,
  },
  {
    adcode: 500108,
    name: "南岸区",
    center: [106.560813, 29.523992],
    centroid: [106.660614, 29.535521],
    markSite: [106.660614, 29.535521],
    labelSite: [106.660614, 29.535521],
    status: 0,
    topColor: "#0f1214",
    sideColor: "#4e8da2",
    markSize: 80,
  },
  {
    adcode: 500109,
    name: "北碚区",
    center: [106.437868, 29.82543],
    centroid: [106.513996, 29.861006],
    markSite: [106.513996, 29.861006],
    labelSite: [106.513996, 29.861006],
    status: 0,
    topColor: "#0f1214",
    sideColor: "#4e8da2",
    markSize: 80,
  },
  {
    adcode: 500110,
    name: "綦江区",
    center: [106.651417, 29.028091],
    centroid: [106.722706, 28.87864],
    markSite: [106.722706, 28.87864],
    labelSite: [106.722706, 28.87864],
    status: 0,
    topColor: "#0f1214",
    sideColor: "#4e8da2",
    markSize: 80,
  },
  {
    adcode: 500111,
    name: "大足区",
    center: [105.715319, 29.700498],
    centroid: [105.742721, 29.65],
    markSite: [105.742721, 29.65],
    labelSite: [105.742721, 29.65],
    status: 0,
    topColor: "#0f1214",
    sideColor: "#4e8da2",
    markSize: 80,
  },
  {
    adcode: 500112,
    name: "渝北区",
    center: [106.512851, 29.601451],
    centroid: [106.746928, 29.810209],
    markSite: [106.746928, 29.810209],
    labelSite: [106.746928, 29.810209],
    status: 0,
    topColor: "#0f1214",
    sideColor: "#4e8da2",
    markSize: 80,
  },
  {
    adcode: 500113,
    name: "巴南区",
    center: [106.519423, 29.381919],
    centroid: [106.751731, 29.371851],
    markSite: [106.751731, 29.371851],
    labelSite: [106.751731, 29.371851],
    status: 0,
    topColor: "#0f1214",
    sideColor: "#4e8da2",
    markSize: 80,
  },
  {
    adcode: 500114,
    name: "黔江区",
    center: [108.782577, 29.527548],
    centroid: [108.708597, 29.435532],
    markSite: [108.708597, 29.435532],
    labelSite: [108.708597, 29.435532],
    status: 0,
    topColor: "#0f1214",
    sideColor: "#4e8da2",
    markSize: 80,
  },
  {
    adcode: 500115,
    name: "长寿区",
    center: [107.074854, 29.833671],
    centroid: [107.140018, 29.954649],
    markSite: [107.140018, 29.954649],
    labelSite: [107.140018, 29.954649],
    status: 0,
    topColor: "#0f1214",
    sideColor: "#4e8da2",
    markSize: 80,
  },
  {
    adcode: 500116,
    name: "江津区",
    center: [106.253156, 29.283387],
    centroid: [106.263211, 29.029608],
    markSite: [106.263211, 29.029608],
    labelSite: [106.263211, 29.029608],
    status: 0,
    topColor: "#0f1214",
    sideColor: "#4e8da2",
    markSize: 80,
  },
  {
    adcode: 500117,
    name: "合川区",
    center: [106.265554, 29.990993],
    centroid: [106.311538, 30.112474],
    markSite: [106.311538, 30.112474],
    labelSite: [106.311538, 30.112474],
    status: 0,
    topColor: "#0f1214",
    sideColor: "#4e8da2",
    markSize: 80,
  },
  {
    adcode: 500118,
    name: "永川区",
    center: [105.894714, 29.348748],
    centroid: [105.872859, 29.290183],
    markSite: [105.872859, 29.290183],
    labelSite: [105.872859, 29.290183],
    status: 0,
    topColor: "#0f1214",
    sideColor: "#4e8da2",
    markSize: 80,
  },
  {
    adcode: 500119,
    name: "南川区",
    center: [107.098153, 29.156646],
    centroid: [107.171436, 29.13547],
    markSite: [107.171436, 29.13547],
    labelSite: [107.171436, 29.13547],
    status: 0,
    topColor: "#0f1214",
    sideColor: "#4e8da2",
    markSize: 80,
  },
  {
    adcode: 500120,
    name: "璧山区",
    center: [106.231126, 29.593581],
    centroid: [106.191948, 29.561371],
    markSite: [106.191948, 29.561371],
    labelSite: [106.191948, 29.561371],
    status: 0,
    topColor: "#0f1214",
    sideColor: "#4e8da2",
    markSize: 80,
  },
  {
    adcode: 500151,
    name: "铜梁区",
    center: [106.054948, 29.839944],
    centroid: [106.0332, 29.81109],
    markSite: [106.0332, 29.81109],
    labelSite: [106.0332, 29.81109],
    status: 0,
    topColor: "#0f1214",
    sideColor: "#4e8da2",
    markSize: 80,
  },
  {
    adcode: 500152,
    name: "潼南区",
    center: [105.841818, 30.189554],
    centroid: [105.814632, 30.143351],
    markSite: [105.814632, 30.143351],
    labelSite: [105.814632, 30.143351],
    status: 0,
    topColor: "#0f1214",
    sideColor: "#4e8da2",
    markSize: 80,
  },
  {
    adcode: 500153,
    name: "荣昌区",
    center: [105.594061, 29.403627],
    centroid: [105.506727, 29.464817],
    markSite: [105.506727, 29.464817],
    labelSite: [105.506727, 29.464817],
    status: 0,
    topColor: "#0f1214",
    sideColor: "#4e8da2",
    markSize: 80,
  },
  {
    adcode: 500154,
    name: "开州区",
    center: [108.413317, 31.167735],
    centroid: [108.382659, 31.271013],
    markSite: [108.382659, 31.271013],
    labelSite: [108.382659, 31.271013],
    status: 0,
    topColor: "#0f1214",
    sideColor: "#4e8da2",
    markSize: 80,
  },
  {
    adcode: 500155,
    name: "梁平区",
    center: [107.800034, 30.672168],
    centroid: [107.719234, 30.658344],
    markSite: [107.719234, 30.658344],
    labelSite: [107.719234, 30.658344],
    status: 0,
    topColor: "#0f1214",
    sideColor: "#4e8da2",
    markSize: 80,
  },
  {
    adcode: 500156,
    name: "武隆区",
    center: [107.75655, 29.32376],
    centroid: [107.709628, 29.373158],
    markSite: [107.709628, 29.373158],
    labelSite: [107.709628, 29.373158],
    status: 0,
    topColor: "#0f1214",
    sideColor: "#4e8da2",
    markSize: 80,
  },
  {
    adcode: 500229,
    name: "城口县",
    center: [108.6649, 31.946293],
    centroid: [108.735105, 31.881846],
    markSite: [108.735105, 31.881846],
    labelSite: [108.735105, 31.881846],
    status: 0,
    topColor: "#0f1214",
    sideColor: "#4e8da2",
    markSize: 80,
  },
  {
    adcode: 500230,
    name: "丰都县",
    center: [107.73248, 29.866424],
    centroid: [107.830885, 29.884753],
    markSite: [107.830885, 29.884753],
    labelSite: [107.830885, 29.884753],
    status: 0,
    topColor: "#0f1214",
    sideColor: "#4e8da2",
    markSize: 80,
  },
  {
    adcode: 500231,
    name: "垫江县",
    center: [107.348692, 30.330012],
    centroid: [107.437814, 30.253308],
    markSite: [107.437814, 30.253308],
    labelSite: [107.437814, 30.253308],
    status: 0,
    topColor: "#0f1214",
    sideColor: "#4e8da2",
    markSize: 80,
  },
  {
    adcode: 500233,
    name: "忠县",
    center: [108.037518, 30.291537],
    centroid: [107.914786, 30.335722],
    markSite: [107.914786, 30.335722],
    labelSite: [107.914786, 30.335722],
    status: 0,
    topColor: "#0f1214",
    sideColor: "#4e8da2",
    markSize: 80,
  },
  {
    adcode: 500235,
    name: "云阳县",
    center: [108.697698, 30.930529],
    centroid: [108.856912, 31.036349],
    markSite: [108.856912, 31.036349],
    labelSite: [108.856912, 31.036349],
    status: 0,
    topColor: "#0f1214",
    sideColor: "#4e8da2",
    markSize: 80,
  },
  {
    adcode: 500236,
    name: "奉节县",
    center: [109.465774, 31.019967],
    centroid: [109.349632, 30.952293],
    markSite: [109.349632, 30.952293],
    labelSite: [109.349632, 30.952293],
    status: 0,
    topColor: "#0f1214",
    sideColor: "#4e8da2",
    markSize: 80,
  },
  {
    adcode: 500237,
    name: "巫山县",
    center: [109.878928, 31.074843],
    centroid: [109.901246, 31.115189],
    markSite: [109.901246, 31.115189],
    labelSite: [109.901246, 31.115189],
    status: 0,
    topColor: "#0f1214",
    sideColor: "#4e8da2",
    markSize: 80,
  },
  {
    adcode: 500238,
    name: "巫溪县",
    center: [109.628912, 31.3966],
    centroid: [109.35337, 31.503107],
    markSite: [109.35337, 31.503107],
    labelSite: [109.35337, 31.503107],
    status: 0,
    topColor: "#0f1214",
    sideColor: "#4e8da2",
    markSize: 80,
  },
  {
    adcode: 500240,
    name: "石柱土家族",
    center: [108.112448, 29.99853],
    centroid: [108.298494, 30.093676],
    markSite: [108.298494, 30.093676],
    labelSite: [108.298494, 30.093676],
    status: 0,
    topColor: "#0f1214",
    sideColor: "#4e8da2",
    markSize: 80,
  },
  {
    adcode: 500241,
    name: "秀山土家族",
    center: [108.996043, 28.444772],
    centroid: [109.018121, 28.491722],
    markSite: [109.018121, 28.491722],
    labelSite: [109.018121, 28.491722],
    status: 0,
    topColor: "#0f1214",
    sideColor: "#4e8da2",
    markSize: 80,
  },
  {
    adcode: 500242,
    name: "酉阳土家族",
    center: [108.767201, 28.839828],
    centroid: [108.800321, 28.89987],
    markSite: [108.800321, 28.89987],
    labelSite: [108.800321, 28.89987],
    status: 0,
    topColor: "#0f1214",
    sideColor: "#4e8da2",
    markSize: 80,
  },
  {
    adcode: 500243,
    name: "彭水苗族",
    center: [108.166551, 29.293856],
    centroid: [108.266309, 29.353956],
    markSite: [108.266309, 29.353956],
    labelSite: [108.266309, 29.353956],
    status: 0,
    topColor: "#0f1214",
    sideColor: "#4e8da2",
    markSize: 80,
  },
];
const ADCODE_MAP = new Map();
ADCODE.forEach((item) => {
  ADCODE_MAP.set(item.adcode, item);
});

export default {
  name: "3dMap30",
  components: {
    leftBuiding,
    rightBuiding,
  },
  setup() {
    // 地图相关逻辑
    let baseEarth = null;
    const raycaster = new THREE.Raycaster(); // 光线投射
    const pointer = new THREE.Vector2();
    let animationEnd = false;

    // 重置
    const resize = () => {
      baseEarth.resize();
    };

    const { requestData } = useFileLoader();
    const { transfromGeoJSON } = useConversionStandardData();
    const { getBoundingBox } = useCoord();
    const { createCountryFlatLine, createAreaLine } = useCountry();
    const { initCSS2DRender, create2DTag, create2DMark } = useCSS2DRender();
    const { createLightPillar, setLightPillarColor } = useMapMarkedLightPillar({
      scaleFactor: 3,
    });
    // 序列帧
    const { createSequenceFrame } = useSequenceFrameAnimate();

    const texture = new THREE.TextureLoader();
    const textureMap = texture.load("/data/map/gz-map.jpg");
    const texturefxMap = texture.load("/data/map/gz-map-fx.jpg");
    const rotatingApertureTexture = texture.load(
      "/data/map/rotatingAperture.png"
    );
    const rotatingPointTexture = texture.load("/data/map/rotating-point2.png");
    const circlePoint = texture.load("/data/map/circle-point.png");
    const sceneBg = texture.load("/data/map/scene-bg2.png");
    textureMap.wrapS = texturefxMap.wrapS = THREE.RepeatWrapping;
    textureMap.wrapT = texturefxMap.wrapT = THREE.RepeatWrapping;
    textureMap.flipY = texturefxMap.flipY = false;
    textureMap.rotation = texturefxMap.rotation = THREE.MathUtils.degToRad(45);
    // const scale = 0.5;
    // textureMap.repeat.set(scale, scale);
    // texturefxMap.repeat.set(scale, scale);

    // json数据中的code映射组
    let groupCodeMap = {};
    // 光标也可以针对单个省
    let lightGroup = null;
    const guiParams = {
      topColor: "#29445d",
      topOpacity: 1,
      sideColor: "#4e8da2",
      sideOpacity: 1,
      // scale: 0.0,
      markColor: 0xe10909,
      showBackground: false,
      adcodeMap: 510000,
      showCharts: false,
      showAperture: true,
      rotatingApertureMesh: null,
      rotatingPointMesh: null,
      circlePointMesh: null,
    };
    let backgroundMesh = null;
    // 地图拉伸设置
    const extrudeSettings = {
      depth: 0.4,
      bevelEnabled: true,
      bevelSegments: 1,
      bevelThickness: 0.1,
    };

    const bottomZ = -0.2;
    // 初始化gui
    const initGui = () => {
      const gui = new GUI();
      gui.addColor(guiParams, "topColor").onChange((val) => {
        console.log("topColor", val, topFaceMaterial);
        if (topFaceMaterial) {
          topFaceMaterial.color = new THREE.Color(val);
        }
      });
      gui.add(guiParams, "topOpacity", 0.1, 1, 0.01).onChange((val) => {
        if (topFaceMaterial) {
          topFaceMaterial.opacity = val;
        }
      });
      gui.addColor(guiParams, "sideColor").onChange((val) => {
        if (sideMaterial) {
          sideMaterial.color = new THREE.Color(val);
        }
      });
      gui.add(guiParams, "sideOpacity", 0.1, 0.7, 0.01).onChange((val) => {
        if (topFaceMaterial) {
          sideMaterial.opacity = val;
        }
      });
      gui.add(guiParams, "showBackground").onChange((val) => {
        backgroundMesh.visible = val;
      });
      gui.add(guiParams, "showCharts").onChange((val) => {
        showCharts.value = val;
      });
      gui.add(guiParams, "showAperture").onChange((val) => {
        guiParams.rotatingApertureMesh.visible = val;
        guiParams.rotatingPointMesh.visible = val;
        guiParams.circlePointMesh.visible = val;
      });
    };
    // 初始化旋转光圈
    const initRotatingAperture = (scene, width) => {
      let plane = new THREE.PlaneBufferGeometry(width, width);
      let material = new THREE.MeshBasicMaterial({
        map: rotatingApertureTexture,
        transparent: true,
        opacity: 1,
        depthTest: true,
      });
      let mesh = new THREE.Mesh(plane, material);
      mesh.position.set(...centerXY, 0);
      mesh.scale.set(1.1, 1.1, 1.1);
      scene.add(mesh);
      return mesh;
    };
    // 初始化旋转点
    const initRotatingPoint = (scene, width) => {
      let plane = new THREE.PlaneBufferGeometry(width, width);
      let material = new THREE.MeshBasicMaterial({
        map: rotatingPointTexture,
        transparent: true,
        opacity: 1,
        depthTest: true,
      });
      let mesh = new THREE.Mesh(plane, material);
      mesh.position.set(...centerXY, bottomZ - 0.02);
      mesh.scale.set(1.1, 1.1, 1.1);
      scene.add(mesh);
      return mesh;
    };
    // 初始化背景
    const initSceneBg = (scene, width) => {
      let plane = new THREE.PlaneBufferGeometry(width * 3, width * 3);
      let material = new THREE.MeshBasicMaterial({
        // color: 0x061920,
        // color: 0xffffff,
        map: sceneBg,
        transparent: true,
        opacity: 1,
        depthTest: true,
      });

      backgroundMesh = new THREE.Mesh(plane, material);
      backgroundMesh.position.set(...centerXY, bottomZ - 0.2);
      scene.add(backgroundMesh);
    };

    // 初始化背景
    const initSceneImag = (scene, url, size) => {
      new THREE.TextureLoader().load(url, (texture) => {
        const img = texture.image;
        let height = (img && img.height) || 1080;
        let width = (img && img.width) || 1920;
        console.log("size", height, width); // 1080*1920
        height = size * height;
        width = size * width;
        const mat = new THREE.MeshStandardMaterial({
          map: texture,
          // side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.75,
        });
        const geom = new THREE.PlaneGeometry(width, height);
        backgroundMesh = new THREE.Mesh(geom, mat);
        backgroundMesh.position.set(...centerXY, bottomZ + 0.1);
        backgroundMesh.position.y += 2.5;
        backgroundMesh.position.x += 0.9;
        // mesh.receiveShadow = true; // 设置接受阴影
        scene.add(backgroundMesh);

        // 创建镜面
        const mirrorOptions = {
          clipBias: 0.03,
          textureWidth: window.innerWidth * window.devicePixelRatio,
          textureHeight: window.innerHeight * window.devicePixelRatio,
          transparent: true,
          opacity: 0.5,
        };
        const mirror = new Reflector(geom, mirrorOptions);
        // mirror.receiveShadow = true; // 设置接受阴影
        mirror.position.set(...centerXY, bottomZ - 0.2);
        mirror.position.y += 2.5;
        mirror.position.x += 0.9;
        scene.add(mirror);
      });
    };

    // 初始化中国轮廓地图
    const ChinaOutlineParams = {
      // 描边方案2需要的参数
      Vector3Lines: [],
      lineProgress: 0,
      topGeometry: null,
      // 描边方案1需要的参数
      lines: [],
      positions: null,
      opacitys: null,
      points: null,
      geometry: null,
      // 速度控制
      currentPos: 0,
      pointSpeed: 10,
      // 追光控制
      pointSize: 3,
      pointColor: "#ffffff",
    };
    const initChinaOutline = async (scene) => {
      function lineDraw(polygon) {
        polygon.forEach((row) => {
          const [x, y] = row;
          // 创建三维点
          // ChinaOutlineParams.lines.push([x, -y, 0]);
          ChinaOutlineParams.Vector3Lines.push(new THREE.Vector3(...[x, y, 0]));
        });
      }

      const chinaData = await requestData("./data/map/重庆市轮廓.json");
      console.log("重庆市轮廓", chinaData);

      // 边界
      const feature = chinaData.features[0];
      // 点数据
      const coordinates = feature.geometry.coordinates;
      coordinates[0].forEach((rows) => {
        lineDraw(rows);
      });
      // 取第一个数组里面的数据即可
      // coordinates.forEach((coordinate) => {
      //   // coordinate 多边形数据
      //   coordinate.forEach((rows) => {
      //     lineDraw(rows);
      //   });
      // });

      // 顶部亮线条
      const topLineMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff, // 可以调整为动态变化的颜色
        opacity: 1, // 透明度
        transparent: true, // 使线段半透明
      });
      ChinaOutlineParams.topGeometry = new THREE.BufferGeometry().setFromPoints(
        ChinaOutlineParams.Vector3Lines
      );
      ChinaOutlineParams.topLineMesh = new THREE.Line(
        ChinaOutlineParams.topGeometry,
        topLineMaterial
      );

      // 方案2，线段，依然无法调整线宽，记得记录
      // const topLineMaterial = new THREE.LineBasicMaterial({
      //   color: 0xffffff, // 可以调整为动态变化的颜色
      //   linewidth: 100, // 线宽 无法调整
      //   opacity: 1, // 透明度
      //   transparent: true, // 使线段半透明
      // });
      // ChinaOutlineParams.topGeometry = new THREE.BufferGeometry().setFromPoints(
      //   ChinaOutlineParams.Vector3Lines
      // );

      // // 创建线条
      // ChinaOutlineParams.topLineMesh = new THREE.LineSegments(
      //   ChinaOutlineParams.topGeometry,
      //   topLineMaterial
      // );

      scene.add(ChinaOutlineParams.topLineMesh);

      ChinaOutlineParams.topLineMesh.position.set(
        0,
        0,
        extrudeSettings.depth + 0.1
        // (extrudeSettings.depth * 2) / 3
      );

      // 着色器相关
      ChinaOutlineParams.geometry = new THREE.BufferGeometry();
      ChinaOutlineParams.positions = new Float32Array(
        ChinaOutlineParams.lines.flat(1)
      );
      // 设置顶点
      ChinaOutlineParams.geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(ChinaOutlineParams.positions, 3)
      );
      // 设置 粒子透明度为 0
      ChinaOutlineParams.opacitys = new Float32Array(
        ChinaOutlineParams.positions.length
      ).map(() => 0);
      ChinaOutlineParams.geometry.setAttribute(
        "aOpacity",
        new THREE.BufferAttribute(ChinaOutlineParams.opacitys, 1)
      );

      const vertexShader = `
        attribute float aOpacity;
        uniform float uSize;
        varying float vOpacity;

        void main(){
            gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);
            gl_PointSize = uSize;

            vOpacity=aOpacity;
        }
        `;

      const fragmentShader = `
        varying float vOpacity;
        uniform vec3 uColor;

        float invert(float n){
            return 1.-n;
        }

        void main(){
          if(vOpacity <=0.2){
              discard;
          }
          vec2 uv=vec2(gl_PointCoord.x,invert(gl_PointCoord.y));
          vec2 cUv=2.*uv-1.;
          vec4 color=vec4(1./length(cUv));
          color*=vOpacity;
          color.rgb*=uColor;
          gl_FragColor=color;
        }
        `;
      const material = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        transparent: true, // 设置透明
        // emissive: 0xff0000,
        // lending: THREE.AdditiveBlending, //在使用此材质显示对象时要使用何种混合。加法
        uniforms: {
          uSize: {
            value: ChinaOutlineParams.pointSize,
          },
          uColor: {
            value: new THREE.Color(ChinaOutlineParams.pointColor),
          },
        },
      });
      ChinaOutlineParams.points = new THREE.Points(
        ChinaOutlineParams.geometry,
        material
      );
      ChinaOutlineParams.points && scene.add(ChinaOutlineParams.points);

      ChinaOutlineParams.points.position.set(0, 0, extrudeSettings.depth / 2);
      ChinaOutlineParams.points.rotation.set(0, Math.PI, Math.PI);
      //UI设计  12秒1圈   长度大概是 64/360
      // 渲染
      function render() {
        // console.log(ChinaOutlineParams.currentPos, ChinaOutlineParams.lines);
        if (
          ChinaOutlineParams.lines.length &&
          ChinaOutlineParams.points &&
          ChinaOutlineParams.geometry.attributes.position
        ) {
          ChinaOutlineParams.currentPos += ChinaOutlineParams.pointSpeed;
          for (let i = 0; i < ChinaOutlineParams.pointSpeed; i++) {
            ChinaOutlineParams.opacitys[
              (ChinaOutlineParams.currentPos - i) %
                ChinaOutlineParams.lines.length
            ] = 0;
          }

          for (let i = 0; i < 888; i++) {
            ChinaOutlineParams.opacitys[
              (ChinaOutlineParams.currentPos + i) %
                ChinaOutlineParams.lines.length
            ] = i / 50 > 2 ? 2 : i / 50;
          }
          ChinaOutlineParams.geometry.attributes.aOpacity.needsUpdate = true;
        }

        if (ChinaOutlineParams.topGeometry) {
          // // 逐渐增加进度，控制线段的显现
          // ChinaOutlineParams.lineProgress += 0.005; // 每次帧增加进度，调整速度

          // if (ChinaOutlineParams.lineProgress >= 0.99) {
          //   ChinaOutlineParams.lineProgress = 0; // 重置进度，或者可以做其它逻辑
          // }

          // // 计算当前应该显示到哪个点
          // let currentPoints = [];
          // let segmentCount = Math.floor(
          //   ChinaOutlineParams.lineProgress *
          //     ChinaOutlineParams.Vector3Lines.length
          // ); // 当前绘制到第多少个点

          // for (let i = 0; i < segmentCount; i++) {
          //   currentPoints.push(ChinaOutlineParams.Vector3Lines[i]);
          // }

          // // 更新几何体的顶点数据
          // ChinaOutlineParams.topGeometry.setFromPoints(currentPoints);

          // 方案2.2
          const segmentLength = 200; // 每次绘制500个点

          // 计算当前应该显示到哪个点
          let currentPoints = [];
          for (let i = 0; i < segmentLength; i++) {
            // 计算索引，如果超过点集的长度则从前面取
            let pointIndex =
              (ChinaOutlineParams.lineProgress + i) %
              ChinaOutlineParams.Vector3Lines.length;
            currentPoints.push(ChinaOutlineParams.Vector3Lines[pointIndex]);
          }

          ChinaOutlineParams.lineProgress =
            (ChinaOutlineParams.lineProgress + 3) %
            ChinaOutlineParams.Vector3Lines.length; // 每次更新时索引增加，超过点集长度则从0重新开始

          // 更新几何体的顶点数据
          ChinaOutlineParams.topGeometry.setFromPoints(currentPoints);
        }

        requestAnimationFrame(render);
      }
      requestAnimationFrame(render);
    };
    // 初始化原点
    const initCirclePoint = (scene, width) => {
      let plane = new THREE.PlaneBufferGeometry(width, width);
      let material = new THREE.MeshPhongMaterial({
        color: 0x00ffff,
        map: circlePoint,
        transparent: true,
        opacity: 1,
      });
      let mesh = new THREE.Mesh(plane, material);
      mesh.position.set(...centerXY, bottomZ - 0.1);
      scene.add(mesh);
      return mesh;
    };

    // 创建顶部底部边线
    const initBorderLine = (data, mapGroup) => {
      let lineTop = createCountryFlatLine(
        data,
        {
          // color: 0xffffff,
          color: 0x969ca2,
          linewidth: 0.0008,
          transparent: true,
          depthTest: false,
        },
        "Line2"
      );
      lineTop.position.z += extrudeSettings.depth + 0.1;
      let lineBottom = createCountryFlatLine(
        data,
        {
          color: 0xa9a7a7,
          linewidth: 0.001,
          transparent: true,
          depthTest: false,
        },
        "Line2"
      );
      lineBottom.position.z = 0.305;
      //  添加边线
      mapGroup.add(lineTop);
      console.log("大边线", lineTop);
      // mapGroup.add(lineBottom);
    };
    // 创建顶部描边边线
    const initStrokeLine = (data, mapGroup) => {
      let lineTop = createAreaLine(
        data,
        {
          color: "#adf5ff",
          linewidth: 0.0012,
          transparent: true,
          depthTest: false,
        },
        "Line2"
      );
      lineTop.position.z = extrudeSettings.depth + 0.65;
      //  添加边线
      console.log("小边线", lineTop);
      mapGroup.add(lineTop);
    };
    // 创建光柱
    const initLightPoint = (properties, mapGroup) => {
      if (!properties.markSite) {
        return false;
      }
      // 创建光柱
      let heightScaleFactor = 4 + random(1, 5) / 5;
      let lightCenter = properties.markSite;
      lightGroup = createLightPillar(...lightCenter, heightScaleFactor);
      lightGroup.position.z = extrudeSettings.depth + 0.1;
      mapGroup.add(lightGroup);
      return lightGroup;
    };
    // 创建标签
    const initLabel = (properties, scene) => {
      if (!properties.labelSite) {
        return false;
      }
      // 设置标签的显示内容和位置
      var label = create2DTag("标签", "map-32-label");
      scene.add(label);
      let labelCenter = properties.labelSite;
      label.show(
        properties.name,
        new THREE.Vector3(...labelCenter, extrudeSettings.depth + 0.1)
      );
    };

    // 创建2D标点
    const initMark = (properties, scene) => {
      if (!properties.markSite) {
        return false;
      }
      // 设置标签的显示内容和位置
      const mark = create2DMark();
      scene.add(mark);
      let markCenter = properties.markSite;
      mark.show(
        "/assets/texture/旋转点位.webp",
        new THREE.Vector3(...markCenter, extrudeSettings.depth + 0.3),
        properties.markSize || 120
      );
    };

    function throttle(fn, delay) {
      let lastTime = 0;

      return function (...args) {
        const now = Date.now();
        if (now - lastTime >= delay) {
          lastTime = now;
          fn(...args);
        }
      };
    }
    // 鼠标移动监听
    let meshs = null;
    function onPointerMove(event, { renderer, camera }) {
      // 获取 canvas 的边界矩形信息
      const rect = renderer.domElement.getBoundingClientRect();

      // 计算相对于 canvas 的归一化设备坐标，x 和 y 范围在 (-1, 1)
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // 通过摄像机和归一化的坐标更新射线，参数1是标准化设备坐标中鼠标的二维坐标 —— X分量与Y分量应当在-1到1之间，参数2射线所来源的摄像机
      raycaster.setFromCamera(pointer, camera);

      // 计算物体和射线的焦点，参数2递归若为true，则同时也会检测所有物体的后代。否则将只会检测对象本身的相交部分。默认值为true。
      if (!meshs) {
        meshs = ADCODE.map((item) => item.mesh);
      }

      const intersects = raycaster.intersectObjects(meshs, true);
      if (intersects.length > 0) {
        console.log(intersects);
        // intersects.forEach((item) => {
        //   item.object.material[0].color.set(0xff0000);
        // });
        const object = intersects[0].object;

        if (object.adcode) {
          ADCODE_MAP.get(object.adcode).topFaceMaterial.color.set(0xff0000);
          ADCODE_MAP.get(object.adcode).sideMaterial.color.set(0xff0000);
        } else {
          if (Array.isArray(object.material)) {
            object.material.forEach((m) => {
              m.color.set(0xff0000);
            });
          } else {
            object.material.color.set(0xff0000);
          }
        }
      }
    }

    let pointerMoveHandler = null;

    onMounted(async () => {
      // 图表相关
      if (showCharts.value) {
        currentTime();
        animation();
      }

      // geo数据
      let provinceData = await requestData("./data/map/重庆市.json");
      console.log("原始地图数据", provinceData);
      provinceData = transfromGeoJSON(provinceData);

      class CurrentMap3d extends Map3d {
        constructor(props) {
          super(props);
        }
        initCamera() {
          let { width, height } = this.options;
          let rate = width / height;
          // 设置45°的透视相机,更符合人眼观察
          this.camera = new THREE.PerspectiveCamera(45, rate, 0.001, 90000000);
          this.camera.up.set(0, 0, 1); // 设置相机上方向为z轴
          // 中国地图
          this.camera.position.set(102.49, 11.97, 22.95); //相机在Three.js坐标系中的位置
          this.camera.lookAt(...centerXY, 0);
        }
        // 使用 GSAP 控制相机位置变化
        startEntranceAnimation() {
          const targetPosition = new THREE.Vector3(...centerXY, 0);
          // 使用 GSAP 控制相机位置变化
          gsap
            .to(this.camera.position, {
              x: 107.71, // 相机目标 x 坐标
              y: 28.8, // 相机目标 y 坐标
              z: 7.12, // 相机目标 z 坐标
              delay: 0.3, // 延迟一定时间后开始动画
              duration: 2, // 动画持续时间
              ease: "power2.inOut", // 缓动函数
              onUpdate: () => {
                this.camera.lookAt(targetPosition);
              },
            })
            .then(() => {
              animationEnd = true;
            });
        }

        initModel() {
          try {
            // 创建组
            this.mapGroup = new THREE.Group();
            // 标签 初始化
            this.css2dRender = initCSS2DRender(this.options, this.container);

            provinceData.features.forEach((elem, index) => {
              // 定一个省份 | 区对象
              const province = new THREE.Object3D();
              // 坐标
              const coordinates = elem.geometry.coordinates;
              // city 属性
              const properties = elem.properties;
              console.log("当前省份配置", ADCODE_MAP.get(properties.adcode));
              const currentConfig =
                ADCODE_MAP.get(properties.adcode) || properties;

              // 循环坐标
              coordinates.forEach((multiPolygon) => {
                multiPolygon.forEach((polygon) => {
                  // 省/区的轮廓线
                  const shape = new THREE.Shape();
                  // 绘制shape
                  for (let i = 0; i < polygon.length; i++) {
                    let [x, y] = polygon[i];
                    if (i === 0) {
                      shape.moveTo(x, y);
                    }
                    shape.lineTo(x, y);
                  }
                  const geometry = new THREE.ExtrudeGeometry(
                    shape,
                    extrudeSettings
                  );

                  // 顶部和侧边材质,提出去就是控制所有,放里面可以单独设置
                  const topFaceMaterial = new THREE.MeshPhongMaterial({
                    map: textureMap,
                    color: 0x6e6e6e,
                    combine: THREE.MultiplyOperation,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 1,
                  });
                  const sideMaterial = new THREE.MeshLambertMaterial({
                    color: 0x528fa3,
                    transparent: true,
                    side: THREE.DoubleSide,
                    opacity: 0.7,
                  });

                  const mesh = new THREE.Mesh(geometry, [
                    topFaceMaterial,
                    sideMaterial,
                  ]);
                  mesh.adcode = properties.adcode;

                  currentConfig.mesh = mesh;
                  currentConfig.topFaceMaterial = topFaceMaterial;
                  currentConfig.sideMaterial = sideMaterial;

                  // 省份的轮廓线

                  // 已上报的省份凸出来
                  if (currentConfig && currentConfig.status === 1) {
                    initStrokeLine(polygon, province);

                    // 方案1 凹凸效果 缺点：没有更强烈的层次感
                    mesh.scale.set(1, 1, 1.5);
                  }

                  province.add(mesh);
                });
              });

              // 将每个省份 | 区的地图对象添加到总的地图组 mapGroup 中
              this.mapGroup.add(province);
              // 创建标点和标签
              initLabel(currentConfig, this.scene);
              // initMark(currentConfig, this.scene);
            });
            // 创建上下边框
            initBorderLine(provinceData, this.mapGroup);
            console.log("this.mapGroup", this.mapGroup);

            let earthGroupBound = getBoundingBox(this.mapGroup);
            centerXY = [earthGroupBound.center.x, earthGroupBound.center.y];
            // centerXY = [107, 30];
            let { size } = earthGroupBound;
            let width = size.x < size.y ? size.y + 1 : size.x + 1;
            // 添加背景，修饰元素
            this.rotatingApertureMesh = guiParams.rotatingApertureMesh =
              initRotatingAperture(this.scene, width);
            this.rotatingPointMesh = guiParams.rotatingPointMesh =
              initRotatingPoint(this.scene, width - 2);
            this.circlePointMesh = guiParams.circlePointMesh = initCirclePoint(
              this.scene,
              width
            );
            this.rotatingApertureMesh.visible =
              this.rotatingPointMesh.visible =
              this.circlePointMesh.visible =
                guiParams.showAperture;

            if (guiParams.showBackground) {
              initSceneImag(this.scene, "/data/map/scene-bg2.png", 0.063);
              // initSceneBg(this.scene, 40);
            }
            initChinaOutline(this.scene);
            // console.log(ChinaOutlineParams);

            // 将组添加到场景中
            this.scene.add(this.mapGroup);
            // this.particleArr = initParticle(this.scene, earthGroupBound);
            initGui();
            // setLightPillarColor(
            //   groupCodeMap[guiParams.adcodeMap],
            //   guiParams.markColor
            // );
          } catch (error) {
            console.log(error);
          }
        }
        getDataRenderMap() {}

        destroy() {}
        initControls() {
          super.initControls();
          this.controls.target = new THREE.Vector3(...centerXY, 0);
        }
        initLight() {
          //   平行光1
          let directionalLight1 = new THREE.DirectionalLight(0x7af4ff, 1);
          directionalLight1.position.set(...centerXY, 30);
          //   平行光2
          let directionalLight2 = new THREE.DirectionalLight(0x7af4ff, 1);
          directionalLight2.position.set(...centerXY, 30);
          // 环境光
          let ambientLight = new THREE.AmbientLight(0x7af4ff, 1);
          // 聚光灯,颜色，光照强度，光源照射的最大距离，光线照射范围的角度，聚光锥的半影衰减百分比，沿着光照距离的衰减量
          let spotLight = new THREE.SpotLight(
            0x1af0ff,
            1.8,
            200,
            Math.PI / 3,
            0,
            2
          );
          spotLight.position.set(...centerXY, 20);
          spotLight.target.position.set(...centerXY, 0); // 设置聚光灯的目标位置
          this.addObject(spotLight.target); // 需要将目标的位置加入到场景中
          spotLight.penumbra = 0.45; // 设置聚光灯的边缘模糊程度

          // 将光源添加到场景中
          // this.addObject(directionalLight1);
          this.addObject(directionalLight2);
          this.addObject(ambientLight);
          this.addObject(spotLight);
        }
        initRenderer() {
          super.initRenderer();
          // this.renderer.autoClear = false;
          // this.renderer.outputEncoding = THREE.sRGBEncoding

          // {
          //   let { width, height } = this.options;
          //   // 添加后期处理效果
          //   this.composer = new EffectComposer(this.renderer);
          //   this.composer.setSize(width, height);
          //   const renderPass = new RenderPass(this.scene, this.camera);
          //   this.composer.addPass(renderPass);

          //   // 配置UnrealBloomPass
          //   const bloomPass = new UnrealBloomPass(
          //     // 泛光的画布大小
          //     new THREE.Vector2(width, height),
          //     // 泛光效果的强度
          //     0.4,
          //     // 泛光效果的半径
          //     0.4,
          //     // 泛光效果的阈值
          //     0.6
          //   );
          //   this.composer.addPass(bloomPass);
          // }
        }
        loop() {
          this.animationStop = window.requestAnimationFrame(() => {
            this.loop();
          });
          // 这里是你自己业务上需要的code

          // 在每一帧渲染之后获取相机的实时位置
          // var cameraPosition = this.camera.position.clone();
          // console.log("Camera Position:", cameraPosition);

          this.renderer.render(this.scene, this.camera);
          // 控制相机旋转缩放的更新
          if (this.options.controls.visibel && this.controls) {
            // this.controls.target.set(...centerXY, 0)
            this.controls.update();
          }
          // 统计更新
          if (this.options.statsVisibel) this.stats.update();
          if (guiParams.showAperture && this.rotatingApertureMesh) {
            this.rotatingApertureMesh.rotation.z += 0.0005;
          }
          if (guiParams.showAperture && this.rotatingPointMesh) {
            this.rotatingPointMesh.rotation.z -= 0.0005;
          }
          // 渲染标签
          if (this.css2dRender) {
            this.css2dRender.render(this.scene, this.camera);
          }
          // 粒子上升
          // if (this.particleArr.length) {
          //   for (let i = 0; i < this.particleArr.length; i++) {
          //     this.particleArr[i].updateSequenceFrame();
          //     this.particleArr[i].position.z += 0.01;
          //     if (this.particleArr[i].position.z >= 6) {
          //       this.particleArr[i].position.z = -6;
          //     }
          //   }
          // }
          TWEEN.update();
          if (this.composer) {
            this.composer.render();
          }
          // console.log(this.camera.position)
        }
        resize() {
          super.resize();
          // 这里是你自己业务上需要的code
          this.renderer.render(this.scene, this.camera);
          this.renderer.setPixelRatio(window.devicePixelRatio);

          if (this.css2dRender) {
            this.css2dRender.setSize(this.options.width, this.options.height);
          }
        }
      }
      baseEarth = new CurrentMap3d({
        container: "#app-32-map",
        axesVisibel: false,
        controls: {
          enableDamping: true, // 阻尼
          maxPolarAngle: (Math.PI / 2) * 0.98,
        },
      });
      baseEarth.run();
      baseEarth.startEntranceAnimation();
      window.addEventListener("resize", resize);
      pointerMoveHandler = throttle((event) => {
        if (!animationEnd) return;
        onPointerMove(event, {
          renderer: baseEarth.renderer,
          scene: baseEarth.scene,
          camera: baseEarth.camera,
        });
      }, 100);
      document.addEventListener("pointermove", pointerMoveHandler);
    });
    onBeforeUnmount(() => {
      window.removeEventListener("resize", resize);
      document.removeEventListener("pointermove", pointerMoveHandler);
    });

    // 图表相关逻辑
    const displayData = reactive({
      // 左 菜单
      menuData1: [
        {
          name: "整体视图",
          active: true,
          route: "/landmark", //路由
          id: 0,
        },
        {
          name: "资产视图",
          active: false,
          route: "/building", //路由
          id: 2,
        },
      ],
      // 右 菜单
      menuData2: [
        {
          name: "风险视图",
          active: false,
          route: "/operation", //路由
          id: 3,
        },
        {
          name: "暂未开放",
          route: "/command", //路由
          active: false,
          id: 4,
        },
      ],

      // 当前日期和时间
      nowDate: "", // 当前日期
      openType: false,
    });

    // 日期 时间 星期
    const formatDate = () => {
      let date = new Date();
      let year = date.getFullYear(); // 年
      let month = date.getMonth() + 1; // 月
      let day = date.getDate(); // 日
      let week = date.getDay(); // 星期
      let weekArr = [
        "星期日",
        "星期一",
        "星期二",
        "星期三",
        "星期四",
        "星期五",
        "星期六",
      ];
      let hour = date.getHours(); // 时
      hour = hour < 10 ? "0" + hour : hour; // 如果只有一位，则前面补零
      let minute = date.getMinutes(); // 分
      minute = minute < 10 ? "0" + minute : minute; // 如果只有一位，则前面补零
      let second = date.getSeconds(); // 秒
      second = second < 10 ? "0" + second : second; // 如果只有一位，则前面补零
      displayData.nowDate = `${year}/${month}/${day} ${hour}:${minute}:${second} ${weekArr[week]}`;
    };
    // 日期 时间 星期  刷新
    const currentTime = () => {
      setInterval(formatDate, 500); // 每 0.5秒 刷新 获取时间 数据
    };
    // 动画效果
    const animation = () => {
      let navigation = document.querySelector(".navigation"); // 导航
      let imgsSetting = document.querySelector(".imgs_setting"); // 边框
      let navigationMain = document.querySelector(".navigation_main"); // 文字
      let navigationUlMenuLeft = document.querySelector(
        ".navigation_ul_menu_left"
      ); // 左
      let navigationUlMenuRight = document.querySelector(
        ".navigation_ul_menu_right"
      ); // 右

      navigation.style.cssText =
        "animation: imgsSettingTop 1s 0.8s; opacity: 1;";
      imgsSetting.style.cssText =
        "animation: imgsSettingTop 1s 1s; opacity: 1;";
      navigationMain.style.cssText =
        "animation: imgsSettingTop 2s 1s; opacity: 1;";
      navigationUlMenuLeft.style.cssText =
        "animation: navigationBottom 3s 1s; opacity: 1;";
      navigationUlMenuRight.style.cssText =
        "animation: navigationBottom 3s 1s; opacity: 1;";

      userName.value.style.cssText =
        "animation: imgsSettingTop 3s 1s; opacity: 1;"; // 用户名称
      timeDate.value.style.cssText =
        "animation: navigationBottom 3s 1s; opacity: 1;"; // 时间日期
    };

    const handleClick = (item) => {
      if (item) {
        [...displayData.menuData1, ...displayData.menuData2].forEach((item) => {
          item.active = false;
        });
        item.active = true;
      }
    };

    const timeDate = ref(null);
    const userName = ref(null);
    const showCharts = ref(false);

    return {
      displayData,
      handleClick,
      timeDate,
      userName,
      showCharts,
    };
  },
};
</script>
<style>
html,
body,
#app,
.is-full {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.index_home,
.contengt-wrap {
  width: 100%;
  height: 100%;
  position: relative;
}
#pp-32-map {
  position: fixed;
  z-index: 0;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.map-32-label {
  padding: 4px;
  color: #fff;
  font-size: 12px;
  text-align: center;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: row;
}

/* 首页+ 导航栏 css */
.index_home {
}
/* 导航栏 */
.index_home .navigation {
  position: fixed;
  z-index: 100;
  top: 0;
  left: 0;
  height: 80px;
  width: 100%;
  background-image: url(/imges/building/bei/shang.png);
  background-size: 100% 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.navigation .navigation_ul {
  /* margin-top: .5%; */
  height: 100%;
  display: flex;
  align-items: center;
  position: relative;
}
.navigation .navigation_ul .navigation_ul_menu {
  position: relative;
  display: flex;
}

.navigation .navigation_left {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 20%;
  /* background-image: url(/imges/building/bei/zuo.png); */
  /* background-size: 100% 100%; */
}
.navigation .navigation_right {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 20%;
  /* background-image: url(/imges/building/bei/you.png); */
  /* background-size: 100% 100%; */
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.navigation .navigation_right .navigation_tips_name {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: right;
}
/* 提示 */
.navigation .navigation_right .navigation_tips {
  cursor: pointer;
  width: 20px;
  height: 23px;
  background-image: url(/imges/building/ico/lingSheng.png);
  background-size: 100% 100%;
}

.navigation .navigation_right .date {
  position: relative;
  margin-top: 5px;
  display: flex;
  margin-left: auto;
  margin-right: 3%;
  width: 60%;
  justify-content: right;
}
.navigation .navigation_right .date .date_text {
  margin: 0 5px;
  font-size: 12px;
  color: #0798d7;
}

.navigation_name {
  cursor: pointer;
  margin-right: 3%;
  padding: 0 3%;
  font-size: 14px;
  color: #fff;
}
.navigation .navigation_ul .navigation_li {
  /* margin: 0 3px; */
  position: relative;
  z-index: 1;
  width: 120px;
  height: 34px;
  line-height: 34px;
  font-size: 16px;
  text-align: center;
  color: #fff;
  /* background-color: aliceblue; */
  background: url("/imges/Button.png") no-repeat;
  background-size: 100% 100%;
  cursor: pointer;
}
.navigation .navigation_ul .navigation_li_Right {
  background: url("/imges/you_button.png") no-repeat;
  background-size: 100% 100%;
}
.navigation .navigation_ul .navigation_li_te {
  background: url("/imges/Button2.png") no-repeat;
  background-size: 100% 100%;
}
.navigation .navigation_ul .navigation_li_Right_te {
  background: url("/imges/you_button2.png") no-repeat;
  background-size: 100% 100%;
}
.navigation .navigation_ul .navigation_li:hover {
  background: url("/imges/Button2.png") no-repeat;
  background-size: 100% 100%;
}
.navigation .navigation_ul .navigation_li_Right:hover {
  background: url("/imges/you_button2.png") no-repeat;
  background-size: 100% 100%;
}
.navigation .navigation_ul .navigation_main {
  position: relative;
  height: 100%;
  width: 320px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.navigation .navigation_ul .navigation_name {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 280px;
  font-size: 20px;
  height: 95%;
  padding-bottom: 5%;
  color: #09b7ff;
  font-size: 22px;
  font-weight: 700;
  /* background-color: rgba(255,255,255,.4); */
}
.navigation .navigation_ul .imgs_setting {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  margin: auto;
  width: 75%;
  height: 55%;
  background: url("/imges/main_title.png") no-repeat;
  background-size: 100% 100%;
}

/* 内容 */
.index_home .index_content {
  height: 91%;
  position: relative;
}
.index_content_model {
  position: fixed;
  z-index: 0;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
/* .index_home .index_content .index_left{
    position: fixed;
    left: 0;
    top: 80px;
    width: 26%;
    height:  calc(100% - 80px);

}
.index_home .index_content .index_right{
    position: fixed;
    right: 0;
    top: 80px;
    width: 26%;
    height:  calc(100% - 80px);
} */

@keyframes imgsSettingTop {
  from {
    top: -400px;
  }
  to {
    top: 0;
  }
}

@keyframes navigationBottom {
  from {
    bottom: -1000px;
  }
  to {
    bottom: 0;
  }
}

.index_home .index_left {
  position: fixed;
  z-index: 3;
  opacity: 1;
  left: 0;
  top: 0;
  width: 20%;
  height: 100%;
}
.index_home .index_right {
  position: fixed;
  z-index: 2;
  opacity: 1;
  right: 0;
  top: 0;
  width: 20%;
  height: 100%;
}

.index_home .floor_right {
  position: fixed;
  z-index: 2;
  opacity: 1;
  right: 20%;
  width: 4%;
  height: 100%;
  /* background-color: #fff; */

  bottom: 0;
}
.index_home .operation_left {
  position: fixed;
  z-index: 2;
  opacity: 1;
  left: 20%;
  width: 98px;
  height: 50%;
  /* background-color: #fff; */
  bottom: 0;
  top: 0;
  margin: auto 0;
  overflow: hidden;
}
</style>

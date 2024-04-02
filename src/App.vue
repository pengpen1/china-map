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
import * as d3 from "d3";
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

let centerXY = [104.114129, 7.550339];
const ADCODE = [
  { adcode: "110000", name: "北京市" },
  { adcode: "120000", name: "天津市" },
  { adcode: "130000", name: "河北省" },
  { adcode: "140000", name: "山西省" },
  { adcode: "150000", name: "内蒙古自治区" },
  { adcode: "210000", name: "辽宁省" },
  { adcode: "220000", name: "吉林省" },
  { adcode: "230000", name: "黑龙江省" },
  { adcode: "310000", name: "上海市" },
  { adcode: "320000", name: "江苏省" },
  { adcode: "330000", name: "浙江省" },
  { adcode: "340000", name: "安徽省" },
  { adcode: "350000", name: "福建省" },
  { adcode: "360000", name: "江西省" },
  { adcode: "370000", name: "山东省" },
  { adcode: "410000", name: "河南省" },
  { adcode: "420000", name: "湖北省" },
  { adcode: "430000", name: "湖南省" },
  { adcode: "440000", name: "广东省" },
  { adcode: "450000", name: "广西壮族自治区" },
  { adcode: "460000", name: "海南省" },
  { adcode: "500000", name: "重庆市" },
  { adcode: "510000", name: "四川省" },
  { adcode: "520000", name: "贵州省" },
  { adcode: "530000", name: "云南省" },
  { adcode: "540000", name: "西藏自治区" },
  { adcode: "610000", name: "陕西省" },
  { adcode: "620000", name: "甘肃省" },
  { adcode: "630000", name: "青海省" },
  { adcode: "640000", name: "宁夏回族自治区" },
  { adcode: "650000", name: "新疆维吾尔自治区" },
  { adcode: "710000", name: "台湾省" },
  { adcode: "810000", name: "香港特别行政区" },
  { adcode: "820000", name: "澳门特别行政区" },
];
const adCodeMap = {
  北京市: 110000,
  天津市: 120000,
  河北省: 130000,
  山西省: 140000,
  内蒙古自治区: 150000,
  辽宁省: 210000,
  吉林省: 220000,
  黑龙江省: 230000,
  上海市: 310000,
  江苏省: 320000,
  浙江省: 330000,
  安徽省: 340000,
  福建省: 350000,
  江西省: 360000,
  山东省: 370000,
  河南省: 410000,
  湖北省: 420000,
  湖南省: 430000,
  广东省: 440000,
  广西壮族自治区: 450000,
  海南省: 460000,
  重庆市: 500000,
  四川省: 510000,
  贵州省: 520000,
  云南省: 530000,
  西藏自治区: 540000,
  陕西省: 610000,
  甘肃省: 620000,
  青海省: 630000,
  宁夏回族自治区: 640000,
  新疆维吾尔自治区: 650000,
  台湾省: 710000,
  香港特别行政区: 810000,
  澳门特别行政区: 820000,
};

export default {
  name: "3dMap30",
  components: {
    leftBuiding,
    rightBuiding,
  },
  setup() {
    // 地图相关逻辑
    let baseEarth = null;

    // 重置
    const resize = () => {
      baseEarth.resize();
    };

    const { requestData } = useFileLoader();
    const { transfromGeoJSON } = useConversionStandardData();
    const { getBoundingBox } = useCoord();
    const { createCountryFlatLine } = useCountry();
    const { initCSS2DRender, create2DTag } = useCSS2DRender();
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
    const scale = 0.0;
    textureMap.repeat.set(scale, scale);
    texturefxMap.repeat.set(scale, scale);

    const color = new THREE.Color("#29445d");
    // json数据中的code映射组
    let groupCodeMap = {};
    // 光标也可以针对单个省
    let lightGroup = null;
    const guiParams = {
      topColor: "#29445d",
      sideColor: "#ffffff",
      // scale: 0.0,
      markColor: 0xe10909,
      showBackground: true,
      adcodeMap: 510000,
      showCharts: true,
    };
    let backgroundMesh = null;
    // 地图拉伸设置
    const extrudeSettings = {
      depth: 1,
      bevelEnabled: true,
      bevelSegments: 1,
      bevelThickness: 0.1,
    };

    const topFaceMaterial = new THREE.MeshPhongMaterial({
      // 贴图或者纯色
      // map: textureMap,
      color,
      combine: THREE.MultiplyOperation,
      transparent: true,
      opacity: 1,
    });
    const sideMaterial = new THREE.MeshLambertMaterial({
      color: "#ffffff",
      transparent: true,
      opacity: 0.9,
    });
    const bottomZ = -0.2;
    // 初始化gui
    const initGui = () => {
      const gui = new GUI();
      gui.addColor(guiParams, "topColor").onChange((val) => {
        topFaceMaterial.color = new THREE.Color(val);
      });
      gui.addColor(guiParams, "sideColor").onChange((val) => {
        sideMaterial.color = new THREE.Color(val);
      });
      gui.addColor(guiParams, "markColor").onChange((val) => {
        console.log(val);
        // setLightPillarColor(lightGroup, val);
      });
      // gui.add(guiParams, "scale", 0, 1).onChange((val) => {
      //   textureMap.repeat.set(val, val);
      //   texturefxMap.repeat.set(val, val);
      // });
      gui.add(guiParams, "adcodeMap", adCodeMap).onChange((val) => {
        console.log(val); // 15000
        console.log(groupCodeMap);
        setLightPillarColor(groupCodeMap[val], guiParams.markColor);
      });
      gui.add(guiParams, "showBackground").onChange((val) => {
        backgroundMesh.visible = val;
      });
      gui.add(guiParams, "showCharts").onChange((val) => {
        showCharts.value = val;
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
      scene.fog = new THREE.Fog(0xffffff, 2, 90);
    };

    // 初始化中国轮廓地图
    const ChinaOutlineParams = {
      lines: [],
      positions: null,
      opacitys: null,
      points: null,
      geometry: null,
      currentPos: 0,
      pointSpeed: 20,
    };
    const initChinaOutline = async (scene) => {
      ChinaOutlineParams.geometry = new THREE.BufferGeometry();
      // 以北京为中心 修改坐标
      const projection = d3
        .geoMercator()
        .center([116.412318, 39.909843])
        .translate([0, 0]);

      let indexBol = true;

      /**
       * 边框 图形绘制
       * @param polygon 多边形 点数组
       * @param color 材质颜色
       * */
      function lineDraw(polygon, color) {
        const lineGeometry = new THREE.BufferGeometry();
        const pointsArray = new Array();
        polygon.forEach((row) => {
          const [x, y] = projection(row);
          // 创建三维点
          pointsArray.push(new THREE.Vector3(x, -y, 0));
          console.log(indexBol);
          if (indexBol) {
            ChinaOutlineParams.lines.push([x, -y, 0]);
          }
        });
        indexBol = false;
        // 放入多个点
        lineGeometry.setFromPoints(pointsArray);

        const lineMaterial = new THREE.LineBasicMaterial({
          color: color,
        });
        return new THREE.Line(lineGeometry, lineMaterial);
      }

      const chinaData = await requestData("./data/map/中国轮廓.json");
      console.log("中国轮廓数据", chinaData);

      // 中国边界
      const feature = chinaData.features[0];
      const province = new THREE.Object3D();
      province.properties = feature.properties.name;
      // 点数据
      const coordinates = feature.geometry.coordinates;

      coordinates.forEach((coordinate) => {
        // coordinate 多边形数据
        coordinate.forEach((rows) => {
          const line = lineDraw(rows, 0xffffff);
          province.add(line);
        });
      });

      ChinaOutlineParams.positions = new Float32Array(
        ChinaOutlineParams.lines.flat(1)
      );
      // 设置顶点
      ChinaOutlineParams.geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(114, 38, 0)
      );
      console.log(ChinaOutlineParams);
      // 设置 粒子透明度为 0
      ChinaOutlineParams.opacitys = new Float32Array(
        ChinaOutlineParams.positions.length
      ).map(() => 0);
      ChinaOutlineParams.geometry.setAttribute(
        "aOpacity",
        new THREE.BufferAttribute(ChinaOutlineParams.opacitys, 1)
      );

      province.position.set(114, 38, 0);
      province.scale.set(0.35, 0.35, 0.35);
      scene.add(province);
    };
    // 初始化原点
    const initCirclePoint = (scene, width) => {
      let plane = new THREE.PlaneBufferGeometry(width, width);
      let material = new THREE.MeshPhongMaterial({
        color: 0x00ffff,
        map: circlePoint,
        transparent: true,
        opacity: 1,
        // depthTest: false,
      });
      let mesh = new THREE.Mesh(plane, material);
      mesh.position.set(...centerXY, bottomZ - 0.1);
      // let mesh2 = mesh.clone()
      // mesh2.position.set(...centerXY, bottomZ - 0.001)
      scene.add(mesh);
    };
    // 初始化粒子
    const initParticle = (scene, bound) => {
      // 获取中心点和中间地图大小
      let { center, size } = bound;
      // 构建范围，中间地图的2倍
      let minX = center.x - size.x;
      let maxX = center.x + size.x;
      let minY = center.y - size.y;
      let maxY = center.y + size.y;
      let minZ = -6;
      let maxZ = 6;

      let particleArr = [];
      for (let i = 0; i < 16; i++) {
        const particle = createSequenceFrame({
          image: "./data/map/上升粒子1.png",
          width: 180,
          height: 189,
          frame: 9,
          column: 9,
          row: 1,
          speed: 0.5,
        });
        let particleScale = random(5, 10) / 1000;
        particle.scale.set(particleScale, particleScale, particleScale);
        particle.rotation.x = Math.PI / 2;
        let x = random(minX, maxX);
        let y = random(minY, maxY);
        let z = random(minZ, maxZ);
        particle.position.set(x, y, z);
        particleArr.push(particle);
      }
      scene.add(...particleArr);
      return particleArr;
    };
    // 创建顶部底部边线
    const initBorderLine = (data, mapGroup) => {
      let lineTop = createCountryFlatLine(
        data,
        {
          // color: 0xffffff,
          color: 0xa9a7a7,
          linewidth: 0.001,
          transparent: true,
          depthTest: false,
        },
        "Line2"
      );
      // lineTop.position.z = extrudeSettings.depth;
      lineTop.position.z += 0.305;
      let lineBottom = createCountryFlatLine(
        data,
        {
          color: 0x61fbfd,
          linewidth: 0.002,
          // transparent: true,
          depthTest: false,
        },
        "Line2"
      );
      lineBottom.position.z -= 0.1905;
      //  添加边线
      mapGroup.add(lineTop);
      mapGroup.add(lineBottom);
    };
    // 创建光柱
    const initLightPoint = (properties, mapGroup) => {
      if (!properties.centroid && !properties.center) {
        return false;
      }
      // 创建光柱
      let heightScaleFactor = 4 + random(1, 5) / 5;
      let lightCenter = properties.centroid || properties.center;
      lightGroup = createLightPillar(...lightCenter, heightScaleFactor);
      lightGroup.position.z = extrudeSettings.depth + 0.1;
      mapGroup.add(lightGroup);
      return lightGroup;
    };
    // 创建标签
    const initLabel = (properties, scene) => {
      if (!properties.centroid && !properties.center) {
        return false;
      }
      // 设置标签的显示内容和位置
      var label = create2DTag("标签", "map-32-label");
      scene.add(label);
      let labelCenter = properties.center; //centroid || properties.center
      label.show(properties.name, new THREE.Vector3(...labelCenter, 0.31));
    };

    onMounted(async () => {
      // 图表相关
      currentTime();
      animation();

      // 中国地图数据
      let provinceData = await requestData("./data/map/中华人民共和国.json");
      // let provinceData = await requestData("./data/map/中国所有省.json");
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
          this.camera.up.set(0, 0, 1);
          // 中国地图
          this.camera.position.set(102.49, 11.97, 42.95); //相机在Three.js坐标系中的位置
          this.camera.lookAt(...centerXY, 0);
        }
        // 使用 GSAP 控制相机位置变化
        startEntranceAnimation() {
          // gsap.to(this.mapGroup.children, {
          //   opacity: 1, // 目标透明度
          //   duration: 2, // 动画持续时间
          //   delay: 5, // 延迟一定时间后开始动画
          //   // stagger: 0.1, // 每个元素动画之间的延迟时间
          //   ease: "power2.inOut", // 缓动函数
          // });

          const targetPosition = new THREE.Vector3(...centerXY, 0);
          // 使用 GSAP 控制相机位置变化
          gsap.to(this.camera.position, {
            x: 105.54, // 相机目标 x 坐标
            y: 21.36, // 相机目标 y 坐标
            z: 52.69, // 相机目标 z 坐标
            delay: 0.3, // 延迟一定时间后开始动画
            duration: 2, // 动画持续时间
            ease: "power2.inOut", // 缓动函数
            onUpdate: () => {
              this.camera.lookAt(targetPosition);
            },
          });

          gsap.to(this.scene.fog, {
            far: 1000,
            duration: 2,
            delay: 0.3,
            ease: "power2.inOut", // 缓动函数
          });
        }

        initModel() {
          try {
            // 创建组
            this.mapGroup = new THREE.Group();
            // 标签 初始化
            this.css2dRender = initCSS2DRender(this.options, this.container);

            provinceData.features.forEach((elem) => {
              // 定一个省份对象
              const province = new THREE.Object3D();
              // 坐标
              const coordinates = elem.geometry.coordinates;
              // city 属性
              const properties = elem.properties;

              // 循环坐标
              coordinates.forEach((multiPolygon) => {
                multiPolygon.forEach((polygon) => {
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
                  const mesh = new THREE.Mesh(geometry, [
                    topFaceMaterial,
                    sideMaterial,
                  ]);
                  // mesh.material.opacity = 0; // 初始透明度为 0，无效
                  province.add(mesh);
                });
              });
              // 将每个省份的地图对象添加到总的地图组 mapGroup 中
              this.mapGroup.add(province);
              // 创建标点和标签
              const curGroup = initLightPoint(properties, this.mapGroup);
              initLabel(properties, this.scene);
              // console.log("elem", elem); {type: 'Feature', properties: {name:"北京市",adcode:11000,level: "province",center: [116.405285, 39.904989]}, geometry: {…}
              if (elem.properties && elem.properties.level === "province") {
                groupCodeMap[elem.properties.adcode] = curGroup;
              }
            });
            // 创建上下边框
            initBorderLine(provinceData, this.mapGroup);
            console.log("this.mapGroup", this.mapGroup);

            let earthGroupBound = getBoundingBox(this.mapGroup);
            centerXY = [earthGroupBound.center.x, earthGroupBound.center.y + 8];
            let { size } = earthGroupBound;
            let width = size.x < size.y ? size.y + 1 : size.x + 1;
            // 添加背景，修饰元素
            // this.rotatingApertureMesh = initRotatingAperture(this.scene, width);
            // this.rotatingPointMesh = initRotatingPoint(this.scene, width - 2);
            initCirclePoint(this.scene, width);
            initSceneBg(this.scene, 40);
            // initChinaOutline(this.scene);
            console.log(ChinaOutlineParams);

            // // 创建发光材质
            // const glowMaterial = new THREE.MeshBasicMaterial({
            //   color: 0xffffff, // 设置颜色为白色
            //   emissive: 0xffffff, // 设置发光颜色为白色
            //   transparent: true, // 启用透明
            //   opacity: 0.5, // 设置透明度
            //   side: THREE.BackSide, // 设置材质的显示面为背面
            // });

            // // 创建发光的对象
            // const glowGeometry = new THREE.TorusGeometry(10, 0.5, 16, 100); // 自定义形状，这里使用了环形
            // const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
            // glowMesh.position.set(...centerXY, 1);
            // this.scene.add(glowMesh);

            // 将组添加到场景中
            this.scene.add(this.mapGroup);
            // this.particleArr = initParticle(this.scene, earthGroupBound);
            initGui();
            setLightPillarColor(
              groupCodeMap[guiParams.adcodeMap],
              guiParams.markColor
            );
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
          // 将光源添加到场景中
          this.addObject(directionalLight1);
          this.addObject(directionalLight2);
          this.addObject(ambientLight);
        }
        initRenderer() {
          super.initRenderer();
          // this.renderer.outputEncoding = THREE.sRGBEncoding
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
          // if (this.rotatingApertureMesh) {
          //   this.rotatingApertureMesh.rotation.z += 0.0005;
          // }
          // if (this.rotatingPointMesh) {
          //   this.rotatingPointMesh.rotation.z -= 0.0005;
          // }
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
        axesVisibel: true,
        controls: {
          enableDamping: true, // 阻尼
          maxPolarAngle: (Math.PI / 2) * 0.98,
        },
      });
      baseEarth.run();
      baseEarth.startEntranceAnimation();
      window.addEventListener("resize", resize);
    });
    onBeforeUnmount(() => {
      window.removeEventListener("resize", resize);
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
          name: "分支节点",
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
    const showCharts = ref(true);

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
  font-size: 10px;
  color: #fff;
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

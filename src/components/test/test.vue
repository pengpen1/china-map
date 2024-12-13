<template>
  <div id="chinaMap">
    <div id="threejs" ref="threejs"></div>
    <!-- 右侧按钮 -->
    <div class="rightButton" ref="rightButton">
      <div
        v-for="(item, index) in rightButItem"
        :key="index"
        :value="item.value"
        :class="item.selected ? 'selected common' : 'common'"
        @click="rightButClick"
      >
        {{ item.name }}
      </div>
    </div>
    <!-- 地图名称元素 -->
    <div id="provinceName" style="display: none"></div>
    <!-- 光柱上方数值元素 -->
    <div id="cylinderValue" style="display: none"></div>
    <!-- 地图标牌元素 -->
    <div id="mapTag" style="display: none">
      <div class="content">
        <div>旅客:</div>
        <div id="mapTag_value">1024万</div>
      </div>
      <div class="arrow"></div>
    </div>
    <!-- 弹框元素 -->
    <div id="popup" style="display: none">
      <div class="popup_line"></div>
      <div class="popup_Main">
        <div class="popupMain_top"></div>
        <div class="popup_content">
          <div class="popup_head">
            <div class="popup_title">
              <div class="title_icon"></div>
              <div id="popup_Name">湖北省</div>
            </div>
            <div class="close" @click="popupClose"></div>
          </div>
          <div class="popup_item">
            <div>当前流入：</div>
            <div class="item_value">388万人次</div>
          </div>
          <div class="popup_item">
            <div>景区容量：</div>
            <div class="item_value">2688万人次</div>
          </div>
          <div class="popup_item">
            <div>交通资源利用率：</div>
            <div class="item_value">88.7%</div>
          </div>
          <div class="popup_item">
            <div>省市热搜指数：</div>
            <div class="item_value">88.7%</div>
          </div>
        </div>
        <div class="popupMain_footer"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { regionCode } from "@/assets/regionCode.js";
import { onMounted, reactive, computed, ref } from "vue";
import * as THREE from "three";
// 引入TWEENJS
import TWEEN from "@tweenjs/tween.js";
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import { CSS3DObject } from "three/addons/renderers/CSS3DRenderer.js";
// threejs基础配置，场景相机渲染器等
import {
  scene,
  camera,
  controls,
  renderer,
  css3DRenderer,
  css2DRenderer,
  outlinePass,
  composer,
  finalComposer,
} from "./baseConfig/index.js";
// 加载地图
import {
  initMap,
  nationMapModel,
  mapUf,
  projection,
  topMaterial,
  sideMaterial,
} from "./initChinaMap/index.js";
// 地图底部网格背景
import { gridHelper, meshPoint } from "./backgroundMesh/index.js";
// 初始化鼠标移入地图浮动效果
import { initMapFloat } from "./mapFloat/index.js";
// 外圈、内圈、扩散波纹、渐变平面
import {
  circleUf,
  outerCircle,
  innerCircle,
  diffuseCircle,
  gradientPlane,
} from "./backgroundCircle/index.js";
// 光柱发光数组、光圈动画、创建光柱函数
import {
  cylinderGlowArr,
  apertureAnimation,
  createCylinder,
} from "./cylinder/index.js";
// 创建地图标牌函数
import { createMapTag } from "./mapTag/index.js";
import {
  particlesUpdate,
  createParticles,
  particles,
} from "./particles/index.js";
// 首次进入动画
import { eventAnimation } from "./eventAnimation/index.js";

// 右侧按钮选项
const rightButItem = reactive([
  { value: "cylinder", name: "光柱", selected: false },
  { value: "tag", name: "标牌", selected: false },
]);
// 描边模型
let outlineModel = null;
// 时钟对象，用于获取两帧渲染之间的时间值
const clock = new THREE.Clock();
// 射线拾取中模型对象
let rayObj = null;
// 弹框div元素
let popupDiv = null;
// css2D弹框对象
let css2Dpopup = null;
// 需要辉光的模型数组
let glowArr = [];
// 右侧按钮元素
const rightButton = ref();
// 地图状态,分为国省市三种，决定了点击事件等操作效果
const mapStatus = ref("国");
// 省份地图模型
const provinceMapModel = new THREE.Group();
provinceMapModel.name = "省";
provinceMapModel.rotateX(-Math.PI / 2);
// 城市级地图模型
const cityMapModel = new THREE.Group();
cityMapModel.name = "市";
cityMapModel.rotateX(-Math.PI / 2);
// 当前显示模型
const currentShowModel = computed(() => {
  return mapStatus.value === "国"
    ? nationMapModel
    : mapStatus.value === "省"
    ? provinceMapModel
    : cityMapModel;
});
// threejs容器元素
const threejs = ref();

onMounted(async () => {
  threejs.value.appendChild(renderer.domElement);
  threejs.value.appendChild(css3DRenderer.domElement);
  threejs.value.appendChild(css2DRenderer.domElement);

  // 初始化弹框
  initCSS2DPopup();
  // // 创建省份名称对象
  // createProvinceName();
  // 创建粒子
  createParticles();

  // 加载中国地图
  await initMap();
  // 初始化鼠标移入地图浮动效果
  initMapFloat(camera, currentShowModel);
  // 初始化点击事件
  initClickEvent();
  scene.add(
    nationMapModel,
    gridHelper,
    meshPoint,
    outerCircle,
    innerCircle,
    diffuseCircle,
    gradientPlane,
    provinceMapModel,
    cityMapModel,
    particles
  );
  // 设置需要辉光物体
  glowArr = [...cylinderGlowArr];
  // 开始循环渲染
  render();

  // 需要展示全国则注释掉regionSetMap函数调用
  // regionSetMap('湖北省')

  // 首次进入动画
  eventAnimation(camera, controls);
});

// 循环渲染
function render() {
  requestAnimationFrame(render);
  camera.updateProjectionMatrix();
  controls.update();
  // 两帧渲染间隔
  let deltaTime = clock.getDelta();
  // 地图模型侧边渐变效果
  mapUf.uTime.value += deltaTime;
  if (mapUf.uTime.value >= 5) {
    mapUf.uTime.value = 0.0;
  }
  if (rightButItem[0].selected) apertureAnimation(); // 光圈缩放动画
  particlesUpdate(); // 粒子动画
  // 背景外圈内圈旋转
  outerCircle.rotation.z -= 0.003;
  innerCircle.rotation.z += 0.003;
  // 波纹扩散动画
  circleUf.uTime.value += deltaTime;
  if (circleUf.uTime.value >= 6) {
    circleUf.uTime.value = 0.0;
  }
  // TWEEN更新
  TWEEN.update();
  // 将场景内的物体材质设置为黑色
  scene.traverse(darkenMaterial);
  // 渲染辉光
  composer.render();
  // 还原材质
  scene.traverse(restoreMaterial);
  // 最终渲染
  finalComposer.render();
  css3DRenderer.render(scene, camera);
  css2DRenderer.render(scene, camera);
}

// 右侧按钮点击事件
function rightButClick(e, item) {
  // 当前按钮点击项
  let clickItem;
  //  代码中触发的点击项
  if (item) {
    clickItem = item;
  }
  // 用户手动点击触发的点击项
  else {
    const value = e.target.getAttribute("value");
    clickItem = rightButItem.filter((obj) => obj.value === value)[0];
    clickItem.selected = !clickItem.selected;
  }

  if (clickItem.selected) {
    currentShowModel.value.traverse((item) => {
      if (item.name === clickItem.name) {
        item.traverse((item) => (item.visible = true));
      }
    });
  } else {
    currentShowModel.value.traverse((item) => {
      if (item.name === clickItem.name) {
        item.traverse((item) => (item.visible = false));
      }
    });
  }
}

// 弹框关闭事件
function popupClose() {
  // outlineModel存在
  if (outlineModel) {
    outlinePass.selectedObjects = [];
    rayObj.remove(outlineModel);
    // 给弹框清除创建渐变动画
    new TWEEN.Tween({ opacity: 1 })
      .to({ opacity: 0 }, 500)
      .onUpdate(function (obj) {
        //动态更新div元素透明度
        popupDiv.style.opacity = obj.opacity;
      })
      .onComplete(function () {
        // 清除弹框
        rayObj.remove(css2Dpopup);
      })
      .start();
  }
}

// 将材质设置成黑色
function darkenMaterial(obj) {
  if (obj.visible) {
    if (obj instanceof THREE.Scene) {
      obj.background = null;
    }
    const material = obj.material;
    if (material && !glowArr.includes(obj) && !material.isShaderMaterial) {
      obj.originalMaterial = obj.material;
      const Proto = Object.getPrototypeOf(material).constructor;
      obj.material = new Proto({ color: new THREE.Color("#000") });
    }
  }
}

// 还原材质
function restoreMaterial(obj) {
  if (obj.visible) {
    if (!obj.originalMaterial) return;
    obj.material = obj.originalMaterial;
    delete obj.originalMaterial;
  }
}

// 初始化CSS2D弹框
function initCSS2DPopup() {
  popupDiv = document.getElementById("popup");
  const widthScale = window.innerWidth / 1920;
  const heightScale = window.innerHeight / 941;
  popupDiv.style.top += (37 * heightScale).toFixed(2) + "px";
  popupDiv.style.left += (390 * widthScale).toFixed(2) + "px";
  // 转换为CSS2D对象
  css2Dpopup = new CSS2DObject(popupDiv);
  css2Dpopup.name = "弹框";
  // 设置一个较高的渲染顺序，防止弹框被标牌等物体遮挡住
  css2Dpopup.renderOrder = 99;
}

// 初始化点击事件
function initClickEvent() {
  // 左键点击定时器
  let leftClickTimer = null;
  // 右键点击定时器
  let rightClickTimer = null;
  // 左键跟踪连续点击的次数
  let leftClickCount = 0;
  // 右键跟踪连续点击的次数
  let rightClickCount = 0;
  // 延迟时间
  const delay = 300;
  // 添加左键点击事件，双击进入下一层地图(国=>省=>市)
  addEventListener("click", function (event) {
    // 每次点击时增加点击次数
    leftClickCount++;
    // 如果已经有定时器在运行，重置定时器
    if (leftClickTimer) {
      clearTimeout(leftClickTimer);
    }
    // 设置定时器，如果用户停止点击，将根据点击次数决定触发何种事件
    leftClickTimer = setTimeout(() => {
      // 点击次数超过2次以上都视为双击
      if (leftClickCount >= 2) {
        // 当为市级地图时没有下一层了，跳出不执行后续的代码
        if (mapStatus.value === "市") return;
        // 射线检测
        const testResult = rayTest(event, currentShowModel.value);
        // 检测到模型时
        if (testResult.length) {
          // 双击处理
          doubleClickHandle(testResult, "left");
        }
      }
      // 点击次数为1则为单击事件
      else {
        // 射线检测
        const testResult = rayTest(event, currentShowModel.value);
        // 检测到模型在进行下一步处理
        if (testResult.length) oneClickHandle(testResult);
        // 未检测到则触发弹框关闭事件
        // else popupClose();
      }
      // 重置计数器和定时器
      leftClickTimer = null;
      leftClickCount = 0;
    }, delay);
  });

  // 添加右键点击事件，双击返回上一层地图(市=>省=>国)
  addEventListener("contextmenu", function (event) {
    // 每次点击时增加点击次数
    rightClickCount++;

    // 如果已经有定时器在运行，重置定时器
    if (rightClickTimer) {
      clearTimeout(rightClickTimer);
    }
    // 设置定时器，如果用户停止点击，将根据点击次数决定触发何种事件
    rightClickTimer = setTimeout(() => {
      // 点击次数超过2次以上都视为双击
      if (rightClickCount >= 2) {
        // 当为国级地图时没有上一层了，跳出不执行后续的代码
        if (mapStatus.value === "国") return;
        // 双击处理
        doubleClickHandle(null, "right");
      }
      // 重置计数器和定时器
      rightClickTimer = null;
      rightClickCount = 0;
    }, delay);
  });
}

// 射线检测
function rayTest(event, model) {
  const px = event.offsetX;
  const py = event.offsetY;
  // 屏幕坐标转为标准设备坐标
  const x = (px / window.innerWidth) * 2 - 1;
  const y = -(py / window.innerHeight) * 2 + 1;
  // 创建射线
  const raycaster = new THREE.Raycaster();
  // 设置射线参数
  raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
  // 射线交叉计算拾取模型
  let intersects = raycaster.intersectObjects(model.children);
  // 检测结果过滤
  intersects = intersects.filter(function (intersect) {
    return (
      intersect.object.name !== "边线" &&
      intersect.object.name !== "地图名称" &&
      intersect.object.name !== "光圈" &&
      intersect.object.name !== "光柱" &&
      intersect.object.name !== "标牌"
    );
  });
  return intersects;
}

// 地图状态切换
function mapStatusSwitch(e) {
  // 地图状态数组
  const mapStatusArr = ["国", "省", "市"];
  // 当前地图状态在mapStatusArr中的下标位置
  let index = mapStatusArr.indexOf(mapStatus.value);
  // left表示鼠标左键双击触发，地图状态进入下一层，国=>省=>市
  if (e === "left") {
    index++;
  }
  // right表示鼠标右键键双击触发，地图状态返回上一层，市=>省=>国
  else if (e === "right") {
    index--;
  }
  // 重新定义地图状态
  if (mapStatusArr[index]) mapStatus.value = mapStatusArr[index];
}

// 单击处理
function oneClickHandle(rel) {
  // 清除上一次添加的描边模型
  if (rayObj) {
    rayObj.remove(outlineModel);
  }
  // 射线选中模型
  rayObj = rel[0].object.parent;

  // 添加弹框到选中模型rayObj中去
  rayObj.add(css2Dpopup);
  // 获取选中模型的位置
  const center = rayObj.userData.center;
  // 设置弹框位置
  css2Dpopup.visible = true;
  css2Dpopup.position.set(center[0], center[1], 0);
  // 弹框名称元素
  const popupNameDiv = css2Dpopup.element.querySelector("#popup_Name");
  // 更换弹框名称
  popupNameDiv.innerHTML = rayObj.name;
  // 给弹框显示创建渐变动画
  new TWEEN.Tween({ opacity: 0 })
    .to({ opacity: 1.0 }, 500)
    .onUpdate(function (obj) {
      //动态更新div元素透明度
      popupDiv.style.opacity = obj.opacity;
    })
    .start();

  // 地图边线数据
  const mapLineData = rayObj.userData.mapData;
  // 创建shape对象
  const shape = new THREE.Shape();
  // 当数据为多个多边形时
  if (mapLineData.type === "MultiPolygon") {
    // 遍历数据，绘制shape对象数据
    mapLineData.coordinates.forEach((coordinate, index) => {
      if (index === 0) {
        coordinate.forEach((rows) => {
          rows.forEach((row) => {
            const [x, y] = projection(row);
            if (index === 0) {
              shape.moveTo(x, y);
            }
            shape.lineTo(x, y);
          });
        });
      }
    });
  }
  // 当数据为单个多边形时
  if (mapLineData.type === "Polygon") {
    mapLineData.coordinates.forEach((coordinate) => {
      // 遍历数据，绘制shape对象数据
      mapLineData.coordinates.forEach((rows, index) => {
        if (index === 0) {
          rows.forEach((row) => {
            const [x, y] = projection(row);
            if (index === 0) {
              shape.moveTo(x, y);
            }
            shape.lineTo(x, y);
          });
        }
      });
    });
  }
  // 创建形状几何体，shape对象作为参数
  const geometry = new THREE.ShapeGeometry(shape);
  const material = new THREE.MeshBasicMaterial({
    color: rayObj.children[0].material[0].color,
    map: rayObj.children[0].material[0].map,
    side: THREE.DoubleSide,
  });
  let mesh = new THREE.Mesh(geometry, material);
  mesh.rotateX(-Math.PI);
  mesh.name = "描边模型";
  outlineModel = mesh;
  rayObj.add(outlineModel);
  // 设置描边模型进行发光
  outlinePass.selectedObjects = [outlineModel];
  glowArr.pop();
  glowArr.push(outlineModel);
}

function codeSetMapStatus(code) {
  const cityCode = code.substring(2, 4);
  const districtCode = code.substring(4, 6);
  if (code === "100000") {
    mapStatus.value = "国";
  } else if (cityCode === "00" && districtCode === "00") {
    mapStatus.value = "省";
  } else if (districtCode === "00") {
    mapStatus.value = "市";
  }
}

function regionSetMap(regionName) {
  // 隐藏地图状态切换之前的模型
  currentShowModel.value.traverse((item) => {
    item.visible = false;
  });
  const code = regionCode[regionName];
  codeSetMapStatus(code);
  let url = `http://211.143.122.110:18062/mapdata/geojson/areas_v3_full/all/${code}.json`;
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        // 如果响应状态码不是2xx，抛出错误
        throw new Error("Network response was not ok: " + response.statusText);
      }
      // 响应成功，返回解析的JSON数据
      return response.json();
    })
    .then(async (data) => {
      await new Promise((resolve) => {
        // 处理地图数据，绘制模型
        handleMapData(data, 1, resolve);
        // 全国模型的包围盒
        const nationModelBox = new THREE.Box3().setFromObject(nationMapModel);
        // 当前射线选中模型的包围盒
        let currentModelbox;
        // 市级地图切换到市级地图时，市级地图是经过了一次缩放的，需要还原缩放比例进行计算
        if (mapStatus.value === "市") {
          const cloneModel = currentShowModel.value.clone();
          cloneModel.scale.set(1, 1, 1);
          currentModelbox = new THREE.Box3().setFromObject(cloneModel);
        } else {
          currentModelbox = new THREE.Box3().setFromObject(
            currentShowModel.value
          );
        }
        // 计算宽度和高度
        const widthA = nationModelBox.max.x - nationModelBox.min.x;
        const heightA = nationModelBox.max.z - nationModelBox.min.z;
        const widthB = currentModelbox.max.x - currentModelbox.min.x;
        const heightB = currentModelbox.max.z - currentModelbox.min.z;
        // 计算宽度和高度的比例
        const widthRatio = widthA / widthB;
        const heightRatio = heightA / heightB;
        // 当前模型与全国模型大小的缩放值
        const scale = (widthRatio + heightRatio) / 2;
        // 应用缩放值到切换后的模型上去
        currentShowModel.value.scale.set(scale, scale, 1);
        currentShowModel.value.traverse((item) => {
          if (item.name.includes("名称对象")) {
            item.scale.set(0.2 / scale, 0.2 / scale, 0.2 / scale);
          }

          if (item.name == "光柱") {
            item.scale.set(1 / scale, 1, 1 / scale);
          }
        });

        // 这时候计算省份模型，得出放大后的省份模型的中心点，并将其位置归于原点
        const scaledBox = new THREE.Box3().setFromObject(
          currentShowModel.value
        );
        const center = new THREE.Vector3();
        // 获取放大后模型的中心点
        scaledBox.getCenter(center);
        // 将模型的位置调整，使缩放后的中心位于原点
        currentShowModel.value.position.sub(center);
        // 高度不增加
        currentShowModel.value.position.y += center.y;
        // 显示地图状态切换之后的模型
        currentShowModel.value.traverse((item) => {
          item.visible = true;
        });
        glowArr = [...cylinderGlowArr];
        // 触发右侧按钮点击事件
        rightButItem.map((item) => {
          rightButClick(null, item);
        });
      });
    });
}

// 双击处理
function doubleClickHandle(rel, type) {
  console.log(rel, "rel");
  // 隐藏地图状态切换之前的模型
  currentShowModel.value.traverse((item) => {
    item.visible = false;
  });

  // 左键双击进入地图下一层
  if (type === "left") {
    // 地图状态切换，国=>省=>市
    mapStatusSwitch("left");
    // 射线检测到的模型
    const relModel = rel[0].object.parent;
    // 地图code，用于获取数据
    const adcode = relModel.userData.adcode;
    let url = `http://211.143.122.110:18062/mapdata/geojson/areas_v3_full/all/${adcode}.json`;
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          // 如果响应状态码不是2xx，抛出错误
          throw new Error(
            "Network response was not ok: " + response.statusText
          );
        }
        // 响应成功，返回解析的JSON数据
        return response.json();
      })
      .then(async (data) => {
        await new Promise((resolve) => {
          // 全国模型的包围盒
          const nationModelBox = new THREE.Box3().setFromObject(nationMapModel);
          // 当前射线选中模型的包围盒
          let currentModelbox;
          // 市级地图切换到市级地图时，市级地图是经过了一次缩放的，需要还原缩放比例进行计算
          if (mapStatus.value === "市") {
            const cloneModel = relModel.clone();
            cloneModel.scale.set(1, 1, 1);
            currentModelbox = new THREE.Box3().setFromObject(cloneModel);
          } else {
            currentModelbox = new THREE.Box3().setFromObject(relModel);
          }
          // 计算宽度和高度
          const widthA = nationModelBox.max.x - nationModelBox.min.x;
          const heightA = nationModelBox.max.z - nationModelBox.min.z;
          const widthB = currentModelbox.max.x - currentModelbox.min.x;
          const heightB = currentModelbox.max.z - currentModelbox.min.z;
          // 计算宽度和高度的比例
          const widthRatio = widthA / widthB;
          const heightRatio = heightA / heightB;
          // 当前模型与全国模型大小的缩放值
          const scale = (widthRatio + heightRatio) / 2;
          // 应用缩放值到切换后的模型上去
          currentShowModel.value.scale.set(scale, scale, 1);
          // 处理地图数据，绘制模型
          handleMapData(data, scale, resolve);
          // 这时候计算省份模型，得出放大后的省份模型的中心点，并将其位置归于原点
          const scaledBox = new THREE.Box3().setFromObject(
            currentShowModel.value
          );
          const center = new THREE.Vector3();
          // 获取放大后模型的中心点
          scaledBox.getCenter(center);
          // 将模型的位置调整，使缩放后的中心位于原点
          currentShowModel.value.position.sub(center);
          // 高度不增加
          currentShowModel.value.position.y += center.y;
          // 显示地图状态切换之后的模型
          currentShowModel.value.traverse((item) => {
            item.visible = true;
          });
          glowArr = [...cylinderGlowArr];
          // 触发右侧按钮点击事件
          rightButItem.map((item) => {
            rightButClick(null, item);
          });
        });
      });
  }

  // 右键双击返回地图上一层
  if (type === "right") {
    // 全国地图是固定的，省模型、市模型需要清除掉之前的子对象
    if (mapStatus.value !== "国") {
      currentShowModel.value.traverse((item) => {
        // 弹框、标牌等这些为CSS2D和CSS3D对象，要清除其在页面中的dom元素
        if (item.element) {
          if (item.element.parentNode)
            item.element.parentNode.removeChild(item.element);
        }
        if (item.geometry && item.material) {
          // 从内存中销毁几何体资源
          item.geometry.dispose();
          // 从内存中销毁材质资源
          if (item.material.length) {
            item.material[0].dispose();
            item.material[1].dispose();
          } else {
            item.material.dispose();
          }
        }
      });
      currentShowModel.value.children = [];
    }
    // 地图状态切换，市=>省=>国
    mapStatusSwitch("right");
    if (mapStatus.value === "国") rightButton.value.style.display = "block";
    // 地图状态转换完成后显示对应的地图
    currentShowModel.value.traverse((item) => {
      item.visible = true;
    });
    // 触发右侧按钮点击事件
    rightButItem.map((item) => {
      rightButClick(null, item);
    });
  }
}

// 处理地图数据，绘制模型
function handleMapData(data, scale, resolve) {
  // 全部信息
  const features = data.features;
  features.map((feature) => {
    const name = feature.properties.name;
    // 海南省三沙市范围太广不方便展示所以跳过
    if (name === "三沙市") {
      return;
    }
    // 模型
    const model = new THREE.Object3D();
    model.name = name;
    model.userData.animationActive = false; // 新增属性来跟踪动画状态
    model.userData.animationTimer = null; // 用于存储定时器的引用
    model.userData.adcode = feature.properties.adcode; // 用于存储定时器的引用
    currentShowModel.value.add(model);
    // 模型中心坐标
    const pos = feature.properties.centroid
      ? feature.properties.centroid
      : feature.properties.center;
    // 获取地图名称dom
    const nameDom = document.getElementById("provinceName").cloneNode();
    // 设置dom文本
    nameDom.innerHTML = name;
    // 转为CSS3D对象
    const css3DObject = new CSS3DObject(nameDom);
    css3DObject.rotateX(Math.PI);
    css3DObject.name = "名称对象";
    // 这里转换完成后将元素pointerEvents属性设置为none，防止阻碍相机旋转缩放平移等操作
    nameDom.style.pointerEvents = "none";
    // 设置名称对象在模型中心位置
    const [x, y] = projection(pos);
    css3DObject.position.set(x, -y, 0);
    css3DObject.rotateX(Math.PI);
    // 缩放一定大小
    css3DObject.scale.set(0.2 / scale, 0.2 / scale, 0.2 / scale);

    const coordinates = feature.geometry.coordinates;
    // 绘制模型和边界线
    if (feature.geometry.type === "MultiPolygon") {
      coordinates.forEach((coordinate) => {
        coordinate.forEach((rows) => {
          // 城市模型
          const mesh = darwMapModel(rows);
          mesh.rotateX(Math.PI);
          model.add(mesh);
          // 边线
          const line = lineDraw(rows);
          line.name = "边线";
          line.position.z += 0.15;
          model.add(line, css3DObject);
        });
      });
    }
    // 绘制模型和边界线
    if (feature.geometry.type === "Polygon") {
      coordinates.forEach((coordinate) => {
        // 选中省份模型的材质，将继续应用到地级市模型上
        // 城市模型
        const mesh = darwMapModel(coordinate);
        mesh.rotateX(Math.PI);
        model.add(mesh);
        // 边线
        const line = lineDraw(coordinate);
        line.position.z += 0.15;
        line.name = "边线";
        model.add(line, css3DObject);
      });
    }

    // 转换成平面坐标
    const center = projection(pos);
    center[1] = -center[1];
    // 储存中心位置
    model.userData.center = center;
    // 存储地图数据
    model.userData.mapData = feature.geometry;
    // 创建地图标牌
    const mapTag = createMapTag(
      {
        name: name,
        x: center[0],
        y: center[1],
      },
      Math.random() * 30 + 70
    );
    // 创建光柱
    const cylinder = createCylinder(
      {
        name: name,
        x: center[0],
        y: center[1],
      },
      Math.random() * 30000 + 70000,
      scale
    );
    model.add(mapTag, cylinder);
  });
  resolve();
}

// 绘制地图模型
function darwMapModel(polygon) {
  // 创建形状
  const shape = new THREE.Shape();
  // 遍历坐标数组，绘制形状
  polygon.forEach((row, i) => {
    // 坐标点转换
    const [x, y] = projection(row);
    if (i === 0) {
      shape.moveTo(x, y);
    }
    shape.lineTo(x, y);
  });
  // 将形状进行拉伸
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 10,
    bevelEnabled: true,
    bevelSegments: 10,
    bevelThickness: 0.1,
  });
  // const topMaterial = materialArr[0].clone();
  // const sideMaterial = materialArr[1];
  const mesh = new THREE.Mesh(geometry, [topMaterial, sideMaterial]);
  return mesh;
}

// 绘制边界线
function lineDraw(polygon) {
  const lineGeometry = new THREE.BufferGeometry();
  const pointsArray = new Array();
  polygon.forEach((row) => {
    const [x, y] = projection(row);
    // 创建三维点
    pointsArray.push(new THREE.Vector3(x, -y, 0));
  });
  // 放入多个点
  lineGeometry.setFromPoints(pointsArray);
  const lineMaterial = new THREE.LineBasicMaterial({
    color: "#00ffff",
    // color: "#00C5CD",
  });
  return new THREE.Line(lineGeometry, lineMaterial);
}
</script>
<style lang="less">
body,
html {
  font-size: 0.8vw;
}

/* 当视口宽度小于 600 像素时，设置最小字体大小 */
@media (max-width: 1400px) {
  #mapTag {
    font-size: 12px !important;
    width: 80px !important;
    height: 30px !important;
  }
}

#chinaMap {
  width: 100%;
  height: 100%;
  position: absolute;
  overflow: hidden;
}

#threejs {
  width: 100%;
  height: 100%;
}

.rightButton {
  position: absolute;
  right: 1vw;
  bottom: 40vh;
  width: 4vw;

  .common {
    width: 100%;
    height: 3vh;
    border: 1px solid #00ffff;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 1.2vh 0;
    color: #fafafa;
    opacity: 0.5;
    font-size: 0.7vw;
    cursor: pointer;
    transition: 1s;
  }

  .selected {
    opacity: 1 !important;
    transition: 1s;
  }
}

#provinceName {
  pointer-events: none;
  position: absolute;
  left: 0;
  top: 0;
  color: #8ee5ee;
  padding: 10px;
  width: 200px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  font-size: 13px;
}

#popup {
  z-index: 999;
  position: absolute;
  left: 0px;
  top: 0px;
  width: 41.66vw;
  height: 26.59vh;
  display: flex;

  .popup_line {
    margin-top: 4%;
    width: 24%;
    height: 26%;
    background: url("../../public/popup_line.png") no-repeat;
    background-size: 100% 100%;
  }

  .popup_Main {
    width: 35%;
    height: 80%;

    .popupMain_top {
      width: 100%;
      height: 10%;
      background: url("../../public/popupMain_head.png") no-repeat;
      background-size: 100% 100%;
    }

    .popupMain_footer {
      width: 100%;
      height: 10%;
      background: url("../../public/popupMain_footer.png") no-repeat;
      background-size: 100% 100%;
    }

    .popup_content {
      color: #fafafa;
      // background: rgba(47, 53, 121, 0.9);
      background-image: linear-gradient(
        to bottom,
        rgba(15, 36, 77, 1),
        rgba(8, 124, 190, 1)
      );
      border-radius: 10px;
      width: 100%;
      height: 70%;
      padding: 5% 0%;

      .popup_head {
        width: 100%;
        height: 12%;
        margin-bottom: 2%;
        display: flex;
        align-items: center;

        .popup_title {
          color: #8ee5ee;
          font-size: 1vw;
          letter-spacing: 5px;
          width: 88%;
          height: 100%;
          display: flex;
          align-items: center;

          .title_icon {
            width: 0.33vw;
            height: 100%;
            background: #2586ff;
            margin-right: 10%;
          }
        }

        .close {
          cursor: pointer;
          pointer-events: auto;
          width: 1.5vw;
          height: 1.5vw;
          background: url("../../public/close.png") no-repeat;
          background-size: 100% 100%;
        }
      }

      .popup_item {
        display: flex;
        align-items: center;
        width: 85%;
        padding-left: 5%;
        height: 18%;
        // background: rgb(160, 196, 221);
        border-radius: 10px;
        margin: 2.5% 0%;
        margin-left: 10%;

        div {
          line-height: 100%;
          margin-right: 10%;
        }

        .item_value {
          font-size: 0.9vw;
          color: #00ffff;
          font-weight: 600;
          letter-spacing: 2px;
        }
      }
    }
  }
}

#cylinderValue {
  position: absolute;
  top: 0;
  left: 0;
  color: #bbffff;
}

#mapTag {
  z-index: 997;
  position: absolute;
  top: 0;
  left: 0;
  font-size: 0.6vw;
  width: 4.2vw;
  height: 4.7vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .content {
    width: 100%;
    height: calc(100% - 1vw);
    // background: #0e1937;
    background: #0e2346;
    border: 1px solid #6298a9;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fafafa;

    #mapTag_value {
      color: #ffd700;
    }
  }

  .content::before {
    content: "";
    width: 100%;
    height: calc(100% - 1vw);
    position: absolute;
    background: linear-gradient(to top, #26aad1, #26aad1) left top no-repeat,
      //上左
      linear-gradient(to right, #26aad1, #26aad1) left top no-repeat,
      linear-gradient(to top, #26aad1, #26aad1) right bottom no-repeat,
      //下右
      linear-gradient(to left, #26aad1, #26aad1) right bottom no-repeat; //右下
    background-size: 2px 10px, 16px 2px, 2px 10px, 16px 2px;
    pointer-events: none;
  }

  .arrow {
    background: url("../../public/arrow.png") no-repeat;
    background-size: 100% 100%;
    width: 1vw;
    height: 1vw;
  }
}
</style>

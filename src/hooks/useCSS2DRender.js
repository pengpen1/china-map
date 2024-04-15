import {
  CSS2DObject,
  CSS2DRenderer,
} from "three/examples/jsm/renderers/CSS2DRenderer";
export default function useCSS2DRender() {
  /**
   * 初始化标签-
   * @param {*} options 参数
   * @param {*} container canvas内容容器
   * @returns
   */
  const initCSS2DRender = (options, container) => {
    let { width, height } = options; // 获取世界的宽高
    let css2dRender = new CSS2DRenderer(); // 实例化css2d渲染器
    css2dRender.setSize(width, height); // 设置渲染器的尺寸
    css2dRender.domElement.style.position = "absolute"; // 设置定位位置
    css2dRender.domElement.style.left = "0px";
    css2dRender.domElement.style.top = "0px";
    css2dRender.domElement.style.pointerEvents = "none"; // 设置不能背选中
    container.appendChild(css2dRender.domElement); // 插入到容器当中
    return css2dRender;
  };
  /**
   * 创建2d标签
   * @param {*} name  标签内容
   * @param {*} className 标签class
   * @returns
   */
  const create2DTag = (name = "", className = "") => {
    let tag = document.createElement("div");
    // tag.innerHTML = name;
    tag.className = className;
    tag.style.pointerEvents = "none";
    tag.style.visibility = "hidden";
    tag.style.position = "absolute";
    // 如果className不存在，用以下样式
    if (!className) {
      tag.style.padding = "4px";
      tag.style.color = "#fff";
      tag.style.fontSize = "12px";
      tag.style.textAlign = "center";
      tag.style.background = "rgba(0,0,0,0.6)";
      // tag.style.borderRadius = "4px";
    }
    let label = new CSS2DObject(tag);
    /**
     * 标签显示，
     * @param {*} name 显示内容
     * @param {*} point 显示坐标
     */
    label.show = (name, point) => {
      const labelWrap = document.createElement("div");
      labelWrap.innerHTML = name;
      labelWrap.style.color = "#fff";
      labelWrap.style.background = "rgba(198,195,195,0.6)";
      labelWrap.style.padding = "2px 4px";

      // const otherWrap = document.createElement("div");
      // otherWrap.innerHTML = "拼音或者上报情况";
      // otherWrap.style.color = "#fff";
      // otherWrap.style.padding = "2px 4px";

      // label.element.append(labelWrap, otherWrap);
      label.element.append(labelWrap);
      label.element.style.visibility = "visible";
      label.element.style.display = "flex";
      label.position.copy(point);
    };
    /**
     * 隐藏
     */
    label.hide = () => {
      label.element.style.visibility = "hidden";
    };
    return label;
  };
  return {
    initCSS2DRender,
    create2DTag,
  };
}

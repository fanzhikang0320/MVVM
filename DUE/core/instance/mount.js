import VNode from "../vdom/vnode.js";
import { prepareRender } from "./render.js";
import { vmodel } from "./grammer/vmodel.js";
import { vforInit } from "./grammer/vfor.js";
import { mergeAttr } from '../utils/ObjectUtil.js'

export function initMount (Due) {
    Due.prototype.$mount = function (el) {
        let vm = this;
        let rootDom =  document.getElementById(el);
        mount(vm,rootDom);
    }
}


export function mount (vm,el) {
    //进行挂载
    vm._vnode = constructVNode(vm,el,null);

    //进行预备渲染(通过模板找vnode，通过vnode找模板)
    prepareRender(vm,vm._vnode);
}


function constructVNode (vm,elm,parent) {
   
    let vnode =  analysisAttr(vm,elm,parent);
    if (vnode == null) {
        let children = [];
        let text = getNodeText(elm);
        let data = null;
        let nodeType = elm.nodeType;
        let tag = elm.nodeName;
        //创建虚拟节点
        vnode = new VNode(tag,elm,children,text,data,parent,nodeType);
        if (elm.nodeType == 1 && elm.getAttribute('env')) {
            vnode.env = mergeAttr(vnode.env,JSON.parse(elm.getAttribute('env')));
        } else {
            vnode.env = mergeAttr(vnode.env,parent ? parent.env : {});
        }
    }
    
    let childs = vnode.elm.childNodes;  //获取真实dom当中的子节点
    for (let i = 0 ; i < childs.length ; i++) {

        let childNodes = constructVNode(vm,childs[i],vnode);

        if (childNodes instanceof VNode) {
            vnode.children.push(childNodes);
        } else {
            vnode.children = vnode.children.concat(childNodes);
        }
    }
    return vnode;
}

/**
 * 获取文本节点当中的文本
 * @param {*} elm 真实的dom
 */
function getNodeText (elm) {

    if (elm.nodeType == 3) {
        return elm.nodeValue;
    } else {
        return '';
    }
}

/**
 * 分析属性
 * @param {*} vm 
 * @param {*} elm 
 * @param {*} parent 
 */
function analysisAttr (vm,elm,parent) {
    if (elm.nodeType == 1) {
        let attrNames = elm.getAttributeNames();
        //查看属性当中是否含有v-model
        if (attrNames.indexOf('v-model') > -1) {
            vmodel(vm,elm,elm.getAttribute('v-model'));
        }
        if (attrNames.indexOf('v-for') > -1) {
            return vforInit(vm,elm,parent,elm.getAttribute('v-for'));
        }

    }
}




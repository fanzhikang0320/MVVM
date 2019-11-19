import { getValue } from "../utils/ObjectUtil.js";


// 通过模板找到哪些节点用到了这个模板

let template2Vnode = new Map();

// 通过节点，找到这个节点下有哪些模板
let vnode2Template = new Map();

/**
 * 为Due原型上面添加_render方法
 * @param {*} Due 
 */
export function renderMixin (Due) {
    Due.prototype._render = function () {
        renderNode(this,this._vnode);
    }
}



export function renderData (vm,data) {
    let vnodes = template2Vnode.get(data);
    if (vnodes != null) {
        for (let i = 0 ; i < vnodes.length ; i++) {
            renderNode(vm,vnodes[i]);
        }
    }
}






/**
 * 把数据渲染到节点上面
 * @param {*} vm 
 * @param {*} vnode 
 */
export function renderNode (vm,vnode) {
    //是个文本节点就渲染
    if (vnode.nodeType == 3) {
        let templates = vnode2Template.get(vnode);
        
        if (templates) {
            let result = vnode.text;
            for (let i = 0 ; i < templates.length ; i++) {
                let templateValue = getTemplateValue([vm._data],templates[i]);   //当前节点的参数可以来自Due对象，也可以来自父级
                
                if (templateValue) {
                    result = result.replace('{{' + templates[i] + '}}',templateValue);
                }
            
            }
            // 把原来模板替换成data当中对应的值
            vnode.elm.nodeValue = result;
        }
    } else if (vnode.nodeType == 1 && vnode.tag == 'INPUT') {
        let templates = vnode2Template.get(vnode);
        if (templates) {
            for (let i = 0 ; i < templates.length ; i ++) {
                let templateValue = getTemplateValue([vm._data,vnode.env],templates[i]);
                if (templateValue) {
                    vnode.elm.value = templateValue;
                }
            }
        }
    } else {
        for (let i = 0 ; i < vnode.children.length ; i++) {
            renderNode(vm,vnode.children[i]);
        }
    }
}


export function prepareRender (vm,vnode) {
    if (vnode == null) return;

    // 文本节点
    if (vnode.nodeType == 3) {
        analysisTemplateString(vnode);
    }
    analysisAttr(vm,vnode);
    //标签
    if (vnode.nodeType == 1) {
        for (let i = 0 ; i < vnode.children.length ; i++) {
            prepareRender(vm,vnode.children[i]);
        }
    }
}

/**
 * 分析模板字符串（也就是分析文本节点当中有没有“{{}}”）
 * @param {*} vnode 
 */
function analysisTemplateString (vnode) {
    let templateStringList =  vnode.text.match(/{{[a-zA-Z0-9_.]+}}/g);

    for (let i = 0 ; templateStringList && i < templateStringList.length; i++) {
        setTemplate2Vnode(templateStringList[i],vnode);
        setVnode2Template(templateStringList[i],vnode);
    }
}

// 建立映射关系
function setTemplate2Vnode (template,vnode) {
    let templateName = getTemplateName(template);
    let vnodeSet = template2Vnode.get(templateName); //先去看有没有

    if (vnodeSet) {
        vnodeSet.push(vnode);
    } else {
        template2Vnode.set(templateName,[vnode]);
    }
}
function setVnode2Template (template,vnode) {
    let templateSet = vnode2Template.get(vnode);

    if (templateSet) {
        templateSet.push(getTemplateName(template));
    } else {
        vnode2Template.set(vnode,[getTemplateName(template)]);
    }
}

function getTemplateName (template) {
    //判断是否有“{{}}”，如果有就解掉，没有直接返回
    if (template.substring(0,2) == '{{' && template.substring(template.length - 2 , template.length) == '}}' ){
        //把‘{{}}’中间的内容给返回出去
        return template.substring(2,template.length - 2);
    } else {
        return template;
    }


}


function getTemplateValue (objs,templateName) {

    for (let i = 0 ; i < objs.length ; i ++) {
        let temp = getValue(objs[i],templateName);
        if (temp != null) {
            return temp;
        }
    }

    return null;
}

function analysisAttr (vm,vnode) {
    if (vnode.nodeType != 1) {
        return;
    }
    let attrNames = vnode.elm.getAttributeNames();
    if (attrNames.indexOf('v-model') > -1) {
        setTemplate2Vnode(vnode.elm.getAttribute('v-model'),vnode);
        setVnode2Template(vnode.elm.getAttribute('v-model'),vnode);
    }

}

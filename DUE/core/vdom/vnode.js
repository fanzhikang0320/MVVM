
/**
 * 构建虚拟节点
 */
export default class VNode {
    /**
     * 
     * @param {*} tag 标签类型
     * @param {*} element 对应的真实节点
     * @param {*} children 当前节点下的子节点
     * @param {*} text 当前虚拟节点当中的文本
     * @param {*} data 暂时保留，无意义
     * @param {*} parent 父级节点
     * @param {*} nodeType 节点类型
     */
    constructor (tag,elm,children,text,data,parent,nodeType) {
        this.tag = tag;
        this.elm = elm;
        this.children = children;
        this.text = text;
        this.data = data;
        this.parent = parent;
        this.nodeType = nodeType;
        this.env = {};  //当前节点的环境变量

        this.instructions = null;   //存放指令
        this.template = []; //当前这个节点涉及到的模板
    }
}
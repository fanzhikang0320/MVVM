import { renderData } from "./render.js";

/**
 * 用来处理对象的代理
 * @param {*} vm Due对象
 * @param {*} obj 要代理的对象
 * @param {*} namespace 命名空间
 */
function constructObjectProxy (vm,obj,namespace) {

    let proxyObj = {};

    // 为对象当中的所有属性进行代理
    for (let prop in obj) {
        Object.defineProperty(proxyObj,prop,{
            configurable:true,
            get () {
                return obj[prop];
            },
            set: function (value) {
                obj[prop] = value;
                renderData(vm,getNameSpace(namespace,prop));
            }
        });
        //给vm实例上面的属性进行代理
        Object.defineProperty(vm,prop,{
            configurable:true,
            get () {
                return obj[prop];
            },
            set: function (value) {
                obj[prop] = value;
                // console.log(prop);
                // console.log(getNameSpace(namespace,prop));
                renderData(vm,getNameSpace(namespace,prop));
            }
        });
        // 如果代理对象当中属性值还是对象，则需要递归进行再次代理，要不然还是监测不到属性值得变化
        if (obj[prop] instanceof Object) {
            proxyObj[prop] = constructProxy(vm,obj[prop],getNameSpace(namespace,prop))
        }
    }
    return proxyObj;
}


/**
 * 代理数组
 * @param {*} vm Due对象
 * @param {*} arr 要代理的数组
 * @param {*} namespace 命名空间
 */
function proxyArr (vm,arr,namespace) {
    let obj = {
        eleType:'Array',
        toString:function () {
            let result = '';
            for (let i = 0 ; i < arr.length ; i++) {
                result += arr[i] + ', ';
            }
            // 返回的字符串要把后面的空格和逗号去掉
            return result.substring(0,result.length - 2);
        },
        push: function () {

        },
        pop: function () {

        },
        shift: function () {

        },
        unshift:function () {

        }
    };

    defArrayFunc.call(vm,obj,'push',namespace,vm);
    defArrayFunc.call(vm,obj,'pop',namespace,vm);
    defArrayFunc.call(vm,obj,'shift',namespace,vm);
    defArrayFunc.call(vm,obj,'unshift',namespace,vm);
    arr.__proto__ = obj;//修改arr的prototype指向，指向自己定义的prototype
    return arr;

}

const arrayProto = Array.prototype;
/**
 * 代理数组当中的内置方法
 * @param {*} obj 
 * @param {*} func 
 * @param {*} namespace 
 * @param {*} vm 
 */
function defArrayFunc (obj,func,namespace,vm) {
    Object.defineProperty(obj,func,{
        enumerable:true,
        configurable:true,
        value: function (...args) {
            let original = arrayProto[func];    //找到原型上的方法
            const result = original.apply(this,args);   //调用原型上的方法
            renderData(vm,getNameSpace(namespace,prop));
            return result;  //将原型上的方法执行完的结果返回
        }
    });
}


// 我们要知道那个属性被修改了，我们才能对页面上的内容进行更新，所以，我们必须先能够捕获修改的这个事件
// 我们需要使用代理的方式来实现监听属性修改
/**
 * 对象代理
 * @param {*} vm Due对象
 * @param {*} obj 要代理的对象
 * @param {*} namespace 命名空间
 */
export function constructProxy (vm,obj,namespace) {
    
    let proxyObj = null;
    // 判断当前代理对象为数组还是对象
    if (obj instanceof Array) {
        proxyObj = new Array(obj.length);
        for (let i = 0 ; i < obj.length ; i++) {
            proxyObj[i] = constructProxy(vm,obj[i],namespace);
        }
        proxyObj = proxyArr(vm,obj,namespace);
    } else if (obj instanceof Object) {
        proxyObj = constructObjectProxy(vm,obj,namespace);
    } else {
        throw new Error('只能代理数组or对象')
    }

    return proxyObj;
}

/**
 * 获取命名空间
 * @param {*} nowNameSpace 当前命名空间
 * @param {*} nowProp 当前的属性名
 */
function getNameSpace (nowNameSpace,nowProp) {

    // 如果当前的命名空间为null或者为空字符串的时候直接返回当前的属性名就行了
    if (nowNameSpace == null || nowNameSpace == '') {
        return nowProp;
    } else if (nowProp == null || nowProp == '') { //如果当前的属性名为空或者为空字符串，则直接返回当前的命名空间
        return nowNameSpace;
    } else {
        // 否则，返回当前的命名空间拼接上当前的属性名
        return nowNameSpace +'.'+ nowProp;
    }
}
/*
    getFnList() = 获取函数列表对象 根据字符串或者元素的eve-[type]-[name]属性
    getArgumentByStr() = 获取函数传参 根据字符串
    getValueByPath() = 获取真实的值 根据字符串从一个对象获取值的函数
    getJsValueByStr() = 获取js内置字面参数的值 根据字符串
    event() = 使用addEventListener绑定的公用事件代理函数

    jsValueKey = js内置字面参数的值和字符串的映射
    fnNameReg = 获取函数名称用的正则
    semReg = 分号结尾的正则
    events = 默认的事件名称列表
    eve = eve对象
*/

 

// 事件绑定
(function(document,window){
    'use strict'

    function getFnList(eventStr,tag,type){

        var fnList=[]
        var fnName
        var fnValue

        var semicolon
        var valueObj
        var attrName

        while(eventStr){
            // 分号
            semicolon=semReg.exec(eventStr)
            if(semicolon){
                eventStr=eventStr.slice(semicolon[0].length)
                if(!eventStr){
                    return fnList
                }
            }

            // 函数名
            fnName=fnNameReg.exec(eventStr)
            if(!fnName){
                return fnList
            }

            fnName=fnName[0]
            eventStr=eventStr.slice(fnName.length)

            // 函数穿参
            fnValue=undefined
            if(eventStr[0]=='('){
                valueObj=getArgumentByStr(eventStr.slice(1))
                eventStr=valueObj.eventStr
                fnValue=valueObj.data
            }


            // 函数传参 - 属性方式
            attrName='eve-'+type+'-'+fnName
            if(tag.hasAttribute(attrName)){
                fnValue=getJsValueByStr(tag.getAttribute(attrName))
            }

            fnList.push({
                name : fnName,
                value : fnValue,
            })
        }
        return fnList
    }

    function getArgumentByStr(eventStr){
        var right=eventStr.indexOf(')',right+1)
        var data=eventStr.slice(0,right)
        var eventStr=eventStr.slice(right+1)

        return {
            eventStr : eventStr,
            data : getJsValueByStr(data)
        }
    }

    function getValueByPath(obj,name){

        var nameArr=name.split('.')
        var value=obj

        for(var i=0;i<nameArr.length;i++){
            value=value[nameArr[i]]
            if(!value){
                break
            }
        }

        return value
    }

    function getJsValueByStr(str){
        try{
            if(str[0]=='{' || str[0]=='['){
                return JSON.parse(str)
            }
        }
        catch(err){}

        var parseFloatValue=parseFloat(str).toString()
        return jsValueKey[str] || parseFloatValue==str && parseFloatValue || str
    }

    function event(e){
        var type=e.type
        var tag=e.target
        var eventStr
        var fnList
        var fn

        while(tag && tag!=document){

            eventStr = tag.getAttribute(type)

            if(eventStr){

                fnList=getFnList(eventStr,tag,type)

                for(var i=0;i<fnList.length;i++){
                    fn=getValueByPath(eve,fnList[i].name)
                    if(typeof fn=='function'){
                        try{
                            // 停止队列
                            if(e.stopThis){
                                break
                            }
                            fn.apply(tag,[e,fnList[i].value])
                        }
                        catch(error){
                            console.error('执行eve.'+fnList[i].name+'时出错' , tag)
                            console.error(error)
                        }
                    }
                    else{
                        console.error('eve.'+fnList[i].name+'不是一个方法或者未设置')
                    }
                }

                // 停止冒泡
                if(e.stop){
                    break
                }
            }

            tag=tag.parentNode
        }

        e.stop && e.stopPropagation && e.stopPropagation()
        e.def && e.preventDefault && e.preventDefault()
    }

    var jsValueKey={
        'null':null,
        'true':true,
        'false':false,
        'undefined':undefined,
    }

    var fnNameReg=/[^;\(]*/
    var semReg=/^;+/

    var events=['click','focus','change','blur','input','submit','keydown','invalid']

    var eve={
        stop :function (e,type){
            e.stop=true
        },
        stopThis :function (e,type){
            e.stopThis=true
        },
        def :function (e){
            e.def=true
        },
        url :function (e,url){
            window.open(url)
        },
        alert :function (e,value){
            window.alert(value)
        },
        log : function (e,data){
            console.log(e)
            console.log(this)
            console.log(data)
        }
    }

    for(var i=0;i<events.length;i++){
        document.addEventListener(events[i],event,true)
    }

    if(!window.eve){
        window.eve=eve
    }

    document.bindEvent=function(type){
        document.removeEventListener(type,event,true)
        document.addEventListener(type,event,true)
    }

    document.clearEvent=function(type){
        document.removeEventListener(type,event,true)
    }

    document.runEvent=function(tag,data){
        if(!data){
            data={
                type:'click',
                target:tag
            }
        }
        else if(!data.type){
            data.type='click'
        }

        event.call(tag,data)
    }

})(document,window)
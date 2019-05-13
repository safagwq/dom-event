// 事件绑定
;(function(document,window){
    
    'use strict';

    var events=['click','focus','change','blur','input','submit','keydown'];
    var eve={};


    // all
    eve.stop=function (e,type){
        e[type||"stop"]=true;
    };
    eve.def=function (e){
        e.def=true;
    };
    eve.url=function (e,url,target){
        window.open(url,target);
    };

 
    for(var i=0;i<events.length;i++){
        document.addEventListener(events[i],event,true);
    }

    function getFn(name){

        if(!name){
            return false;
        }

        var fn=eve,
        index=name.indexOf('('),
        value;

        value=name.slice(index+1,name.length-1);
        name=name.slice(0,index);

        try{
            value=eval('['+value+']');
        }
        catch(e){
            console.error('以下字符串无法正常解析\n'+value);
            return false;
        }

        name=name.split('.');

        for(var i=0;i<name.length;i++){
            fn=fn[name[i]];
            if(!fn){
                break;
            }
        }

        return {
            fn : fn,
            value : value
        };
    }

    function event(e){

        var type=e.type,
        tag=e.target,
        eventName,
        fnObj;

        while(tag && tag!=document){

            eventName = tag.getAttribute(type);

            if(eventName){

                eventName=eventName.split(';;');

                for(var i2=0;i2<eventName.length;i2++){

                    fnObj=getFn(eventName[i2]);
                    if(fnObj && typeof fnObj.fn=='function'){
                        fnObj.value.unshift(e);

                        try{
                            fnObj.fn.apply(tag,fnObj.value);
                        }
                        catch(error){
                            console.log('执行eve.'+eventName[i2]+'时出错');
                            console.error(error);
                        }

                        // 停止队列和冒泡
                        if(e.stopall){
                            e.stop=
                            e.stoptrue=true;
                        }

                        // 停止队列
                        if(e.stoptrue){
                            break;
                        }
                    }
                    else{
                        console.error('eve.'+eventName[i2]+'无法运行');
                    }
                }

                // 停止冒泡
                if(e.stop){
                    break;
                }
            }

            tag=tag.parentNode;
        }


        if(e.stop && e.stopPropagation){
            e.stopPropagation();
        }


        if(e.def && e.preventDefault){
            e.preventDefault();
        }
    }

    window.bindEvent=function(type){
        document.removeEventListener(type,event,true);
        document.addEventListener(type,event,true);
    };

    window.eve=eve;

})(document,window);
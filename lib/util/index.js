var util = {
    // 可优化: while的判断 现在是截止到根节点
    // 完全可以优化到delegate的那个节点~!
    isOnEle: function (node, isNotEnd, fitTarget){
        while( isNotEnd(node) ){
            if( fitTarget(node) ){
                return node;
            }
            node = node.parentNode;
        }
        return false;
    },
    // 获取一个元素到他的祖先元素的offsetTop
    getOffsetTop: function (el, end){
        if(end === undefined){
            end = document.body;
        }
        var top = 0;
        while( true ){
            top += el.offsetTop;
            el = el.offsetParent;
            if(el === end){
                return top;
            }
        }
        return false;
    },
    // get a style str, like '500px'
    // return just value
    getStyleValue: function(styleStr){
        var len = styleStr.length;
        if( styleStr >= 2 ){
            return 0;
        }
        return Number(styleStr.substr(0, len-2));
    }
};


module.exports = util;
var util = {
    // 可优化: while的判断 现在是截止到根节点
    // 完全可以优化到delegate的那个节点~!
    isOnEle: function (node, isNotEnd, filter){
        while( isNotEnd(node) ){
            if( filter(node) ){
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
    }
};


module.exports = util;
var React = require('react/lib/ReactWithAddons');
var cx = React.addons.classSet;

var util = require('../util');

var DrItem = require('./DrItem.react');

var SCALE_RATE = 1.05;
var SCROLL_UNIT = 4;
// item移到边界 并相交这些值时才算是到边界
var deltaDis = 5;
function getDrItem(node, DrList ){
    function isNotRoot(n){
        return !(n === DrList);
    }
    function isDrItem(n){
        return n.classList.contains('dr-item');
    }

    return util.isOnEle(node, isNotRoot, isDrItem);
}

function getAbdicatorClass(index, state){
    var di = state.draggingIndex, ipos = state.insertPos;
    var lastIndex = state.data.length-1;
    if( ipos !== lastIndex ){
        if( ipos < di && index == ipos ){
            return 'abdicator has-offset-top';
        }
        else if( ipos >= di && index == ipos + 1 ){
            return 'abdicator has-offset-top';
        }
    }
    // 如果要插入在最末尾的位置
    else{
        // 如果拖拽的是最后的元素
        if( di === lastIndex){
            // 那么倒2就要加margin-bottom
            if(index == di-1 ){
                return 'abdicator has-offset-bottom';
            }
        }
        // 拖拽的不是最后的那个元素
        else{
            // 那么倒1元素就要加margin-bottom
            if(index == lastIndex ){
                return 'abdicator has-offset-bottom';
            }
        }
    }
    return '';
}


var DrList = React.createClass({
    getInitialState: function(){
        return {
            data: this.props.datas,
            draggingIndex: null,
            insertPos: false,
            draggingElTop: false,
            justStart: false
        };
    },
    componentDidMount: function(){
        this.el = this.getDOMNode();
        this.el.height = util.getStyleValue(window.getComputedStyle(this.el).height);
        this.getAllLeftItemCenter();
    },
    componentDidUpdate: function(prevProps, prevState){
        // 在拖拽的过程中 必要的时候更新center
        if( this.state.draggingIndex !== null && this.state.insertPos !== prevState.insertPos ){
            this.getAllLeftItemCenter(this.state.draggingIndex);
        }
    },
    render: function(){
        var datas = this.state.data;
        var keyProp = this.props.keyProp;
        var self =this;
        var nodes = datas.map(function(item, index){

            var itemClassList = [];
            var pos = false;
            if( self.state.draggingIndex !== null ){
                // 当前要渲染的item是否是让位者
                var classes = getAbdicatorClass(index, self.state)
                itemClassList.push( classes );
            }
            if( self.state.draggingIndex === index ){
                itemClassList.push('dragging');
                pos = self.state.draggingElTop
            }

            return (
                <DrItem data={item} key={ item[keyProp] } ref={index}
                    avatarPath = {self.props.avatarPath}
                    extraClass={itemClassList}
                    pos={pos}
                >
                </DrItem>
            );
        });

        var listClass = cx({
            'dr-list': true,
            // 刚开始拖拽, margin要立即生效, 不要ani
            // 问题修正: 低index的item拖向高index时 drop时动画会有影响
            //      所以 drop时 no-ani
            'ani': (!this.state.justStart && this.state.draggingIndex !== null)
        });
        return (
            <ol className={listClass}
                onMouseDown  = {this._mouseDown}
                onMouseMove  = {this._mouseMove}
                onMouseUp    = {this._mouseUp}
                onMouseLeave = {this._mouseLeave}
            >
                {nodes}
            </ol>
        )
    },
    _mouseDown: function(e){
        console.time('detect-dragging');
        var drItem = getDrItem(e.target, this.el);

        var data = this.state.data;
        var self = this;
        // 用some检测, 尽早返回
        var getDragging = data.some(function(item, index){
            if( self.refs[index].getDOMNode() === drItem ){
                console.timeEnd('detect-dragging');
                // 开始drag
                self.setState({
                    draggingIndex: index,
                    insertPos: index,
                    justStart: true
                });

                /*
                 * 数据准备
                 * 在拖拽开始时
                 *
                 * 存储 拖拽的哪个元素
                 *
                 * 获取 鼠标的位置
                 * 获取 item相对list头的位置
                 *
                 * 存储 拖拽开始的两个top: 鼠标top, itemTop
                 *
                 * 设定 item刚开始时的绝对定位top
                 *
                 */
                var cursorPageY = e.pageY;
                self.draggingData = { el: drItem };
                var itemOffsetTop = util.getOffsetTop(self.draggingData.el, self.el);

                self.draggingData.elHeight = util.getStyleValue( window.getComputedStyle(drItem).height ) * SCALE_RATE;
                self.draggingData.startCursorTop = cursorPageY;
                self.draggingData.startItemTop = itemOffsetTop;

                self.setState({
                    draggingElTop: itemOffsetTop
                });

                // 获取所有其他item的中心点, 以实现拖拽中的让位计算
                self.getAllLeftItemCenter(self.state.draggingIndex);

                console.log(self.draggingData);

                return true;
            }
            return false;
        });
        if( !getDragging ){
            console.log('event not on item');
            console.timeEnd('detect-dragging');
        }
        return;
    },
    _mouseMove: function(e){
        if(this.state.draggingIndex !== null){
            if( this.state.justStart ){
                this.setState({
                    justStart: false
                });
            }
            var cursorPageY = e.pageY;
            /*
             * 位置计算
             * draggingItem应该处的高度(newTop) - startItemTop = curCursorTop - startCursorTop
             *
             */
            var newTop = this.draggingData.startItemTop + ( cursorPageY - this.draggingData.startCursorTop );

            // 一旦mouse move, 就停止timer自动滚动
            clearTimeout( this.edgeMoveStartTimer );
            clearInterval( this.edgeMoveContinuousTimer );
            // 但凡mouse move, item就应该动
            this.dragMove(newTop);

            // 检测是否已经拖拽到了视窗的顶或底
            var edgeType = this.checkDragEdge( cursorPageY, newTop );
            // 如果是的. 那就在固定一段时间后, 执行滚动和移动
            if( edgeType !== 0 && edgeType!== undefined && !this.alreadListEdge(newTop) ){
                // this.dragMove(newTop);
                var self = this;
                this.edgeMoveStartTimer = setTimeout(function(){
                    console.log('在边际停留了一会了, 该滚动喽~');
                    self.edgeMoveContinuousTimer = setInterval(function(){
                        newTop = self.scrollAndMoveAtEdge(newTop, edgeType);
                        // console.log(newTop);
                        // 在edge处, list滚动的同时, 调整item的top
                        self.dragMove(newTop);
                    }, 25);
                }, 200);
            }
        }
    },
    _mouseUp: function(){
        if( this.state.draggingIndex !== null ){

            clearTimeout( this.edgeMoveStartTimer );
            clearInterval( this.edgeMoveContinuousTimer );

            var stateUpdates = {
                draggingIndex: null,
                draggingElTop: false
            };
            // 如果有item做了移动, 不在原来的位置了
            var d = this.state.draggingIndex, ipos = this.state.insertPos;
            if( d !== ipos){
                var newData = this.state.data;
                var moveItem = newData.splice(d, 1)[0];
                var newPos = ( ipos < d )? ipos : ipos;
                newData.splice(newPos, 0, moveItem);
                stateUpdates.data = newData;

                console.log('完成了一次resort, 新的数据如下:');
                console.table(newData);
            }

            this.setState(stateUpdates);
        }
    },
    _mouseLeave: function(){
        if( this.state.draggingIndex !== null ){

            clearTimeout( this.edgeMoveStartTimer );
            clearInterval( this.edgeMoveContinuousTimer );

            var stateUpdates = {
                draggingIndex: null,
                draggingElTop: false
            };
            // 如果有item做了移动, 不在原来的位置了
            var d = this.state.draggingIndex, ipos = this.state.insertPos;
            if( d !== ipos){
                var newData = this.state.data;
                var moveItem = newData.splice(d, 1)[0];
                var newPos = ( ipos < d )? ipos : ipos;
                newData.splice(newPos, 0, moveItem);
                stateUpdates.data = newData;

                console.log('完成了一次resort, 新的数据如下:');
                console.table(newData);
            }

            this.setState(stateUpdates);
        }
    },
    dragMove: function(newTop){
        var stateUpdates = {
            draggingElTop: newTop
        };

        var selfCenter = newTop + this.draggingData.elHeight/2;
        var insetPos = getInsertPos( selfCenter, this.childrenCenters );
        if( insetPos !== null && insetPos !== this.state.insertPos ){
            //console.log('centers:  ', this.childrenCenters);
            //console.log('self center:  ', selfCenter);
            //console.log('gened insetPos:  ', insetPos);
            stateUpdates.insertPos = insetPos;
        }

        this.setState(stateUpdates);
    },
    childrenCenters: [],
    getEleCenter: function(el, parent){
        var offsetTop = util.getOffsetTop(el, parent);
        var selfHeight = util.getStyleValue( window.getComputedStyle(el).height );
        return offsetTop + selfHeight/2;
    },
    // 获取除draggingItem之外的item的中心线
    getAllLeftItemCenter: function(draggingItemIndex){
        var data = this.state.data;
        var self = this;
        self.childrenCenters = [];
        data.forEach(function( el, index, arr ){
            if(index !== draggingItemIndex){
                self.childrenCenters.push( self.getEleCenter(self.refs[index].getDOMNode(), self.el) );
            }
        });
    },

    // 检测是否已经拖拽到了视窗的顶或底
    // 到顶 返回-1 , 到底 返回 1
    // 没有到边际 返回0
    checkDragEdge: function(curMouseY, newDraggingTop){
        // 鼠标带着元素到边时, 容器要顺势滚动
        // 向上移动
        if( curMouseY < this.draggingData.startCursorTop ){
            if(newDraggingTop + deltaDis <= this.el.scrollTop){
                return -1;
            }
            return 0;
        }
        else if( curMouseY > this.draggingData.startCursorTop ){
            if( newDraggingTop + this.draggingData.elHeight - deltaDis >= this.el.scrollTop + this.el.height ){
                return 1;
            }
            return 0;
        }
        return 0;
    },
    edgeMoveStartTimer: undefined,
    edgeMoveContinuousTimer: undefined,
    // 拖拽到边际时的缓动
    // 容器一点点scroll
    // item的drag初始值进行调整
    scrollAndMoveAtEdge: function(newTop, edgeType){
        // 容器滚动
        this.el.scrollTop += edgeType*SCROLL_UNIT;
        // 刚计算出来的itemtop要变更一下
        // 为了下次计算, item start top也要变更一下
        // 当然 scroll and move过程中也要检查是否到list边际
        if( !this.alreadListEdge(newTop) ){
            newTop += edgeType*SCROLL_UNIT;
            this.draggingData.startItemTop += edgeType*SCROLL_UNIT;
        }
        return newTop;
    },
    alreadListEdge: function(newTop){
        var isListBottom = (newTop + this.draggingData.elHeight >= this.el.scrollHeight);
        // console.log(isListBottom);
        // 判断Item是否已经移动到了List的最顶部或最底部
        return (newTop <=0 || isListBottom);
    }
});

// 在一个排序好的数组中插入一个数字
// 获取它应该插入的索引号(插进去之后它的索引号)
// 先用最简单的方式实现


function getInsertPos(n, arr){
    var insetPos = null;
    arr.some(function(el, i, arr){
        if( n < el && arr[i-1] === undefined ){
            insetPos = i;
            return true;
        }
        else if( n >el && n < arr[i+1]){
            insetPos = i+1;
            return true;
        }
        else if( n>el && arr[i+1] === undefined ){
            insetPos = i+1;
            return true;
        }
        return false;
    });
    return insetPos;
}
module.exports = DrList;
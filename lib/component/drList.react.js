var React = require('react');

var util = require('../util');

var DrItem = require('./DrItem.react');

var SCALE_RATE = 1.03;

function getDrItem(node, DrList ){
    function isNotRoot(n){
        return !(n === DrList);
    }
    function isDrItem(n){
        return n.classList.contains('dr-item');
    }

    return util.isOnEle(node, isNotRoot, isDrItem);
}

function isAbdicator(index, state){
    var d = state.dragging, ipos = state.insertPos;
    //console.log('gonna check abd': )
    if( ipos < d && index == ipos ){
        return true;
    }
    else if( ipos >= d && index == ipos + 1 ){
        return true;
    }
    return false;
}

var DrList = React.createClass({
    getInitialState: function(){
        return {
            data: this.props.datas,
            dragging: false,
            insertPos: false,
            draggingElTop: false,
            justStart: false
        };
    },
    componentDidMount: function(){
        this.el = this.getDOMNode();
        this.getAllItemCenter();
    },
    componentDidUpdate: function(prevProps, prevState){
        // 在拖拽的过程中 必要的时候更新center
        if( this.state.dragging !== false && this.state.insertPos !== prevState.insertPos ){
            this.getAllLeftItemCenter(this.state.dragging);
        }
    },
    render: function(){
        var datas = this.state.data;
        var self =this;
        var nodes = datas.map(function(item, index){
            var key = index;

            var itemClassList = [];
            var pos = false;
            if( self.state.dragging !== false ){
                if( isAbdicator(index, self.state) ){
                    itemClassList.push('has-offset has-offset-top');
                }
            }
            if( self.state.dragging === key ){
                itemClassList.push('dragging');
                pos = self.state.draggingElTop
            }

            return (
                <DrItem data={item} key={key} ref={key}
                    extraClass={itemClassList}
                    pos={pos}
                >
                </DrItem>
            );
        });

        return (
            <ol className="dr-list"
                onMouseDown  = {this._mouseDown}
                onMouseMove  = {this._mouseMove}
                onMouseUp    = {this._mouseUp}
                onMouseLeave = {this._mouseUp}
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
                    dragging: index,
                    insertPos: index
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
                self.dragging = { el: drItem };
                var itemOffsetTop = util.getOffsetTop(self.dragging.el, self.el);

                self.dragging.elHeight = util.getStyleValue( window.getComputedStyle(drItem).height ) * SCALE_RATE;
                self.dragging.startCursorTop = cursorPageY;
                self.dragging.startItemTop = itemOffsetTop;

                self.setState({
                    draggingElTop: itemOffsetTop
                });

                // 获取所有其他item的中心点, 以实现拖拽中的让位计算
                self.getAllLeftItemCenter(self.state.dragging);

                console.log(self.dragging);

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
        if(this.state.dragging !== false){
            var cursorPageY = e.pageY;
            /*
             * 位置计算
             *
             * curItemTop - startItemTop = curCursorTop - startCursorTop
             *
             */
            var newTop = this.dragging.startItemTop + ( cursorPageY -this.dragging.startCursorTop );

            var stateUpdates = {
                draggingElTop: newTop
            };

            var selfCenter = newTop+this.dragging.elHeight/2;
            var insetPos = getInsertPos( selfCenter, this.childrenCenters );
            if( insetPos !== null && insetPos !== this.state.insertPos ){
                console.log('centers:  ', this.childrenCenters);
                console.log('self center:  ', selfCenter);
                console.log('gened insetPos:  ', insetPos);
                stateUpdates.insertPos = insetPos;
            }

            this.setState(stateUpdates);
        }
    },
    _mouseUp: function(){
        this.setState({
            dragging: false,
            draggingElTop: false
        });
    },
    childrenCenters: [],
    getEleCenter: function(el, parent){
        var offsetTop = util.getOffsetTop(el, parent);
        var selfHeight = util.getStyleValue( window.getComputedStyle(el).height );
        return offsetTop + selfHeight/2;
    },
    getAllLeftItemCenter: function(dragging){
        var data = this.state.data;
        var self = this;
        self.childrenCenters = [];
        data.forEach(function( el, index, arr ){
            if(index !== dragging){
                self.childrenCenters.push( self.getEleCenter(self.refs[index].getDOMNode(), self.el) );
            }
        });
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
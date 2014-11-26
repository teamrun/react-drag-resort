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


var DrList = React.createClass({
    getInitialState: function(){
        return {
            data: this.props.datas,
            dragging: false,
            abdicator: false,
            draggingElTop: false,
            justStart: false
        };
    },
    componentDidMount: function(){
        this.el = this.getDOMNode();
        this.getAllItemCenter();
    },
    componentDidUpdate: function(){
        this.getAllItemCenter();
    },
    render: function(){
        var datas = this.state.data;
        var self =this;
        var nodes = datas.map(function(item, index){
            var key = index;

            var itemClassList = [];
            var pos = false;
            if( self.state.dragging !== false ){
                if( index == self.state.abdicator ){
                    itemClassList.push('has-offset has-offset-top');
                }
                //else if(index == self.state.abdicate){
                //    itemClassList.push('has-offset has-offset-bottom');
                //}
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
                    abdicator: index + 1
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
            //var insetPos = getInsertPos( newTop+this.dragging.elHeight/2, this.childrenCenters );

            var stateUpdates = {
                draggingElTop: newTop
            };

            //if( insetPos !== null && insetPos !== this.state.abdicator ){
            //    stateUpdates.abdicator = insetPos;
            //}

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
        return offsetTop - selfHeight/2;
    },
    getAllItemCenter: function(){
        var data = this.state.data;
        var self = this;
        self.childrenCenters = [];
        data.forEach(function( el, index, arr ){
            self.childrenCenters.push( self.getEleCenter(self.refs[index].getDOMNode(), self.el) );
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
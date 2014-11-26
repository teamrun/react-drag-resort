var React = require('react');

var util = require('../util');

var DrItem = require('./DrItem.react');


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
            draggingElTop: false,
            justStart: false
        };
    },
    componentDidMount: function(){
        this.el = this.getDOMNode();
    },
    render: function(){
        var datas = this.state.data;
        var self =this;
        var nodes = datas.map(function(item, index){
            var key = index;

            var itemClassList = [];
            var pos = false;
            if( self.state.dragging !== false && index == self.state.dragging + 1 ){
                itemClassList.push('has-offset');
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
                onMouseDown={this._mouseDown}
                onMouseMove={this._mouseMove}
                onMouseUp  ={this._mouseUp}
                onMouseLeave={this._mouseUp}
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
        data.forEach(function(item, index){
            if( self.refs[index].getDOMNode() === drItem ){
                console.timeEnd('detect-dragging');
                // 开始drag
                self.setState({dragging: index});

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

                self.dragging.startCursorTop = cursorPageY;
                self.dragging.startItemTop = itemOffsetTop;

                self.setState({
                    draggingElTop: itemOffsetTop
                });

                console.log(self.dragging);

                return;
            }
        });
        console.log('event not on item');
        console.timeEnd('detect-dragging');
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

            this.setState({
                draggingElTop: this.dragging.startItemTop + ( cursorPageY -this.dragging.startCursorTop )
            });
        }
    },
    _mouseUp: function(){
        this.setState({
            dragging: false,
            draggingElTop: false
        });
    },
    childrenCenters: []
});


module.exports = DrList;
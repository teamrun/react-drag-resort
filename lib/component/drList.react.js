var React = require('react');
var DrItem = require('./DrItem.react');


// 可优化: while的判断 现在是截止到根节点
// 完全可以优化到delegate的那个节点~!
function isOnEle(node, isNotEnd, filter){
    while( isNotEnd(node) ){
        if( filter(node) ){
            return node;
        }
        node = node.parentNode;
    }
    return false;
}

//
function getDrItem(node, DrList ){
    function isNotRoot(n){
        return !(n === DrList);
    }
    function isDrItem(n){
        return n.classList.contains('dr-item');
    }

    return isOnEle(node, isNotRoot, isDrItem);
}

function getOffsetTop(el, end){
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
    draging: false,
    _mouseDown: function(e){
        console.time('detect-dragging');
        var drItem = getDrItem(e.target, this.el);

        var data = this.state.data;
        var self =this;
        data.forEach(function(item, index){
            if( self.refs[index].getDOMNode() === drItem ){
                console.timeEnd('detect-dragging');
                // 开始drag
                self.setState({dragging: index});

                // 数据准备
                var cursorPageY = e.pageY;
                self.dragging = { el: drItem };
                var listOffsetTop = getOffsetTop(self.el);
                var itemOffsetTop = getOffsetTop(self.dragging.el, self.el);
                
                self.dragging.cursorOffset = ( cursorPageY - listOffsetTop ) - itemOffsetTop;
                self.dragging.listOffsetTop = listOffsetTop;

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
            this.setState({
                draggingElTop: cursorPageY - this.dragging.listOffsetTop - this.dragging.cursorOffset
            });
            // console.log(  );
        }
    },
    _mouseUp: function(){
        this.setState({
            dragging: false,
            draggingElTop: false
        });
    }
});


module.exports = DrList;
var React = require('react');
var DrItem = require('./DrItem.react');


// 可优化: while的判断 现在是截止到根节点
// 完全可以优化到delegate的那个节点~!
function isOnEle(node, filter){
    while(node){
        if( filter(node) ){
            return node;
        }
        node = node.parentNode;
    }
    return false;
}

function getDrItem(node){
    return isOnEle(node, function(n){
       return n.classList.contains('dr-item');
    });
}

var DrList = React.createClass({
    getInitialState: function(){
        var datas = {};
        this.props.datas.forEach(function(d, index){
            datas[index] = d;
        });
        return {
            data: datas,
            draging: false
        };
    },
    render: function(){
        var datas = this.state.data;
        var nodes = [];
        for(var key in datas){
            var d = datas[key];
            /* To access your own subcomponents (the spans), place refs on them. */
            nodes.push(
                <DrItem data={d} key={key} ref={key}
                    draging={(this.state.draging === key)}
                />
            );
        }

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
        console.time('start draging');
        var drItem = getDrItem(e.target)
        if( drItem ){
            for( var i in this.state.data ){
                if( this.refs[i].getDOMNode() === drItem ){
                    //console.log( i );
                    this.setState({draging: i});
                    console.timeEnd('start draging');
                }
            }
        }
    },
    _mouseMove: function(){
        if(this.state.draging !== false){
            console.log('moving...');
            //console.log(e.target);
        }
    },
    _mouseUp: function(){
        this.setState({draging: false});
    }
});


module.exports = DrList;
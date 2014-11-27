var React = require('react');

var DrItem = React.createClass({
    render: function(){
        var d = this.props.data;
        var classArr = ['dr-item'];
        classArr = classArr.concat( this.props.extraClass || [] );

        var style = {};
        if( classArr.indexOf('dragging') >= 0 && this.props.pos !==false ){
            style.top = this.props.pos
        }

        return (
            <li className={classArr.join(' ')} style={style}>
                <img className="avatar" src={this.props.avatarPath + d.avatar} />
                <p className="c-name">{d.name}</p>
                <span className="c-phone">{d.phone}</span>
            </li>
        );
    }
});


module.exports = DrItem;
var React = require('react');

var DrItem = React.createClass({
    render: function(){
        var d = this.props.data;
        var classArr = ['dr-item'];
        if( this.props.draging ){
            classArr.push('draging');
        }
        return (
            <li className={classArr.join(' ')}>
                <p className="c-name">{d.name}</p>
                <span className="c-phone">{d.phone}</span>
            </li>
        );
    }
});


module.exports = DrItem;
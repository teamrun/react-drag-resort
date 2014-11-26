var React = require('react');

var DrList = require('./component/DrList.react');

var contackData = [
    {
        name: 'Yutou',
        phone: 16548102423
    },
    {
        name: 'Zilong',
        phone: 14031518709
    },
    {
        name: 'Bingbing',
        phone: 17087567481
    },
    {
        name: 'Beauty',
        phone: 12015236332
    },
    {
        name: 'Chenllos',
        phone: 18434081503
    }
];

contackData = contackData.concat(contackData);

React.render( <DrList datas={contackData}/>, document.querySelector('#ctn') );
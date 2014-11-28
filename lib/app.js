var React = require('react');

var DrList = require('./component/DrList.react');

var contackData = [
    {
        name: '芋头',
        phone: 16548102423,
        avatar: 'yutou.jpg'
    },
    {
        name: '子龙',
        phone: 14031518709,
        avatar: 'godPig.jpg'
    },
    {
        name: '兵兵',
        phone: 17087567481,
        avatar: 'bingbing.png'
    },
    {
        name: '妹子',
        phone: 12015236332,
        avatar: 'meizi.jpg'
    },
    {
        name: '亮亮',
        phone: 18434081503,
        avatar: 'chenllos.jpg'
    }
];
var lastNameSet = ['赵','钱','孙','李'];
var firstNameSet = ['一','二','三','四', '五','六','七','八','九','十','十一'];
var randomCard = firstNameSet.map(function(f, i){
    var name =  lastNameSet[i%3] + f;
    var phone = String( (1 + Number(Math.random().toFixed(10)))*Math.pow(10, 10));
    return {
        name: name,
        phone: phone,
        avatar: 'default.jpg'
    }
});

contackData = contackData.concat(randomCard);

React.render( <DrList datas={contackData} keyProp="phone" avatarPath="./img/avatar/"/>, document.querySelector('#ctn') );
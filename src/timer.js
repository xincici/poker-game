var React = require('react');

var Timer = React.createClass({
    getInitialState: function(){
        return {
            time : 0
        }
    },
    componentDidMount: function(){
        var self = this;
        this.timer = setInterval(function(){
            self.setState({
                time : ++self.state.time
            });
        }, 1000);
    },
    componentWillUnmount: function(){
        clearInterval(this.timer);
    },
    parseTime: function(s){
        var str = '';
        if(s < 60){
            str = s + ' 秒';
        }else if(s < 3600){
            str = Math.floor(s/60) + ' 分 ' + (s%60) + ' 秒';
        }else{
            str = Math.floor(s/3600) + ' 小时 ' + Math.floor((s%3600)/60) + ' 分 ' + (s%60) + ' 秒';
        }
        return str;
    },
    render: function(){
        var tstr = this.parseTime(this.state.time);
        return (
            <div>
                页面已打开 <strong>{tstr}</strong>！
            </div>
        );
    }
});

module.exports = Timer;

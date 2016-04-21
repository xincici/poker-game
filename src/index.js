import React from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import './index.scss'

/**
 *
 * 处理数字每隔3位加一个逗号
 *
 */
function numToStr(num){
    return num.toString().replace(/(\d{1,3})(?=(?:\d{3})+(?!\d))/g,'$1,');
}
const A = [0, 1, 2, 3, 4];
const ARR = [
    'a-1','a-2','a-3','a-4','a-5','a-6','a-7','a-8','a-9','a-10','a-11','a-12','a-13',
    'b-1','b-2','b-3','b-4','b-5','b-6','b-7','b-8','b-9','b-10','b-11','b-12','b-13',
    'c-1','c-2','c-3','c-4','c-5','c-6','c-7','c-8','c-9','c-10','c-11','c-12','c-13',
    'd-1','d-2','d-3','d-4','d-5','d-6','d-7','d-8','d-9','d-10','d-11','d-12','d-13'
];
const poker = React.createClass({
    getInitialState() {
        const str = localStorage.getItem('poker');
        let json = {};
        if(str){
            json = JSON.parse(str);
        }
        return{
            total : json.total || 1000,
            bet : json.bet || 10,
            win : 0,
            dealing : false,
            cards : ['', '', '', '', ''],
            holds : [false, false, false, false, false],
            step : 0,
            gaming : false,
            times : 0,
            text : null,
            random : 0,
            randomResult : '',
            waiting : false,
            help : false
        }
    },
    showHelp() {
        this.setState({
            help : true
        });
    },
    hideHelp() {
        this.setState({
            help : false
        });
    },
    persistData() {
        let str = JSON.stringify({
            total : this.state.total,
            bet : this.state.bet
        });
        localStorage.setItem('poker', str);
    },
    resetState() {
        this.setState({
            total : this.state.total + this.state.win,
            win : 0,
            dealing : false,
            cards : ['', '', '', '', ''],
            holds : [false, false, false, false, false],
            step : 0,
            gaming : false,
            times : 0,
            text : null,
            random : 0,
            randomResult : '',
            waiting : false
        }, function(){
            this.persistData();
            this.clearTimer();
        });
    },
    clearTimer() {
        clearInterval(this.timer);
    },
    clearRandom() {
        this.setState({
            random : 0,
            randomResult : ''
        });
    },
    startRandom() {
        this.timer = setInterval(function(){
            let random = Math.ceil(Math.random() * 6);
            this.setState({
                random
            });
        }.bind(this), 125);
    },
    randomGuessBig() {
        if(this.state.random >= 4){
            this.randomWin();
        }else{
            this.randomLose();
        }
    },
    randomGuessSmall() {
        if(this.state.random <= 3){
            this.randomWin();
        }else{
            this.randomLose();
        }
    },
    randomWin() {
        this.clearTimer();
        this.setState({
            randomResult : 'Win',
            win : this.state.win * 2,
            waiting : true
        }, function(){
            setTimeout(function(){
                this.startRandom();
                this.setState({
                    randomResult : '',
                    waiting : false
                });
            }.bind(this), 1000);
        });
    },
    randomLose() {
        this.clearTimer();
        this.setState({
            randomResult : 'Lose',
            waiting : true
        }, function(){
            setTimeout(function(){
                this.clearRandom();
                this.setState({
                    win : 0,
                    waiting : false
                }, function(){
                    this.resetState();
                });
            }.bind(this), 1200);
        });
    },
    betMinus() {
        this.setState({
            bet : --this.state.bet
        });
    },
    betPlus() {
        this.setState({
            bet : ++this.state.bet
        });
    },
    rollGame() {
        if(this.state.step === 0){
            this.minusTotal();
        }
        this.setState({
            step : ++this.state.step,
            dealing : true,
            gaming : true
        }, this.dealCards);
    },
    minusTotal() {
        this.setState({
            total : this.state.total - this.state.bet
        });
    },
    toggleHold(index) {
        if(this.state.step !== 2 || this.state.dealing) return;
        this.setState({
            holds : [...this.state.holds.slice(0, index), !this.state.holds[index], ...this.state.holds.slice(index + 1)]
        });
    },
    dealCards() {
        this.dealOneCard(0);
    },
    dealOneCard(index) {
        if(index >= 5){
            this.setState({
                step : ++this.state.step,
                dealing : false
            }, function(){
                if(this.state.step === 4){
                    let times = this.gameResult();
                    if(times === 0){
                        setTimeout(function(){
                            this.setState({
                                text : 'You Lose!!!'
                            }, function(){
                                setTimeout(function(){
                                    this.setState({
                                        text : null
                                    }, this.resetState);
                                }.bind(this), 1500)
                            });
                        }.bind(this), 1500);
                    }else{
                        this.setState({
                            text : 'You Win!!!',
                            win : this.state.bet * times,
                            times : times
                        }, function(){
                            this.startRandom();
                            setTimeout(function(){
                                this.setState({
                                    text : null
                                });
                            }.bind(this), 1500)
                        });
                    }
                }
            });
            return
        }
        if(this.state.holds[index]){
            this.dealOneCard(++index);
            return
        }
        setTimeout(function(){
            let card = this.getOneShuffleCard();
            this.setState({
                cards : [...this.state.cards.slice(0, index), card, ...this.state.cards.slice(index + 1)]
            });
            this.dealOneCard(++index);
        }.bind(this), 200);
    },
    getOneShuffleCard() {
        let ran = parseInt(Math.floor(Math.random() * 51));
        while(this.state.cards.indexOf(ARR[ran]) >= 0){
            ran = parseInt(Math.floor(Math.random() * 51));
        }
        return ARR[ran];
    },
    gameResult() {
        let type = [];
        let number = [];
        let card, cArr;
        A.forEach(function(i){
            card = this.state.cards[i];
            cArr = card.split('-');
            type.push(cArr[0]);
            number.push(parseInt(cArr[1]));
        }.bind(this));
        number.sort(function(a, b){
            return a - b;
        });
        if(type[0] == type[1] && type[0] == type[2] && type[0] == type[3] && type[0] == type[4]){
            //同花顺
            if(number[4] - number[0] == 4){
                return 250;
            }
            //同花
            return 7;
        }
        if(number[0] != number[1] && number[1] != number[2] && number[2] != number[3] && number[3] != number[4]){
            //顺子
            if((number[4] - number[0] == 4) || (number[0] == 1 && number[1] == 10)){
                return 10;
            }
            //什么也不是
            return 0;
        }
        //四条
        if(number[0] == number[3] || number[1] == number[4]){
            return 60;
        }
        //葫芦
        if((number[0] == number[2] && number[3] == number[4]) || (number[0] == number[1] && number[2] == number[4])){
            return 20;
        }
        //三条
        if(number[0] == number[2] || number[1] == number[3] || number[2] == number[4]){
            return 5;
        }
        //两对
        if((number[0] == number[1] && (number[2] == number[3] || number[3] == number[4])) || (number[1] == number[2] && number[3] == number[4])){
            return 2;
        }
        //大于8一对
        if((number[1] == 1) || (number[0] == number[1] && number[0] >= 8) || (number[1] == number[2] && number[1] >= 8) || (number[2] == number[3] && number[2] >= 8) || (number[3] == number[4] && number[3] >= 8)){
            return 1;
        }
        return 0;
    },
    render() {
        const state = this.state;
        let cardsArr = [];
        A.forEach(function(index){
            let card = state.cards[index];
            if(card){
                let r = card.split('-');
                let c = r[0] + '-card p-' + r[1];
                cardsArr.push(
                    <div
                        key={index}
                        className={`card ${c} ${state.holds[index]? 'hold' : ''}`}
                        onClick={this.toggleHold.bind(this, index)}
                    ></div>
                )
            }else{
                cardsArr.push(
                    <div
                        key={index}
                        className={`card back ${state.holds[index]? 'hold' : ''}`}
                        onClick={this.toggleHold.bind(this, index)}
                    ></div>
                )
            }
        }.bind(this));
        return(
            <div>
                <div className="container">
                    <div className="left">
                        <div className="ui vertical menu">
                            <div className={`item ${state.times === 250 ? 'blink' : ''}`}>同花顺<div className="ui teal label">250</div></div>
                            <div className={`item ${state.times === 60 ? 'blink' : ''}`}>四条<div className="ui teal label">60</div></div>
                            <div className={`item ${state.times === 20 ? 'blink' : ''}`}>葫芦<div className="ui teal label">20</div></div>
                            <div className={`item ${state.times === 10 ? 'blink' : ''}`}>顺子<div className="ui teal label">10</div></div>
                            <div className={`item ${state.times === 7 ? 'blink' : ''}`}>同花<div className="ui teal label">7</div></div>
                            <div className={`item ${state.times === 5 ? 'blink' : ''}`}>三条<div className="ui teal label">5</div></div>
                            <div className={`item ${state.times === 2 ? 'blink' : ''}`}>两对<div className="ui teal label">2</div></div>
                            <div className={`item ${state.times === 1 ? 'blink' : ''}`}>大于8一对<div className="ui teal label">1</div></div>
                        </div>
                    </div>
                    <div className="right">
                        <div className="top">
                            <div className="ui form">
                                <div className="fields">
                                    <div className="five wide field">
                                        <label>Total</label>
                                        <div className="ui tiny statistic">
                                            <div className="value">￥{numToStr(state.total)}</div>
                                        </div>
                                    </div>
                                    <div className="four wide field">
                                        <label>Win</label>
                                        <div className="ui tiny statistic">
                                            <div className="value">￥{numToStr(state.win)}</div>
                                        </div>
                                    </div>
                                    <div className="field">
                                        <label>Bet</label>
                                        <div className="ui buttons">
                                            <button
                                                className="ui icon red button"
                                                onClick={this.betMinus}
                                                disabled={state.bet <= 1 || state.gaming}>
                                                <i className="icon minus"></i>
                                            </button>
                                            <button className="ui blue basic button" disabled="disabled">{state.bet}</button>
                                            <button
                                                className="ui icon green button"
                                                onClick={this.betPlus}
                                                disabled={state.bet >= 100 || state.bet >= state.total || state.gaming}>
                                                <i className="icon plus"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="field">
                                        <label>&nbsp;</label>
                                        <button className="ui icon button teal" onClick={this.showHelp}>Help<i className="icon help"></i></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="middle">
                            {state.text ?
                                <div className="ui red floating message massive"><p>{state.text}</p></div>
                                :cardsArr
                            }
                        </div>
                        <div className="bottom">
                            <div className="ui form">
                                <div className="fields">
                                    <div className="five wide field">
                                        <div className="ui large buttons">
                                            <button
                                                className="ui red button"
                                                disabled={state.step !== 4 || state.win === 0 || state.waiting}
                                                onClick={this.randomGuessBig}
                                            >Big</button>
                                            <div className="or"></div>
                                            <button
                                                className="ui green button"
                                                disabled={state.step !== 4 || state.win === 0 || state.waiting}
                                                onClick={this.randomGuessSmall}
                                            >Small</button>
                                        </div>
                                    </div>
                                    <div className="five wide field random-area">
                                        {state.win === 0 ?
                                            null:
                                            <div>
                                                <span className="random-number">{state.random}</span>
                                                <span className="random-result">{state.randomResult}</span>
                                            </div>
                                        }
                                    </div>
                                    <div className="six wide field right-area">
                                        <div className="ui large buttons">
                                            <button
                                                className="ui red button"
                                                disabled={state.win === 0}
                                                onClick={this.resetState}
                                            >Check</button>
                                            <div className="or"></div>
                                            <button className="ui green button"
                                                onClick={this.rollGame}
                                                disabled={state.dealing || state.step >= 3}
                                            >
                                            {[0, 1].indexOf(state.step) >= 0 ? 'Roll' : 'Go on'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {state.help ?
                    <ReactCSSTransitionGroup transitionName="help" transitionAppear={true} transitionAppearTimeout={500} transitionEnter={false} transitionLeave={false}>
                        <div className="ui dimmer modals page active">
                            <div className="ui small basic modal active">
                                <div className="ui icon header orange"><i className="help circle icon"></i> 游戏规则 </div>
                                <div className="content">
                                    <p>点击 Roll 按钮发牌，第一次发牌后点击牌可以选择保留该牌，再次点击该按钮会替换掉未被保留的牌，形成最终牌型，当有四条，或同花，或葫芦，或顺子，或三条，或两对，或大于一对8的牌型时胜利，可选择继续猜大小，猜对则奖金加倍，猜错则奖金清零，也可以随时选择结算奖金。</p>
                                    <div className="ui list">
                                        <div className="item"><i className="info circle icon olive"></i><div className="content">投注范围 1-100</div></div>
                                        <div className="item"><i className="info circle icon olive"></i><div className="content">牌型对应倍数见左侧栏</div></div>
                                    </div>
                                </div>
                                <div className="actions">
                                  <div className="ui green ok inverted button" onClick={this.hideHelp}><i className="checkmark icon"></i> OK, I See </div>
                                </div>
                            </div>
                        </div>
                    </ReactCSSTransitionGroup>
                    :null
                }
            </div>
        )
    }
});

export default poker;
